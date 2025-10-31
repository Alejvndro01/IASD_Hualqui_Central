// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
// Importa el controlador de autenticación que contiene toda la lógica
const authController = require('../Controllers/authController');
const { verifyExternalEmail } = require('../Controllers/emailController'); // 👈 NUEVA IMPORTACIÓN (Ver nota 1)

// ===============================================
// RUTAS DE AUTENTICACIÓN
// ===============================================

// Ruta de Registro
router.post('/register', authController.registerUser);

// Ruta de Login Estándar
router.post('/login', authController.loginUser);

// 🔑 NUEVA RUTA DE VERIFICACIÓN DE EMAIL EXTERNA
// Esta ruta es llamada desde el frontend (onBlur) para verificar la existencia real del email.
router.get('/verify-external-email', verifyExternalEmail); // 👈 NUEVA RUTA (Ver nota 2)

// Rutas para el reseteo de contraseña
router.post('/forgot-password', authController.forgotPassword);
router.get('/reset-password/:token', authController.verifyResetToken); // Para verificar el token al cargar la página
router.post('/reset-password/:token', authController.resetPassword);

module.exports = router;