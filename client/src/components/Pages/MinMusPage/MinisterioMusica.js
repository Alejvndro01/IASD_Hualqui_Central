import React, { useEffect, useState, useCallback } from 'react'; 
import axios from 'axios'; 
import Swal from 'sweetalert2'; 
import UploadModal from '../../utils/UploadModal/UploadModal'; 
import AudioPlayer from '../../utils/AudioPlayer/AudioPlayer'; 
import VideoPlayer from '../../utils/VideoPlayer/VideoPlayer';
import styles from './MinisterioMusica.module.css'; // Importa el CSS específico

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const MINISTRY_ID_MUC = 4; 

function MinisterioDeLaMusica() {
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
            const response = await axios.get(`${API_BASE_URL}/archivos/ministry/${MINISTRY_ID_MUC}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setMinistryFiles(response.data);
        } catch (err) {
            console.error("Error al obtener archivos del ministerio:", err);
            setFilesError("No se pudieron cargar los archivos de Ministerio de la Música. Inténtalo de nuevo más tarde.");
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
        <div className={styles.ministerioDeLaMusicaContainer}>
            {/* Sección del Encabezado (HEADER) */}
            <header className={styles.ministerioDeLaMusicaHeader}>
                <div className={styles.headerContent}>
                    <h2 className={styles.headerSubtitle}>DEPARTAMENTO</h2>
                    <h1 className={styles.headerTitle}>MINISTERIO DE LA <span>Música</span></h1>
                </div>
                {/* Barra de Navegación Interna */}
                <nav className={styles.headerNav}>
                    <ul>
                        {/* Los 'href' deben coincidir con los 'id' de las secciones para el smooth scroll */}
                        <li><a href="#destaque" className={styles.navLink}>CULTOS ESPECIALES</a></li>
                        <li><a href="#himnarios-y-partituras" className={styles.navLink}>HIMNARIOS Y PARTITURAS</a></li>
                        <li><a href="#recursos-audio-visual" className={styles.navLink}>AUDIO Y VIDEO</a></li>
                        <li><a href="#archivos-ministerio" className={styles.navLink}>ARCHIVOS</a></li>
                    </ul>
                </nav>
            </header>

            {/* Área de Contenido Principal (con secciones de recursos) */}
            <div className={styles.resourceContentArea}>

                {/* Sección de Destaque / Recurso Principal */}
                <section className={styles.highlightSection} id='destaque'>
                    <h2 className={styles.sectionHeading}>Cultos Especiales y Programas</h2>
                    <div className={styles.highlightCard}>
                        {/* Imagen sugerida: una imagen de un coro o grupo musical en la iglesia */}
                        <img src="/Images/MusicaPrincipal.jpg" alt="Culto de Adoración y Alabanza" className={styles.highlightImage} />
                        <div className={styles.highlightDetails}>
                            <h3 className={styles.highlightTitle}>Semana de Énfasis en la Adoración por la Música</h3>
                            <p className={styles.highlightDescription}>La música es una herramienta poderosa para acercarnos a Dios. Descarga la guía completa para organizar una semana de énfasis que profundice el compromiso con la música de alabanza y la adoración reverente en tu iglesia. Incluye sermones y sugerencias de repertorio.</p>
                            <a href="#" className={styles.highlightLink}>VER GUÍA COMPLETA <span className={styles.arrowIcon}>&gt;</span></a>
                        </div>
                    </div>
                </section>

                {/* Sección de Himnarios y Partituras */}
                <section className={styles.categorySection} id='himnarios-y-partituras'>
                    <h2 className={styles.sectionHeading}>Himnarios y Partituras</h2>
                    <div className={styles.resourceGrid}>
                        <div className={styles.resourceItem}>
                            <img src="/Images/Himnario.jpg" alt="Himnario Adventista" className={styles.resourceThumbnail} />
                            <div className={styles.resourceInfo}>
                                <h4 className={styles.resourceTitle}>Himnario Adventista Digital (Partituras)</h4>
                                <a href="#" className={styles.resourceLink}>DESCARGAR <span className={styles.arrowIcon}>&gt;</span></a>
                            </div>
                        </div>
                        <div className={styles.resourceItem}>
                            <img src="/Images/Alabanza.jpg" alt="Cancionero de Alabanza" className={styles.resourceThumbnail} />
                            <div className={styles.resourceInfo}>
                                <h4 className={styles.resourceTitle}>Cancionero de Alabanza Joven (Acordes)</h4>
                                <a href="#" className={styles.resourceLink}>VER MÁS <span className={styles.arrowIcon}>&gt;</span></a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Sección: Cuarteto de la Iglesia (Ministerio de Música) */}
                <section className={styles.categorySection} id='cuarteto'>
                    {/* 🔑 Título centrado en el grupo */}
                    <h2 className={styles.sectionHeading}>
                        Nuestro Cuarteto: **Ebenezer**
                    </h2>
                    <h3 className={styles.eventDate}>
                        Recursos para Música y Adoración
                    </h3>
                    
                    <div className={styles.resourceGrid}>
                        
                        {/* TARJETA 1: Pistas (Para ensayos o uso general) */}
                        <div className={styles.resourceItem}>
                            <img src="/Images/Pistas.jpg" alt="Pistas de Acompañamiento" className={styles.resourceThumbnail} />
                            <div className={styles.resourceInfo}>
                                <h4 className={styles.resourceTitle}>Pistas de Acompañamiento</h4>
                                <p className={styles.resourceDescription}>Material esencial para ensayos y acompañamiento musical en los servicios de la iglesia.</p>
                                <a href="#" target="_blank" rel='noopener noreferrer' className={styles.resourceLink}>ESCUCHAR / DESCARGAR <span className={styles.arrowIcon}>&gt;</span></a>
                            </div>
                        </div>

                        {/* 🔑 TARJETA 2: Archivos de Música y Partituras (Específico del Cuarteto) */}
                        <div className={styles.resourceItem}>
                            <img src="/Images/Partituras.jpg" alt="Partituras del Cuarteto Ebenezer" className={styles.resourceThumbnail} />
                            <div className={styles.resourceInfo}>
                                <h4 className={styles.resourceTitle}>Partituras y Letras de las Canciones de **Ebenezer**</h4>
                                <p className={styles.resourceDescription}>Archivos PDF con las partituras y los arreglos utilizados por el cuarteto.</p>
                                <a href="#" target="_blank" rel='noopener noreferrer' className={styles.resourceLink}>DESCARGAR ARCHIVOS <span className={styles.arrowIcon}>&gt;</span></a>
                            </div>
                        </div>
                        
                        {/* 🔑 TARJETA 3: Álbum o Presentación Reciente (Destacando el trabajo) */}
                        <div className={styles.resourceItem}>
                            <img src="/Images/AlbumEbenezer.jpg" alt="Video o Grabación Reciente" className={styles.resourceThumbnail} />
                            <div className={styles.resourceInfo}>
                                <h4 className={styles.resourceTitle}>Última Grabación: "Mi Todo, Mi Jesús"</h4>
                                <p className={styles.resourceDescription}>Grabación de audio de la última alabanza presentada por el cuarteto.</p>
                                <a href="#" target="_blank" rel='noopener noreferrer' className={styles.resourceLink}>ESCUCHAR GRABACIÓN <span className={styles.arrowIcon}>&gt;</span></a>
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
                preselectedMinistryId={MINISTRY_ID_MUC} 
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

export default MinisterioDeLaMusica;