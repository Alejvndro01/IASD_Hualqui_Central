import React, { useState, useCallback, useEffect } from 'react';
import Login from '../../utils/Login/Login';
import Register from '../../utils/Register/Register';
import './AuthPage.css';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

// --- Constantes y Utilidades ---
const MySwal = withReactContent(Swal);
// Contraseña estática para activar el modo administrador (SOLO PARA DESARROLLO/DEMOSTRACIÓN)
const ADMIN_PASSWORD = "adminpass"; 

/**
 * @function AuthPage
 * @description Componente principal que gestiona la vista de autenticación y el "Modo Administrador" local.
 * @returns {JSX.Element} El componente de la página de autenticación.
 */
function AuthPage() {
    // --- Estados del Componente ---
    const [isActive, setIsActive] = useState(false);
    const [emailParaAutocompletar, setEmailParaAutocompletar] = useState('');
    const [isAdminModeEnabled, setIsAdminModeEnabled] = useState(false);
    const [showAdminButton, setShowAdminButton] = useState(false); 

    /**
     * @function showSwalAlert
     * @description Muestra una alerta personalizada utilizando SweetAlert2 (función memoizada).
     */
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

    /**
     * @function handleRegisterClick
     * @description Cambia la vista al formulario de registro.
     */
    const handleRegisterClick = () => {
        setIsActive(true);
        setEmailParaAutocompletar('');
    };

    /**
     * @function handleLoginClick
     * @description Cambia la vista al formulario de inicio de sesión.
     */
    const handleLoginClick = () => {
        setIsActive(false);
    };

    /**
     * @function handleRegisterSuccess
     * @description Callback ejecutado tras un registro exitoso. Guarda el email y cambia a la vista de Login.
     * @param {string} emailRegistrado - El email con el que el usuario se ha registrado.
     */
    const handleRegisterSuccess = (emailRegistrado) => {
        setEmailParaAutocompletar(emailRegistrado);
        setIsActive(false);
        showSwalAlert('¡Registro exitoso!', `Ahora puedes iniciar sesión con ${emailRegistrado}`, 'success');
    };

    // --- Lógica del Modo Administrador ---
    
    /**
     * @function handleAdminModeActivation
     * @description Gestiona la activación/desactivación del modo administrador mediante una contraseña estática.
     */
    const handleAdminModeActivation = async () => {
        if (isAdminModeEnabled) {
            // Desactiva el modo admin
            setIsAdminModeEnabled(false);
            showSwalAlert('Modo Admin', 'Modo Administrador desactivado.', 'info');
            return;
        }

        // Pide la contraseña
        const { value: password } = await MySwal.fire({
            title: 'Activar Modo Administrador',
            input: 'password',
            inputLabel: 'Introduce la contraseña de administrador',
            inputPlaceholder: 'Contraseña...',
            inputAttributes: {
                maxlength: 30,
                autocapitalize: 'off',
                autocorrect: 'off'
            },
            showCancelButton: true,
            confirmButtonText: 'Activar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true,
            buttonsStyling: false,
            customClass: {
                confirmButton: 'swal2-confirm-button',
                cancelButton: 'swal2-cancel-button',
                popup: 'swal2-custom-popup'
            },
            didOpen: () => {
                MySwal.getConfirmButton().focus();
            }
        });

        // Verifica la contraseña
        if (password === ADMIN_PASSWORD) {
            setIsAdminModeEnabled(true);
            showSwalAlert('Modo Admin', 'Modo Administrador activado. Ahora puedes asignar roles y departamentos.', 'success');
        } else if (password !== undefined) {
            // El usuario ingresó algo, pero era incorrecto
            showSwalAlert('Error', 'Contraseña de administrador incorrecta.', 'error');
            setIsAdminModeEnabled(false);
        } else {
            // El usuario canceló
            setIsAdminModeEnabled(false);
        }
    };

    // 🔑 Lógica para la combinación de teclas
    useEffect(() => {
        const handleKeyDown = (event) => {
            // 🛑 CORRECCIÓN: Evita el error "Cannot read properties of undefined (reading 'toLowerCase')"
            if (!event.key) {
                return;
            }

            // Combincación deseada: Ctrl/Cmd + Alt + A
            const isCtrlOrCmd = event.ctrlKey || event.metaKey; // Ctrl para Windows/Linux, Cmd para Mac
            const isAlt = event.altKey;
            const isA = event.key.toLowerCase() === 'a';

            if (isCtrlOrCmd && isAlt && isA) {
                event.preventDefault(); // Evita el comportamiento por defecto del navegador
                // Alterna la visibilidad del botón
                setShowAdminButton(prev => !prev); 
            }
        };

        // Añadir el listener al montar el componente
        window.addEventListener('keydown', handleKeyDown);

        // Limpiar el listener al desmontar el componente
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []); // El array de dependencias vacío asegura que se ejecute solo una vez.


    // --- Renderizado del Componente ---
    return (
        <div className={`container ${isActive ? 'active' : ''}`} id="container">

            {/* 🔑 MODIFICADO: Botón solo se renderiza si showAdminButton es true */}
            {showAdminButton && (
                <button className="admin-button" onClick={handleAdminModeActivation}>
                    {isAdminModeEnabled ? 'Administrador - ON' : 'Administrador - OFF'}
                </button>
            )}

            {/* Contenedor del formulario de Registro */}
            <div className="form-container sign-up">
                <Register
                    onRegisterSuccess={handleRegisterSuccess}
                    isAdminModeEnabled={isAdminModeEnabled}
                    setIsAdminModeEnabled={setIsAdminModeEnabled}
                />
            </div>

            {/* Contenedor del formulario de Inicio de Sesión */}
            <div className="form-container sign-in">
                <Login 
                    emailInicial={emailParaAutocompletar} 
                    // 🛑 ELIMINADO: Se eliminó el pase de la prop onGoogleLogin
                />
            </div>

            {/* Panel de Alternancia (Toggle) entre Login y Register */}
            <div className="toggle-container">
                <div className="toggle">
                    {/* Panel izquierdo: Contenido para la vista de inicio de sesión */}
                    <div className="toggle-panel toggle-left">
                        <h1>¡Bienvenido de Nuevo!</h1>
                        <p>Ingresa tus datos personales para usar todas las características del sitio</p>
                        <button className="hidden" id="login" onClick={handleLoginClick}>
                            Iniciar Sesión
                        </button>
                    </div>
                    {/* Panel derecho: Contenido para la vista de registro */}
                    <div className="toggle-panel toggle-right">
                        <h1>¡Hola, Amigo!</h1>
                        <p>
                            Regístrate con tus datos personales para usar todas las características del sitio
                        </p>
                        <button className="hidden" id="register" onClick={handleRegisterClick}>
                            Registrarse
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AuthPage;