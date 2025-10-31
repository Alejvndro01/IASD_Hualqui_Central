/*
 * =============================================
 * Archivo: server/routes/roleRoutes.js
 * Descripción: Define las rutas de la API para la gestión de roles.
 * Permite crear nuevos roles y obtener la lista de todos los roles.
 * El GET de roles ahora es público.
 * Autor: Dilan Baltras | Fecha: 2025-06-27
 * =============================================
 */

const express = require('express');
const router = express.Router();
const db = require('../Config/db'); // Módulo de conexión a la base de datos
const authenticateToken = require('../Middleware/authMiddleware'); // Middleware de autenticación JWT

/**
 * @route POST /api/roles
 * @description Crea un nuevo rol en la base de datos.
 * Requiere autenticación.
 * @access Private (solo usuarios autenticados, se recomienda admin)
 */
router.post('/', authenticateToken, async (req, res) => { // La creación sigue siendo privada
    const { NombreRol } = req.body;
    console.log("ROLE_CREATE_REQ: Solicitud para crear rol con nombre:", NombreRol);

    if (!NombreRol) {
        return res.status(400).json({ message: "El nombre del rol es requerido." });
    }

    const sql = "INSERT INTO rol (NombreRol) VALUES (?)";
    try {
        const [result] = await db.query(sql, [NombreRol]);
        console.log("ROLE_CREATE_SUCCESS: Rol creado exitosamente:", NombreRol, "ID:", result.insertId);
        res.status(201).json({ message: "Rol creado exitosamente.", RolID: result.insertId });
    } catch (err) {
        console.error("ROLE_CREATE_ERROR: Error al crear rol:", err.message);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: "El rol ya existe." });
        }
        return res.status(500).json({ message: "Error interno del servidor al crear rol." });
    }
});

/**
 * @route GET /api/roles
 * @description Obtiene todos los roles de la base de datos.
 * NO Requiere autenticación para permitir el uso público en formularios de registro.
 * @access Public
 */
router.get('/', async (req, res) => { // <-- CAMBIO CLAVE: authenticateToken ELIMINADO
    console.log("ROLE_GET_ALL_REQ: Solicitud para obtener todos los roles (público).");

    try {
        const sql = "SELECT RolID, NombreRol FROM Rol ORDER BY NombreRol ASC";
        const [rows] = await db.query(sql);

        console.log("ROLE_GET_ALL_SUCCESS: Se obtuvieron", rows.length, "roles de la base de datos.");
        res.status(200).json(rows);
    } catch (error) {
        console.error("ROLE_GET_ALL_ERROR: Error al obtener roles:", error.message);
        res.status(500).json({ message: "Error del servidor al obtener roles." });
    }
});

module.exports = router;
