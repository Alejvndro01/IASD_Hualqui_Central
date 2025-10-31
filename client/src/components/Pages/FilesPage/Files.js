/*
 * =============================================
 * Archivo: client/src/components/Files/Files.js
 * Descripción: Componente para la gestión general de archivos,
 * implementando `react-data-table-component` para visualización.
 * Todos los estilos, incluyendo los de la tabla, ahora se manejan
 * en un único archivo CSS.
 * Autor: Dilan Baltras | Fecha: 2025-06-27 (Actualizado con lógica de permisos completa)
 * =============================================
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import UploadModal from '../../utils/UploadModal/UploadModal';
import AudioPlayer from '../../utils/AudioPlayer/AudioPlayer';
import VideoPlayer from '../../utils/VideoPlayer/VideoPlayer';
import ImageModal from '../../utils/ImageModal/ImageModal';
import { jwtDecode } from 'jwt-decode'; 
import DataTable from 'react-data-table-component'; // Importación correcta de DataTable

// Ahora todos los estilos se importan desde Files.module.css
import styles from './Files.module.css'; 

// --- Constantes Fuera del Componente ---
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
/**
 * @function Files
 * @description Componente funcional que gestiona la página de "Archivos".
 * Muestra una lista de archivos utilizando un `react-data-table-component`,
 * ofreciendo funcionalidades de búsqueda, filtrado, ordenación, subida, eliminación
 * y visualización/reproducción de diferentes tipos de archivos.
 * La eliminación está restringida a administradores de su propio ministerio.
 * @returns {JSX.Element} El componente de la página de archivos.
 */
function Files() {
    // --- Estados del Componente ---
    const [fileList, setFileList] = useState([]);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [currentAudioUrl, setCurrentAudioUrl] = useState(null);
    const [currentVideoUrl, setCurrentVideoUrl] = useState(null);
    const [currentImageUrl, setCurrentImageUrl] = useState(null);
    const [currentImageFileName, setCurrentImageFileName] = useState(null);
    const [currentImageFileId, setCurrentImageFileId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados para filtrado
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMinistryId, setSelectedMinistryId] = useState('');

    const [ministries, setMinistries] = useState([]);

    // Nuevos estados para la información del usuario logeado
    const [loggedInUserRolID, setLoggedInUserRolID] = useState(null);
    const [loggedInUserMinisterioID, setLoggedInUserMinisterioID] = useState(null);

    // --- Efecto para obtener la información del usuario logeado desde el token JWT ---
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                // Asegúrate de que los nombres de las propiedades coincidan con los que pones en tu JWT
                setLoggedInUserRolID(decodedToken.rolID); // Asumo que el token tiene 'rolID'
                setLoggedInUserMinisterioID(decodedToken.ministerioID); // Asumo que el token tiene 'ministerioID'
                console.log("FILES_COMPONENT: Información de usuario decodificada del token. RolID:", decodedToken.rolID, "MinisterioID:", decodedToken.ministerioID);
            } catch (err) {
                console.error("FILES_COMPONENT_ERROR: Error al decodificar el token JWT:", err);
                setLoggedInUserRolID(null);
                setLoggedInUserMinisterioID(null);
                localStorage.removeItem('authToken'); // Opcional: limpiar token inválido
            }
        } else {
            setLoggedInUserRolID(null);
            setLoggedInUserMinisterioID(null);
            console.log("FILES_COMPONENT: No se encontró token JWT en localStorage.");
        }
    }, []); // Se ejecuta una sola vez al montar el componente

    // --- Manejadores de Eventos del UI (Memorizados con useCallback) ---
    const showSwalAlert = useCallback((title, text, icon, callback = () => {}) => {
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

    // --- Callbacks y Lógica de Datos ---
    /**
     * @function fetchFilesAndMinistries
     * @description Realiza peticiones a la API para obtener la lista de archivos y ministerios.
     * Actualiza los estados de `fileList`, `ministries`, `loading` y `error`.
     */
    const fetchFilesAndMinistries = useCallback(async () => {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('authToken');
        if (!token) {
            setFileList([]);
            setMinistries([]);
            setLoading(false);
            setError("No hay token de autenticación. Por favor, inicie sesión para ver los archivos.");
            return;
        }
        try {
            // Petición para obtener ministerios (esta ruta es pública ahora)
            const ministriesResponse = await axios.get(`${API_BASE_URL}/ministerios`, {
                headers: { Authorization: `Bearer ${token}` }, // Los ministerios también requieren autenticación ahora
            });
            const fetchedMinistries = ministriesResponse.data;
            setMinistries(fetchedMinistries);

            // Petición para obtener archivos (esta ruta requiere autenticación)
            const filesResponse = await axios.get(`${API_BASE_URL}/archivos`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const receivedFiles = filesResponse.data.files || filesResponse.data || [];
            
            // Mapea NombreMinisterio a los archivos después de obtener los ministerios
            const filesWithMinistryNames = receivedFiles.map(file => {
                const ministry = fetchedMinistries.find(min => min.MinisterioID === file.MinisterioID);
                return {
                    ...file,
                    NombreMinisterio: ministry ? ministry.NombreMinisterio : 'Sin asignar',
                };
            });

            const validFiles = filesWithMinistryNames.filter(file => file && file.NombreArchivo && typeof file.NombreArchivo === 'string');
            if (receivedFiles.length !== validFiles.length) {
                console.warn('Advertencia: Se encontraron archivos mal formateados o sin nombre en la lista recibida.');
            }
            setFileList(validFiles);

        } catch (error) {
            console.error('Error al obtener la lista de archivos o ministerios:', error);
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                setError('No autorizado. Tu sesión ha expirado o no tienes permisos para ver los archivos.');
                localStorage.removeItem('authToken'); // Limpiar token inválido
            } else {
                setError('No se pudo obtener la lista de archivos o ministerios. Por favor, inténtalo de nuevo.');
            }
            showSwalAlert('Error de Carga', 'No se pudo obtener la lista de archivos o ministerios. Por favor, verifica tu conexión o permisos.', 'error');
        } finally {
            setLoading(false);
        }
    }, [showSwalAlert]);

    useEffect(() => {
        fetchFilesAndMinistries();
    }, [fetchFilesAndMinistries]);

    // --- Manejadores de Interacción del Usuario (Actualizados/Mantenidos) ---
    const openUploadModal = () => setIsUploadModalOpen(true);
    const closeUploadModal = () => setIsUploadModalOpen(false);

    const handleUploadSuccess = () => {
        showSwalAlert('¡Éxito!', 'Archivo subido correctamente.', 'success');
        fetchFilesAndMinistries();
        closeUploadModal();
    };
    
    // Función de edición asume que ya existe la lógica en ImageModal o que se implementará
    const handleEditFileName = useCallback(async (archivoID, currentFileName) => {
        const { value: newFileName } = await Swal.fire({
            title: 'Editar Nombre del Archivo',
            input: 'text',
            inputLabel: 'Nuevo nombre:',
            inputValue: currentFileName,
            showCancelButton: true,
            confirmButtonText: 'Guardar',
            cancelButtonText: 'Cancelar',
            buttonsStyling: false,
            customClass: {
                confirmButton: 'swal2-confirm-button',
                cancelButton: 'swal2-cancel-button',
                popup: 'swal2-custom-popup',
                input: 'swal2-custom-input' 
            }
        });
        
        if (newFileName && newFileName !== currentFileName) {
            const token = localStorage.getItem('authToken');
            try {
                await axios.put(`${API_BASE_URL}/archivos/${archivoID}`, { NombreArchivo: newFileName }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                showSwalAlert('¡Éxito!', 'Nombre del archivo actualizado correctamente.', 'success', () => {
                    fetchFilesAndMinistries(); 
                });
            } catch (err) {
                console.error("Error al actualizar el nombre del archivo:", err);
                showSwalAlert('Error', err.response?.data?.message || 'No se pudo actualizar el nombre del archivo.', 'error');
            }
        }
    }, [showSwalAlert, fetchFilesAndMinistries]);

    const handlePlayAudio = useCallback((fileUrl) => {
        setCurrentVideoUrl(null);
        setCurrentAudioUrl(fileUrl);
    }, []);

    const handlePlayVideo = useCallback((fileUrl) => {
        setCurrentAudioUrl(null);
        setCurrentVideoUrl(fileUrl);
    }, []);

    const handleCloseAudioPlayer = useCallback(() => {
        setCurrentAudioUrl(null);
    }, []);

    const handleCloseVideoPlayer = useCallback(() => {
        setCurrentVideoUrl(null);
    }, []);

    const handleViewImage = useCallback((imageUrl, fileName, fileId) => {
        setCurrentImageUrl(imageUrl);
        setCurrentImageFileName(fileName);
        setCurrentImageFileId(fileId);
    }, []);

    const handleCloseImagePlayer = useCallback(() => {
        setCurrentImageUrl(null);
        setCurrentImageFileName(null);
        setCurrentImageFileId(null);
    }, []);

    const getFileIcon = useCallback((fileName) => {
        if (!fileName || typeof fileName !== 'string') {
            return 'bx bx-file';
        }
        const ext = fileName.split('.').pop().toLowerCase();
        switch (ext) {
            case 'pdf': return 'bx bxs-file-pdf';
            case 'doc':
            case 'docx': return 'bx bxs-file-doc';
            case 'xls':
            case 'xlsx': return 'bx bxs-spreadsheet';
            case 'ppt':
            case 'pptx': return 'bx bxs-slideshow';
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif': return 'bx bxs-file-image';
            case 'mp3': return 'bx bx-music';
            case 'mp4':
            case 'mpeg':
            case 'mpg': return 'bx bx-video';
            case 'zip':
            case 'rar': return 'bx bxs-file-archive';
            default: return 'bx bx-file';
        }
    }, []);

    const getFileDisplayName = useCallback((fileType, fileName) => {
        const lowerCaseFileType = fileType ? fileType.toLowerCase() : '';
        const ext = fileName ? fileName.split('.').pop().toLowerCase() : '';

        if (ext === 'zip') return 'ARCHIVO COMPRIMIDO (ZIP)';
        if (ext === 'rar') return 'ARCHIVO COMPRIMIDO (RAR)';
        if (lowerCaseFileType === 'pdf') return 'PDF';
        if (lowerCaseFileType === 'doc' || lowerCaseFileType === 'docx') return 'DOCUMENTO WORD';
        if (lowerCaseFileType === 'xls' || lowerCaseFileType === 'xlsx') return 'HOJA DE CÁLCULO EXCEL';
        if (lowerCaseFileType === 'ppt' || lowerCaseFileType === 'pptx') return 'PRESENTACIÓN POWERPOINT';
        if (lowerCaseFileType === 'mp3' || lowerCaseFileType === 'audio') return 'AUDIO';
        if (['mp4', 'mpeg', 'mpg', 'mov', 'avi', 'wmv', 'flv', 'webm', 'mkv'].includes(lowerCaseFileType) || ['mp4', 'mpeg', 'mpg', 'mov', 'avi', 'wmv', 'flv', 'webm', 'mkv'].includes(ext)) return 'VIDEO';
        if (['jpg', 'jpeg', 'png', 'gif'].includes(lowerCaseFileType) || ['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return 'IMAGEN';

        if (fileType) {
            return fileType.charAt(0).toUpperCase() + fileType.slice(1).toLowerCase();
        }
        return 'DESCONOCIDO';
    }, []);

    const handleDeleteFile = useCallback(async (archivoID, fileName) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: `Vas a eliminar el archivo: "${fileName}". ¡Esta acción es irreversible!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            customClass: {
                confirmButton: 'swal2-confirm-button',
                cancelButton: 'swal2-cancel-button',
                popup: 'swal2-custom-popup',
            },
            buttonsStyling: false,
        });

        if (result.isConfirmed) {
            const token = localStorage.getItem('authToken');
            if (!token) {
                showSwalAlert('Error', 'No estás autenticado para realizar esta acción.', 'error');
                return;
            }
            try {
                await axios.delete(`${API_BASE_URL}/archivos/${archivoID}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                showSwalAlert('Eliminado', 'El archivo ha sido eliminado exitosamente.', 'success', () => {
                    fetchFilesAndMinistries();
                });
            } catch (error) {
                console.error('Error al eliminar el archivo:', error);
                // El backend ahora enviará mensajes de error más específicos (403 para permisos)
                showSwalAlert('Error', error.response?.data?.message || 'No se pudo eliminar el archivo.', 'error');
            }
        }
    }, [fetchFilesAndMinistries, showSwalAlert]);

    // --- Definición de Columnas para react-data-table-component ---
    const columns = useMemo(() => [
        {
            name: (<span>Nombre del Archivo <i className='bx bx-sort'></i></span>),
            selector: row => row.NombreArchivo,
            sortable: true,
            grow: 3,
            cell: row => {
                const fileExtension = row.NombreArchivo.split('.').pop().toLowerCase();
                const fileUrl = `${API_BASE_URL}${row.RutaArchivo}`;

                const isAudio = ['mp3', 'wav', 'ogg'].includes(fileExtension);
                const isVideo = ['mp4', 'mpeg', 'mpg', 'mov', 'avi', 'wmv', 'flv', 'webm', 'mkv'].includes(fileExtension);
                const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension);

                if (isAudio) {
                    return (
                        <button onClick={() => handlePlayAudio(fileUrl)} className={styles.fileLinkAsButton} title={`Reproducir ${row.NombreArchivo}`}>
                            <i className={`${getFileIcon(row.NombreArchivo)} ${styles.fileIcon}`}></i>
                            <span className={styles.fileNameText}>{row.NombreArchivo}</span>
                        </button>
                    );
                } else if (isVideo) {
                    return (
                        <button onClick={() => handlePlayVideo(fileUrl)} className={styles.fileLinkAsButton} title={`Reproducir video ${row.NombreArchivo}`}>
                            <i className={`${getFileIcon(row.NombreArchivo)} ${styles.fileIcon}`}></i>
                            <span className={styles.fileNameText}>{row.NombreArchivo}</span>
                        </button>
                    );
                } else if (isImage) {
                    return (
                        <button onClick={() => handleViewImage(fileUrl, row.NombreArchivo, row.ArchivoID)} className={styles.fileLinkAsButton} title={`Ver imagen ${row.NombreArchivo}`}>
                            <i className={`${getFileIcon(row.NombreArchivo)} ${styles.fileIcon}`}></i>
                            <span className={styles.fileNameText}>{row.NombreArchivo}</span>
                        </button>
                    );
                } else {
                    return (
                        <a href={fileUrl} target="_blank" rel="noopener noreferrer" className={styles.fileLink} download={row.NombreArchivo} title={`Descargar o ver ${row.NombreArchivo}`}>
                            <i className={`${getFileIcon(row.NombreArchivo)} ${styles.fileIcon}`}></i>
                            <span className={styles.fileNameText}>{row.NombreArchivo}</span>
                        </a>
                    );
                }
            },
        },
        {
            name: (<span>Tipo <i className='bx bx-sort'></i></span>),
            selector: row => row.TipoArchivo,
            sortable: true,
            grow: 1,
            cell: row => getFileDisplayName(row.TipoArchivo, row.NombreArchivo),
        },
        {
            name: (<span>Ministerio <i className='bx bx-sort'></i></span>),
            selector: row => row.NombreMinisterio,
            sortable: true,
            grow: 2,
        },
        {
            name: (<span>Fecha de Subida <i className='bx bx-sort'></i></span>),
            selector: row => row.FechaSubida,
            sortable: true,
            format: row => {
                const date = new Date(row.FechaSubida);
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                return `${day}/${month}/${year}`;
            },
            width: '145px',
            minWidth: '135px',
            compact: true,
        },
        {
            name: 'Acciones',
            cell: row => {
                // LÓGICA DE PERMISOS PARA MODIFICACIÓN (Editar/Eliminar)
                const isGeneralAdmin = loggedInUserRolID === 1; // Administrador General
                const isMinistryLeader = loggedInUserRolID === 2; // Líder de Ministerio
                const isFileFromMyMinistry = loggedInUserMinisterioID === row.MinisterioID;
                
                const isAuthorizedToModify = 
                    isGeneralAdmin || // Rol 1: Permiso total
                    (isMinistryLeader && isFileFromMyMinistry); // Rol 2: Solo su ministerio

                // NOTA: Los roles 3 (Usuario Est.) y 4 (Lector/Inv.) están excluidos
                return (
                    <div className={styles.actionsCell}>
                        
                        {/* Botón de Edición (visible para Rol 1 y Rol 2 en su ministerio) */}
                        {isAuthorizedToModify && (
                            <button
                                onClick={() => handleEditFileName(row.ArchivoID, row.NombreArchivo)}
                                className={`${styles.actionButton} ${styles.editButton}`}
                                title={`Editar nombre de ${row.NombreArchivo}`}
                            >
                                <i className="bx bx-edit-alt"></i>
                            </button>
                        )}
                        
                        {/* Botón de Eliminación (visible para Rol 1 y Rol 2 en su ministerio) */}
                        {isAuthorizedToModify && (
                            <button
                                onClick={() => handleDeleteFile(row.ArchivoID, row.NombreArchivo)}
                                className={`${styles.actionButton} ${styles.deleteButton}`}
                                title={`Eliminar ${row.NombreArchivo}`}
                            >
                                <i className="bx bx-trash"></i>
                            </button>
                        )}
                    </div>
                );
            },
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            width: '115px',
            minWidth: '105px',
        },
    ], [handlePlayAudio, handlePlayVideo, handleViewImage, getFileIcon, getFileDisplayName, handleDeleteFile, handleEditFileName, loggedInUserRolID, loggedInUserMinisterioID]); 

    // --- Lógica de filtrado de archivos ---
    const filteredFiles = useMemo(() => {
        return fileList.filter(file => {
            const matchesSearch = searchTerm === '' ||
                (file.NombreArchivo && file.NombreArchivo.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (getFileDisplayName(file.TipoArchivo, file.NombreArchivo).toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesMinistry = selectedMinistryId === '' ||
                (file.MinisterioID && file.MinisterioID.toString() === selectedMinistryId);

            return matchesSearch && matchesMinistry;
        });
    }, [fileList, searchTerm, selectedMinistryId, getFileDisplayName]);

    // --- Renderizado Condicional de Estados de Carga/Error ---
    if (loading) {
        return <div className={styles.loadingContainer}>Cargando archivos...</div>;
    }

    if (error) {
        return <div className={styles.errorContainer}>{error}</div>;
    }
    
    // Control de visibilidad del botón de Subida
    const canUpload = [1, 2, 3].includes(loggedInUserRolID);

    // --- Renderizado del Componente Principal ---
    return (
        <div className={styles.filesContainer}>
            <h1>
                <i className="bx bxs-folder-open"></i> Gestión de Archivos
            </h1>

            {/* BOTÓN DE SUBIDA: Visible solo para RolID 1, 2, 3 */}
            {canUpload && (
                <div className={styles.topButtonsContainer}>
                    <button onClick={openUploadModal} className={styles.openUploadModalButton}>
                        <i className="bx bx-upload"></i> Subir Nuevo Archivo
                    </button>
                </div>
            )}

            <div className={styles.controlsGroup}>
                <input
                    type="text"
                    placeholder="Buscar por nombre o tipo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                />
                <select
                    value={selectedMinistryId}
                    onChange={(e) => setSelectedMinistryId(e.target.value)}
                    className={styles.departmentSelect}
                >
                    <option value="">Todos los Ministerios</option>
                    {ministries.map(ministry => (
                        <option key={ministry.MinisterioID} value={ministry.MinisterioID}>
                            {ministry.NombreMinisterio}
                        </option>
                    ))}
                </select>
            </div>

            <div className={styles.fileListSection}>
                <h3>Archivos Disponibles</h3>
                {filteredFiles.length === 0 ? (
                    <p className={styles.noFilesMessage}>No hay archivos disponibles que coincidan con la búsqueda o filtro.</p>
                ) : (
                    <DataTable
                        columns={columns}
                        data={filteredFiles}
                        pagination
                        highlightOnHover
                        pointerOnHover
                        responsive
                        noDataComponent="No hay archivos para mostrar."
                        paginationComponentOptions={{
                            rowsPerPageText: 'Filas por página:',
                            rangeSeparatorText: 'de',
                            noRowsPerPage: false,
                            selectAllRowsItem: false,
                            selectAllRowsItemText: 'Todas',
                        }}
                        // Aplica la clase del módulo CSS para estilizar el DataTable
                        className={styles.customDataTable} 
                    />
                )}
            </div>

            {/* Modales y Reproductores */}
            <UploadModal
                isVisible={isUploadModalOpen}
                onClose={closeUploadModal}
                onUploadSuccess={handleUploadSuccess}
                ministries={ministries}
                showSwalAlert={showSwalAlert}
                uploadUrl={`${API_BASE_URL}/archivos/uploads`}
            />

            {currentAudioUrl && (
                <AudioPlayer src={currentAudioUrl} onClose={handleCloseAudioPlayer} />
            )}

            {currentVideoUrl && (
                <VideoPlayer
                    src={currentVideoUrl}
                    onClose={handleCloseVideoPlayer}
                />
            )}

            {currentImageUrl && (
                <ImageModal
                    src={currentImageUrl}
                    fileName={currentImageFileName}
                    fileId={currentImageFileId}
                    onClose={handleCloseImagePlayer}
                />
            )}
        </div>
    );
}

export default Files;