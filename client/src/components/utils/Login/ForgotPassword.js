/*
 * =============================================
 * Archivo: ForgotPassword.js
 * Descripción: Componente para solicitar el restablecimiento de contraseña.
 * Ahora funciona como un modal, con estilos mejorados y un botón de cerrar.
 * Autor: Dilan Baltras | Fecha: 2025-06-28 (Actualizado)
 * =============================================
 */

/* 1. Importaciones */
import React, { useState, useCallback } from 'react';
import ReactDOM from 'react-dom'; // Importa ReactDOM para los Portals
import Axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

// `useNavigate` no se usa directamente en este componente en la redirección después de cerrar el modal,
// ya que el cierre y la navegación están en el mismo callback que `onClose()`.
// Sin embargo, si `onClose` en el componente padre también maneja la navegación,
// podríamos considerar si es realmente necesario aquí. Por ahora, lo mantenemos.
import { useNavigate } from 'react-router-dom';

// Importa el archivo de estilos CSS modular
import styles from './ForgotPassword.module.css'; 

/* 2. Constantes Globales */
// Instancia personalizada de SweetAlert2 para mostrar alertas.
const MySwal = withReactContent(Swal);
// URL base de la API para las peticiones al backend.
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
/*
 * =============================================
 * 3. ForgotPassword
 * =============================================
 * Componente funcional para el formulario de recuperación de contraseña,
 * ahora renderizado como un modal.
 * @param {object} props - Propiedades del componente.
 * @param {boolean} props.isVisible - Controla si el modal es visible.
 * @param {function} props.onClose - Función de callback para cerrar el modal.
 * @returns {JSX.Element | null} Un modal con el formulario de recuperación o null si no es visible.
 */
function ForgotPassword({ isVisible, onClose }) {
    /* 3.1. Estado y Referencias */
    const [email, setEmail] = useState('');
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

    // No renderizar si el modal no es visible
    if (!isVisible) {
        return null;
    }

    // Maneja el envío del formulario para solicitar el restablecimiento de contraseña.
    const handleForgotPasswordSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            showSwalAlert('Campo Vacío', 'Por favor, ingresa tu dirección de correo electrónico.', 'warning');
            return;
        }

        try {
            const response = await Axios.post(`${API_BASE_URL}/auth/forgot-password`, { email });
            if (response.data.status === 'success') {
                showSwalAlert(
                    'Correo Enviado',
                    'Se ha enviado un enlace para restablecer tu contraseña a tu correo electrónico.',
                    'success',
                    () => {
                        setEmail(''); // Limpia el campo de email aquí
                        onClose(); // Cierra el modal
                        navigate('/'); // Redirige al login después de enviar el correo
                    }
                );
            } else {
                showSwalAlert('Error', response.data.message || 'No se pudo enviar el correo de recuperación.', 'error');
            }
        } catch (error) {
            console.error('Error al solicitar recuperación de contraseña:', error);
            showSwalAlert('Error', error.response?.data?.message || 'Ocurrió un error inesperado. Inténtalo de nuevo.', 'error');
        }
    };

    /* 3.3. Renderizado JSX del Modal */
    // Usa ReactDOM.createPortal para renderizar el modal fuera del DOM principal de la aplicación.
    return ReactDOM.createPortal(
        <div className={styles.modalOverlay} onClick={onClose}> {/* Cierra el modal al hacer clic en el overlay */}
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}> {/* Evita que el clic dentro del modal lo cierre */}
                {/* Botón de cerrar el modal */}
                <button className={styles.closeButton} onClick={onClose} title="Cerrar">
                    <i className='bx bx-x'></i> {/* Icono de Boxicons para cerrar */}
                </button>

                {/* Contenido del formulario de recuperación */}
                <form className={styles.forgotPasswordForm} onSubmit={handleForgotPasswordSubmit}>
                    <h1 className={styles.formTitle}>Recuperar Contraseña</h1>
                    <p className={styles.formSubtitle}>Ingresa tu email para restablecer tu contraseña</p>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className={styles.formInput}
                    />
                    <button type="submit" className={styles.submitButton}>Enviar Enlace de Reseteo</button>
                    {/* El enlace "Volver al Login" ahora también cierra el modal */}
                    <a href="#" onClick={(e) => { e.preventDefault(); onClose(); navigate('/'); }} className={styles.backToLoginLink}>Volver al Login</a>
                </form>
            </div>
        </div>,
        document.body // Adjunta el portal directamente al body del documento
    );
}

/* 4. Exportación */
export default ForgotPassword;
