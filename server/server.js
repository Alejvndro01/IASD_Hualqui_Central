/*
 * =============================================
 * Archivo: server.js
 * Descripción: Configuración principal del servidor Express.
 * Monta rutas de autenticación, ministerios, roles, archivos y la nueva gestión de usuarios.
 * Autor: Dilan Baltras | Fecha: 2025-10-19 (Actualizado)
 * =============================================
 */
require('dotenv').config(); 

const express = require('express');
const cors = require('cors'); 
const path = require('path'); 

const app = express(); 

// --- Importar configuración de la base de datos ---
const db = require('./Config/db'); 

// --- Importar middlewares ---
const authenticateToken = require('./Middleware/authMiddleware'); // Middleware de autenticación
const { UPLOADS_DIR } = require('./Middleware/uploadMiddleware'); // Directorio de subidas
// const isAdmin = require('./Middleware/adminMiddleware'); // <--- Ya no se necesita aquí, se importa en userRoutes

// --- Importar módulos de rutas ---
const authRoutes = require('./Routes/authRoutes'); 
const ministryRoutes = require('./Routes/ministryRoutes');
const roleRoutes = require('./Routes/roleRoutes');     
const fileRoutes = require('./Routes/fileRoutes');     
const userRoutes = require('./Routes/userRoutes');     // <--- NUEVAS RUTAS DE USUARIO/ADMIN

// ===========================================
// MIDDLEWARE GENERAL
// ===========================================
app.use(cors()); 

// 🔑 CLAVE: AUMENTAR EL LÍMITE DEL CUERPO DE LA PETICIÓN
// Esto es necesario para subir archivos grandes (el límite por defecto es muy bajo).
// Establecemos un límite de 50MB.
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ extended: true, limit: '50mb' })); 

// Servir archivos estáticos desde la carpeta 'uploads'
app.use('/uploads', express.static(UPLOADS_DIR));
console.log(`SERVER_INFO: Sirviendo archivos estáticos desde: ${UPLOADS_DIR}`);

// ===========================================
// MONTAR RUTAS DE LA API
// ===========================================
// Cada grupo de rutas se monta bajo un prefijo URL específico.
app.use('/auth', authRoutes);         
app.use('/ministerios', ministryRoutes); 
app.use('/roles', roleRoutes);         
app.use('/archivos', fileRoutes);       
app.use('/users', userRoutes);         

// --- Ruta protegida para obtener información del usuario autenticado ---
app.get('/api/userinfo', authenticateToken, (req, res) => {
    // req.user es establecido por el middleware 'authenticateToken'
    console.log("USER_INFO_REQ: Solicitud de info de usuario para:", req.user.email);
    res.status(200).json({
        message: 'Información de usuario autenticada.',
        user: {
            usuarioID: req.user.usuarioID,
            email: req.user.email,
            rolID: req.user.rolID,
            ministerioID: req.user.ministerioID // Aseguramos que ministerioID también se envíe
        }
    });
});

// ===========================================
// MANEJO DE ERRORES Y RUTAS NO ENCONTRADAS
// ===========================================

// Middleware para manejar rutas no encontradas (404 Not Found)
app.use((req, res, next) => {
    res.status(404).json({ message: 'Ruta no encontrada', path: req.originalUrl });
});

// Middleware centralizado para manejar errores (500 Internal Server Error)
app.use((err, req, res, next) => {
    console.error('ERROR DEL SERVIDOR:', err.stack); 
    res.status(err.status || 500).json({
        message: err.message || 'Error interno del servidor',
        error: process.env.NODE_ENV === 'production' ? {} : err
    });
});

// ===========================================
// INICIO DEL SERVIDOR
// ===========================================
const PORT = process.env.PORT || 3001; 
app.listen(PORT, () => {
    console.log(`SERVER_INFO: Servidor backend ejecutándose en el puerto ${PORT}`);
    console.log('SERVER_INFO: Para detener el servidor, presiona Ctrl+C');
});