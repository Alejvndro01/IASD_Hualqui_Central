/*
 * =============================================
 * Archivo: server/routes/ministryRoutes.js
 * Descripción: Define las rutas de la API para la gestión de ministerios.
 * Permite crear nuevos ministerios y obtener la lista de todos los ministerios.
 * El GET de ministerios ahora es público.
 * Autor: Dilan Baltras | Fecha: 2025-06-27
 * =============================================
 */

const express = require('express');
const router = express.Router();
const db = require('../Config/db'); // Módulo de conexión a la base de datos
const authenticateToken = require('../Middleware/authMiddleware'); // Middleware de autenticación JWT

/**
 * @route POST /api/ministries
 * @description Crea un nuevo ministerio en la base de datos.
 * Requiere autenticación.
 * @access Private (solo usuarios autenticados, se recomienda admin)
 */
router.post('/', authenticateToken, async (req, res) => { // La creación sigue siendo privada
    const { NombreMinisterio } = req.body;
    console.log("MINISTRY_CREATE_REQ: Solicitud para crear ministerio con nombre:", NombreMinisterio);

    // Valida que el nombre del ministerio no esté vacío
    if (!NombreMinisterio) {
        return res.status(400).json({ message: "El nombre del ministerio es requerido." });
    }

    const sql = "INSERT INTO ministerio (NombreMinisterio) VALUES (?)";
    try {
        const [result] = await db.query(sql, [NombreMinisterio]);
        console.log("MINISTRY_CREATE_SUCCESS: Ministerio creado exitosamente:", NombreMinisterio, "ID:", result.insertId);
        res.status(201).json({ message: "Ministerio creado exitosamente.", ministerioID: result.insertId });
    } catch (err) {
        console.error("MINISTRY_CREATE_ERROR: Error al crear ministerio:", err.message);
        // Maneja el error de entrada duplicada si el ministerio ya existe
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: "El ministerio ya existe." });
        }
        // Para otros errores del servidor
        return res.status(500).json({ message: "Error interno del servidor al crear ministerio." });
    }
});

/**
 * @route GET /api/ministries
 * @description Obtiene todos los ministerios de la base de datos.
 * NO Requiere autenticación para permitir el uso público en formularios de registro.
 * @access Public
 */
router.get('/', async (req, res) => { // <-- CAMBIO CLAVE: authenticateToken ELIMINADO
    console.log("MINISTRY_GET_ALL_REQ: Solicitud para obtener todos los ministerios (público).");

    try {
        const sql = "SELECT MinisterioID, NombreMinisterio FROM ministerio ORDER BY NombreMinisterio ASC";
        const [rows] = await db.query(sql);

        console.log("MINISTRY_GET_ALL_SUCCESS: Se obtuvieron", rows.length, "ministerios de la base de datos.");
        res.status(200).json(rows); // Envía la lista de ministerios como respuesta
    } catch (error) {
        console.error("MINISTRY_GET_ALL_ERROR: Error al obtener ministerios:", error.message);
        res.status(500).json({ message: "Error del servidor al obtener ministerios." });
    }
});

module.exports = router;
