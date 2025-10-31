/*
 * =============================================
 * Archivo: server/controllers/authController.js
 * Descripción: Maneja la lógica de autenticación de usuarios, incluyendo registro,
 * inicio de sesión, recuperación de contraseña.
 * Autor: Dilan Baltras | Fecha: 2025-10-19 (Limpieza de GitHub Login)
 * =============================================
 */

const bcrypt = require('bcryptjs'); // Para hashing y comparación de contraseñas
const jwt = require('jsonwebtoken'); // Para crear y verificar JSON Web Tokens
const db = require('../Config/db'); // Módulo de conexión a la base de datos
const transporter = require('../Config/email'); // Módulo para el envío de correos
const crypto = require('crypto'); // Módulo nativo de Node.js para criptografía
// 🛑 Eliminadas las importaciones de Axios y google-auth-library (si existían)

// Carga las variables de entorno
const JWT_SECRET = process.env.JWT_SECRET;
const CLIENT_URL = process.env.CLIENT_URL || 'http://192.168.70.89:3001'; // URL del frontend

// Verifica que la clave secreta de JWT esté definida. Si no, termina la aplicación.
if (!JWT_SECRET) {
    console.error("AUTH_INIT_ERROR: JWT_SECRET no está definido. Por favor, configúralo en tu archivo .env");
    process.exit(1);
}

/**
 * @function registerUser
 * @description Registra un nuevo usuario en la base de datos.
 */
const registerUser = async (req, res) => {
    const { Nombre, Email, Contraseña, RolID, MinisterioID } = req.body;
    console.log("AUTH_REGISTER_REQ: Solicitud de registro recibida para:", Email);

    if (!Nombre || !Email || !Contraseña) {
        return res.status(400).json({ message: "Nombre, Email y Contraseña son campos obligatorios." });
    }

    try {
        const hashedPassword = await bcrypt.hash(Contraseña, 10);
        const [existingUsers] = await db.execute("SELECT Email FROM usuario WHERE Email = ?", [Email]);

        if (existingUsers.length > 0) {
            console.warn("AUTH_REGISTER_WARN: Intento de registro con email existente:", Email);
            return res.status(409).json({ message: "El email ya está registrado." });
        }

        const sql = "INSERT INTO usuario (Nombre, Email, Contraseña, RolID, MinisterioID) VALUES (?, ?, ?, ?, ?)";
        const values = [Nombre, Email, hashedPassword, RolID || null, MinisterioID || null];

        const [result] = await db.execute(sql, values);

        console.log("AUTH_REGISTER_SUCCESS: Usuario registrado exitosamente:", Email, "ID:", result.insertId);
        return res.status(201).json({ message: "Usuario registrado exitosamente.", usuarioID: result.insertId });

    } catch (error) {
        console.error("AUTH_REGISTER_ERROR: Error en el registro de usuario para", Email, ":", error);
        res.status(500).json({ message: "Error interno del servidor al registrar usuario." });
    }
};

/**
 * @function loginUser
 * @description Autentica un usuario verificando sus credenciales y genera un JWT.
 */
const loginUser = async (req, res) => {
    const { Email, Contraseña } = req.body;
    console.log("AUTH_LOGIN_REQ: Solicitud de login recibida para:", Email);

    if (!Email || !Contraseña) {
        return res.status(400).json({ status: 'fail', message: "Email y Contraseña son obligatorios." });
    }

    try {
        const [users] = await db.execute("SELECT UsuarioID, Nombre, Email, Contraseña AS ContrasenaHash, RolID, MinisterioID FROM usuario WHERE Email = ?", [Email]);

        if (users.length === 0) {
            console.warn("AUTH_LOGIN_FAIL: Intento de login con email no encontrado:", Email);
            return res.status(401).json({ status: 'fail', message: 'Credenciales inválidas' });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(Contraseña, user.ContrasenaHash);

        if (isMatch) {
            const token = jwt.sign(
                {
                    usuarioID: user.UsuarioID,
                    email: user.Email,
                    rolID: user.RolID,
                    ministerioID: user.MinisterioID
                },
                JWT_SECRET, 
                { expiresIn: '1h' } 
            );
            console.log("AUTH_LOGIN_SUCCESS: Login exitoso para:", Email, "Token generado.");

            return res.status(200).json({
                status: 'success',
                message: 'Login correcto',
                token: token,
                user: {
                    UsuarioID: user.UsuarioID,
                    Nombre: user.Nombre,
                    Email: user.Email,
                    RolID: user.RolID,
                    MinisterioID: user.MinisterioID 
                }
            });
        } else {
            console.warn("AUTH_LOGIN_FAIL: Contraseña incorrecta para:", Email);
            return res.status(401).json({ status: 'fail', message: 'Credenciales inválidas' });
        }
    } catch (error) {
        console.error("AUTH_LOGIN_ERROR: Error en el proceso de login para", Email, ":", error);
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor al verificar credenciales.' });
    }
};

// 🛑 Eliminadas las funciones githubLogin y githubCallback

/**
 * @function forgotPassword
 * @description Maneja la solicitud de recuperación de contraseña.
 */
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    console.log("AUTH_FORGOT_PASSWORD_REQ: Solicitud de recuperación para:", email);

    try {
        const [users] = await db.execute('SELECT UsuarioID, Email FROM Usuario WHERE Email = ?', [email]);
        const user = users[0];

        if (!user) {
            console.warn("AUTH_FORGOT_PASSWORD_WARN: Intento de recuperación para email no registrado o no encontrado:", email);
            return res.status(200).json({ status: 'success', message: 'Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña.' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
        const resetTokenExpires = new Date(Date.now() + 3600000);

        await db.execute(
            'UPDATE Usuario SET resetPasswordToken = ?, resetPasswordExpires = ? WHERE UsuarioID = ?',
            [resetTokenHash, resetTokenExpires, user.UsuarioID]
        );
        console.log("AUTH_FORGOT_PASSWORD_DB_UPDATE: Token de reseteo guardado para", user.Email);

        const resetURL = `${CLIENT_URL}/reset-password/${resetToken}`;
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.Email,
            subject: 'Restablecer Contraseña - IASD Hualqui Central',
            html: `
                <p>Estimado(a) ${user.Email},</p>
                <p>Has solicitado restablecer tu contraseña para tu cuenta en **IASD Hualqui Central**.</p>
                <p>Por favor, haz clic en el siguiente enlace para establecer una nueva contraseña:</p>
                <p><a href="${resetURL}">**${resetURL}**</a></p>
                <p>Este enlace expirará en 1 hora.</p>
                <p>Si no solicitaste esto, por favor, ignora este correo.</p>
                <br/>
                <p>Atentamente,</p>
                <p>El Equipo de IASD Hualqui Central</p>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log("AUTH_FORGOT_PASSWORD_EMAIL_SENT: Enlace de restablecimiento enviado a:", user.Email);
        res.status(200).json({ status: 'success', message: 'Enlace de restablecimiento enviado a tu correo.' });

    } catch (error) {
        console.error('AUTH_FORGOT_PASSWORD_ERROR: Error en la función forgotPassword para', email, ':', error);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor al procesar la solicitud de recuperación.' });
    }
};

/**
 * @function verifyResetToken
 * @description Verifica la validez de un token de restablecimiento de contraseña.
 */
const verifyResetToken = async (req, res) => {
    const { token } = req.params;
    console.log("AUTH_VERIFY_RESET_TOKEN_REQ: Solicitud de verificación de token:", token ? token.substring(0, 10) + '...' : 'No token');

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    try {
        const [users] = await db.execute(
            'SELECT UsuarioID FROM Usuario WHERE resetPasswordToken = ? AND resetPasswordExpires > ?',
            [hashedToken, new Date()]
        );
        const user = users[0];

        if (!user) {
            console.warn("AUTH_VERIFY_RESET_TOKEN_FAIL: Token inválido o expirado:", token ? token.substring(0, 10) + '...' : 'No token');
            return res.status(400).json({ status: 'error', message: 'Token inválido o ha expirado. Por favor, solicita un nuevo enlace de recuperación.' });
        }
        console.log("AUTH_VERIFY_RESET_TOKEN_SUCCESS: Token válido.");
        res.status(200).json({ status: 'success', message: 'Token válido.' });

    } catch (error) {
        console.error('AUTH_VERIFY_RESET_TOKEN_ERROR: Error en verifyResetToken para token:', token ? token.substring(0, 10) + '...' : 'No token', ':', error);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor al verificar el token.' });
    }
};

/**
 * @function resetPassword
 * @description Restablece la contraseña de un usuario utilizando un token válido.
 */
const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    console.log("AUTH_RESET_PASSWORD_REQ: Solicitud de reseteo de contraseña para token:", token ? token.substring(0, 10) + '...' : 'No token');

    if (!password || password.length < 6) {
        return res.status(400).json({ status: 'fail', message: 'La nueva contraseña debe tener al menos 6 caracteres.' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    try {
        const [users] = await db.execute(
            'SELECT UsuarioID FROM Usuario WHERE resetPasswordToken = ? AND resetPasswordExpires > ?',
            [hashedToken, new Date()]
        );
        const user = users[0];

        if (!user) {
            console.warn("AUTH_RESET_PASSWORD_FAIL: Token inválido o expirado durante el reseteo:", token ? token.substring(0, 10) + '...' : 'No token');
            return res.status(400).json({ status: 'error', message: 'Token inválido o ha expirado. Por favor, solicita un un nuevo enlace de recuperación.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.execute(
            'UPDATE Usuario SET Contraseña = ?, resetPasswordToken = NULL, resetPasswordExpires = NULL WHERE UsuarioID = ?',
            [hashedPassword, user.UsuarioID]
        );
        console.log("AUTH_RESET_PASSWORD_SUCCESS: Contraseña actualizada y token limpiado para UsuarioID:", user.UsuarioID);
        res.status(200).json({ status: 'success', message: 'Contraseña restablecida exitosamente.' });

    } catch (error) {
        console.error('AUTH_RESET_PASSWORD_ERROR: Error en resetPassword para token:', token ? token.substring(0, 10) + '...' : 'No token', ':', error);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor al restablecer la contraseña.' });
    }
};

// Exportar todas las funciones controladoras para ser usadas en las rutas
module.exports = {
    registerUser,
    loginUser,
    forgotPassword,
    verifyResetToken,
    resetPassword,
    // 🛑 Eliminadas las funciones githubLogin y githubCallback de la exportación
};