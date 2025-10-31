/*
 * =============================================
 * Archivo: AudioPlayer.js
 * Descripción: Componente reproductor de audio con controles básicos.
 * Ahora el audio no se reinicia al ajustar el volumen o silenciar.
 * Autor: Dilan Baltras | Fecha: 2025-06-28 (Actualizado)
 * =============================================
 */

/* 1. Importaciones */
import React, { useRef, useState, useEffect, useCallback } from 'react';
import styles from './AudioPlayer.module.css';

/*
 * =============================================
 * 2. AudioPlayer
 * =============================================
 * Componente funcional para reproducir archivos de audio.
 * @param {Object} props - Propiedades recibidas por el componente.
 * @param {string} props.src - URL del archivo de audio a reproducir.
 * @param {function} props.onClose - Función para cerrar el reproductor.
 */
function AudioPlayer({ src, onClose }) {
    /* 2.1. Estado y Referencias */
    const audioRef = useRef(null); // Referencia al elemento de audio HTML
    const [isPlaying, setIsPlaying] = useState(false); // Estado de reproducción
    const [currentTime, setCurrentTime] = useState(0); // Tiempo actual de reproducción
    const [duration, setDuration] = useState(0);     // Duración total del audio
    const [volume, setVolume] = useState(0.7);       // Nivel de volumen (0.0 a 1.0)
    const [isMuted, setIsMuted] = useState(false);   // Estado de silencio

    /* 2.2. Funciones de Manejo */
    // Alterna el estado de reproducción/pausa del audio.
    const togglePlayPause = () => {
        const audio = audioRef.current;
        if (audio) {
            if (isPlaying) {
                audio.pause();
            } else {
                audio.play().catch(error => {
                    console.error("Error al intentar reproducir audio:", error);
                });
            }
            setIsPlaying(!isPlaying);
        }
    };

    // Detiene la reproducción y resetea el tiempo.
    const handleStop = () => {
        const audio = audioRef.current;
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
            setIsPlaying(false);
            setCurrentTime(0);
        }
    };

    // Actualiza el tiempo de reproducción al cambiar la barra de progreso.
    const handleProgressChange = (e) => {
        const audio = audioRef.current;
        if (audio) {
            audio.currentTime = e.target.value;
            setCurrentTime(audio.currentTime);
            // Si estaba pausado y se mueve la barra, mantener pausado
            if (!isPlaying && audio.paused) {
                audio.pause();
            }
        }
    };

    // Actualiza el volumen del audio.
    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
    };

    // Alterna el estado de silencio (mute).
    const toggleMute = () => {
        // Al mutear/desmutear, también queremos que el slider de volumen refleje esto
        // Si estaba muteado y se desmutea, y el volumen es 0, lo ponemos a 0.7 para que se oiga.
        // Si no, simplemente alternamos el estado.
        const audio = audioRef.current;
        if (audio) {
            const newMutedState = !isMuted;
            setIsMuted(newMutedState);
            // Si se desmutea y el volumen real del elemento es 0 (porque estaba muteado),
            // lo ajustamos a 0.7 para que haya sonido.
            // Esto es para que el slider visual y el volumen del audioElement sean consistentes.
            if (!newMutedState && audio.volume === 0) {
                 setVolume(0.7); // Ajusta el estado de volumen si estaba en 0 y se desmutea
            }
        }
    };

    // Inicia la descarga del archivo de audio.
    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = src;
        // Asigna el nombre del archivo de la URL
        link.download = src.substring(src.lastIndexOf('/') + 1);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Formatea el tiempo de segundos a formato MM:SS.
    const formatTime = (time) => {
        if (isNaN(time)) return "00:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    /* 2.3. Efectos (useEffect) */
    // Efecto principal para gestionar la carga y reproducción inicial del audio.
    // Solo se ejecuta cuando `src` cambia.
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
            // Asegurarse de que el volumen del elemento audio se inicialice con el estado 'volume'
            // y el estado 'isMuted' se sincronice con la propiedad 'muted' del audio.
            audio.volume = volume; // Aplica el volumen inicial del estado
            audio.muted = isMuted; // Aplica el estado de mute inicial
        };

        const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
        const handleEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
            audio.currentTime = 0;
        };
        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);

        // Añade listeners de eventos al elemento de audio
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);

        // Carga y reproduce el audio automáticamente cuando 'src' cambia
        if (src) {
            audio.load();
            audio.play().then(() => {
                setIsPlaying(true);
            }).catch(error => {
                console.error("Error al intentar reproducir audio automáticamente:", error);
                setIsPlaying(false);
            });
        }

        // Función de limpieza al desmontar o cambiar 'src'
        return () => {
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
            }
        };
    }, [src]); // <-- Dependencia clave: ¡SOLO src!

    // Sincroniza el volumen del elemento de audio con el estado 'volume'.
    // Este efecto se encarga solo del volumen.
    useEffect(() => {
        const audio = audioRef.current;
        if (audio) {
            audio.volume = volume;
            // Si el volumen se ajusta a 0, automáticamente mutear y reflejarlo en el estado.
            // Si el volumen se ajusta a algo distinto de 0, desmutear y reflejarlo.
            setIsMuted(volume === 0); 
        }
    }, [volume]); // Dependencia: volume

    // Sincroniza el estado 'isMuted' con la propiedad 'muted' del elemento de audio.
    // Este efecto se encarga solo del mute.
    useEffect(() => {
        const audio = audioRef.current;
        if (audio) {
            audio.muted = isMuted;
            // Si se mutea, establecer el volumen a 0 para que el slider refleje el mute.
            // Si se desmutea, restablecer el volumen a un valor por defecto si estaba en 0.
            if (isMuted && audio.volume !== 0) { // Si se mutea y el volumen no era 0, guardar el volumen actual antes de ponerlo a 0
                // No hay necesidad de guardar el volumen anterior si se va a mutear.
                // Simplemente establecemos el volumen del elemento a 0 si se mutear,
                // pero el estado 'volume' se mantiene para cuando se desmutee.
                audio.volume = 0; // Visualmente, esto apaga el sonido.
            } else if (!isMuted && audio.volume === 0) {
                setVolume(0.7); // Si se desmutea y el audio estaba en 0, lo ponemos a un valor por defecto.
            }
        }
    }, [isMuted]); // Dependencia: isMuted

    /* 2.4. Renderizado Condicional */
    // No renderiza el componente si no se proporciona un 'src'.
    if (!src) return null;

    /* 2.5. Renderizado JSX */
    return (
        <div className={styles.playerOverlay}>
            <div className={styles.playerModal}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>Reproduciendo Audio</h2>
                    <button
                        onClick={onClose}
                        className={styles.closeButton}
                        aria-label="Cerrar reproductor"
                    >
                        <i className="bx bx-x"></i> {/* Icono de Boxicons */}
                    </button>
                </div>

                {/* Elemento de audio HTML oculto, controlado por React */}
                <audio ref={audioRef} src={src} preload="metadata" className={styles.audioElement}></audio>

                <div className={styles.controlsGroup}>
                    {/* Botón de Reproducir/Pausar */}
                    <button
                        onClick={togglePlayPause}
                        className={styles.controlButton}
                        aria-label={isPlaying ? "Pausar" : "Reproducir"}
                    >
                        {isPlaying ? (
                            <i className="bx bx-pause"></i>
                        ) : (
                            <i className="bx bx-play"></i>
                        )}
                    </button>

                    {/* Botón de Detener */}
                    <button
                        onClick={handleStop}
                        className={`${styles.controlButton} ${styles.red}`}
                        aria-label="Detener"
                    >
                        <i className="bx bx-stop"></i>
                    </button>

                    {/* Botón de Descargar */}
                    <button
                        onClick={handleDownload}
                        className={`${styles.controlButton} ${styles.gray}`}
                        title="Descargar audio"
                        aria-label="Descargar audio"
                    >
                        <i className="bx bx-download"></i>
                    </button>
                </div>

                {/* Barra de Progreso del Audio */}
                <div className={styles.progressBarContainer}>
                    <input
                        type="range"
                        min="0"
                        max={duration}
                        value={currentTime}
                        onChange={handleProgressChange}
                        className={styles.progressBar}
                        aria-label="Barra de progreso del audio"
                    />
                    <div className={styles.timeDisplay}>
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>

                {/* Controles de Volumen */}
                <div className={styles.volumeControlGroup}>
                    {/* Botón de Silenciar/Des-silenciar */}
                    <button
                        onClick={toggleMute}
                        className={styles.muteButton}
                        aria-label={isMuted || volume === 0 ? "Desactivar silencio" : "Silenciar"}
                    >
                        {isMuted || volume === 0 ? (
                            <i className="bx bx-volume-mute"></i>
                        ) : (
                            <i className="bx bx-volume-full"></i>
                        )}
                    </button>
                    {/* Slider de Volumen */}
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                        className={styles.volumeSlider}
                        aria-label="Control de volumen"
                    />
                </div>
            </div>
        </div>
    );
}

/* 3. Exportación */
export default AudioPlayer;
