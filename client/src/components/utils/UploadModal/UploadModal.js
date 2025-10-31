/*
* =============================================
* Archivo: UploadModal.js
* Descripción: Componente modal para la subida de archivos.
* Permite al usuario seleccionar un archivo, asignarle un ministerio,
* y gestiona el proceso de subida, mostrando progreso, éxito o error.
* Autor: Dilan Baltras | Fecha: 2025-06-25 (Actualizado con restricción de ministerio)
* =============================================
*/

/* 1. Importaciones */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './UploadModal.module.css'; // Estilos específicos del modal
import axios from 'axios'; // Para realizar peticiones HTTP
import Swal from 'sweetalert2'; // Para mostrar alertas amigables

/*
* =============================================
* 2. UploadModal
* =============================================
* Componente funcional que gestiona la lógica y UI del modal de subida.
*/
// Asegúrate de que 'preselectedMinistryId' esté en las props
function UploadModal({ isVisible, onClose, onUploadSuccess, ministries, showSwalAlert, preselectedMinistryId }) {
    /* 2.1. Estados del Componente */
    const [modalState, setModalState] = useState(0);       
    const [progress, setProgress] = useState(0);          
    const [filename, setFilename] = useState('');          
    const [errorMessage, setErrorMessage] = useState('');  
    const [isCopying, setIsCopying] = useState(false);    
    // Inicializar el estado con el ID preseleccionado si existe
    const [selectedMinistryId, setSelectedMinistryId] = useState(preselectedMinistryId || '');

    /* 2.2. Referencias a Elementos del DOM y Timers */
    const fileInputRef = useRef(null);      
    const progressTimeoutRef = useRef(null); 

    /* 2.3. Constantes de API */
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

    /* 2.4. Función para mostrar alertas de SweetAlert2 (usada internamente y pasada por props) */
    const internalShowSwalAlert = useCallback((title, text, icon, callback = () => {}) => {
        Swal.fire({
            title: title,
            text: text,
            icon: icon,
            confirmButtonText: 'Entendido',
            buttonsStyling: false,
            customClass: {
                confirmButton: 'swal2-confirm-button',
                popup: 'swal2-custom-popup',
            },
        }).then((result) => {
            if (result.isConfirmed) {
                callback();
            }
        });
    }, []);

    /* 2.5. Reseteo del Estado del Modal */
    // Restablece todos los estados del modal a su valor inicial.
    const resetModal = useCallback(() => {
        setModalState(0);
        setProgress(0);
        setFilename('');
        setErrorMessage('');
        setIsCopying(false);
        setSelectedMinistryId(preselectedMinistryId || ''); // Usa el ID preseleccionado
        if (fileInputRef.current) {
            fileInputRef.current.value = ''; 
        }
        if (progressTimeoutRef.current) {
            clearTimeout(progressTimeoutRef.current);
            progressTimeoutRef.current = null;
        }
    }, [preselectedMinistryId]); 

    /* 2.6. Efecto para Controlar la Visibilidad del Modal */
    // Resetea el modal cada vez que se oculta.
    useEffect(() => {
        if (!isVisible) {
            resetModal();
        } else {
            // Asegurar que al abrir se inicializa el ministerio si está preseleccionado
            setSelectedMinistryId(preselectedMinistryId || '');
        }
    }, [isVisible, resetModal, preselectedMinistryId]); 

    /* 2.7. Handlers de Eventos */

    // Maneja la selección de un archivo en el input.
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFilename(file.name);
            setModalState(0); 
            setProgress(0);
            setErrorMessage('');
        } else {
            setFilename('');
            setModalState(0);
            setProgress(0);
            setErrorMessage('');
        }
    };

    // Maneja el cambio de selección del ministerio.
    const handleMinistryChange = (e) => {
        if (!preselectedMinistryId) {
            setSelectedMinistryId(e.target.value);
        }
    };

    // Simula el progreso de la subida para feedback visual.
    const simulateProgress = useCallback(() => {
        if (progress < 1) {
            setProgress((prev) => Math.min(prev + 0.01, 1));
            progressTimeoutRef.current = setTimeout(simulateProgress, 50);
        }
    }, [progress]);

    // Inicia el proceso de subida del archivo al servidor.
    const startUpload = async () => {
        const fileToUpload = fileInputRef.current && fileInputRef.current.files[0];

        if (!fileToUpload) {
            showSwalAlert('Advertencia', 'Por favor, selecciona un archivo para subir.', 'warning');
            return;
        }
        if (!selectedMinistryId) {
            showSwalAlert('Advertencia', 'Por favor, selecciona un ministerio al que pertenece el archivo.', 'warning');
            return;
        }

        setModalState(1); 
        setProgress(0);
        simulateProgress(); 

        const formData = new FormData();
        formData.append('file', fileToUpload);

        const token = localStorage.getItem('authToken');
        if (!token) {
            showSwalAlert('No Autorizado', 'Necesitas iniciar sesión para subir archivos.', 'warning');
            resetModal();
            onClose();
            return;
        }

        try {
            // Paso 1: Subir el archivo físicamente al servidor
            const uploadResponse = await axios.post(`${API_BASE_URL}/archivos/uploads`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (uploadResponse.data.filePath) {
                // Paso 2: Guardar la metadata del archivo en la base de datos
                const fileMetadata = {
                    NombreArchivo: fileToUpload.name,
                    TipoArchivo: fileToUpload.type || 'application/octet-stream',
                    RutaArchivo: uploadResponse.data.filePath,
                    MinisterioID: selectedMinistryId, 
                };

                await axios.post(`${API_BASE_URL}/archivos`, fileMetadata, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setModalState(3); 
                setProgress(1); 
                clearTimeout(progressTimeoutRef.current); 
                showSwalAlert('¡Subida Exitosa!', 'Tu archivo ha sido subido correctamente.', 'success');
                onUploadSuccess(); 
            }
        } catch (error) {
            clearTimeout(progressTimeoutRef.current); 
            setModalState(2); 
            setProgress(0); 

            let msg = 'Error al subir el archivo. Inténtalo de nuevo.';
            if (error.response && error.response.data && error.response.data.message) {
                msg = error.response.data.message;
            } else if (error.message) {
                msg = error.message;
            }
            setErrorMessage(msg);
            showSwalAlert('Error de Subida', msg, 'error');
        }
    };

    // Maneja el botón de copia (copia el enlace directo al archivo).
    const handleCopy = () => {
        if (filename && !isCopying) {
            setIsCopying(true);
            const tempInput = document.createElement('textarea');
            tempInput.value = `${API_BASE_URL}/uploads/${filename}`; 
            document.body.appendChild(tempInput);
            tempInput.select();
            try {
                document.execCommand('copy');
                showSwalAlert('Copiado', 'Enlace copiado al portapapeles.', 'success');
            } catch (err) {
                console.error('Error al copiar: ', err);
                showSwalAlert('Error', 'No se pudo copiar el enlace.', 'error');
            }
            document.body.removeChild(tempInput);

            setTimeout(() => {
                setIsCopying(false);
            }, 1000);
        }
    };

    /* 2.8. Renderizado del Componente */
    // No renderiza nada si el modal no es visible.
    if (!isVisible) return null;

    // Determinar si el campo de ministerio debe estar deshabilitado
    const isMinistrySelectDisabled = !!preselectedMinistryId;

    return (
        <div className={styles.modalOverlay}>
            <div className={`${styles.modal} ${styles[`state-${modalState}`]}`} data-ready="false">
                <div className={styles.modalHeader}>
                    <button className={styles.modalCloseButton} type="button" onClick={() => { resetModal(); onClose(); }}>
                        <svg className={styles.modalCloseIcon} viewBox="0 0 16 16" width="16px" height="16px" aria-hidden="true">
                            <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <polyline points="1,1 15,15" />
                                <polyline points="15,1 1,15" />
                            </g>
                        </svg>
                        <span className={styles.modalSr}>Cerrar</span>
                    </button>
                </div>

                <div className={styles.modalBody}>
                    {/* Contenido para el estado 0: Seleccionar archivo y Ministerio */}
                    {modalState === 0 && (
                        <div className={styles.modalCol}>
                            <svg className={`${styles.modalIcon} ${styles.modalIconBlue}`} viewBox="0 0 24 24" width="24px" height="24px" aria-hidden="true">
                                <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="11"></circle>
                                    <polyline points="8 12 12 8 16 12"></polyline>
                                    <line x1="12" y1="16" x2="12" y2="8"></line>
                                </g>
                            </svg>
                            <h2 className={styles.modalTitle}>Sube tus Archivos</h2>
                            <p className={styles.modalMessage}>Selecciona un archivo de tu dispositivo y el ministerio al que pertenece.</p>

                            {/* Input para seleccionar archivo */}
                            <div className={styles.modalActions}>
                                <label className={styles.modalButton} htmlFor="file">
                                    Seleccionar Archivo
                                </label>
                                <input
                                    id="file"
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    hidden
                                />
                            </div>
                            {filename && (
                                <p className={styles.selectedFileName}>Archivo seleccionado: <strong>{filename}</strong></p>
                            )}

                            {/* Selector de Ministerio */}
                            <select
                                value={selectedMinistryId}
                                onChange={handleMinistryChange}
                                className={styles.ministrySelect}
                                disabled={isMinistrySelectDisabled}
                            >
                                <option value="" disabled={isMinistrySelectDisabled}>
                                    {isMinistrySelectDisabled ? 
                                        ministries.find(m => m.MinisterioID === preselectedMinistryId)?.NombreMinisterio || 'Ministerio Asignado' 
                                        : 'Selecciona el Ministerio'
                                    }
                                </option>
                                {ministries && ministries.map(min => (
                                    <option 
                                        key={min.MinisterioID} 
                                        value={min.MinisterioID}
                                        disabled={isMinistrySelectDisabled && min.MinisterioID !== preselectedMinistryId}
                                    >
                                        {min.NombreMinisterio}
                                    </option>
                                ))}
                            </select>

                            {/* Botón de Subir Archivo (activo solo si archivo y ministerio seleccionados) */}
                            {filename && selectedMinistryId && (
                                <button
                                    className={styles.modalButtonPrimary}
                                    onClick={startUpload}
                                >
                                    Subir Archivo
                                </button>
                            )}
                        </div>
                    )}

                    {/* Contenido para el estado 1: Subiendo */}
                    {modalState === 1 && (
                        <div className={styles.modalCol}>
                            <svg className={`${styles.modalIcon} ${styles.modalIconBlue}`} viewBox="0 0 24 24" width="24px" height="24px" aria-hidden="true">
                                <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12,23 C17.5228475,23 22,18.5228475 22,13 C22,7.4771525 17.5228475,3 12,3 C6.4771525,3 2,7.4771525 2,13 C2,18.5228475 6.4771525,23 12,23 Z"></path>
                                    <polyline points="12 18 12 12 16 12"></polyline>
                                </g>
                            </svg>
                            <h2 className={styles.modalTitle}>Subiendo…</h2>
                            <p className={styles.modalMessage}>Por favor, espera mientras procesamos tu archivo.</p>
                            <div className={styles.modalActions}>
                                <div className={styles.modalProgress}>
                                    <div className={styles.modalProgressValue} data-progress-value>{Math.round(progress * 100)}%</div>
                                    <div className={styles.modalProgressBar}>
                                        <div className={styles.modalProgressFill} style={{ width: `${progress * 100}%` }}></div>
                                    </div>
                                </div>
                                <button className={styles.modalButton} type="button" onClick={() => { resetModal(); onClose(); }}>
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    )}
                    {/* Contenido para el estado 2: Error */}
                    {modalState === 2 && (
                        <div className={styles.modalCol}>
                            <svg className={`${styles.modalIcon} ${styles.modalIconRed}`} viewBox="0 0 24 24" width="24px" height="24px" aria-hidden="true">
                                <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="11"></circle>
                                    <line x1="15" y1="9" x2="9" y2="15"></line>
                                    <line x1="9" y1="9" x2="15" y2="15"></line>
                                </g>
                            </svg>
                            <h2 className={styles.modalTitle}>¡Oops!</h2>
                            <p className={styles.modalMessage}>
                                {/* Muestra el mensaje de error exacto recibido del backend */}
                                {errorMessage || 'Tu archivo no pudo ser subido debido a un error desconocido.'}
                            </p>

                            {/* 🛑 Lógica implementada: Muestra la sugerencia de contacto solo si el error es de permiso. */}
                            {errorMessage && errorMessage.includes('Permiso denegado') && (
                                <p className={styles.modalMessage} style={{marginTop: '15px', color: '#666', fontSize: '0.9em'}}>
                                    Recuerda que solo los **líderes de ministerio** pueden subir archivos. Si necesitas esta función o crees que es un error, por favor, **contacta a un administrador**.
                                </p>
                            )}
                            
                            <div className={`${styles.modalActions} ${styles.modalActionsCenter}`}>
                                <button className={styles.modalButton} type="button" onClick={() => { resetModal(); onClose(); }}>
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Contenido para el estado 3: Éxito */}
                    {modalState === 3 && (
                        <div className={styles.modalCol}>
                            <svg className={`${styles.modalIcon} ${styles.modalIconGreen}`} viewBox="0 0 24 24" width="24px" height="24px" aria-hidden="true">
                                <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="11"></circle>
                                    <polyline points="8 13 12 17 16 9"></polyline>
                                </g>
                            </svg>
                            <h2 className={styles.modalTitle}>¡Subida Exitosa!</h2>
                            <p className={styles.modalMessage}>Tu archivo ha sido subido. Puedes copiar el enlace.</p>
                            <div className={`${styles.modalActions} ${styles.modalActionsCenter}`}>
                                <button className={styles.modalButton} type="button" onClick={handleCopy} disabled={isCopying}>
                                    {isCopying ? 'Copiado!' : 'Copiar Enlace'}
                                </button>
                                <button className={styles.modalButton} type="button" onClick={() => { resetModal(); onClose(); }}>
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/* 3. Exportación del Componente */
export default UploadModal;