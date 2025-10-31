const express = require('express');
const router = express.Router();
const db = require('../Config/db'); // Conexión a MySQL con mysql2/promise
const authenticateToken = require('../Middleware/authMiddleware'); // Middleware de autenticación JWT
const { upload, UPLOADS_DIR, MulterError } = require('../Middleware/uploadMiddleware'); // Middleware de Multer
const path = require('path'); 
const fs = require('fs');     

// 🛑 DEFINICIÓN DE CONSTANTES DE ROLES (Basado en Base de Datos IASD.txt)
const ROL_ADMIN = 1; // Administrador General
const ROL_LIDER = 2; // Líder de Ministerio
const ROL_ESTANDAR = 3; // Usuario Estándar
const ROL_LECTOR = 4; // Lector/Invitado

/**
 * Verifica si el usuario tiene permiso para modificar (editar/eliminar) un archivo específico
 * basado en su rol y ministerio asociado.
 */
async function checkModificationPermission(archivoID, userRolID, userMinisterioID) {
    let isAuthorized = false;

    // 1. Obtener información del archivo A PRIORI.
    const getFileMinSql = "SELECT RutaArchivo, MinisterioID FROM archivo WHERE ArchivoID = ?";
    const [fileInfoResults] = await db.query(getFileMinSql, [archivoID]);
    const fileInfo = fileInfoResults.length > 0 ? fileInfoResults[0] : null;

    if (!fileInfo) {
        return { isAuthorized: false, fileInfo: null };
    }

    // 2. Aplicar la lógica de roles:
    if (userRolID === ROL_ADMIN) {
        isAuthorized = true;
    } else if (userRolID === ROL_LIDER) {
        if (fileInfo.MinisterioID && fileInfo.MinisterioID === userMinisterioID) {
            isAuthorized = true;
        }
    }
    return { isAuthorized, fileInfo };
}

// -----------------------------------------------------
// RUTAS DE ARCHIVOS
// -----------------------------------------------------

// 🔑 CAMBIO CLAVE 1: Ruta de subida física (Middleware de Multer)
// Aplicamos Multer como middleware explícito en la cadena de la ruta.
router.post('/uploads', authenticateToken, upload.single('file'), (req, res) => {
    console.log("FILE_UPLOAD_REQ: Subida recibida y Multer ejecutado.");
    
    // Si la subida fue exitosa, el control llega aquí.
    if (!req.file) {
        console.warn("FILE_UPLOAD_WARN: Multer no capturó el archivo (posible error en el cliente).");
        return res.status(400).json({ message: 'No se ha seleccionado ningún archivo para subir.' });
    }
    
    // Éxito en la subida física
    console.log('FILE_UPLOAD_SUCCESS: Archivo físico subido con éxito:', req.file.filename);
    res.status(200).json({
        message: 'Archivo subido al servidor con éxito.',
        fileName: req.file.filename,
        filePath: `/uploads/${req.file.filename}`
    });
});


// 🔑 CAMBIO CLAVE 2: Middleware de Manejo de Errores de Multer
// Este middleware captura CUALQUIER error de Multer (límite de tamaño, tipo incorrecto) 
// y devuelve una respuesta JSON limpia, eliminando el "Network Error" en el cliente.
router.use((err, req, res, next) => {
    if (err instanceof MulterError) {
        console.error("FILE_UPLOAD_ERROR (Multer):", err.message, err.code);
        let message = `Error de subida: ${err.message}`;
        
        if (err.code === 'LIMIT_FILE_SIZE') {
            message = 'El archivo es demasiado grande (máximo 200MB).';
        }
        
        // Devolvemos el error Multer con un 400
        return res.status(400).json({ 
            message: message,
            code: err.code 
        });
    } 
    // Si el error no es de Multer, lo pasamos al manejador de errores general de Express
    next(err); 
});


// Registra la metadata del archivo en la base de datos (POST /)
router.post('/', authenticateToken, async (req, res) => {
    const { NombreArchivo, RutaArchivo, MinisterioID } = req.body;
    const userRolID = req.user?.rolID;
    const userMinisterioID = req.user?.ministerioID;
    console.log("FILE_META_CREATE_REQ: Solicitud para registrar metadata de archivo:", NombreArchivo);

    // 🛑 1. VALIDACIÓN DE ROL GLOBAL PARA SUBIDA
    if (userRolID === ROL_ESTANDAR || userRolID === ROL_LECTOR) { 
        console.warn(`FILE_META_AUTH_FAIL: RolID ${userRolID} intentó registrar metadata.`);
        return res.status(403).json({ message: 'Permiso denegado. Solo administradores y líderes de ministerio pueden subir archivos.' });
    }

    // 🛑 2. VALIDACIÓN DE CONTEXTO PARA LÍDERES
    if (userRolID === ROL_LIDER) {
        if (!userMinisterioID || userMinisterioID !== MinisterioID) {
            console.warn(`FILE_META_AUTH_FAIL: Líder (RolID ${ROL_LIDER}) intentó subir a MinisterioID ${MinisterioID}, pero su ID es ${userMinisterioID}.`);
            return res.status(403).json({ message: 'Permiso denegado. Solo puedes subir archivos al ministerio que lideras.' });
        }
    }
    
    // 🛑 3. Asegurar que los datos mínimos estén presentes.
    if (!NombreArchivo || !RutaArchivo || !MinisterioID) {
        return res.status(400).json({ message: "Nombre, Ruta del archivo y MinisterioID son obligatorios." });
    }
    
    // Lógica de tipificación de archivo... 
    let simplifiedTipoArchivo;
    const fileExtension = path.extname(RutaArchivo).toLowerCase();

    switch (fileExtension) {
        case '.pdf': simplifiedTipoArchivo = 'PDF'; break;
        case '.doc': case '.docx': simplifiedTipoArchivo = 'DOCX'; break;
        case '.xls': case '.xlsx': simplifiedTipoArchivo = 'XLSX'; break;
        case '.ppt': case '.pptx': simplifiedTipoArchivo = 'PPTX'; break;
        case '.jpg': case '.jpeg': case '.png': case '.gif': simplifiedTipoArchivo = 'IMAGEN'; break;
        case '.mp3': case '.wav': case '.ogg': simplifiedTipoArchivo = 'AUDIO'; break;
        case '.mp4': case '.mpeg': case '.mpg': case '.mov': case '.avi': case '.wmv':
        case '.flv': case '.webm': case '.mkv': simplifiedTipoArchivo = 'VIDEO'; break;
        case '.zip': simplifiedTipoArchivo = 'ZIP'; break;
        case '.rar': simplifiedTipoArchivo = 'RAR'; break;
        default: simplifiedTipoArchivo = 'OTRO';
    }

    console.log(`FILE_META_DEBUG: Extensión original: ${fileExtension}, Tipo simplificado a guardar: ${simplifiedTipoArchivo}`);

    const usuarioID = req.user?.usuarioID;
    if (!usuarioID) {
        console.error('FILE_META_ERROR: UsuarioID no encontrado en el token JWT para guardar metadata.');
        return res.status(401).json({ message: 'Información de usuario no disponible para registrar el archivo.' });
    }

    const sql = "INSERT INTO archivo (NombreArchivo, TipoArchivo, RutaArchivo, UsuarioID, MinisterioID) VALUES (?, ?, ?, ?, ?)";
    const values = [NombreArchivo, simplifiedTipoArchivo, RutaArchivo, usuarioID, MinisterioID]; 

    try {
        const [result] = await db.query(sql, values);
        console.log('FILE_META_SUCCESS: Metadata de archivo registrada exitosamente. ID:', result.insertId, "Nombre:", NombreArchivo, "Ministerio:", MinisterioID);
        res.status(201).json({ message: "Metadata del archivo registrada exitosamente.", archivoID: result.insertId });
    } catch (err) {
        console.error("FILE_META_DB_ERROR: Error al registrar metadata del archivo:", err);
        res.status(500).json({ message: "Error interno del servidor al registrar metadata del archivo." });
    }
});

// Obtiene la metadata de todos los archivos.
router.get('/', authenticateToken, async (req, res) => {
    console.log("FILE_GET_ALL_REQ: Solicitud para obtener todos los archivos (metadata).");
    
    // CORRECCIÓN DE SINTAXIS SQL: Usar .trim() para limpiar espacios/saltos de línea iniciales.
    const sql = `
SELECT
    a.ArchivoID, a.NombreArchivo, a.TipoArchivo, a.RutaArchivo, a.UsuarioID, a.MinisterioID,
    m.NombreMinisterio, DATE_FORMAT(a.FechaSubida, '%Y-%m-%d %H:%i:%s') AS FechaSubida
FROM
    archivo a
LEFT JOIN
    ministerio m ON a.MinisterioID = m.MinisterioID
ORDER BY
    a.FechaSubida DESC
`.trim();

    try {
        const [results] = await db.query(sql);
        console.log('FILE_GET_ALL_SUCCESS: Archivos obtenidos de la DB para frontend:', results.length, "registros.");
        res.status(200).json({ files: results });
    } catch (err) {
        console.error("FILE_GET_ALL_DB_ERROR: Error al obtener archivos desde la DB:", err);
        res.status(500).json({ message: "Error interno del servidor al obtener archivos." });
    }
});

// Obtiene la metadata de archivos por MinisterioID.
router.get('/ministry/:ministryId', authenticateToken, async (req, res) => {
    const { ministryId } = req.params;
    console.log(`FILE_GET_BY_MINISTRY_REQ: Solicitud de archivos para MinisterioID: ${ministryId}`);

    // CORRECCIÓN DE SINTAXIS SQL: Usar .trim() para limpiar espacios/saltos de línea iniciales.
    const sql = `
SELECT
    a.ArchivoID, a.NombreArchivo, a.TipoArchivo, a.RutaArchivo, a.UsuarioID, a.MinisterioID,
    m.NombreMinisterio, DATE_FORMAT(a.FechaSubida, '%Y-%m-%d %H:%i:%s') AS FechaSubida
FROM
    archivo a
JOIN
    ministerio m ON a.MinisterioID = m.MinisterioID
WHERE
    a.MinisterioID = ?
ORDER BY
    a.FechaSubida DESC
`.trim();

    try {
        const [results] = await db.query(sql, [ministryId]);
        console.log(`FILE_GET_BY_MINISTRY_SUCCESS: Se encontraron ${results.length} archivos para MinisterioID: ${ministryId}`);
        res.status(200).json(results);
    } catch (err) {
        console.error("FILE_GET_BY_MINISTRY_DB_ERROR: Error al obtener archivos por ministerio:", err);
        res.status(500).json({ message: "Error interno del servidor al obtener archivos por ministerio." });
    }
});

// Edita el nombre de un archivo.
router.put('/:id', authenticateToken, async (req, res) => {
    const archivoID = req.params.id;
    const { NombreArchivo } = req.body;
    const userRolID = req.user?.rolID;
    const userMinisterioID = req.user?.ministerioID; 

    console.log(`FILE_UPDATE_REQ: Solicitud para editar nombre de archivo ID: ${archivoID}, Nuevo nombre: ${NombreArchivo}`);

    if (!NombreArchivo) {
        return res.status(400).json({ message: "El nuevo nombre del archivo es obligatorio." });
    }

    try {
        // VALIDACIÓN DE AUTORIZACIÓN PARA EDICIÓN
        const { isAuthorized } = await checkModificationPermission(archivoID, userRolID, userMinisterioID);
        
        if (!isAuthorized) {
            console.warn(`FILE_UPDATE_AUTH_FAIL: RolID ${userRolID} intentó editar archivo ID ${archivoID}. Permiso Denegado.`);
            return res.status(403).json({ message: "Permiso denegado. Solo el administrador o el líder del ministerio asociado pueden editar este archivo." });
        }
        
        // Ejecución de la actualización
        const sql = "UPDATE archivo SET NombreArchivo = ? WHERE ArchivoID = ?";
        const [result] = await db.query(sql, [NombreArchivo, archivoID]);

        if (result.affectedRows === 0) {
            console.warn("FILE_UPDATE_WARN: Archivo no encontrado para actualizar nombre. ID:", archivoID);
            return res.status(404).json({ message: "Archivo no encontrado para actualizar." });
        }

        console.log(`FILE_UPDATE_SUCCESS: Nombre de archivo ID ${archivoID} actualizado a: ${NombreArchivo}`);
        res.status(200).json({ message: "Nombre del archivo actualizado exitosamente." });

    } catch (err) {
        console.error(`FILE_UPDATE_DB_ERROR: Error al actualizar nombre de archivo ID ${archivoID}:`, err);
        res.status(500).json({ message: "Error interno del servidor al actualizar el nombre del archivo." });
    }
});

// Permite descargar un archivo.
router.get('/download/:id', authenticateToken, async (req, res) => {
    const archivoID = req.params.id;
    const userRolID = req.user?.rolID;
    console.log(`FILE_DOWNLOAD_REQ: Solicitud de descarga para ArchivoID: ${archivoID} por RolID: ${userRolID}`);

    // VALIDACIÓN DE DESCARGA: Solo roles Admin (1), Líder (2) y Estándar (3) pueden descargar.
    // El Lector/Invitado (4) está excluido.
    if (userRolID === ROL_LECTOR) {
        console.warn(`FILE_DOWNLOAD_AUTH_FAIL: RolID ${ROL_LECTOR} (Lector) intentó descargar archivo ID ${archivoID}.`);
        return res.status(403).json({ message: "Permiso denegado. Los lectores/invitados no pueden descargar archivos." });
    }

    try {
        const sql = "SELECT RutaArchivo, NombreArchivo FROM archivo WHERE ArchivoID = ?";
        const [results] = await db.query(sql, [archivoID]);

        if (results.length === 0) {
            console.warn("FILE_DOWNLOAD_WARN: Archivo no encontrado en DB para descarga. ID:", archivoID);
            return res.status(404).json({ message: "Archivo no encontrado para descargar." });
        }

        const { RutaArchivo, NombreArchivo } = results[0];
        const filenameOnDisk = path.basename(RutaArchivo);
        const absoluteFilePath = path.join(UPLOADS_DIR, filenameOnDisk);

        if (!fs.existsSync(absoluteFilePath)) {
            console.error("FILE_DOWNLOAD_ERROR: Archivo físico no encontrado en disco:", absoluteFilePath);
            return res.status(404).json({ message: "El archivo físico no se encontró en el servidor." });
        }

        res.download(absoluteFilePath, NombreArchivo, (err) => {
            if (err) {
                console.error(`FILE_DOWNLOAD_ERROR: Error al enviar archivo ID ${archivoID} (${NombreArchivo}):`, err);
                if (!res.headersSent) {
                    res.status(500).json({ message: "Error al descargar el archivo." });
                }
            } else {
                console.log(`FILE_DOWNLOAD_SUCCESS: Archivo ID ${archivoID} (${NombreArchivo}) enviado exitosamente.`);
            }
        });

    } catch (err) {
        console.error(`FILE_DOWNLOAD_DB_ERROR: Error al buscar archivo ID ${archivoID} en DB para descarga:`, err);
        res.status(500).json({ message: "Error interno del servidor al procesar la descarga." });
    }
});

// Elimina un archivo (Roles: 1 - Total, 2 - Solo su ministerio)
router.delete('/:id', authenticateToken, async (req, res) => {
    const archivoID = req.params.id;
    console.log("FILE_DELETE_REQ: Solicitud para eliminar archivo ID:", archivoID);

    const userRolID = req.user?.rolID;
    const userMinisterioID = req.user?.ministerioID;

    try {
        // VALIDACIÓN DE AUTORIZACIÓN PARA ELIMINACIÓN
        const { isAuthorized, fileInfo } = await checkModificationPermission(archivoID, userRolID, userMinisterioID);

        if (!isAuthorized) {
            console.warn(`FILE_DELETE_AUTH_FAIL: RolID ${userRolID} intentó eliminar archivo ID ${archivoID}. Permiso Denegado.`);
            return res.status(403).json({ message: "Permiso denegado. Solo el administrador o el líder del ministerio asociado pueden eliminar este archivo." });
        }
        
        if (!fileInfo) {
            console.warn("FILE_DELETE_WARN: Archivo no encontrado en DB para ID:", archivoID);
            return res.status(404).json({ message: "Archivo no encontrado en la base de datos para eliminar." });
        }

        // Si la autorización es exitosa, se procede a eliminar.
        const filePathInDB = fileInfo.RutaArchivo;
        const filename = path.basename(filePathInDB);
        const absoluteFilePath = path.join(UPLOADS_DIR, filename);

        // 1. Intentar eliminar el archivo físico del servidor
        try {
            await fs.promises.unlink(absoluteFilePath);
            console.log("FILE_DELETE_FS_SUCCESS: Archivo físico eliminado:", absoluteFilePath);
        } catch (unlinkErr) {
            if (unlinkErr.code === 'ENOENT') {
                console.warn("FILE_DELETE_FS_WARN: Archivo físico ya no existe en disco (posible inconsistencia):", absoluteFilePath);
            } else {
                console.error(`FILE_DELETE_FS_ERROR: Error al eliminar archivo físico: ${unlinkErr}`);
                // NOTA: Se intenta eliminar el registro de la DB incluso si falla la eliminación física para limpiar la metadata.
            }
        }

        // 2. Eliminar el registro de la metadata del archivo de la base de datos
        const deleteSql = "DELETE FROM archivo WHERE ArchivoID = ?";
        const [deleteResult] = await db.query(deleteSql, [archivoID]);

        if (deleteResult.affectedRows === 0) {
            console.warn("FILE_DELETE_DB_WARN: No se eliminó metadata de archivo, archivo no encontrado en DB ID:", archivoID);
            return res.status(404).json({ message: "Archivo no encontrado en la base de datos." });
        }

        console.log("FILE_DELETE_SUCCESS: Archivo eliminado completamente (físico + metadata). ID:", archivoID);
        res.status(200).json({ message: "Archivo eliminado exitosamente." });

    } catch (err) {
        console.error("FILE_DELETE_ERROR: Error interno al eliminar archivo:", err);
        res.status(500).json({ message: "Error interno del servidor al eliminar archivo." });
    }
});

module.exports = router;