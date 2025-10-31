/*
 * =============================================
 * Archivo: client/src/components/Register/Register.js
 * Descripción: Componente de formulario para el registro de nuevos usuarios.
 * Integra la funcionalidad de revelar la contraseña, 
 * MOSTRANDO EL ICONO SOLO CUANDO HAY CARACTERES ESCRITOS.
 * Autor: Dilan Baltras | Fecha: 2025-06-28 (Actualizado)
 * =============================================
 */

/* 1. Importaciones */
import React, { useState, useEffect, useCallback } from 'react';
import Axios from 'axios';
import { validarRegistro } from '../../Validaciones'; // Asume que esta ruta es correcta
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

/* 2. Constantes y Utilidades */
const MySwal = withReactContent(Swal);
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
/*
 * =============================================
 * 3. Componente Register
 * =============================================
 * Permite a los usuarios registrarse en el sistema. En modo administrador,
 * habilita la asignación de roles y ministerios.
 */
function Register({ onRegisterSuccess, isAdminModeEnabled, setIsAdminModeEnabled }) {
    /* 3.1. Estados del Formulario (ACTUALIZADO) */
    const [nombre, setNombre] = useState("");
    const [email, setEmail] = useState("");
    const [contrasena, setContrasena] = useState("");
    const [confirmarContrasena, setConfirmarContrasena] = useState("");

    // Estados: Controlan la visibilidad de cada campo de contraseña
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // 🔑 ESTADOS para la verificación de Email (AÑADIDOS)
    const [isEmailAvailable, setIsEmailAvailable] = useState(true); // Asume true inicialmente
    const [isCheckingEmail, setIsCheckingEmail] = useState(false); // Estado de carga/consulta
    const [emailCheckMessage, setEmailCheckMessage] = useState(""); // Mensaje de feedback

    /* 3.2. Estados para Modos Administrador (Roles y Ministerios) */
    const [roles, setRoles] = useState([]);
    const [ministerios, setMinisterios] = useState([]);
    const [selectedRolId, setSelectedRolId] = useState('');
    const [selectedMinisterioId, setSelectedMinisterioId] = useState(''); 

    /* 3.3. Estado para el Token de Autenticación */
    const [externalAuthToken, setExternalAuthToken] = useState(localStorage.getItem('authToken'));

    /* 3.4. Funciones de Utilidad (ACTUALIZADO) */

    // Muestra una alerta SweetAlert2 personalizada.
    const showSwalAlert = useCallback((title, text, icon, callback = () => {}) => {
        MySwal.fire({
            title: title,
            html: text,
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

    // Gestiona los diferentes tipos de errores en peticiones Axios.
    const getAxiosErrorMessage = useCallback((error, contextMessage = 'realizar la operación') => {
        let errorMessage = `Ocurrió un error inesperado al ${contextMessage}. Por favor, inténtalo de nuevo.`;
        if (error.response) {
            console.error(`Error del Servidor ${contextMessage}:`, error.response.data);
            console.error('Status HTTP:', error.response.status);
            errorMessage = error.response.data.message || `Error del servidor (Código: ${error.response.status}).`;
        } else if (error.request) {
            console.error(`Sin Respuesta del Servidor ${contextMessage}:`, error.request);
            errorMessage = `No se pudo conectar con el servidor al ${contextMessage}. Por favor, verifica tu conexión o el estado del backend.`;
        } else {
            console.error(`Error de Configuración de Petición ${contextMessage}:`, error.message);
            errorMessage = 'Ocurrió un error inesperado al cargar roles/ministerios: ' + error.message;
        }
        return errorMessage;
    }, []);
    
    // 🔑 NUEVA FUNCIÓN: Verifica si el email es válido y no está registrado (llamando al backend)
    const checkEmailExistence = useCallback(async (currentEmail) => {
        // 0. Validación inicial y limpieza
        if (!currentEmail || currentEmail.length < 5 || !/\S+@\S+\.\S+/.test(currentEmail)) {
            setIsEmailAvailable(true); // No mostrar error si está vacío o es muy corto
            setEmailCheckMessage("");
            return;
        }

        setIsCheckingEmail(true); // Inicia el estado de carga
        setEmailCheckMessage("Verificando existencia...");

        try {
            // Llama a TU PROPIO ENDPOINT del backend
            const response = await Axios.get(`${API_BASE_URL}/auth/verify-external-email`, {
                params: { email: currentEmail }
            });

            const { isAvailable, message } = response.data;

            setIsEmailAvailable(isAvailable);
            setEmailCheckMessage(message);
            
        } catch (error) {
            // Error de red, 500 del servidor, etc.
            const errorMessage = getAxiosErrorMessage(error, 'verificar la existencia del email');
            setIsEmailAvailable(false); // Por seguridad, asumimos no disponible si hay fallo
            setEmailCheckMessage("Error al verificar el email. Inténtalo de nuevo.");
            console.error("REGISTER ERROR (Frontend): Fallo en la verificación de email:", errorMessage);

        } finally {
            setIsCheckingEmail(false); // Finaliza el estado de carga
        }
    }, [getAxiosErrorMessage]);

    // Resetea todos los campos del formulario.
    const resetForm = useCallback(() => {
        setNombre('');
        setEmail('');
        setContrasena('');
        setConfirmarContrasena('');
        setSelectedRolId('');
        setSelectedMinisterioId('');
        setShowPassword(false);
        setShowConfirmPassword(false);
        // Resetea estados de verificación (AÑADIDO)
        setIsEmailAvailable(true); 
        setEmailCheckMessage("");
    }, []);

    // Funciones: Alterna la visibilidad de cada campo
    const togglePasswordVisibility = useCallback(() => {
        setShowPassword(prev => !prev);
    }, []);

    const toggleConfirmPasswordVisibility = useCallback(() => {
        setShowConfirmPassword(prev => !prev);
    }, []);


    /* 3.5. Efectos y Carga de Datos (para el modo administrador) */

    // Efecto para monitorear cambios en localStorage (token).
    useEffect(() => {
        const handleStorageChange = () => {
            console.log("REGISTER DEBUG: localStorage 'authToken' ha cambiado (detectado por evento storage).");
            setExternalAuthToken(localStorage.getItem('authToken'));
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Carga roles y ministerios si el modo administrador está activo.
    const fetchRolesAndMinisterios = useCallback(async () => {
        const tokenFromLocalStorage = localStorage.getItem('authToken');
        console.log('REGISTER DEBUG: fetchRolesAndMinisterios ejecutándose. Modo Admin Activo:', isAdminModeEnabled, 'Token presente (directo):', !!tokenFromLocalStorage);

        if (!isAdminModeEnabled) {
            setRoles([]);
            setSelectedRolId('');
            setMinisterios([]);
            setSelectedMinisterioId('');
            console.log('REGISTER DEBUG: Modo Admin OFF, no se cargan roles/ministerios.');
            return;
        }

        try {
            console.log('REGISTER DEBUG: Intentando cargar roles (público)...');
            const rolesResponse = await Axios.get(`${API_BASE_URL}/roles`);
            console.log('REGISTER DEBUG: Roles recibidos:', rolesResponse.data);
            setRoles(rolesResponse.data);
            if (rolesResponse.data.length > 0) {
                setSelectedRolId(rolesResponse.data[0].RolID);
            } else {
                setSelectedRolId('');
            }

            console.log('REGISTER DEBUG: Intentando cargar ministerios (público)...');
            const ministeriosResponse = await Axios.get(`${API_BASE_URL}/ministerios`);
            console.log('REGISTER DEBUG: Ministerios recibidos:', ministeriosResponse.data);
            setMinisterios(ministeriosResponse.data);
            if (ministeriosResponse.data.length > 0) {
                setSelectedMinisterioId(ministeriosResponse.data[0].MinisterioID);
            } else {
                setSelectedMinisterioId('');
            }

        } catch (error) {
            console.error("REGISTER ERROR: Error al cargar roles o ministerios en frontend:", error);
            let errorMessage = "Error desconocido al cargar datos.";
            if (error.response) {
                console.error("REGISTER ERROR: Datos de respuesta del servidor:", error.response.data);
                console.error("REGISTER ERROR: Código de estado HTTP:", error.response.status);
                errorMessage = `Error del servidor al cargar ${error.config.url.includes('roles') ? 'roles' : 'ministerios'}: ${error.response.data.message || 'Error desconocido.'}`;
            } else if (error.request) {
                console.error("REGISTER ERROR: No se recibió respuesta del servidor (Network Error):", error.request);
                errorMessage = 'No se pudo conectar con el servidor para cargar roles/ministerios. Verifica tu conexión o que el backend esté funcionando.';
            } else {
                console.error("REGISTER ERROR: Error al configurar la petición:", error.message);
                errorMessage = 'Ocurrió un error inesperado al cargar roles/ministerios: ' + error.message;
            }
            showSwalAlert('Error de Carga', errorMessage, 'error');
        }
    }, [isAdminModeEnabled, showSwalAlert]);

    // Ejecuta `fetchRolesAndMinisterios` cuando `isAdminModeEnabled` cambia.
    useEffect(() => {
        console.log('REGISTER DEBUG (useEffect): useEffect de carga disparado. Modo Admin Activo:', isAdminModeEnabled, 'Token actual (desde estado):', !!externalAuthToken);
        fetchRolesAndMinisterios();
    }, [isAdminModeEnabled, externalAuthToken, fetchRolesAndMinisterios]);

    /* 3.6. Manejadores de Eventos (ACTUALIZADO) */

    // Maneja el envío del formulario de registro.
    const handleRegister = async (e) => {
        e.preventDefault();
        
        // 🔑 1. BLOQUEO Y VERIFICACIÓN DEL EMAIL EXTERNA (AÑADIDO)
        if (isCheckingEmail) {
            showSwalAlert("Espera", "La verificación del correo aún está en curso. Por favor, espera y haz clic de nuevo.", "info");
            return;
        }

        // Si el email tiene contenido, pero nunca se ha verificado (el usuario no hizo blur), forzamos la verificación.
        if (email.length > 0 && emailCheckMessage === "") {
            // Forzamos la verificación. Esto solo inicia el proceso asíncrono.
            await checkEmailExistence(email); 
            // Informamos al usuario que debe esperar y volver a intentar.
            showSwalAlert("Atención", "Estamos verificando la existencia de tu email. Por favor, haz clic en 'Registrarse' de nuevo.", "info");
            return; 
        }

        // Si el estado es "no disponible" después de una verificación
        if (!isEmailAvailable) {
            showSwalAlert("Error de Registro", `El correo electrónico no es válido o ya está registrado: ${emailCheckMessage}`, "error");
            return;
        }
        // 🔑 1. BLOQUEO Y VERIFICACIÓN DEL EMAIL EXTERNA (FIN)


        // 2. Validaciones del lado del cliente (Antiguo punto 1)
        const errores = validarRegistro(nombre, email, contrasena, confirmarContrasena);
        if (errores.length > 0) {
            showSwalAlert("Error de Validación", errores.join("<br/>"), "error");
            return;
        }

        if (isAdminModeEnabled && (!selectedRolId || selectedRolId === '')) {
            showSwalAlert("Error de Validación", "Debes seleccionar un rol para el usuario en modo administrador.", "warning");
            return;
        }

        try {
            // 3. Preparar los datos a enviar (Antiguo punto 2)
            const dataToSend = {
                Nombre: nombre,
                Email: email,
                Contraseña: contrasena,
                RolID: isAdminModeEnabled && selectedRolId !== '' ? parseInt(selectedRolId) : null,
                MinisterioID: isAdminModeEnabled && selectedMinisterioId !== '' ? parseInt(selectedMinisterioId) : null,
            };
            console.log("REGISTER DEBUG: Datos a enviar al registro:", dataToSend);

            // Obtener el token más reciente de localStorage antes de enviar la petición
            const tokenForRegister = localStorage.getItem('authToken');

            // 4. Petición al backend (Antiguo punto 3)
            const response = await Axios.post(`${API_BASE_URL}/auth/register`, dataToSend, {
                headers: {
                    ...(isAdminModeEnabled && tokenForRegister && { Authorization: `Bearer ${tokenForRegister}` })
                }
            });

            if (response.status === 201) {
                console.log("Registro Exitoso: Respuesta del servidor:", response.data);
                showSwalAlert('¡Registro Exitoso!', response.data.message, 'success', () => {
                    onRegisterSuccess(email);
                    resetForm();
                });
            }
        } catch (error) {
            const errorMessage = getAxiosErrorMessage(error, 'registrar el usuario');
            showSwalAlert('Error de Registro', errorMessage, 'error');
        }
    };

    /* 3.7. Renderizado del Componente (ACTUALIZADO) */
    return (
        <form onSubmit={handleRegister}>
            <h1>Crear Cuenta</h1>
            <div className="social-icons">
                <a href="#" className="icon"><i className="fa-brands fa-google-plus-g"></i></a>
                <a href="#" className="icon"><i className="fa-brands fa-facebook-f"></i></a>
                <a href="#" className="icon"><i className="fa-brands fa-github"></i></a>
                <a href="#" className="icon"><i className="fa-brands fa-linkedin-in"></i></a>
            </div>
            <span>o usa tu email para registrarte</span>
            <input
                className="auth-input"
                type="text"
                placeholder="Nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
            />
            {/* 🔑 CAMPO DE EMAIL CON VERIFICACIÓN INTEGRADA */}
            <input
                className="auth-input"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => {
                    setEmail(e.target.value);
                    // Resetea el estado al empezar a escribir
                    setIsEmailAvailable(true); 
                    setEmailCheckMessage("");
                }}
                onBlur={(e) => checkEmailExistence(e.target.value)} // 👈 Dispara la verificación
                required
            />
            
            {/* 🔑 FEEDBACK VISUAL PARA LA VERIFICACIÓN DE EMAIL */}
            {email.length > 0 && (
                <div style={{ 
                    marginTop: '-8px', 
                    marginBottom: '8px', 
                    width: '100%', 
                    textAlign: 'left', 
                    paddingLeft: '20px',
                    minHeight: '20px' // Ayuda a prevenir saltos en el diseño
                }}>
                    {isCheckingEmail && (
                        <span style={{ color: '#888', fontSize: '0.8em' }}>
                            <i className="fa-solid fa-spinner fa-spin-pulse"></i> Verificando email...
                        </span>
                    )}
                    {!isCheckingEmail && emailCheckMessage && (
                        <span style={{ color: isEmailAvailable ? 'green' : 'red', fontSize: '0.8em' }}>
                            {isEmailAvailable ? <i className="fa-solid fa-check"></i> : <i className="fa-solid fa-times"></i>}
                            {" "}
                            {emailCheckMessage}
                        </span>
                    )}
                </div>
            )}
            
            {/* MODIFICADO: Contenedor para la Contraseña */}
            <div style={{ position: 'relative', width: '100%', marginBottom: '10px' }}>
                <input
                    className="auth-input"
                    type={showPassword ? "text" : "password"}
                    placeholder="Contraseña"
                    value={contrasena}
                    onChange={(e) => {
                        setContrasena(e.target.value);
                        // Oculta la vista si se borra todo
                        if (e.target.value.length === 0) setShowPassword(false); 
                    }}
                    required
                    style={{ paddingRight: '40px', width: '100%', boxSizing: 'border-box' }}
                />
                {/* 🔑 CLAVE: Renderiza el icono SOLO si hay caracteres escritos */}
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
            
            {/* MODIFICADO: Contenedor para Confirmar Contraseña */}
            <div style={{ position: 'relative', width: '100%', marginBottom: isAdminModeEnabled ? '10px' : '20px' }}>
                <input
                    className="auth-input"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirmar Contraseña"
                    value={confirmarContrasena}
                    onChange={(e) => {
                        setConfirmarContrasena(e.target.value);
                        // Oculta la vista si se borra todo
                        if (e.target.value.length === 0) setShowConfirmPassword(false);
                    }}
                    required
                    style={{ paddingRight: '40px', width: '100%', boxSizing: 'border-box' }}
                />
                {/* 🔑 CLAVE: Renderiza el icono SOLO si hay caracteres escritos */}
                {confirmarContrasena.length > 0 && (
                    <i 
                        className={`fa-solid ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}
                        onClick={toggleConfirmPasswordVisibility}
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
            
            {/* Campos de Rol y Ministerio condicionales para el modo administrador */}
            {isAdminModeEnabled && (
                <>
                    <select
                        value={selectedRolId}
                        onChange={(e) => setSelectedRolId(e.target.value)}
                        className="form-select"
                        disabled={!isAdminModeEnabled || !roles.length}
                        style={{ opacity: isAdminModeEnabled && roles.length ? '1' : '0.6', cursor: isAdminModeEnabled && roles.length ? 'pointer' : 'not-allowed' }}
                    >
                        <option value="">
                            {roles.length ? "Selecciona un Rol" : "Cargando Roles..."}
                        </option>
                        {roles.map(rol => (
                            <option key={rol.RolID} value={rol.RolID}>
                                {rol.NombreRol}
                            </option>
                        ))}
                    </select>

                    <select
                        value={selectedMinisterioId}
                        onChange={(e) => setSelectedMinisterioId(e.target.value)}
                        className="form-select"
                        disabled={!isAdminModeEnabled || !ministerios.length}
                        style={{ opacity: isAdminModeEnabled && ministerios.length ? '1' : '0.6', cursor: isAdminModeEnabled && ministerios.length ? 'pointer' : 'not-allowed' }}
                    >
                        <option value="">
                            {ministerios.length ? "Selecciona un Ministerio" : "Cargando Ministerios..."}
                        </option>
                        {ministerios.map(min => (
                            <option key={min.MinisterioID} value={min.MinisterioID}>
                                {min.NombreMinisterio}
                            </option>
                        ))}
                    </select>
                </>
            )}

            <button type="submit">Registrarse</button>

            {isAdminModeEnabled && (
                <p style={{ fontSize: '0.9em', color: 'var(--primary-color)', marginTop: '10px', fontWeight: 'bold' }}>
                    Modo Administrador Activo
                </p>
            )}
            {!isAdminModeEnabled && (
                <p style={{ fontSize: '0.8em', color: '#666', marginTop: '5px' }}>
                    Activa el modo administrador para asignar roles y ministerios.
                </p>
            )}
        </form>
    );
}

/* 4. Exportación */
export default Register;