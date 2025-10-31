import React, { useEffect, useState, useCallback } from 'react'; 
import axios from 'axios'; 
import Swal from 'sweetalert2'; 
import UploadModal from '../../utils/UploadModal/UploadModal'; 
import AudioPlayer from '../../utils/AudioPlayer/AudioPlayer'; 
import VideoPlayer from '../../utils/VideoPlayer/VideoPlayer';
import styles from './MayordomiaCristiana.module.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const MINISTRY_ID_MC = 3; 

function MayordomiaCristiana() {
    // --- 1. Declaración de Estados (Se mantiene la lógica de estado) ---
    const [ministryFiles, setMinistryFiles] = useState([]); 
    const [loadingFiles, setLoadingFiles] = useState(true); 
    const [filesError, setFilesError] = useState(null);     
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [currentAudioUrl, setCurrentAudioUrl] = useState(null); 
    const [currentVideoUrl, setCurrentVideoUrl] = useState(null); 
    const [ministries, setMinistries] = useState([]);

    // --- 2. Funciones de Utilidad (Se mantiene la lógica funcional) ---
    const showSwalAlert = useCallback((title, text, icon, callback = () => {}) => {
        Swal.fire({
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

    const fetchMinistries = useCallback(async () => {
        try {
            const token = localStorage.getItem('authToken'); 
            const response = await axios.get(`${API_BASE_URL}/ministerios`, {
                headers: {
                    Authorization: `Bearer ${token}`, 
                },
            });
            setMinistries(response.data); 
        } catch (err) {
            console.error("Error al obtener ministerios:", err);
        }
    }, []); 

    const fetchMinistryFiles = useCallback(async () => {
        setLoadingFiles(true); 
        setFilesError(null);   
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(`${API_BASE_URL}/archivos/ministry/${MINISTRY_ID_MC}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setMinistryFiles(response.data);
        } catch (err) {
            console.error("Error al obtener archivos del ministerio:", err);
            setFilesError("No se pudieron cargar los archivos de Mayordomía Cristiana. Inténtalo de nuevo más tarde.");
            showSwalAlert('Error', 'No se pudieron cargar los archivos del ministerio.', 'error');
        } finally {
            setLoadingFiles(false); 
        }
    }, [showSwalAlert]);

    // --- 3. Efectos de Montaje y Limpieza (Se mantiene la lógica de efectos) ---
    useEffect(() => {
        fetchMinistries();
        fetchMinistryFiles();
    }, [fetchMinistries, fetchMinistryFiles]);

    useEffect(() => {
        const handleSmoothScroll = (e) => {
            e.preventDefault(); 
            const targetId = e.currentTarget.getAttribute('href').substring(1); 
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80, 
                    behavior: 'smooth'                 
                });
            }
        };

        const navLinks = document.querySelectorAll(`.${styles.headerNav} a`);
        navLinks.forEach(link => {
            link.addEventListener('click', handleSmoothScroll);
        });

        return () => {
            navLinks.forEach(link => {
                link.removeEventListener('click', handleSmoothScroll);
            });
        };
    }, []); 

    // --- 4. Funciones de Lógica de Negocio y Handlers (Se mantiene la lógica de handlers) ---
    const getFileTypeAndUrl = (fileName, rutaArchivo) => {
        const extension = fileName.split('.').pop().toLowerCase();
        const fileUrl = `${API_BASE_URL}${rutaArchivo}`;

        if (['mp3', 'wav', 'ogg'].includes(extension)) {
            return { type: 'audio', url: fileUrl, icon: 'bx bx-volume-full' };
        } else if (['mp4', 'mpeg', 'mpg', 'mov', 'avi', 'wmv', 'flv', 'webm', 'mkv'].includes(extension)) {
            return { type: 'video', url: fileUrl, icon: 'bx bx-video' };
        } else if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
            return { type: 'image', url: fileUrl, icon: 'bx bx-image' };
        } else if (['pdf'].includes(extension)) {
            return { type: 'pdf', url: fileUrl, icon: 'bx bxs-file-pdf' };
        } else if (['doc', 'docx'].includes(extension)) {
            return { type: 'document', url: fileUrl, icon: 'bx bxs-file-doc' };
        } else if (['xls', 'xlsx'].includes(extension)) {
            return { type: 'spreadsheet', url: fileUrl, icon: 'bx bxs-file-xls' };
        } else if (['ppt', 'pptx'].includes(extension)) {
            return { type: 'presentation', url: fileUrl, icon: 'bx bxs-file-ppt' };
        } else if (['zip', 'rar'].includes(extension)) {
            return { type: 'archive', url: fileUrl, icon: 'bx bxs-file-archive' };
        }
        return { type: 'unknown', url: fileUrl, icon: 'bx bx-file' };
    };

    const openUploadModal = () => {
        setIsUploadModalOpen(true);
    };

    const closeUploadModal = () => {
        setIsUploadModalOpen(false);
    };

    const handleUploadSuccess = () => {
        showSwalAlert('¡Éxito!', 'Archivo subido correctamente.', 'success');
        fetchMinistryFiles(); 
        closeUploadModal(); 
    };

    const handleEditFileName = async (fileId, currentFileName) => {
        const { value: newFileName } = await Swal.fire({
            title: 'Editar Nombre del Archivo',
            input: 'text',
            inputLabel: 'Nuevo nombre:',
            inputValue: currentFileName,
            showCancelButton: true,
            confirmButtonText: 'Guardar',
            cancelButtonText: 'Cancelar',
            inputValidator: (value) => {
                if (!value) {
                    return 'Necesitas escribir un nombre!';
                }
            },
            buttonsStyling: false,
            customClass: {
                confirmButton: 'swal2-confirm-button',
                cancelButton: 'swal2-cancel-button',
                popup: 'swal2-custom-popup',
                input: 'swal2-custom-input' 
            }
        });
        if (newFileName && newFileName !== currentFileName) {
            try {
                const token = localStorage.getItem('authToken');
                await axios.put(`${API_BASE_URL}/archivos/${fileId}`, { NombreArchivo: newFileName }, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                showSwalAlert('¡Éxito!', 'Nombre del archivo actualizado correctamente.', 'success');
                fetchMinistryFiles(); 
            } catch (err) {
                console.error("Error al actualizar el nombre del archivo:", err);
                showSwalAlert('Error', 'No se pudo actualizar el nombre del archivo. Inténtalo de nuevo.', 'error');
            }
        } else if (newFileName === currentFileName) {
            Swal.close();
        }
    };

    const handleDeleteFile = async (fileId, fileName) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `Estás a punto de eliminar "${fileName}". ¡Esta acción no se puede deshacer!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            buttonsStyling: false,
            customClass: {
                confirmButton: 'swal2-confirm-button',
                cancelButton: 'swal2-cancel-button',
                popup: 'swal2-custom-popup'
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const token = localStorage.getItem('authToken');
                    await axios.delete(`${API_BASE_URL}/archivos/${fileId}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    showSwalAlert('¡Eliminado!', 'El archivo ha sido eliminado.', 'success');
                    fetchMinistryFiles(); 
                } catch (err) {
                    console.error("Error al eliminar archivo:", err);
                    showSwalAlert('Error', 'No se pudo eliminar el archivo. Inténtalo de nuevo.', 'error');
                }
            }
        });
    };

    const handlePlayAudio = (url) => {
        setCurrentAudioUrl(url);
    };

    const handleCloseAudioPlayer = () => {
        setCurrentAudioUrl(null);
    };

    const handlePlayVideo = (url) => {
        setCurrentVideoUrl(url);
    };

    const handleCloseVideoPlayer = () => {
        setCurrentVideoUrl(null);
    };

    // --- 5. Renderizado del Componente ---
    return (
        <div className={styles.mayordomiaCristianaContainer}>
            {/* Sección del Encabezado (HEADER) */}
            <header className={styles.mayordomiaCristianaHeader}>
                <div className={styles.headerContent}>
                    <h2 className={styles.headerSubtitle}>DEPARTAMENTO</h2>
                    <h1 className={styles.headerTitle}>MAYORDOMÍA <span>Cristiana</span></h1>
                </div>
                {/* Barra de Navegación Interna - Ajustada a secciones DSA/IASD */}
                <nav className={styles.headerNav}>
                    <ul>
                        <li><a href="#destaque" className={styles.navLink}>DESTACADOS</a></li>
                        <li><a href="#probad-y-ved" className={styles.navLink}>PROBAD Y VED</a></li>
                        <li><a href="#archivos-ministerio" className={styles.navLink}>ARCHIVOS</a></li>
                    </ul>
                </nav>
            </header>

            {/* Área de Contenido Principal (con secciones de recursos) */}
            <div className={styles.resourceContentArea}>

                {/* Sección de Destaque / Recurso Principal */}
                <section className={styles.highlightSection} id='destaque'>
                    <h2 className={styles.sectionHeading}>Destacados</h2>
                    <div className={styles.highlightCard}>
                        {/* Imagen sugerida: una imagen de la campaña actual de Mayordomía */}
                        <img src="/Images/PrimeroDios.jpg" alt="Campaña 'Primero Dios'" className={styles.highlightImage} />
                        <div className={styles.highlightDetails}>
                            <h3 className={styles.highlightTitle}>Primero Dios - Crecimiento Espiritual</h3>
                            <p className={styles.highlightDescription}>La Mayordomía Cristiana es una forma de vida en sociedad con Dios. Es la práctica de invertir la vida en sociedad con Él. Descarga los materiales de la meditación de la Puesta del Sol, el sermón mensual de Fidelidad y Probad y Ved.</p>
                            <a href="https://www.adventistas.org/es/mayordomiacristiana/proyecto/primero-dios-crecimiento-espiritual/" target="_blank" rel='noopener noreferrer' className={styles.highlightLink}>VER MÁS <span className={styles.arrowIcon}>&gt;</span></a>
                        </div>
                    </div>
                </section>
                
                {/* Sección de Probad y Ved (Diezmos y Ofrendas) */}
                <section className={styles.categorySection} id='probad-y-ved'>
                    <h2 className={styles.sectionHeading}>Probad y Ved</h2>
                    <div className={styles.resourceGrid}>
                        <div className={styles.resourceItem}>
                            <img src="/Images/Capa.jpg" alt="Plan de Diezmo" className={styles.resourceThumbnail} />
                            <div className={styles.resourceInfo}>
                                <h4 className={styles.resourceTitle}>Materiales "Probad y Ved" 2025</h4>
                                <a href="https://www.adventistas.org/es/mayordomiacristiana/proyecto/probad-y-ved/" target="_blank" rel='noopener noreferrer' className={styles.resourceLink}>DESCARGAR <span className={styles.arrowIcon}>&gt;</span></a>
                            </div>
                        </div>
                        <div className={styles.resourceItem}>
                            <img src="/Images/Ofrenda.jpg" alt="Planes de Ofrenda Sistemática" className={styles.resourceThumbnail} />
                            <div className={styles.resourceInfo}>
                                <h4 className={styles.resourceTitle}>Sermón Mensual de Fidelidad (2025)</h4>
                                <a href="https://downloads.adventistas.org/es/mayordomia-cristiana/materiales-de-divulgacion/sermonario-mensual-2025/" target="_blank" rel='noopener noreferrer' className={styles.resourceLink}>VER MÁS <span className={styles.arrowIcon}>&gt;</span></a>
                            </div>
                        </div>
                    </div>
                </section>


                {/* --- SECCIÓN: ARCHIVOS DEL MINISTERIO (DINÁMICA) --- */}
                <section id="archivos-ministerio" className={styles.section}>
                    <h2 className={styles.sectionHeading}>
                        <i className='bx bx-folder'></i> Archivos del Ministerio
                    </h2>

                    <div className={styles.filesControlBar}>
                        <button
                            onClick={openUploadModal}
                            className={styles.uploadButton}
                            title="Subir nuevo archivo"
                        >
                            <i className="bx bx-cloud-upload"></i> Subir Archivo
                        </button>
                    </div>

                    {loadingFiles && (
                        <div className={styles.loadingContainer}>
                            <i className='bx bx-loader bx-spin'></i> Cargando archivos...
                        </div>
                    )}

                    {filesError && (
                        <div className={styles.errorContainer}>
                            <i className='bx bx-error-alt'></i> {filesError}
                        </div>
                    )}

                    {!loadingFiles && !filesError && ministryFiles.length === 0 && (
                        <div className={styles.noFilesMessage}>
                            <i className='bx bx-info-circle'></i> No hay archivos disponibles para este ministerio.
                        </div>
                    )}

                    {/* Lista de archivos si no hay errores y hay archivos */}
                    {!loadingFiles && !filesError && ministryFiles.length > 0 && (
                        <ul className={styles.fileList}>
                            {ministryFiles.map((file) => {
                                const { type, url, icon } = getFileTypeAndUrl(file.NombreArchivo, file.RutaArchivo);
                                return (
                                    <li key={file.ArchivoID} className={styles.fileItem}>
                                        <div className={styles.fileIcon}>
                                            <i className={icon}></i>
                                        </div>
                                        <div className={styles.fileDetails}>
                                            <span className={styles.fileName} title={file.NombreArchivo}>
                                                {file.NombreArchivo}
                                            </span>
                                            <span className={styles.fileMinistry}>
                                                Ministerio: {file.NombreMinisterio || 'Sin asignar'}
                                            </span>
                                            <span className={styles.fileUploadDate}>
                                                Subido: {new Date(file.FechaSubida).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <div className={styles.fileActions}>
                                            {/* Botones de reproducción para audio/video */}
                                            {type === 'audio' && (
                                                <button
                                                    onClick={() => handlePlayAudio(url)}
                                                    className={styles.playButton}
                                                    title="Reproducir Audio"
                                                >
                                                    <i className="bx bx-play-circle"></i>
                                                </button>
                                            )}
                                            {type === 'video' && (
                                                <button
                                                    onClick={() => handlePlayVideo(url)}
                                                    className={styles.playButton}
                                                    title="Reproducir Video"
                                                >
                                                    <i className="bx bx-play-circle"></i>
                                                </button>
                                            )}
                                            {/* Botón de ver para otros tipos de archivo (abre en nueva pestaña) */}
                                            {type !== 'audio' && type !== 'video' && (
                                                <a
                                                    href={url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={styles.viewButton}
                                                    title={`Ver ${file.NombreArchivo}`}
                                                >
                                                    <i className="bx bx-show"></i>
                                                </a>
                                            )}
                                            {/* Botón de Descargar */}
                                            <a
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                download={file.NombreArchivo} 
                                                className={styles.downloadButton}
                                                title={`Descargar ${file.NombreArchivo}`}
                                            >
                                                <i className="bx bx-download"></i>
                                            </a>
                                            {/* Botón de Editar Nombre */}
                                            <button
                                                onClick={() => handleEditFileName(file.ArchivoID, file.NombreArchivo)}
                                                className={styles.editButton}
                                                title={`Editar ${file.NombreArchivo}`}
                                            >
                                                <i className="bx bx-edit-alt"></i>
                                            </button>
                                            {/* Botón de Eliminar */}
                                            <button
                                                onClick={() => handleDeleteFile(file.ArchivoID, file.NombreArchivo)}
                                                className={styles.deleteButton}
                                                title={`Eliminar ${file.NombreArchivo}`}
                                            >
                                                <i className="bx bx-trash"></i>
                                            </button>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </section>
            </div>

            {/* --- Modales y Reproductores --- */}
            <UploadModal
                isVisible={isUploadModalOpen}
                onClose={closeUploadModal}
                onUploadSuccess={handleUploadSuccess}
                ministries={ministries}
                preselectedMinistryId={MINISTRY_ID_MC}
                showSwalAlert={showSwalAlert}
                uploadUrl={`${API_BASE_URL}/archivos/uploads`} 
            />

            {currentAudioUrl && (
                <AudioPlayer src={currentAudioUrl} onClose={handleCloseAudioPlayer} />
            )}

            {currentVideoUrl && (
                <VideoPlayer src={currentVideoUrl} onClose={handleCloseVideoPlayer} />
            )}
        </div>
    );
}

export default MayordomiaCristiana;