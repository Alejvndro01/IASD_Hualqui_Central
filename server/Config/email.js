// server/config/email.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.example.com', // Tu host SMTP
    port: process.env.EMAIL_PORT || 587, // Puerto SMTP (ej. 587 para TLS)
    secure: process.env.EMAIL_SECURE === 'true' || false, // true para 465, false para otros puertos (ej. 587)
    auth: {
        user: process.env.EMAIL_USER, // Tu dirección de correo
        pass: process.env.EMAIL_PASS, // Contraseña de la aplicación/correo
    },
    tls: {
        rejectUnauthorized: false // Puede ser necesario para algunos servidores de prueba
    }
});

transporter.verify(function (error, success) {
    if (error) {
        console.error("Error al conectar con el servidor de correo:", error);
    } else {
        console.log("Servidor de correo listo para enviar mensajes.");
    }
});

module.exports = transporter;