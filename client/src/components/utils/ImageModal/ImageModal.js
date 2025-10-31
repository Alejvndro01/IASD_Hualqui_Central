/*
 * =============================================
 * Archivo: client/src/utils/ImageModal/ImageModal.js
 * Descripción: Componente modal genérico para visualizar imágenes a pantalla completa.
 * Permite cerrar el modal, y ahora el botón de "descarga" abrirá la imagen en una nueva pestaña.
 * Autor: Dilan Baltras | Fecha: 2025-06-26
 * =============================================
 */

import React from 'react';
import ReactDOM from 'react-dom'; // Necesario para crear portales

import styles from './ImageModal.module.css'; // Estilos específicos para el modal de imagen

// URL base de tu API backend (aunque no se usará para abrir en nueva pestaña, se mantiene si es relevante para otros aspectos)
// const API_BASE_URL = 'http://localhost:3001'; 

/**
 * @function ImageModal
 * @description Componente modal para mostrar una imagen.
 * Se renderiza como un portal fuera del DOM principal de la aplicación.
 * @param {object} props - Propiedades del componente.
 * @param {string} props.src - La URL de la imagen a mostrar (ej. /uploads/nombre_generado.jpg).
 * @param {string} props.fileName - El nombre original del archivo (para el título del enlace).
 * @param {number} props.fileId - El ID del archivo en la base de datos (se mantiene por si acaso, no se usa para abrir en nueva pestaña).
 * @param {function} props.onClose - Función de callback para cerrar el modal.
 * @returns {JSX.Element | null} Un modal con la imagen o null si no hay `src`.
 */
function ImageModal({ src, fileName, fileId, onClose }) {
    if (!src) {
        return null; // No renderiza nada si no hay URL de imagen
    }

    // Para abrir en una nueva pestaña, el href debe ser la URL directa de la imagen (src).
    // No necesitamos la ruta de descarga forzada del backend para este comportamiento.
    const viewInNewTabUrl = src;

    // Renderiza el modal usando un Portal para que esté fuera del flujo normal del DOM
    return ReactDOM.createPortal(
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                {/* Botón de cerrar el modal */}
                <button className={styles.closeButton} onClick={onClose} title="Cerrar">
                    <i className='bx bx-x'></i> {/* Icono de cerrar de Boxicons */}
                </button>
                {/* Botón para abrir la imagen en una nueva pestaña */}
                <a
                    href={viewInNewTabUrl} // CAMBIO: Ahora apunta directamente a la URL de la imagen
                    target="_blank"        // Abre en una nueva pestaña
                    rel="noopener noreferrer" // Mejora la seguridad al abrir nuevas pestañas
                    className={styles.downloadButton} // Se mantiene la clase de estilos existentes
                    title={`Ver en pestaña nueva ${fileName || 'imagen'}`} // Título actualizado
                    onClick={(e) => e.stopPropagation()} // Evita que el clic en el botón cierre el modal
                >
                    <i className='bx bx-link-external'></i> {/* CAMBIO: Icono de enlace externo para indicar nueva pestaña */}
                </a>
                <img src={src} alt="Visualización de Imagen" className={styles.modalImage} />
            </div>
        </div>,
        document.body // Adjunta el portal directamente al body del documento
    );
}

export default ImageModal;
