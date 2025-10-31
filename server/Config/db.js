// server/Config/db.js
const mysql = require('mysql2/promise'); // Asegúrate de tener 'mysql2' instalado (npm install mysql2)

// Utiliza createPool en lugar de createConnection
const db = mysql.createPool({ // <--- ¡CAMBIADO A createPool!
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE, // Mantengo DB_DATABASE como lo tienes, pero DB_NAME es común
    waitForConnections: true, // Esperar si todas las conexiones están en uso
    connectionLimit: 10,      // Número máximo de conexiones en el pool
    queueLimit: 0             // Sin límite de cola (0 significa ilimitado)
});

// Prueba la conexión del pool al inicio de la aplicación
db.getConnection()
    .then(connection => {
        console.log("DB_INFO: Conectado a MySQL: " + process.env.DB_DATABASE);
        connection.release(); // Libera la conexión de prueba de vuelta al pool
    })
    .catch(err => {
        console.error("DB_ERROR: Error de conexión MySQL:", err.message);
        console.error("DB_ERROR: Asegúrate de que el servidor MySQL esté ejecutándose y las credenciales en .env sean correctas.");
        process.exit(1); // Termina la aplicación si la conexión inicial falla
    });

module.exports = db;