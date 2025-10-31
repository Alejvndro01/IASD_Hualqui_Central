/*
 * =============================================
 * Archivo: Validaciones.js
 * Descripción: Funciones de validación para formularios de usuario.
 * Proporciona validaciones para campos de registro y para
 * la actualización de contraseñas (nueva contraseña y confirmación).
 * Autor: Dilan Baltras | Fecha: 2025-06-28 (Actualizado)
 * =============================================
 */

/**
 * Valida los campos de un formulario de registro.
 *
 * @param {string} nombre - Nombre del usuario.
 * @param {string} email - Email del usuario.
 * @param {string} contrasena - Contraseña ingresada.
 * @param {string} confirmarContrasena - Confirmación de la contraseña.
 * @returns {Array<string>} Un array de mensajes de error; vacío si no hay errores.
 */
export const validarRegistro = (nombre, email, contrasena, confirmarContrasena) => {
    const errores = [];

    // 1. Validación del Nombre
    if (!nombre || nombre.trim() === '') {
        errores.push('El campo "Nombre" es obligatorio.');
    }

    // 2. Validación del Email
    if (!email || email.trim() === '') {
        errores.push('El campo "Email" es obligatorio.');
    } else if (!/\S+@\S+\.\S+/.test(email)) {
        errores.push('El formato del "Email" es inválido.');
    }

    // 3. Validación de la Contraseña
    // Mínimo 6 caracteres, al menos una mayúscula y un número.
    if (!contrasena || contrasena.trim() === '') {
        errores.push('El campo "Contraseña" es obligatorio.');
    } else if (contrasena.length < 6) {
        errores.push('La "Contraseña" debe tener al menos 6 caracteres.');
    } else if (!/[A-Z]/.test(contrasena)) {
        errores.push('La "Contraseña" debe contener al menos una letra mayúscula.');
    } else if (!/[0-9]/.test(contrasena)) {
        errores.push('La "Contraseña" debe contener al menos un número.');
    }

    // 4. Validación de Confirmación de Contraseña
    if (!confirmarContrasena || confirmarContrasena.trim() === '') {
        errores.push('Por favor, confirma tu contraseña.');
    } else if (contrasena !== confirmarContrasena) {
        errores.push('Las contraseñas no coinciden.');
    }

    return errores;
};

/**
 * Valida los campos de una nueva contraseña y su confirmación.
 * Aplica las mismas reglas de seguridad de contraseña que `validarRegistro`.
 *
 * @param {string} newContrasena - La nueva contraseña ingresada.
 * @param {string} confirmarNewContrasena - La confirmación de la nueva contraseña.
 * @returns {Array<string>} Un array de mensajes de error; vacío si no hay errores.
 */
export const validarNuevaContrasena = (newContrasena, confirmarNewContrasena) => {
    const errores = [];

    // 1. Validación de la Nueva Contraseña
    // Mínimo 6 caracteres, al menos una mayúscula y un número.
    if (!newContrasena || newContrasena.trim() === '') {
        errores.push('El campo "Nueva Contraseña" es obligatorio.');
    } else if (newContrasena.length < 6) {
        errores.push('La "Nueva Contraseña" debe tener al menos 6 caracteres.');
    } else if (!/[A-Z]/.test(newContrasena)) {
        errores.push('La "Nueva Contraseña" debe contener al menos una letra mayúscula.');
    } else if (!/[0-9]/.test(newContrasena)) {
        errores.push('La "Nueva Contraseña" debe contener al menos un número.');
    }

    // 2. Validación de Confirmación de la Nueva Contraseña
    if (!confirmarNewContrasena || confirmarNewContrasena.trim() === '') {
        errores.push('Por favor, confirma tu nueva contraseña.');
    } else if (newContrasena !== confirmarNewContrasena) {
        errores.push('Las nuevas contraseñas no coinciden.');
    }

    return errores;
};
