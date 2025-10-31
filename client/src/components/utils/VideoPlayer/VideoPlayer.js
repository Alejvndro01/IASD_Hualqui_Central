/*
 * =============================================
 * Archivo: VideoPlayer.js
 * Descripción: Componente React para reproducir videos.
 * Ofrece controles básicos como reproducir/pausar, detener,
 * control de volumen, barra de progreso, pantalla completa y descarga.
 * Autor: Dilan Baltras | Fecha: 2025-06-25
 * =============================================
 */

/* 1. Importaciones */
import React, { useRef, useState, useEffect, useCallback } from 'react';
import styles from './VideoPlayer.module.css'; // Estilos específicos del reproductor

/*
 * =============================================
 * 2. VideoPlayer
 * =============================================
 * Componente funcional principal del reproductor de video.
 */
function VideoPlayer({ src, onClose }) {
    /* 2.1. Referencias al DOM */
    const videoRef = useRef(null); // Referencia al elemento <video>

    /* 2.2. Estados del Componente */
    const [isPlaying, setIsPlaying] = useState(false); // true si el video está reproduciéndose
    const [currentTime, setCurrentTime] = useState(0); // Tiempo actual de reproducción
    const [duration, setDuration] = useState(0);       // Duración total del video
    const [volume, setVolume] = useState(0.7);         // Nivel de volumen (0.0 a 1.0)
    const [isMuted, setIsMuted] = useState(false);     // true si el video está silenciado
    const [isFullScreen, setIsFullScreen] = useState(false); // true si está en pantalla completa

    /* 2.3. Efectos (useEffect) */

    // Efecto principal: Maneja la carga del video, eventos y reproducción inicial.
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        // Handler para cuando los metadatos del video están cargados (para obtener la duración)
        const handleLoadedMetadata = () => {
            setDuration(video.duration);
        };

        // Handler para actualizar el tiempo actual de reproducción
        const handleTimeUpdate = () => {
            setCurrentTime(video.currentTime);
        };

        // Handler para cuando el video termina
        const handleEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
            video.currentTime = 0; // Reinicia el video al final
        };

        // Handler para cambios de estado de pantalla completa
        const handleFullScreenChange = () => {
            setIsFullScreen(
                !!document.fullscreenElement ||
                !!document.webkitFullscreenElement ||
                !!document.mozFullScreenElement ||
                !!document.msFullscreenElement
            );
        };

        // 2.3.1. Añadir Listeners de Eventos al elemento de video
        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('ended', handleEnded);

        // 2.3.2. Añadir Listeners de Eventos al DOCUMENTO para pantalla completa (compatibilidad entre navegadores)
        document.addEventListener('fullscreenchange', handleFullScreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullScreenChange);
        document.addEventListener('mozfullscreenchange', handleFullScreenChange);
        document.addEventListener('MSFullscreenChange', handleFullScreenChange);

        // 2.3.3. Cargar y intentar reproducir el video cuando `src` cambia
        if (src) {
            video.load(); // Carga el video
            video.play().then(() => {
                setIsPlaying(true);
            }).catch(error => {
                // Maneja el error si la reproducción automática es bloqueada
                console.warn("Advertencia: La reproducción automática fue bloqueada por el navegador. El usuario deberá iniciar la reproducción manualmente.", error);
                setIsPlaying(false);
            });
        }

        // 2.3.4. Función de limpieza: Se ejecuta al desmontar el componente o antes de re-ejecutar el efecto.
        return () => {
            // Remueve todos los listeners para evitar fugas de memoria
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('ended', handleEnded);
            document.removeEventListener('fullscreenchange', handleFullScreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullScreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullScreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullScreenChange);
            
            // Pausa y reinicia el video si el componente se desmonta
            if (video) {
                video.pause();
                video.currentTime = 0;
            }
        };
    }, [src]); // Dependencia: re-ejecuta el efecto si 'src' cambia.

    // Efecto para sincronizar el estado 'volume' con la propiedad 'volume' del video.
    useEffect(() => {
        const video = videoRef.current;
        if (video) {
            video.volume = volume;
            setIsMuted(volume === 0); // Actualiza isMuted si el volumen es 0
        }
    }, [volume]); // Dependencia: re-ejecuta si 'volume' cambia.

    // Efecto para sincronizar el estado 'isMuted' con la propiedad 'muted' del video.
    useEffect(() => {
        const video = videoRef.current;
        if (video) {
            video.muted = isMuted;
        }
    }, [isMuted]); // Dependencia: re-ejecuta si 'isMuted' cambia.

    /* 2.4. Manejadores de Eventos de los Controles del Reproductor (Optimizados con useCallback) */

    // Alterna entre reproducir y pausar el video.
    const togglePlayPause = useCallback(() => {
        const video = videoRef.current;
        if (video) {
            if (isPlaying) {
                video.pause();
            } else {
                video.play().catch(error => {
                    console.error("Error al intentar reproducir el video:", error);
                });
            }
            setIsPlaying(!isPlaying);
        }
    }, [isPlaying]); // Dependencia: isPlaying

    // Detiene el video y lo reinicia al principio.
    const handleStop = useCallback(() => {
        const video = videoRef.current;
        if (video) {
            video.pause();
            video.currentTime = 0;
            setIsPlaying(false);
            setCurrentTime(0);
        }
    }, []); // Sin dependencias, ya que no usa estados externos que cambien.

    // Maneja el cambio de la barra de progreso (arrastre del usuario).
    const handleProgressChange = useCallback((e) => {
        const video = videoRef.current;
        if (video) {
            video.currentTime = parseFloat(e.target.value);
            setCurrentTime(video.currentTime);
            // Si el video está pausado y el usuario arrastra, no lo inicies.
            if (!isPlaying && video.paused) {
                video.pause();
            }
        }
    }, [isPlaying]); // Dependencia: isPlaying

    // Maneja el cambio del volumen.
    const handleVolumeChange = useCallback((e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
    }, []); // Sin dependencias.

    // Alterna el estado de silencio (mute).
    const toggleMute = useCallback(() => {
        const video = videoRef.current;
        if (video) {
            const newMutedState = !isMuted;
            setIsMuted(newMutedState);
            // Si se desmutea y el volumen estaba en 0, lo establece a un valor por defecto.
            if (!newMutedState && volume === 0) {
                setVolume(0.7);
            }
        }
    }, [isMuted, volume]); // Dependencias: isMuted, volume

    // Alterna el modo de pantalla completa.
    const toggleFullScreen = useCallback(() => {
        const playerContainer = videoRef.current.parentElement; // El contenedor del reproductor
        if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.mozFullScreenElement && !document.msFullscreenElement) {
            // Entrar en pantalla completa (con prefijos para compatibilidad)
            if (playerContainer.requestFullscreen) {
                playerContainer.requestFullscreen();
            } else if (playerContainer.mozRequestFullScreen) { // Firefox
                playerContainer.mozRequestFullScreen();
            } else if (playerContainer.webkitRequestFullscreen) { // Chrome, Safari, Edge
                playerContainer.webkitRequestFullscreen();
            } else if (playerContainer.msRequestFullscreen) { // IE/Edge
                playerContainer.msRequestFullscreen();
            }
        } else {
            // Salir de pantalla completa (con prefijos para compatibilidad)
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) { // Firefox
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) { // Chrome, Safari, Edge
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { // IE/Edge
                document.msExitFullscreen();
            }
        }
    }, []); // Sin dependencias.

    // Descarga el video actual.
    const handleDownload = useCallback(() => {
        if (!src) return;
        const link = document.createElement('a');
        link.href = src;
        // Intenta extraer el nombre del archivo de la URL, si no, usa un nombre por defecto.
        link.download = src.substring(src.lastIndexOf('/') + 1) || 'video_descargado.mp4';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [src]); // Dependencia: src

    /* 2.5. Funciones Auxiliares */

    // Formatea el tiempo de segundos a formato MM:SS.
    const formatTime = (time) => {
        if (isNaN(time) || time < 0) return "00:00"; // Manejo de valores inválidos
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    /* 2.6. Renderizado del Componente */

    // No renderizar el componente si no se proporciona una fuente de video (src).
    if (!src) return null;

    return (
        <div className={styles.playerOverlay}>
            <div className={styles.playerModal}>
                {/* Cabecera del modal con título y botón de cierre */}
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>Reproduciendo Video</h2>
                    <button
                        onClick={onClose}
                        className={styles.closeButton}
                        aria-label="Cerrar reproductor de video"
                    >
                        <i className="fas fa-times"></i> {/* Icono de Font Awesome */}
                    </button>
                </div>

                {/* Contenedor del elemento de video */}
                <div className={styles.videoContainer}>
                    <video
                        ref={videoRef}
                        src={src}
                        preload="metadata" // Precarga solo los metadatos del video
                        className={styles.videoElement}
                        onClick={togglePlayPause} // Permite pausar/reproducir haciendo clic en el video
                    ></video>
                </div>

                {/* Grupo de controles principales (Play/Pause, Stop, Download) */}
                <div className={styles.controlsGroup}>
                    <button
                        onClick={togglePlayPause}
                        className={styles.controlButton}
                        aria-label={isPlaying ? "Pausar video" : "Reproducir video"}
                    >
                        {isPlaying ? (
                            <i className="fas fa-pause"></i>
                        ) : (
                            <i className="fas fa-play"></i>
                        )}
                    </button>

                    <button
                        onClick={handleStop}
                        className={`${styles.controlButton} ${styles.red}`}
                        aria-label="Detener video"
                    >
                        <i className="fas fa-stop"></i>
                    </button>

                    <button
                        onClick={handleDownload}
                        className={`${styles.controlButton} ${styles.gray}`}
                        title="Descargar video"
                        aria-label="Descargar video"
                    >
                        <i className="fas fa-download"></i>
                    </button>
                </div>

                {/* Contenedor de la barra de progreso y visualización de tiempo */}
                <div className={styles.progressBarContainer}>
                    <input
                        type="range"
                        min="0"
                        max={duration || 0} // Asegura que el máximo sea al menos 0
                        value={currentTime}
                        onChange={handleProgressChange}
                        className={styles.progressBar}
                        aria-label="Barra de progreso del video"
                    />
                    <div className={styles.timeDisplay}>
                        <span>{formatTime(currentTime)}</span> {/* Tiempo actual formateado */}
                        <span>{formatTime(duration)}</span>     {/* Duración total formateada */}
                    </div>
                </div>

                {/* Grupo de controles de volumen y pantalla completa */}
                <div className={styles.volumeFullscreenGroup}>
                    <button
                        onClick={toggleMute}
                        className={styles.volumeMuteButton}
                        aria-label={isMuted || volume === 0 ? "Desmutear video" : "Mutear video"}
                    >
                        {isMuted || volume === 0 ? (
                            <i className="fas fa-volume-mute"></i>
                        ) : (
                            <i className="fas fa-volume-up"></i>
                        )}
                    </button>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01" // Permite controlar el volumen en incrementos pequeños
                        value={volume}
                        onChange={handleVolumeChange}
                        className={styles.volumeSlider}
                        aria-label="Control de volumen del video"
                    />

                    <button
                        onClick={toggleFullScreen}
                        className={styles.fullscreenButton}
                        aria-label={isFullScreen ? "Salir de pantalla completa" : "Entrar en pantalla completa"}
                    >
                        {isFullScreen ? (
                            <i className="fas fa-compress-alt"></i>
                        ) : (
                            <i className="fas fa-expand-alt"></i>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* 3. Exportación del Componente */
export default VideoPlayer;