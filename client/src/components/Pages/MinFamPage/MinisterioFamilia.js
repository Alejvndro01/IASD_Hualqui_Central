import React, { useEffect, useState, useCallback } from 'react'; 
import axios from 'axios'; 
import Swal from 'sweetalert2'; 
import UploadModal from '../../utils/UploadModal/UploadModal'; 
import AudioPlayer from '../../utils/AudioPlayer/AudioPlayer'; 
import VideoPlayer from '../../utils/VideoPlayer/VideoPlayer';
import styles from './MinisterioFamilia.module.css'; // Importa el CSS específico

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const MINISTRY_ID_FAM = 4; // ID del Ministerio de la Familia (Asumido)

function MinisterioDeLaFamilia() {
    // --- 1. Declaración de Estados ---
    const [ministryFiles, setMinistryFiles] = useState([]); 
    const [loadingFiles, setLoadingFiles] = useState(true); 
    const [filesError, setFilesError] = useState(null);     
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [currentAudioUrl, setCurrentAudioUrl] = useState(null); 
    const [currentVideoUrl, setCurrentVideoUrl] = useState(null); 
    const [ministries, setMinistries] = useState([]);

    // --- 2. Funciones de Utilidad (Memoizadas con useCallback) ---
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

    //Obtiene la lista completa de ministerios desde la API.
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

    //Obtiene los archivos asociados específicamente al Ministerio de la Familia desde la API.
    const fetchMinistryFiles = useCallback(async () => {
        setLoadingFiles(true); 
        setFilesError(null);   
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(`${API_BASE_URL}/archivos/ministry/${MINISTRY_ID_FAM}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setMinistryFiles(response.data);
        } catch (err) {
            console.error("Error al obtener archivos del ministerio:", err);
            setFilesError("No se pudieron cargar los archivos del Ministerio de la Familia. Inténtalo de nuevo más tarde.");
            showSwalAlert('Error', 'No se pudieron cargar los archivos del ministerio.', 'error');
        } finally {
            setLoadingFiles(false); 
        }
    }, [showSwalAlert]);

    // --- 3. Efectos de Montaje y Limpieza (useEffect) ---
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

        // Selecciona todos los enlaces de navegación y añade el listener
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

    // --- 4. Funciones de Lógica de Negocio y Handlers ---

    //Determina el tipo de archivo y construye la URL completa para visualización/descarga. 
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

    //Abre el modal de subida de archivos.
    const openUploadModal = () => {
        setIsUploadModalOpen(true);
    };

    //Cierra el modal de subida de archivos
    const closeUploadModal = () => {
        setIsUploadModalOpen(false);
    };

    //Manejador para cuando un archivo se sube exitosamente.
    const handleUploadSuccess = () => {
        showSwalAlert('¡Éxito!', 'Archivo subido correctamente.', 'success');
        fetchMinistryFiles(); 
        closeUploadModal(); 
    };

    //Permite al usuario editar el nombre de un archivo existente.
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

    //Maneja la eliminación de un archivo.
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

    //Inicia la reproducción de un archivo de audio en el reproductor.
    const handlePlayAudio = (url) => {
        setCurrentAudioUrl(url);
    };

    //Cierra el reproductor de audio.
    const handleCloseAudioPlayer = () => {
        setCurrentAudioUrl(null);
    };

    //Inicia la reproducción de un archivo de video en el reproductor.
    const handlePlayVideo = (url) => {
        setCurrentVideoUrl(url);
    };

    //Cierra el reproductor de video.
    const handleCloseVideoPlayer = () => {
        setCurrentVideoUrl(null);
    };

    // --- 5. Renderizado del Componente ---
    return (
        <div className={styles.ministerioDeLaFamiliaContainer}>
            {/* Sección del Encabezado (HEADER) */}
            <header className={styles.ministerioDeLaFamiliaHeader}>
                <div className={styles.headerContent}>
                    <h2 className={styles.headerSubtitle}>DEPARTAMENTO</h2>
                    <h1 className={styles.headerTitle}>MINISTERIO DE LA <span>Familia</span></h1>
                </div>
                {/* Barra de Navegación Interna */}
                <nav className={styles.headerNav}>
                    <ul>
                        {/* Los 'href' deben coincidir con los 'id' de las secciones para el smooth scroll */}
                        <li><a href="#destaque" className={styles.navLink}>SEMANA DE LA FAMILIA</a></li>
                        <li><a href="#matrimonio" className={styles.navLink}>ENRIQUECIMIENTO MATRIMONIAL</a></li>
                        <li><a href="#crianza" className={styles.navLink}>CRIANZA Y EDUCACIÓN</a></li>
                        <li><a href="#archivos-ministerio" className={styles.navLink}>ARCHIVOS</a></li>
                    </ul>
                </nav>
            </header>

            {/* Área de Contenido Principal (con secciones de recursos) */}
            <div className={styles.resourceContentArea}>

                {/* Sección de Destaque / Recurso Principal */}
                <section className={styles.highlightSection} id='destaque'>
                    <h2 className={styles.sectionHeading}>Destaque: Semana de la Familia</h2>
                    <div className={styles.highlightCard}>
                        {/* Imagen sugerida: una familia orando o haciendo un culto */}
                        <img src="/Images/FamiliaPrincipal.jpg" alt="Semana de la Familia 2025" className={styles.highlightImage} />
                        <div className={styles.highlightDetails}>
                            <h3 className={styles.highlightTitle}>Semana Anual de la Familia 2025 - "Un Hogar de Esperanza"</h3>
                            <p className={styles.highlightDescription}>Cada año dedicamos una semana a fortalecer los lazos espirituales y emocionales de nuestros hogares. Descarga aquí la guía completa de sermones, meditaciones y actividades interactivas para celebrar esta semana en tu iglesia y familia.</p>
                            <a href="#" className={styles.highlightLink}>VER GUÍA COMPLETA <span className={styles.arrowIcon}>&gt;</span></a>
                        </div>
                    </div>
                </section>

                {/* Sección de Enriquecimiento Matrimonial */}
                <section className={styles.categorySection} id='matrimonio'>
                    <h2 className={styles.sectionHeading}>Enriquecimiento y Fortalecimiento Matrimonial</h2>
                    <div className={styles.resourceGrid}>
                        <div className={styles.resourceItem}>
                            <img src="/Images/Consejeria.jpg" alt="Guía de Consejería Matrimonial" className={styles.resourceThumbnail} />
                            <div className={styles.resourceInfo}>
                                <h4 className={styles.resourceTitle}>Guía de Consejería Prematrimonial y Matrimonial</h4>
                                <a href="#" className={styles.resourceLink}>VER GUÍA <span className={styles.arrowIcon}>&gt;</span></a>
                            </div>
                        </div>
                        <div className={styles.resourceItem}>
                            <img src="/Images/RetiroParejas.jpg" alt="Material para Retiro de Parejas" className={styles.resourceThumbnail} />
                            <div className={styles.resourceInfo}>
                                <h4 className={styles.resourceTitle}>Material para Retiros y Campamentos de Parejas</h4>
                                <a href="#" className={styles.resourceLink}>DESCARGAR <span className={styles.arrowIcon}>&gt;</span></a>
                            </div>
                        </div>
                        <div className={styles.resourceItem}>
                            <img src="/Images/Comunicacion.jpg" alt="Seminarios de Comunicación Efectiva" className={styles.resourceThumbnail} />
                            <div className={styles.resourceInfo}>
                                <h4 className={styles.resourceTitle}>Recursos sobre Comunicación Efectiva en el Hogar</h4>
                                <a href="#" className={styles.resourceLink}>VER MÁS <span className={styles.arrowIcon}>&gt;</span></a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Sección de Crianza y Educación */}
                <section className={styles.categorySection} id='crianza'>
                    <h2 className={styles.sectionHeading}>Crianza de los Hijos y Educación Familiar</h2>
                    <div className={styles.resourceGrid}>
                        <div className={styles.resourceItem}>
                            <img src="/Images/CrianzaBiblica.jpg" alt="Principios de Crianza Bíblica" className={styles.resourceThumbnail} />
                            <div className={styles.resourceInfo}>
                                <h4 className={styles.resourceTitle}>Principios Bíblicos para la Crianza con Propósito</h4>
                                <a href="#" target="_blank" rel='noopener noreferrer' className={styles.resourceLink}>VER MÁS <span className={styles.arrowIcon}>&gt;</span></a>
                            </div>
                        </div>
                        <div className={styles.resourceItem}>
                            <img src="/Images/CultoFamiliar.jpg" alt="Guías de Culto Familiar" className={styles.resourceThumbnail} />
                            <div className={styles.resourceInfo}>
                                <h4 className={styles.resourceTitle}>Guías y Devocionales para el Culto Familiar Diario</h4>
                                <a href="#" target="_blank" rel='noopener noreferrer' className={styles.resourceLink}>DESCARGAR <span className={styles.arrowIcon}>&gt;</span></a>
                            </div>
                        </div>
                        <div className={styles.resourceItem}>
                            <img src="/Images/Adolescentes.jpg" alt="Manejo de Adolescentes" className={styles.resourceThumbnail} />
                            <div className={styles.resourceInfo}>
                                <h4 className={styles.resourceTitle}>Seminarios sobre Manejo de Adolescentes</h4>
                                <a href="#" target="_blank" rel='noopener noreferrer' className={styles.resourceLink}>VER VIDEOS <span className={styles.arrowIcon}>&gt;</span></a>
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
                preselectedMinistryId={MINISTRY_ID_FAM} 
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

export default MinisterioDeLaFamilia;