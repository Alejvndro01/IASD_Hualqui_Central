const Axios = require('axios');

// ⚠️ Usaremos la clave de Hunter.io
const HUNTER_IO_API_KEY = process.env.HUNTER_IO_API_KEY; 
const HUNTER_IO_URL = 'https://api.hunter.io/v2/email-verifier'; // Endpoint de verificación de Hunter

/**
 * Función que realiza la verificación de email externa utilizando Hunter.io.
 * Es el controlador para la ruta GET /auth/verify-external-email
 */
exports.verifyExternalEmail = async (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).json({ message: "Se requiere el parámetro 'email'." });
    }
    
    // 1. Validar la clave API
    if (!HUNTER_IO_API_KEY) {
        console.error("ADVERTENCIA: HUNTER_IO_API_KEY no está configurada. Saltando verificación externa.");
        return res.status(503).json({ 
            isAvailable: false, 
            message: "Servicio de verificación de email no disponible (API Key faltante)." 
        });
    }

    // 2. Llamada a la API de Verificación Externa (Hunter.io)
    try {
        const hunterResponse = await Axios.get(HUNTER_IO_URL, {
            params: {
                // 🔑 Hunter.io usa el parámetro 'api_key' y 'email'
                api_key: HUNTER_IO_API_KEY, 
                email: email
            }
        });

        const data = hunterResponse.data.data;
        const result = data.result; // 'deliverable', 'undeliverable', 'risky', 'unknown'
        
        let isAvailable = true;
        let message = "Correo válido y disponible.";

        // 3. Determinar la validez basado en el resultado de Hunter.io
        
        if (result === 'undeliverable') {
            isAvailable = false;
            // Razones comunes: invalid_host, invalid_email, invalid_smtp
            const reason = data.reason || "El correo no existe o es inválido.";
            message = `Correo inválido. Razón: ${reason.replace(/_/g, ' ')}.`;
        } else if (result === 'risky') {
            // Correos 'risky' incluyen catch_all, desechables, o de rol. 
            // La mayoría de las veces los aceptamos, pero se advierte que son 'riesgosos'.
            isAvailable = true; 
            const source = data.regexp ? "Formato sospechoso" : data.type; 
            message = `¡Válido! Pero es de tipo '${source}'. (Riesgoso)`;
        } else if (result === 'unknown') {
             // Si Hunter.io no puede verificar (ej. el servidor de correo tiene un estricto 'rate limit')
             isAvailable = false; // Mejor ser estricto
             message = "No se pudo verificar la existencia del email. Por favor, revisa el email.";
        }
        
        // Si es 'deliverable', isAvailable sigue siendo true y se usa el mensaje por defecto.

        return res.status(200).json({ 
            isAvailable: isAvailable, 
            message: message 
        });

    } catch (error) {
        console.error("Error al verificar email externo con Hunter.io:", error.message);
        
        // Manejar el error 429 (Rate Limit de Hunter.io) si es necesario
        if (error.response && error.response.status === 429) {
             return res.status(429).json({ 
                message: "Límite de verificación de email alcanzado. Inténtalo más tarde.",
                isAvailable: false
            });
        }
        
        // Fallo general del servicio.
        return res.status(500).json({ 
            message: "Fallo temporal del servicio de verificación. Intenta de nuevo.",
            isAvailable: false
        });
    }
};