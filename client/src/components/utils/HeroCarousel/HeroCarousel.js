/*
* =============================================
* Archivo: HeroCarousel.js
* Descripción: Componente de banner principal (Hero) que reemplaza
* la funcionalidad del carrusel de react-slick con un banner estático.
* Autor: Dilan Baltras | Fecha: 2025-10-20 (Modificado para eliminar slick-carousel)
* =============================================
*/

import React from 'react';
// 🛑 ELIMINAR: import Slider from 'react-slick'; 
import styles from './HeroCarousel.module.css';

// Usaremos un único slide estático (el primero) como banner principal.
const STATIC_SLIDE_DATA = {
    title: "Escuela Sabática",
    description: "Estudiamos la Biblia en grupo, exploramos temas de fe y fortalecemos nuestra vida espiritual cada sábado.",
    image: "/Images/EcuelaSabatica.jpg",
    link: "/escuela-sabatica"
};

/**
* @function HeroCarousel
* @description Implementación de un Banner Estático simple, eliminando la dependencia de react-slick.
*/
function HeroCarousel() {
    
    // 🛑 ELIMINAR: const carouselSettings = { ... }

    // 🛑 ELIMINAR: return ( <Slider {...carouselSettings}>...</Slider> )
    return (
        <div className={styles.heroWrapper}> 
            {/* Título de la Sección de Ministerios */}
            <h2 className={styles.carouselTitle}>Nuestros Ministerios</h2>
            
            <section className={styles.heroCarouselSection}>
                {/* ÚNICO SLIDE ESTÁTICO */}
                <div className={styles.heroSlide}>
                    <div className={styles.heroOverlay}></div>
                    <img src={STATIC_SLIDE_DATA.image} alt={STATIC_SLIDE_DATA.title} className={styles.heroSlideImage} />
                    <div className={styles.heroContent}>
                        <h1 className={styles.heroTitle}>{STATIC_SLIDE_DATA.title}</h1>
                        <p className={styles.heroDescription}>{STATIC_SLIDE_DATA.description}</p>
                        <a href={STATIC_SLIDE_DATA.link} className={styles.heroButton}>ACCEDE A LOS CONTENIDOS</a>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default HeroCarousel;