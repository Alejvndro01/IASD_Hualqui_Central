/*
 * =============================================
 * Archivo: Login.js
 * Descripción: Componente para el inicio de sesión de usuarios.
 * Ahora integra el modal de recuperación de contraseña y la función de revelar contraseña.
 * El icono revelador solo aparece si hay texto en el campo.
 * Autor: Dilan Baltras | Fecha: 2025-06-28 (Limpieza de GitHub Login)
 * =============================================
 */

/* 1. Importaciones */
import React, { useState, useEffect, useCallback } from 'react';
import Axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import ForgotPassword from './ForgotPassword'; // Importa el componente modal

/* 2. Constantes Globales */
// Instancia personalizada de SweetAlert2 para mostrar alertas.
const MySwal = withReactContent(Swal);
// URL base de la API para las peticiones al backend.
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
/*
 * =============================================
 * 3. Login
 * =============================================
 * Componente funcional para el formulario de inicio de sesión.
 * @param {Object} props - Propiedades recibidas por el componente.
 * @param {string} props.emailInicial - Email pre-rellenado (opcional).
 */
function Login({ emailInicial }) { 
    /* 3.1. Estado y Referencias */
    const [email, setEmail] = useState("");
    const [contrasena, setContrasena] = useState("");
    const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false); // Estado para controlar el modal
    const [showPassword, setShowPassword] = useState(false); // Estado para alternar la visibilidad de la contraseña
    const navigate = useNavigate();

    /* 3.2. Funciones de Manejo */
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

    const handleLogin = async (e) => {
        e.preventDefault();
        // ... (lógica de login estándar)
        if (!email || !contrasena) {
            showSwalAlert("Campos Vacíos", "Debes completar todos los campos.", "warning");
            return;
        }

        try {
            const response = await Axios.post(`${API_BASE_URL}/auth/login`, {
                Email: email,
                Contraseña: contrasena
            });

            if (response.data.status === 'success') {
                localStorage.setItem('authToken', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));

                showSwalAlert('Inicio de Sesión Exitoso', 'Bienvenido de nuevo.', 'success', () => {
                    navigate('/home');
                });
            } else {
                showSwalAlert('Error de Login', response.data.message || 'Credenciales inválidas.', 'error');
                console.warn("Login Fallido: Mensaje del servidor:", response.data.message);
            }
        } catch (error) {
            console.error('Error General al Iniciar Sesión:', error);
            // ... (lógica de manejo de error)
            let errorMessage = 'Ocurrió un error inesperado al intentar iniciar sesión. Por favor, inténtalo de nuevo.';
            if (error.response) {
                errorMessage = error.response.data.message || `Error del servidor (Código: ${error.response.status}).`;
            } else if (error.request) {
                errorMessage = 'No se pudo conectar con el servidor. Por favor, verifica tu conexión o el estado del backend.';
            } else {
                errorMessage = 'Ocurrió un error al preparar la solicitud: ' + error.message;
            }
            showSwalAlert('Error', errorMessage, 'error');
        }
    };

    // 🛑 Eliminado: handleLoginError fusionado en handleLogin para simplificar el código.
    // Abre el modal de recuperación de contraseña
    const openForgotPasswordModal = useCallback((e) => {
        e.preventDefault();
        setShowForgotPasswordModal(true);
    }, []);

    // Cierra el modal de recuperación de contraseña
    const closeForgotPasswordModal = useCallback(() => {
        setShowForgotPasswordModal(false);
    }, []);

    // Función para alternar la visibilidad de la contraseña
    const togglePasswordVisibility = useCallback(() => {
        setShowPassword(prev => !prev);
    }, []);

    // 🛑 Eliminado: handleGitHubIconClick ya no es necesario.

    /* 3.3. Efectos (useEffect) */
    useEffect(() => {
        if (emailInicial) {
            setEmail(emailInicial);
        }
    }, [emailInicial]); 

    /* 3.4. Renderizado JSX */
    return (
        <>
            <form onSubmit={handleLogin}>
                <h1>Iniciar Sesión</h1>
                <div className="social-icons">
                    {/* Iconos de redes sociales revertidos a placeholders */}
                    <a href="#" className="icon">
                        <i className="fa-brands fa-google-plus-g"></i>
                    </a>
                    <a href="#" className="icon"><i className="fa-brands fa-facebook-f"></i></a>
                    {/* 🛑 Ícono de GitHub (placeholder) */}
                    <a href="#" className="icon">
                        <i className="fa-brands fa-github"></i>
                    </a>
                    <a href="#" className="icon"><i className="fa-brands fa-linkedin-in"></i></a>
                </div>
                <span>o usa tu email y contraseña</span>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                
                {/* Contenedor para el input y el icono (Revelador de Contraseña). */}
                <div style={{ position: 'relative', width: '100%' }}> 
                    <input
                        type={showPassword ? "text" : "password"} 
                        placeholder="Contraseña"
                        value={contrasena}
                        onChange={(e) => {
                            setContrasena(e.target.value);
                            if (e.target.value.length === 0) setShowPassword(false);
                        }}
                        required
                        style={{ paddingRight: '40px', width: '100%', boxSizing: 'border-box' }} 
                    />
                    
                    {/* CLAVE: Renderiza el icono SOLO si contrasena tiene caracteres */}
                    {contrasena.length > 0 && (
                        <i 
                            className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} 
                            onClick={togglePasswordVisibility}
                            style={{
                                position: 'absolute',
                                right: '15px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                cursor: 'pointer',
                                color: '#aaa',
                                zIndex: 1 
                            }}
                        ></i>
                    )}
                </div>

                <a href="#" onClick={openForgotPasswordModal}>¿Olvidaste tu contraseña?</a>
                <button type="submit">Iniciar Sesión</button>
            </form>

            <ForgotPassword
                isVisible={showForgotPasswordModal}
                onClose={closeForgotPasswordModal}
            />
        </>
    );
}

/* 4. Exportación */
export default Login;