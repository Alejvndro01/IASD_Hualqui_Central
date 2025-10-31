/*
 * =============================================
 * Archivo: server/Middleware/adminMiddleware.js
 * Descripción: Middleware para verificar si el usuario es Administrador (RolID = 1).
 * Depende de que authMiddleware.js se haya ejecutado previamente para adjuntar req.user.
 * Autor: Dilan Baltras | Fecha: 2025-10-19
 * =============================================
 */

const isAdmin = (req, res, next) => {
    // Asumimos que el RolID 1 es el Administrador General.
    const ADMIN_ROL_ID = 1; 

    // req.user.rolID se establece en authMiddleware.js
    if (req.user && req.user.rolID === ADMIN_ROL_ID) {
        console.log("ADMIN_MIDDLEWARE: Acceso permitido. RolID:", req.user.rolID);
        next(); // El usuario es Admin, continuar.
    } else {
        console.warn("ADMIN_MIDDLEWARE: Acceso denegado. Usuario ID:", req.user?.usuarioID, "RolID:", req.user?.rolID);
        return res.status(403).json({ 
            message: "Permiso denegado. Se requiere rol de Administrador General." 
        });
    }
};

module.exports = isAdmin;