/*
 * =============================================
 * Archivo: server/routes/userRoutes.js
 * Descripción: Rutas de la API para la gestión CRUD de usuarios por el Administrador.
 * TODAS las rutas requieren autenticación y el rol de Administrador.
 * Autor: Dilan Baltras | Fecha: 2025-10-19
 * =============================================
 */

const express = require('express');
const router = express.Router();
const db = require('../Config/db');
const authenticateToken = require('../Middleware/authMiddleware'); // Verifica el token
const isAdmin = require('../Middleware/adminMiddleware'); // Verifica el rol de Administrador
const bcrypt = require('bcryptjs'); // Para hashear contraseñas

// Montar el middleware de autenticación y el de administrador en todas las rutas de este módulo
router.use(authenticateToken, isAdmin);

// -----------------------------------------------------
// RUTAS DE GESTIÓN DE USUARIOS (CRUD)
// -----------------------------------------------------

/**
 * @route GET /api/users
 * @description Obtiene la lista completa de todos los usuarios (Rol y Ministerio incluidos).
 */
router.get('/', async (req, res) => {
    console.log("USER_CRUD_REQ: Solicitud de lista completa de usuarios por Admin.");
    try {
        // --- CONSULTA CORREGIDA ---
        // Se elimina la referencia a 'FechaRegistro' para compatibilidad con el esquema proporcionado.
        const sql = `
            SELECT
                u.UsuarioID,
                u.Nombre,
                u.Email,
                u.RolID,
                r.NombreRol,
                u.MinisterioID,
                m.NombreMinisterio
            FROM
                usuario u
            LEFT JOIN
                rol r ON u.RolID = r.RolID
            LEFT JOIN
                ministerio m ON u.MinisterioID = m.MinisterioID
            ORDER BY u.Nombre ASC;
        `;
        const [users] = await db.query(sql);
        console.log("USER_CRUD_SUCCESS: Lista de", users.length, "usuarios obtenida.");
        
        // El frontend espera el campo 'FechaRegistro', así que simularemos un valor simple para evitar un error de renderizado.
        const usersWithMockDate = users.map(user => ({
            ...user,
            FechaRegistro: 'N/A' // O un valor más adecuado si lo agregas al DB.
        }));
        
        res.status(200).json(usersWithMockDate);
    } catch (error) {
        // Si hay otro error (ej. nombre de tabla 'usuario' es incorrecto)
        console.error("USER_CRUD_DB_ERROR: Error crítico al obtener lista de usuarios. Error de MySQL:", error.message || error);
        res.status(500).json({ message: "Error interno del servidor al obtener usuarios. (Verifica nombres de tablas y columnas: 'usuario', 'rol', 'ministerio')." });
    }
});

/**
 * @route POST /api/users
 * @description Crea un nuevo usuario. Protegido solo para el Administrador.
 */
router.post('/', async (req, res) => {
    const { Nombre, Email, Contraseña, RolID, MinisterioID } = req.body;
    console.log("USER_CRUD_CREATE_REQ: Solicitud de creación de usuario por Admin:", Email);

    // Validación básica de campos obligatorios
    if (!Nombre || !Email || !Contraseña || !RolID) {
        return res.status(400).json({ message: "Nombre, Email, Contraseña y Rol son obligatorios para crear un usuario." });
    }

    try {
        // 1. Verificar si el email ya existe
        const [existingUsers] = await db.execute("SELECT Email FROM usuario WHERE Email = ?", [Email]);

        if (existingUsers.length > 0) {
            console.warn("USER_CRUD_CREATE_WARN: Intento de creación con email existente:", Email);
            return res.status(409).json({ message: "El email ya está registrado." });
        }

        // 2. Hashear la contraseña
        const hashedPassword = await bcrypt.hash(Contraseña, 10);

        // 3. Insertar el nuevo usuario en la tabla 'usuario'
        const sql = "INSERT INTO usuario (Nombre, Email, Contraseña, RolID, MinisterioID) VALUES (?, ?, ?, ?, ?)";
        const values = [Nombre, Email, hashedPassword, RolID, MinisterioID || null];

        const [result] = await db.execute(sql, values); 

        console.log("USER_CRUD_CREATE_SUCCESS: Usuario creado exitosamente por Admin:", Email, "ID:", result.insertId);
        return res.status(201).json({ message: "Usuario creado exitosamente.", usuarioID: result.insertId });

    } catch (error) {
        console.error("USER_CRUD_CREATE_ERROR: Error en la creación de usuario por Admin para", Email, ":", error);
        res.status(500).json({ message: "Error interno del servidor al crear usuario." });
    }
});


/**
 * @route PUT /api/users/:id
 * @description Modifica el Nombre, Email, RolID y MinisterioID de un usuario por su ID.
 * NO permite cambiar la contraseña directamente por seguridad.
 */
router.put('/:id', async (req, res) => {
    const usuarioID = req.params.id;
    const { Nombre, Email, RolID, MinisterioID } = req.body;
    console.log(`USER_CRUD_UPDATE_REQ: Solicitud para modificar UsuarioID: ${usuarioID} por Admin.`);

    if (!Nombre || !Email || !RolID) {
        return res.status(400).json({ message: "Nombre, Email y RolID son campos obligatorios." });
    }

    try {
        const sql = `
            UPDATE usuario 
            SET Nombre = ?, Email = ?, RolID = ?, MinisterioID = ? 
            WHERE UsuarioID = ?
        `;
        const values = [Nombre, Email, RolID, MinisterioID || null, usuarioID];

        const [result] = await db.query(sql, values);

        if (result.affectedRows === 0) {
            console.warn(`USER_CRUD_UPDATE_WARN: UsuarioID ${usuarioID} no encontrado para actualizar.`);
            return res.status(404).json({ message: "Usuario no encontrado." });
        }

        console.log(`USER_CRUD_UPDATE_SUCCESS: UsuarioID ${usuarioID} actualizado.`);
        res.status(200).json({ message: "Usuario actualizado exitosamente." });

    } catch (error) {
        console.error(`USER_CRUD_UPDATE_ERROR: Error al actualizar UsuarioID ${usuarioID}:`, error);
        res.status(500).json({ message: "Error interno del servidor al actualizar el usuario." });
    }
});

/**
 * @route PATCH /api/users/:id/password
 * @description Permite al Administrador restablecer la contraseña de un usuario.
 */
router.patch('/:id/password', async (req, res) => {
    const usuarioID = req.params.id;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ message: "La nueva contraseña debe tener al menos 6 caracteres." });
    }

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        const sql = `UPDATE usuario SET Contraseña = ? WHERE UsuarioID = ?`;
        const [result] = await db.query(sql, [hashedPassword, usuarioID]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Usuario no encontrado." });
        }

        console.log(`USER_CRUD_PASSWORD_SUCCESS: Contraseña restablecida por Admin para UsuarioID: ${usuarioID}`);
        res.status(200).json({ message: "Contraseña restablecida exitosamente." });

    } catch (error) {
        console.error(`USER_CRUD_PASSWORD_ERROR: Error al restablecer contraseña para UsuarioID ${usuarioID}:`, error);
        res.status(500).json({ message: "Error interno del servidor al restablecer la contraseña." });
    }
});


/**
 * @route DELETE /api/users/:id
 * @description Elimina un usuario de la base de datos.
 */
router.delete('/:id', async (req, res) => {
    const usuarioID = req.params.id;
    console.log(`USER_CRUD_DELETE_REQ: Solicitud para eliminar UsuarioID: ${usuarioID} por Admin.`);

    // Opcional: Impedir que el administrador se elimine a sí mismo (si el token contiene su ID)
    if (req.user.usuarioID == usuarioID) {
         return res.status(403).json({ message: "No puedes eliminar tu propia cuenta de administrador." });
    }

    try {
        // Ejecutar la eliminación
        const sql = "DELETE FROM usuario WHERE UsuarioID = ?";
        const [result] = await db.query(sql, [usuarioID]);

        if (result.affectedRows === 0) {
            console.warn(`USER_CRUD_DELETE_WARN: UsuarioID ${usuarioID} no encontrado para eliminar.`);
            return res.status(404).json({ message: "Usuario no encontrado." });
        }

        console.log(`USER_CRUD_DELETE_SUCCESS: UsuarioID ${usuarioID} eliminado exitosamente.`);
        res.status(200).json({ message: "Usuario eliminado exitosamente." });

    } catch (error) {
        console.error(`USER_CRUD_DELETE_ERROR: Error al eliminar UsuarioID ${usuarioID}:`, error);
        res.status(500).json({ message: "Error interno del servidor al eliminar el usuario." });
    }
});

module.exports = router;
