/*
* =============================================
* Archivo: Footer.js
* Descripción: Componente del pie de página que muestra información de la iglesia,
* enlaces rápidos y derechos de autor.
* Autor: Dilan Baltras | Fecha: 2025-06-25
* =============================================
*/

/* 1. Importaciones */
import React from 'react';
import styles from './Footer.module.css'; // Módulo CSS para los estilos del footer

/*
* =============================================
* 2. Footer
* =============================================
* Componente funcional que renderiza el pie de página de la aplicación.
* Incluye logo, enlaces a redes sociales, secciones de navegación y copyright.
*/
const Footer = () => {
    /* 2.1. Renderizado JSX */
    return (
        <footer className={styles.footer}>
            {/* Contenedor principal del contenido del footer */}
            <div className={styles.content}>

                {/* Sección superior: Logo y redes sociales */}
                <div className={styles.top}>
                    {/* Detalles del logo y nombre de la entidad */}
                    <div className={styles.logoDetails}>
                        <i className={`bx bx-church ${styles.icon}`}></i> {/* Icono de Boxicons */}
                        <span className={styles.logoName}>IASD Hualqui Central</span>
                    </div>
                    {/* Iconos de redes sociales */}
                    <div className={styles.mediaIcons}>
                        <a href="https://www.facebook.com/IASDHualquiCentral" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook-f"></i></a>
                        <a href="https://twitter.com/tu_usuario" target="_blank" rel="noopener noreferrer"><i className="fab fa-twitter"></i></a>
                        <a href="https://www.instagram.com/iasd.hualqui.central/" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram"></i></a>
                        <a href="https://www.linkedin.com/in/tu_usuario" target="_blank" rel="noopener noreferrer"><i className="fab fa-linkedin-in"></i></a>
                        <a href="https://www.youtube.com/user/YOUR_CHANNEL_ID" target="_blank" rel="noopener noreferrer"><i className="fab fa-youtube"></i></a>
                    </div>
                </div>

                {/* Sección de enlaces por categorías */}
                <div className={styles.linkBoxes}>
                    {/* Columna: Compañía */}
                    <ul className={styles.box}>
                        <li className={styles.linkName}>Compañía</li>
                        <li><a href="/home">Inicio</a></li> {/* Considera usar <Link> de react-router-dom para navegación interna */}
                        <li><a href="">Contáctanos</a></li>
                        <li><a href="">Acerca de nosotros</a></li>
                        <li><a href="">Comenzar</a></li>
                    </ul>

                    {/* Columna: Servicios */}
                    <ul className={styles.box}>
                        <li className={styles.linkName}>Servicios</li>
                        <li><a href="">Anuncios</a></li>
                        <li><a href="/gallery">Galería</a></li>
                        <li><a href="/files">Archivos</a></li>
                        <li><a href="">Apoyo</a></li>
                    </ul>

                    {/* Columna: Cuenta */}
                    <ul className={styles.box}>
                        <li className={styles.linkName}>Cuenta</li>
                        <li><a href="">Perfil</a></li>
                        <li><a href="">Mi cuenta</a></li>
                        <li><a href="">Preferencias</a></li>
                        <li><a href="">Historial</a></li>
                    </ul>

                    {/* Columna: Recursos */}
                    <ul className={styles.box}>
                        <li className={styles.linkName}>Recursos</li>
                        <li><a href="">Estudios Bíblicos</a></li>
                        <li><a href="">Sermones</a></li>
                        <li><a href="">Donaciones</a></li>
                        <li><a href="">Voluntariado</a></li>
                    </ul>
                </div>
            </div>

            {/* Sección inferior: Copyright */}
            <div className={styles.bottomDetails}>
                <div className={styles.bottomText}>
                    <span className={styles.copyrightText}>
                        Copyright © 2025 IASD Hualqui Central. Desarrollado por <a href="https://www.instagram.com/alejvndro.dev/" target="_blank" rel="noopener noreferrer">Dilan Baltras</a>. Todos los derechos reservados.
                    </span>
                </div>
            </div>
        </footer>
    );
};

/* 3. Exportación */
export default Footer;