/*
* =============================================
* Archivo: Sidebar.js
* Descripción: Componente de barra lateral con interacción MIXTA:
* - Sidebar principal: Hover (abre/cierra) en escritorio.
* - Sidebar principal: Prop (abre/cierra) en móvil.
* - Menú Ministerios: Click (abre/cierra) en todas las plataformas.
* Autor: Dilan Baltras | Fecha: 2025-10-20 (Añadida función de Scroll al Top)
* =============================================
*/

/* 1. Importaciones */
import React, { useState, useCallback } from 'react'; 
import { useNavigate, NavLink, useLocation } from 'react-router-dom';
import styles from './Sidebar.module.css';

/*
* =============================================
* 2. Sidebar
* =============================================
* Componente funcional que renderiza el menú de navegación lateral.
* Recibe props de control de apertura para el modo móvil.
*/
const Sidebar = ({ userRoleID, isManualOpen, toggleSidebar }) => { 
    /* 2.1. Hooks de Navegación y Estado */
    const navigate = useNavigate(); 
    const location = useLocation(); 
    
    // Estado para el Sidebar principal: Controlado por HOVER (solo escritorio).
    const [isHoverOpen, setIsHoverOpen] = useState(false); 
    
    // Estado para el submenú de Ministerios: Controlado por CLICK.
    const [isMinistrysOpen, setIsMinistrysOpen] = useState(false); 

    // ID del rol de Administrador General
    const ADMIN_ROL_ID = 1;
    
    // --- Handlers de Interacción con Mouse y Click ---
    
    // 🔑 HOVER: Maneja la entrada del mouse en el Sidebar (Abrir Sidebar)
    const handleMouseEnterSidebar = () => {
        // Solo permitir hover en escritorio (ancho > 768px)
        if (window.innerWidth > 768) {
            setIsHoverOpen(true);
        }
    };

    // 🔑 HOVER: Maneja la salida del mouse del Sidebar (Cerrar Sidebar)
    const handleMouseLeaveSidebar = () => {
        // Solo permitir hover en escritorio
        if (window.innerWidth > 768) {
            setIsHoverOpen(false);
            // 🛑 LÓGICA CLAVE: Forzar el cierre del submenú de Ministerios si el Sidebar principal se cierra.
            setIsMinistrysOpen(false); 
        }
    };
    
    // 🔑 CLICK: Alterna el estado del desplegable de Ministerios (abrir/cerrar).
    const toggleMinistry = () => {
        setIsMinistrysOpen(prev => !prev);
    };

    // 🛑 NUEVA FUNCIÓN: Scroll al top de la página y cierra el sidebar en móvil.
    const handleNavLinkClick = useCallback(() => {
        // 1. Forzar el scroll al inicio de la página.
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

        // 2. Si estamos en móvil, cerramos el sidebar principal.
        if (window.innerWidth <= 768 && toggleSidebar) {
            toggleSidebar();
        }
    }, [toggleSidebar]); // 🔑 useCallBack optimiza la función

    // Función para cerrar el desplegable de Ministerios y disparar el scroll.
    const closeMinistryDropdown = () => {
        setIsMinistrysOpen(false);
        // Llamamos a la función centralizada
        handleNavLinkClick();
    };

    // Maneja el cierre de sesión del usuario.
    const handleLogout = () => {
        localStorage.removeItem('authToken'); 
        navigate('/');
        // Aseguramos el scroll al salir (aunque se navega a la raíz)
        window.scrollTo(0, 0); 
    };
    
    /* 2.4. Renderizado del Componente */
    return (
        // 🔑 CAMBIO 2: APLICAR CLASES DE CONTROL MÓVIL
        <nav 
            className={`${styles.sidebar} ${!isHoverOpen && !isManualOpen ? styles.close : ''} ${isManualOpen ? styles['open-mobile'] : ''}`}
            onMouseEnter={handleMouseEnterSidebar}
            onMouseLeave={handleMouseLeaveSidebar}
        >
            <header>
                <div className={styles.imageText}>
                    <span className={styles.image}>
                        <img src="/logo192.png" alt="Logo" />
                    </span>
                    <div className={`${styles.text} ${styles['header-text']}`}>
                        <span className={styles.name}>IASD</span>
                        <span className={styles.profession}>Hualqui Central</span>
                    </div>
                </div>
                
                {/* El icono de toggle (flecha lateral) para el HOVER en escritorio */}
                <i className={`bx bx-chevron-right ${styles.toggle}`}></i> 
            </header>

            <div className={styles['menu-bar']}>
                <div className={styles.menu}>
                    <li className={styles['search-box']}>
                        <i className={`bx bx-search ${styles.icon}`}></i>
                        <input type="text" placeholder="Buscar..." />
                    </li>

                    <ul className={styles['menu-links']}>
                        {/* Enlace: Inicio */}
                        <li className={styles['nav-link']}>
                            {/* 🛑 CAMBIO: Usamos handleNavLinkClick */}
                            <NavLink to="/home" className={({ isActive }) => isActive ? styles.active : ''} onClick={handleNavLinkClick}>
                                <i className={`bx bx-home-alt ${styles.icon}`}></i>
                                <span className={`${styles.text} ${styles['nav-text']}`}>Inicio</span>
                            </NavLink>
                        </li>

                        {/* Menú desplegable: "Ministerios" - Controlado por CLICK */}
                        <li 
                            className={`${styles['nav-link']} ${styles['has-dropdown']}`}
                        >
                            <div
                                className={`${styles.dropdownToggle} ${isMinistrysOpen ? styles.active : ''}`}
                                onClick={toggleMinistry} // 🔑 CLICK para abrir/cerrar Ministerios
                            >
                                <i className={`bx bx-category ${styles.icon}`}></i> 
                                <span className={`${styles.text} ${styles['nav-text']}`}>Ministerios</span>
                                <i className={`bx bx-chevron-down ${styles.dropdownCaret} ${isMinistrysOpen ? styles.rotate : ''}`}></i>
                            </div>
                            
                            {/* Renderizado condicional del Submenú */}
                            {isMinistrysOpen && (
                                <ul className={`${styles.dropdownMenu} ${styles.open}`}>
                                    {/* ... Links de Ministerios (Usa closeMinistryDropdown) ... */}
                                    <li className={styles['dropdownMenuItem']}>
                                        {/* 🛑 CAMBIO: Usamos closeMinistryDropdown */}
                                        <NavLink to="/escuela-sabatica" className={({ isActive }) => isActive ? styles.active : ''} onClick={closeMinistryDropdown}>
                                            <i className={`bx bx-bible ${styles.icon}`}></i> 
                                            <span className={`${styles.text} ${styles['nav-text']}`}>Escuela Sabática</span>
                                        </NavLink>
                                    </li>
                                    {/* 🛑 CAMBIO: Usamos closeMinistryDropdown en todos los enlaces del submenú */}
                                    <li className={styles['dropdownMenuItem']}>
                                        <NavLink to="/mayordomia-cristiana" className={({ isActive }) => isActive ? styles.active : ''} onClick={closeMinistryDropdown}>
                                            <i className={`bx bx-wallet ${styles.icon}`}></i> 
                                            <span className={`${styles.text} ${styles['nav-text']}`}>Mayordomía</span>
                                        </NavLink>
                                    </li>
                                    <li className={styles['dropdownMenuItem']}>
                                        <NavLink to="/ministerio-personal-evangelismo" className={({ isActive }) => isActive ? styles.active : ''} onClick={closeMinistryDropdown}>
                                            <i className={`bx bx-user-pin ${styles.icon}`}></i> 
                                            <span className={`${styles.text} ${styles['nav-text']}`}>M. Personal</span>
                                        </NavLink>
                                    </li>
                                    <li className={styles['dropdownMenuItem']}>
                                        <NavLink to="/ministerio-comunicacion" className={({ isActive }) => isActive ? styles.active : ''} onClick={closeMinistryDropdown}>
                                            <i className={`bx bx-broadcast ${styles.icon}`}></i> 
                                            <span className={`${styles.text} ${styles['nav-text']}`}>Comunicación</span>
                                        </NavLink>
                                    </li>
                                    <li className={styles['dropdownMenuItem']}>
                                        <NavLink to="/ministerio-familia" className={({ isActive }) => isActive ? styles.active : ''} onClick={closeMinistryDropdown}>
                                            <i className={`bx bx-home ${styles.icon}`}></i> 
                                            <span className={`${styles.text} ${styles['nav-text']}`}>M. de la Familia</span>
                                        </NavLink>
                                    </li>
                                    <li className={styles['dropdownMenuItem']}>
                                        <NavLink to="/jovenes-adventistas" className={({ isActive }) => isActive ? styles.active : ''} onClick={closeMinistryDropdown}>
                                            <i className={`bx bx-group ${styles.icon}`}></i> 
                                            <span className={`${styles.text} ${styles['nav-text']}`}>Jóvenes (J.A.)</span>
                                        </NavLink>
                                    </li>
                                    <li className={styles['dropdownMenuItem']}>
                                        <NavLink to="/ministerio-mujer" className={({ isActive }) => isActive ? styles.active : ''} onClick={closeMinistryDropdown}>
                                            <i className={`bx bx-female ${styles.icon}`}></i> 
                                            <span className={`${styles.text} ${styles['nav-text']}`}>M. de la Mujer</span>
                                        </NavLink>
                                    </li>
                                    <li className={styles['dropdownMenuItem']}>
                                        <NavLink to="/ministerio-musica" className={({ isActive }) => isActive ? styles.active : ''} onClick={closeMinistryDropdown}>
                                            <i className={`bx bx-music ${styles.icon}`}></i> 
                                            <span className={`${styles.text} ${styles['nav-text']}`}>Música y Adoración</span>
                                        </NavLink>
                                    </li>
                                </ul>
                            )}
                        </li>
                        
                        {/* ENLACE: PANEL DE ADMINISTRACIÓN (VISIBLE SOLO PARA ADMIN) */}
                        {userRoleID === ADMIN_ROL_ID && (
                            <li className={styles['nav-link']}>
                                {/* 🛑 CAMBIO: Usamos handleNavLinkClick */}
                                <NavLink to="/admin" className={({ isActive }) => isActive ? styles.active : ''} onClick={handleNavLinkClick}>
                                    <i className={`bx bx-cog ${styles.icon}`}></i>
                                    <span className={`${styles.text} ${styles['nav-text']}`}>Administración</span>
                                </NavLink>
                            </li>
                        )}

                        {/* Enlace: ¿Quiénes Somos? */}
                        <li className={styles['nav-link']}>
                            {/* 🛑 CAMBIO: Usamos handleNavLinkClick */}
                            <NavLink to="/quienes-somos" className={({ isActive }) => isActive ? styles.active : ''} onClick={handleNavLinkClick}>
                                <i className={`bx bx-info-circle ${styles.icon}`}></i>
                                <span className={`${styles.text} ${styles['nav-text']}`}>¿Quiénes Somos?</span>
                            </NavLink>
                        </li>

                        {/* Enlace: Archivos */}
                        <li className={styles['nav-link']}>
                            {/* 🛑 CAMBIO: Usamos handleNavLinkClick */}
                            <NavLink to="/files" className={({ isActive }) => isActive ? styles.active : ''} onClick={handleNavLinkClick}>
                                <i className={`bx bx-folder ${styles.icon}`}></i>
                                <span className={`${styles.text} ${styles['nav-text']}`}>Archivos</span>
                            </NavLink>
                        </li>
                    </ul>
                </div>

                {/* Sección Inferior del Sidebar */}
                <div className={styles['bottom-content']}>
                    {/* Enlace: Cerrar Sesión */}
                    <li>
                        {/* 🛑 CAMBIO: Se mantiene el handleLogout y se añade el scroll al final */}
                        <NavLink to="/" onClick={() => { handleLogout(); if (isManualOpen) toggleSidebar(); window.scrollTo(0, 0); }}>
                            <i className={`bx bx-log-out ${styles.icon}`}></i>
                            <span className={`${styles.text} ${styles['nav-text']}`}>Cerrar Sesión</span>
                        </NavLink>
                    </li>
                </div>
            </div>
        </nav>
    );
};

/* 3. Exportación */
export default Sidebar;