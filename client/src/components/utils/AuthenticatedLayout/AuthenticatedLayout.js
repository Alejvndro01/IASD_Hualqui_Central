/*
 * =============================================
 * Archivo: AuthenticatedLayout.js
 * Descripción: Componente de layout para rutas autenticadas, incluyendo Sidebar y Footer.
 * Autor: Dilan Baltras | Fecha: 2025-10-19 (Actualizado a Responsividad Móvil)
 * =============================================
 */

/* 1. Importaciones */
import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom'; 
import Sidebar from '../Sidebar/Sidebar'; 
import Footer from '../Footer/Footer';  
import styles from './AuthenticatedLayout.module.css';
import axios from 'axios'; 

// URL base de tu backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
/*
 * =============================================
 * 2. AuthenticatedLayout
 * =============================================
 */
const AuthenticatedLayout = () => {
    /* 2.1. Estado y Referencias */
    const location = useLocation();
    
    // ESTADO DE ESCRITORIO (Controlado por la flecha/hover)
    const [isSidebarClosed, setIsSidebarClosed] = useState(() => {
        const storedState = localStorage.getItem('isSidebarClosed');
        return storedState ? JSON.parse(storedState) : false;
    });

    // 🔑 ESTADO MÓVIL (Controlado por el botón hamburguesa)
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Verifica si hay un token en localStorage (control de autenticación básico)
    const isAuthenticated = !!localStorage.getItem('authToken');

    /* 2.2. Funciones de Manejo */
    const handleToggleSidebar = () => {
        // Esto sigue controlando el estado de escritorio
        setIsSidebarClosed(prev => !prev);
    };

    // 🔑 HANDLER PARA ABRIR/CERRAR EL MENÚ MÓVIL
    const handleToggleMobileSidebar = () => {
        setIsMobileSidebarOpen(prev => !prev);
    };

    /* 2.3. Efectos (useEffect) */
    useEffect(() => {
        // Guardar estado del sidebar de escritorio en localStorage
        localStorage.setItem('isSidebarClosed', JSON.stringify(isSidebarClosed));
    }, [isSidebarClosed]); 

    useEffect(() => {
        const fetchUserRole = async () => {
            if (!isAuthenticated) {
                setLoading(false);
                return;
            }

            try {
                const token = localStorage.getItem('authToken');
                const response = await axios.get(`${API_BASE_URL}/api/userinfo`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                setUser(response.data.user); 

            } catch (error) {
                console.error("Error al obtener datos de usuario/rol:", error);
                localStorage.removeItem('authToken');
            } finally {
                setLoading(false);
            }
        };
        fetchUserRole();
    }, [isAuthenticated]); 

    /* 2.4. Renderizado JSX condicional */

    // 1. Redirigir si no está autenticado (prioridad máxima)
    if (!isAuthenticated) {
        return <Navigate to="/" />;
    }
    
    // 2. CORRECCIÓN DE SEGURIDAD
    if (location.pathname === '/') {
        return <Navigate to="/home" replace={true} />;
    }

    // 3. Mostrar pantalla de carga
    if (loading) {
        return (
            <div className={styles.loadingScreen}>
                <i className='bx bx-loader bx-spin'></i> Cargando datos de usuario...
            </div>
        );
    }

    // Renderizado principal
    return (
        <div className={`${styles.layoutContainer} ${isSidebarClosed ? styles.sidebarClosed : ''} ${isMobileSidebarOpen ? styles.mobileOpen : ''}`}>
            
            {/* 🔑 BOTÓN HAMBURGUESA (Solo visible en móvil) */}
            <button 
                className={styles.mobileMenuButton}
                onClick={handleToggleMobileSidebar}
                title="Abrir Menú"
            >
                <i className='bx bx-menu'></i>
            </button>

            {/* Sidebar del Layout */}
            <Sidebar
                // Props de Escritorio
                isClosed={isSidebarClosed} 
                toggleSidebar={handleToggleSidebar}
                
                // 🔑 Props de Móvil
                isManualOpen={isMobileSidebarOpen}
                userRoleID={user ? user.rolID : null} 
            />
            
            {/* 🔑 OVERLAY MÓVIL (Visible solo si el menú está abierto para cerrar al hacer clic fuera) */}
            {isMobileSidebarOpen && 
                <div 
                    className={styles.mobileOverlay}
                    onClick={handleToggleMobileSidebar}
                ></div>
            }

            {/* Contenido principal, donde se renderizan las rutas anidadas */}
            <main className={styles.mainContent}>
                <Outlet />
                {/* Pie de página */}
                <Footer />
            </main>
        </div>
    );
};

/* 3. Exportación */
export default AuthenticatedLayout;