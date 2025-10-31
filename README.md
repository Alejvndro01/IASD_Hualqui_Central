# Sistema de Gestión de Archivos - IASD Hualqui Central

Este proyecto es una aplicación web full-stack diseñada para gestionar los archivos y recursos de los ministerios de la Iglesia Adventista del Séptimo Día de Hualqui Central.

La aplicación consta de dos componentes principales:
* **/client**: Un frontend de React (usando Create React App) desplegado en **Vercel**.
* **/server**: Un backend de API REST (usando Node.js/Express y MySQL) desplegado en **Railway**.

---

## 🚀 Despliegue

La aplicación está desplegada en dos plataformas separadas que se comunican entre sí:

* **Frontend (Vercel):** `[Pega aquí tu URL de Vercel]`
* **Backend (Railway):** `[Pega aquí tu URL de Railway]`

---

## 🛠️ Stack Tecnológico

### Backend (`/server`)
* **Node.js**
* **Express.js** (Para la API REST)
* **MySQL** (Base de datos)
* **mysql2/promise** (Driver de la base de datos)
* **JSON Web Tokens (JWT)** (Para autenticación)
* **Bcrypt.js** (Para hash de contraseñas)
* **Multer** (Para subida de archivos)
* **Nodemailer** (Para envío de correos de recuperación)
* **CORS**

### Frontend (`/client`)
* **React** (usando Create React App)
* **React Router DOM** (Para enrutamiento)
* **Axios** (Para peticiones a la API)
* **SweetAlert2** (Para notificaciones y alertas)
* **React Data Table Component** (Para tablas de administración)
* **CSS Modules** (Para estilos encapsulados)

---

## 🏁 Instalación y Ejecución Local

Para ejecutar este proyecto en tu máquina local, sigue estos pasos.

### 1. Requisitos Previos
* Node.js (v18 o superior)
* Un servidor de base de datos MySQL local.

### 2. Configuración del Backend (`/server`)

1.  **Navega a la carpeta del servidor:**
    ```bash
    cd server
    ```
2.  **Instala las dependencias:**
    ```bash
    npm install
    ```
3.  **Configura la Base de Datos:**
    * Importa el archivo `IASD_Central_Hualqui_DB.sql` en tu MySQL local.
4.  **Configura las Variables de Entorno:**
    * Crea un archivo `.env` en la carpeta `/server`.
    * Añade las siguientes variables (ajusta los valores a tu entorno local):
        ```env
        # Credenciales de Base de Datos
        DB_HOST=localhost
        DB_USER=root
        DB_PASSWORD=tu_contraseña_local
        DB_DATABASE=iglesia_hualqui_db

        # Clave secreta para JWT (¡genera una nueva!)
        JWT_SECRET="UNA_CLAVE_SECRETA_MUY_LARGA_Y_COMPLEJA"

        # Puerto del servidor
        PORT=3001
        
        # URL del Frontend (para CORS y Emails)
        CLIENT_URL=http://localhost:3000

        # (Opcional) Credenciales de Email y Hunter
        EMAIL_USER=tu_email@gmail.com
        EMAIL_PASS=tu_app_password
        HUNTER_IO_API_KEY=tu_hunter_key
        ```
5.  **Inicia el servidor:**
    ```bash
    npm start
    ```
    El backend estará corriendo en `http://localhost:3001`.

### 3. Configuración del Frontend (`/client`)

1.  **Abre una nueva terminal y navega a la carpeta del cliente:**
    ```bash
    cd client
    ```
2.  **Instala las dependencias:**
    ```bash
    npm install
    ```
3.  **Configura las Variables de Entorno:**
    * Crea un archivo `.env` en la carpeta `/client`.
    * Añade la variable de la API:
        ```env
        REACT_APP_API_URL=http://localhost:3001
        ```
4.  **Inicia el cliente:**
    ```bash
    npm start
    ```
    La aplicación se abrirá automáticamente en `http://localhost:3000`.