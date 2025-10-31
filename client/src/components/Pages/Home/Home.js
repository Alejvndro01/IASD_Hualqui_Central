// client/src/components/Pages/Home/Home.js
import React, { useEffect, useState, useRef } from 'react'; // Importar useState
import { useSpring, animated } from 'react-spring';
import { useInView } from 'react-intersection-observer';
// 🛑 COMENTADO/ELIMINADO: import HeroCarousel from '../../utils/HeroCarousel/HeroCarousel';
import styles from './Home.module.css';

// Constantes de ubicación para Hualqui, Chile
const HUALQUI_LATITUDE = -36.93;
const HUALQUI_LONGITUDE = -72.95;
// Usaremos una API pública conocida para obtener datos astronómicos
// NOTA: Esta API devuelve la hora en UTC. Necesitaremos convertirla a la zona horaria local (Chile).
const SUNSET_API_BASE_URL = 'https://api.sunrise-sunset.org/json'; 

function Inicio() {
    // --- 1. Definición de Animaciones (React Spring) ---
    // (Se mantienen las animaciones existentes)
    const [missionRef, missionInView] = useInView({ triggerOnce: true, threshold: 0.2 });
    const missionProps = useSpring({
        opacity: missionInView ? 1 : 0,
        transform: missionInView ? 'translateX(0)' : 'translateX(-50px)',
        config: { mass: 1, tension: 120, friction: 14 },
    });

    const [visionRef, visionInView] = useInView({ triggerOnce: true, threshold: 0.2 });
    const visionProps = useSpring({
        opacity: visionInView ? 1 : 0,
        transform: visionInView ? 'translateX(0)' : 'translateX(50px)',
        config: { mass: 1, tension: 120, friction: 14 },
        delay: 200,
    });

    const [scheduleRef, scheduleInView] = useInView({ triggerOnce: true, threshold: 0.1 });
    const scheduleProps = useSpring({
        opacity: scheduleInView ? 1 : 0,
        transform: scheduleInView ? 'translateY(0)' : 'translateY(50px)',
        config: { mass: 1, tension: 120, friction: 14 },
        delay: 100,
    });

    const [mapRef, mapInView] = useInView({ triggerOnce: true, threshold: 0.1 });
    const mapProps = useSpring({
        opacity: mapInView ? 1 : 0,
        transform: mapInView ? 'scale(1)' : 'scale(0.95)',
        config: { mass: 1, tension: 120, friction: 14 },
        delay: 50,
    });
    
    // --- NUEVO ESTADO para la PUESTA DEL SOL ---
    const [sunsetTime, setSunsetTime] = useState('...');

    // --- FUNCIÓN PARA OBTENER LA HORA DE LA PUESTA DEL SOL ---
    const fetchSunsetTime = async () => {
        // Obtenemos la fecha actual en formato YYYY-MM-DD
        const today = new Date().toISOString().slice(0, 10); 
        
        const url = `${SUNSET_API_BASE_URL}?lat=${HUALQUI_LATITUDE}&lng=${HUALQUI_LONGITUDE}&date=${today}&formatted=0`; // formatted=0 retorna UTC ISO

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.status === 'OK') {
                const sunsetUtc = data.results.sunset;
                
                // Convertir la hora UTC (ISO 8601) a la hora local de Chile (UTC-3 o UTC-4 dependiendo del DST)
                // Usamos Intl.DateTimeFormat para la conversión segura a la zona horaria de Chile.
                const localSunset = new Date(sunsetUtc);
                
                // Formatear la hora en formato HH:MM (ej. 18:35 hrs.)
                const formattedTime = new Intl.DateTimeFormat('es-CL', {
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'America/Santiago', // Chile continental
                    hourCycle: 'h23' // Usar formato 24 horas
                }).format(localSunset);

                setSunsetTime(formattedTime + ' hrs.');
            } else {
                setSunsetTime('Error al obtener datos');
                console.error("API error:", data.status);
            }
        } catch (error) {
            setSunsetTime('Error de red');
            console.error("Fetch error:", error);
        }
    };

    // --- EFECTO: Ejecutar la obtención de datos al cargar el componente ---
    useEffect(() => {
        fetchSunsetTime();
        // Opcional: Re-ejecutar la función cada 24 horas para mantener la precisión
        const intervalId = setInterval(fetchSunsetTime, 86400000); // 24 horas en milisegundos
        return () => clearInterval(intervalId); // Limpiar el intervalo al desmontar el componente
    }, []); 

    // --- 2. Renderizado del Componente ---
    return (
        <div className={styles.homeContainer}>
            {/* --- Carrusel Principal --- */}
            {/* 🛑 PLACEHOLDER: Sustituto temporal del HeroCarousel */}
            <h1 className={styles.heroPlaceholder}>BIENVENIDO AL PORTAL DE RECURSOS</h1>
            {/* 🛑 Sustituido por <HeroCarousel /> */}

            {/* Sección de Misión y Visión (Cards Section) */}
            <section className={styles.cardsSection}>
                <animated.div ref={missionRef} style={missionProps} className={styles.card}>
                    <i className={`bx bx-target-lock ${styles.cardIcon}`}></i>
                    <h2 className={styles.cardTitle}>Nuestra Misión</h2>
                    <p className={styles.cardText}>
                        Proclamar el evangelio eterno a todos, invitándolos a aceptar a Jesús como Salvador y unirse a Su iglesia, preparándolos para Su pronto regreso.
                    </p>
                </animated.div>

                <animated.div ref={visionRef} style={visionProps} className={styles.card}>
                    <i className={`bx bx-bulb ${styles.cardIcon}`}></i>
                    <h2 className={styles.cardTitle}>Nuestra Visión</h2>
                    <p className={styles.cardText}>
                        Ser una comunidad vibrante y relevante, que refleja el carácter de Cristo y satisface las necesidades de sus miembros y de la comunidad circundante.
                    </p>
                </animated.div>
            </section>

            {/* --- SECCIÓN: HORARIOS DE REUNIÓN --- */}
            <animated.section 
                ref={scheduleRef} 
                style={scheduleProps} 
                className={styles.scheduleSection}
            >
                <h2 className={styles.scheduleTitle}>Horarios de Reunión</h2>
                <div className={styles.scheduleGrid}>
                    <div className={styles.scheduleItem}>
                        <i className={`bx bx-time ${styles.scheduleIcon}`}></i>
                        <h4 className={styles.scheduleItemTitle}>SÁBADO | Mañana</h4>
                        <p>Escuela Sabática: 10:00 hrs.</p>
                        <p>Culto Divino: 11:30 hrs.</p>
                    </div>
                    <div className={styles.scheduleItem}>
                        <i className={`bx bx-calendar-event ${styles.scheduleIcon}`}></i>
                        <h4 className={styles.scheduleItemTitle}>SÁBADO | Tarde</h4>
                        <p>Sociedad de Jóvenes (JA): 19:00 hrs.</p>
                        {/* PUESTA DEL SOL DINÁMICA */}
                        <p>Puesta del Sol: {sunsetTime}</p> 
                    </div>
                    <div className={styles.scheduleItem}>
                        <i className={`bx bx-book-open ${styles.scheduleIcon}`}></i>
                        <h4 className={styles.scheduleItemTitle}>MIÉRCOLES | Oración</h4>
                        <p>Reunión de Oración: 19:30 hrs.</p>                        
                    </div>
                </div>
            </animated.section>
            
            {/* --- SECCIÓN: UBICACIÓN Y MAPA --- */}
            <animated.section 
                ref={mapRef} 
                style={mapProps} 
                className={styles.locationSection}
            >
                <h2 className={styles.locationTitle}>¿Dónde Estamos?</h2>
                <p className={styles.locationAddress}>
                    {/* DIRECCIÓN */}
                    <i className='bx bx-map-pin'></i> Dirección: Bulnes 450, Hualqui, Región del Biobío.
                </p>
                <div className={styles.mapContainer}>
                    {/* Google Maps Embed para Bulnes 450, Hualqui. */}
                    <iframe 
                        title="Ubicación IASD Hualqui Central"
                        className={styles.googleMap}
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3198.8105740439615!2d-72.95383562947117!3d-36.93881471375253!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x96696d5e7a9b0c03%3A0xc3c45b5c9a0c4f8d!2sBulnes%20450%2C%20Hualqui%2C%20B%C3%ADo%20B%C3%ADo!5e0!3m2!1ses-419!2scl!4v1700000000000!5m2!1ses-419!2scl" 
                        allowFullScreen="" 
                        loading="lazy" 
                        referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                </div>
            </animated.section>
            
            {/* Sección de Valores o Servicios (Values Section - Se mantiene) */}
            <section className={styles.valuesSection}>
                <h2 className={styles.valuesTitle}>Nuestros Pilares</h2>
                <div className={styles.valuesGrid}>
                    <div className={styles.valueItem}>
                        <i className={`bx bx-bible ${styles.valueIcon}`}></i>
                        <p>Estudio de la Biblia</p>
                    </div>
                    <div className={styles.valueItem}>
                        <i className={`bx bx-group ${styles.valueIcon}`}></i>
                        <p>Comunidad y Hermandad</p>
                    </div>
                    <div className={styles.valueItem}>
                        <i className={`bx bx-donate-heart ${styles.valueIcon}`}></i>
                        <p>Servicio a la Comunidad</p>
                    </div>
                    <div className={styles.valueItem}>
                        <i className={`bx bx-music ${styles.valueIcon}`}></i>
                        <p>Adoración y Alabanza</p>
                    </div>
                </div>
            </section>

            {/* Sección de Llamada a la Acción (CTA Section - Se mantiene) */}
            <section className={styles.ctaSection}>
                <p className={styles.ctaText}>
                    ¿Interesado en saber más? ¡Visítanos o contáctanos!
                </p>
                <a href="mailto:info@iasdhualquicentral.cl" className={styles.ctaButton}>
                    <i className="bx bx-envelope"></i> Contactar
                </a>
            </section>
        </div>
    );
}

export default Inicio;
