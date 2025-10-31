/*
 * =============================================
 * Archivo: ResetPassword.js
 * Descripción: Componente para establecer una nueva contraseña usando un token de reseteo.
 * Ahora con estilos que se asemejan al login y validaciones robustas.
 * Autor: Dilan Baltras | Fecha: 2025-06-28 (Actualizado)
 * =============================================
 */

/* 1. Importaciones */
import React, { useState, useEffect, useCallback } from 'react';
import Axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import styles from './ResetPassword.module.css';
import { validarNuevaContrasena } from '../../Validaciones'; // <-- IMPORTADO: Función de validación

/* 2. Constantes Globales */
// Instancia personalizada de SweetAlert2 para mostrar alertas.
const MySwal = withReactContent(Swal);
// URL base de la API para las peticiones al backend.
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
/*
 * =============================================
 * 3. ResetPassword
 * =============================================
 * Componente funcional para el formulario de restablecimiento de contraseña.
 */
function ResetPassword() {
    /* 3.1. Estado y Referencias */
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [tokenValid, setTokenValid] = useState(false); // Indica si el token es válido
    const [loading, setLoading] = useState(true);     // Indica si se está verificando el token
    const [validationErrors, setValidationErrors] = useState([]); // Estado para los errores de validación
    const { token } = useParams();                    // Obtiene el token de la URL
    const navigate = useNavigate();

    /* 3.2. Funciones de Manejo */
    // Muestra una alerta personalizada utilizando SweetAlert2.
    const showSwalAlert = useCallback((title, text, icon, callback = () => {}) => {
        MySwal.fire({
            title: title,
            text: text,
            icon: icon,
            confirmButtonText: 'Entendido',
            buttonsStyling: false,
            customClass: {
                confirmButton: 'swal2-confirm-button',
                popup: 'swal2-custom-popup'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                callback();
            }
        });
    }, []);

    // Maneja el envío del formulario para restablecer la contraseña.
    const handleResetPasswordSubmit = async (e) => {
        e.preventDefault();

        // Limpiar errores de validación anteriores
        setValidationErrors([]);

        // --- Aplicar las validaciones de Validaciones.js ---
        const errores = validarNuevaContrasena(password, confirmPassword);
        if (errores.length > 0) {
            setValidationErrors(errores);
            showSwalAlert('Error de Validación', 'Por favor, corrige los errores en los campos.', 'error');
            return;
        }

        try {
            const response = await Axios.post(`${API_BASE_URL}/auth/reset-password/${token}`, { password });
            if (response.data.status === 'success') {
                showSwalAlert(
                    'Contraseña Actualizada',
                    'Tu contraseña ha sido restablecida exitosamente. Ahora puedes iniciar sesión.',
                    'success',
                    () => navigate('/') // Redirige al login
                );
            } else {
                showSwalAlert('Error', response.data.message || 'No se pudo restablecer la contraseña.', 'error');
            }
        } catch (error) {
            console.error('Error al restablecer contraseña:', error);
            showSwalAlert('Error', error.response?.data?.message || 'Ocurrió un error inesperado. Inténtalo de nuevo.', 'error');
        }
    };

    /* 3.3. Efectos (useEffect) */
    // Verifica la validez del token al cargar el componente.
    useEffect(() => {
        const verifyToken = async () => {
            try {
                // Envía solicitud al backend para verificar el token.
                await Axios.get(`${API_BASE_URL}/auth/reset-password/${token}`);
                setTokenValid(true);
            } catch (error) {
                console.error('Error al verificar token de reseteo:', error);
                setTokenValid(false);
                showSwalAlert(
                    'Token Inválido',
                    'El enlace de restablecimiento de contraseña no es válido o ha expirado.',
                    'error',
                    () => navigate('/forgot-password') // Redirige para solicitar uno nuevo
                );
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            verifyToken();
        } else {
            setLoading(false);
            showSwalAlert('Error', 'No se encontró el token de reseteo.', 'error', () => navigate('/forgot-password'));
        }
    }, [token, navigate, showSwalAlert]); // Dependencias: token, navigate, showSwalAlert

    /* 3.4. Renderizado Condicional */
    // Muestra un mensaje de carga mientras se verifica el token.
    if (loading) {
        return <p className={styles.loadingMessage}>Cargando...</p>;
    }
    // Si el token no es válido, muestra un mensaje y se asume que SweetAlert ya redirigió.
    if (!tokenValid) {
        return <p className={styles.errorMessage}>Token inválido o expirado. Por favor, solicita un nuevo enlace de recuperación.</p>;
    }

    /* 3.5. Renderizado JSX */
    return (
        <form onSubmit={handleResetPasswordSubmit} className={styles.resetPasswordForm}>
            <h1>Establecer Nueva Contraseña</h1>
            <span>Ingresa tu nueva contraseña</span>

            {/* Mostrar errores de validación aquí */}
            {validationErrors.length > 0 && (
                <div className={styles.errorMessages}>
                    {validationErrors.map((error, index) => (
                        <p key={index}><i className='bx bx-error-circle'></i> {error}</p>
                    ))}
                </div>
            )}

            <input
                type="password"
                placeholder="Nueva Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.formInput}
                required
            />
            <input
                type="password"
                placeholder="Confirmar Contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={styles.formInput}
                required
            />
            <button type="submit" className={styles.submitButton}>Restablecer Contraseña</button>
        </form>
    );
}

/* 4. Exportación */
export default ResetPassword;
