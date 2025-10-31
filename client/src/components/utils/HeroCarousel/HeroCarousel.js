/*
* =============================================
* Archivo: HeroCarousel.js
* Descripción: Componente de carrusel principal (Hero Carousel) para mostrar
* banners destacados con enlaces a ministerios.
* Autor: Dilan Baltras | Fecha: 2025-10-20 (Actualizado para el estilo Destaque)
* =============================================
*/

/* 1. Importaciones */
import React from 'react';
import Slider from 'react-slick'; // Componente de carrusel de react-slick
import styles from './HeroCarousel.module.css';

/*
* =============================================
* 2. HeroCarousel
* =============================================
* Componente funcional que implementa un carrusel de imágenes y contenido
* utilizando la librería `react-slick`.
*/
function HeroCarousel() {
    /* 2.1. Configuración del Carrusel */
    // Define las propiedades y comportamiento del carrusel.
    const carouselSettings = {
        dots: true,       // Mostrar indicadores de navegación (puntos)
        infinite: true,     // Bucle infinito
        speed: 800,         // Velocidad de transición entre slides (ms)
        slidesToShow: 1,    // Número de slides visibles a la vez
        slidesToScroll: 1,  // Número de slides a desplazar por vez
        autoplay: true,     // Reproducción automática
        autoplaySpeed: 5000, // Tiempo entre cada cambio de slide (ms)
        arrows: false,      // Ocultar flechas de navegación
        fade: true,         // Efecto de transición de desvanecimiento
        cssEase: 'linear',  // Función de temporización CSS para la transición

        // Personalización de los indicadores (puntos)
        appendDots: dots => (
            <div style={{
                position: "absolute",
                bottom: "20px",
                width: "100%",
                display: "flex",
                justifyContent: "center",
            }}>
                <ul style={{ margin: "0px", padding: "0", display: "flex", listStyle: "none" }}> {dots} </ul>
            </div>
        ),
        // Estilos personalizados para cada punto del indicador
        customPaging: i => (
            <div style={{
                width: "12px",
                height: "12px",
                background: "rgba(255, 255, 255, 0.5)",
                borderRadius: "50%",
                margin: "0 5px",
                cursor: "pointer",
                border: "2px solid transparent",
            }}></div>
        )
    };

    /* 2.2. Renderizado JSX */
    return (
        /* 🛑 CAMBIO: Nuevo div envolvente para el título y la sección */
        <div className={styles.heroWrapper}> 
            {/* 🛑 CAMBIO: Título reubicado FUERA del <section> para que sea un encabezado de sección */}
            <h2 className={styles.carouselTitle}>Nuestros Ministerios</h2>
            
            <section className={styles.heroCarouselSection}>
                <Slider {...carouselSettings}>
                    
                    {/* Slide 1: Ministerio de Escuela Sabática - DESCRIPCIÓN AÑADIDA */}
                    <div className={styles.heroSlide}>
                        <div className={styles.heroOverlay}></div>
                        <img src="/Images/EcuelaSabatica.jpg" alt="Escuela Sabática 2025" className={styles.heroSlideImage} />
                        <div className={styles.heroContent}>
                            <h1 className={styles.heroTitle}>Escuela Sabática</h1>
                            <p className={styles.heroDescription}>
                                Estudiamos la Biblia en grupo, exploramos temas de fe y fortalecemos nuestra vida espiritual cada sábado.
                            </p>
                            <a href="/escuela-sabatica" className={styles.heroButton}>ACCEDE A LOS CONTENIDOS</a>
                        </div>
                    </div>

                    {/* Slide 2: Ministerio de Mayordomía Cristiana - DESCRIPCIÓN AÑADIDA */}
                    <div className={styles.heroSlide}>
                        <div className={styles.heroOverlay}></div>
                        <img src="/Images/Mayordomia.jpg" alt="Probad y Ved 2025" className={styles.heroSlideImage} />
                        <div className={styles.heroContent}>
                            <h1 className={styles.heroTitle}>Ministerio de Mayordomía</h1>
                            <p className={styles.heroDescription}>
                                Aprendiendo a administrar sabiamente los recursos, el tiempo y los talentos que Dios nos ha dado.
                            </p>
                            <a href="/mayordomia-cristiana" className={styles.heroButton}>ACCEDE</a>
                        </div>
                    </div>

                    {/* Slide 3: Ministerio de Música y Adoración (Mantenida) */}
                    <div className={styles.heroSlide}>
                        <div className={styles.heroOverlay}></div>
                        <img src="/Images/Música.jpg" alt="Ministerio de Música" className={styles.heroSlideImage} />
                        <div className={styles.heroContent}>
                            <h1 className={styles.heroTitle}>Música y Adoración</h1>
                            <p className={styles.heroDescription}>
                                Alabando a Dios con melodías que elevan el espíritu. ¡Únete a nuestro coro y orquesta!
                            </p>
                            <a href="/ministerio-musica" className={styles.heroButton}>
                                PARTICIPA
                            </a>
                        </div>
                    </div>

                    {/* Slide 4: Jóvenes Adventistas - DESCRIPCIÓN MEJORADA */}
                    <div className={styles.heroSlide}>
                        <div className={styles.heroOverlay}></div>
                        <img src="/Images/Joven.jpg" alt="Ministerio de Jóvenes Adventistas" className={styles.heroSlideImage} />
                        <div className={styles.heroContent}>
                            <h1 className={styles.heroTitle}>Jóvenes Adventistas (J.A.)</h1>
                            <p className={styles.heroDescription}>
                                Conéctate, crece en la fe y marca la diferencia. ¡Descubre nuestras actividades y proyectos!
                            </p>
                            <a href="/jovenes-adventistas" className={styles.heroButton}>
                                ÚNETE
                            </a>
                        </div>
                    </div>
                    
                    {/* Slide 5: Ministerio de Familia - DESCRIPCIÓN MANTENIDA/AJUSTADA */}
                    <div className={styles.heroSlide}>
                        <div className={styles.heroOverlay}></div>
                        <img src="/Images/Min-Familia.jpg" alt="Ministerio de Familia" className={styles.heroSlideImage} />
                        <div className={styles.heroContent}>
                            <h1 className={styles.heroTitle}>Ministerio de Familia</h1>
                            <p className={styles.heroDescription}>
                                Recursos y apoyo para fortalecer los lazos matrimoniales y la educación cristiana en el hogar.
                            </p>
                            <a href="/ministerio-familia" className={styles.heroButton}>
                                VER RECURSOS
                            </a>
                        </div>
                    </div>

                    {/* Slide 6: Ministerio de la Mujer - DESCRIPCIÓN MANTENIDA/AJUSTADA */}
                    <div className={styles.heroSlide}>
                        <div className={styles.heroOverlay}></div>
                        <img src="/Images/Min-Mujer.jpg" alt="Ministerio de la Mujer" className={styles.heroSlideImage} />
                        <div className={styles.heroContent}>
                            <h1 className={styles.heroTitle}>Ministerio de la Mujer</h1>
                            <p className={styles.heroDescription}>
                                Fortaleciendo el rol de la mujer en la iglesia y la sociedad a través de la fe y el servicio.
                            </p>
                            <a href="/ministerio-mujer" className={styles.heroButton}>
                                EXPLORA
                            </a>
                        </div>
                    </div>

                    {/* Slide 7: Ministerio Personal y de Evangelismo - DESCRIPCIÓN MANTENIDA/AJUSTADA */}
                    <div className={styles.heroSlide}>
                        <div className={styles.heroOverlay}></div>
                        <img src="/Images/Evangelismo.jpg" alt="Ministerio de Evangelismo" className={styles.heroSlideImage} />
                        <div className={styles.heroContent}>
                            <h1 className={styles.heroTitle}>Evangelismo y Misión</h1>
                            <p className={styles.heroDescription}>
                                Equipando a cada miembro para compartir el mensaje de esperanza y preparar a la comunidad para el regreso de Cristo.
                            </p>
                            <a href="/evangelismo-personal" className={styles.heroButton}>
                                APRENDE MÁS
                            </a>
                        </div>
                    </div>

                    {/* Slide 8: Ministerio de Comunicación - DESCRIPCIÓN MANTENIDA/AJUSTADA */}
                    <div className={styles.heroSlide}>
                        <div className={styles.heroOverlay}></div>
                        <img src="/Images/Comunicación.jpg" alt="Ministerio de Comunicación" className={styles.heroSlideImage} />
                        <div className={styles.heroContent}>
                            <h1 className={styles.heroTitle}>Ministerio de Comunicación</h1>
                            <p className={styles.heroDescription}>
                                Mantente al día con nuestros anuncios y sigue nuestras transmisiones en vivo.
                            </p>
                            <a href="/comunicacion" className={styles.heroButton}>
                                VER NOTICIAS
                            </a>
                        </div>
                    </div>
                    
                </Slider>
            </section>
        </div>
        /* 🛑 Fin del div envolvente */
    );
}

/* 3. Exportación */
export default HeroCarousel;