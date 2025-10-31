/*
 * =============================================
 * Archivo: server/Middleware/authMiddleware.js
 * Descripción: Middleware para verificar tokens JWT y adjuntar
 * información del usuario (incluyendo RolID y MinisterioID) a req.user.
 * Autor: Dilan Baltras | Fecha: 2025-06-27
 * =============================================
 */

const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    // Obtener el token del header de autorización
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Formato: Bearer TOKEN

    if (token == null) {
        console.warn("AUTH_MIDDLEWARE: Intento de acceso sin token. Ruta:", req.originalUrl);
        return res.status(401).json({ message: "Acceso denegado. No se proporcionó token." });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.error("AUTH_MIDDLEWARE: Token inválido o expirado. Error:", err.message, "Ruta:", req.originalUrl);
            return res.status(403).json({ message: "Token inválido o expirado." });
        }

        // Adjuntar la información del usuario decodificada al objeto request
        // Asumiendo que tu token incluye usuarioID, rolID y ministerioID en su payload.
        req.user = user;
        
        // CÓDIGO CORREGIDO: Usando camelCase para acceder a las propiedades del token decodificado
        console.log("AUTH_MIDDLEWARE: Token verificado. Usuario ID:", req.user.usuarioID, "Rol ID:", req.user.rolID, "Ministerio ID:", req.user.ministerioID);
        
        next(); // Continuar con la siguiente función middleware/ruta
    });
};

module.exports = authenticateToken;