/*
 * =============================================
 * Archivo: App.js
 * Descripción: Configura el enrutamiento principal de la aplicación.
 * 🛑 Se ha eliminado el AuthCallbackHandler para deshacer la funcionalidad OAuth.
 * Autor: Dilan Baltras | Fecha: 2025-10-19 
 * =============================================
 */

import React from 'react'; // Eliminado useEffect, useNavigate, Swal, withReactContent
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Importaciones de estilos globales
import 'slick-carousel/slick/slick.css'; 
import 'slick-carousel/slick/slick-theme.css';
import './App.css'; 

// Importaciones de Componentes de Layout y Utilidades
import AuthenticatedLayout from './components/utils/AuthenticatedLayout/AuthenticatedLayout';
import ForgotPassword from './components/utils/Login/ForgotPassword';
import ResetPassword from './components/utils/Login/ResetPassword';

// Importaciones de Páginas principales
import AuthPage from './components/Pages/AuthPage/AuthPage';
import Home from './components/Pages/Home/Home';
import Files from './components/Pages/FilesPage/Files';
import QuienesSomos from './components/Pages/QuiSomPage/QuienesSomos';

// Importaciones de Páginas de Ministerios/Secciones Específicas
import EscuelaSabatica from './components/Pages/EscSabPage/EscuelaSabatica';
import MayordomiaCristiana from './components/Pages/MayCriPage/MayordomiaCristiana';
import MinisterioMusica from './components/Pages/MinMusPage/MinisterioMusica'; 
import JovenesAdventistas from './components/Pages/JovAdvPage/JovenesAdventistas';
import MinisterioFamilia from './components/Pages/MinFamPage/MinisterioFamilia'; 

// Importaciones de los nuevos Ministerios
import MinisterioComunicacion from './components/Pages/MinComPage/MinisterioComunicacion'; 
import MinisterioMujer from './components/Pages/MinMujPage/MinisterioMujer'; 
import MinisterioPersonal from './components/Pages/MinPerPage/MinisterioPersonal'; 

// Importación del Panel de Administración
import AdminDashboard from './components/Pages/Admin/AdminDashboard'; 

/**
 * Componente principal de la aplicación.
 * Define la estructura de enrutamiento y renderiza los componentes de página.
 */
function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    {/* 🛑 Ruta Pública Principal: Revertida a solo AuthPage */}
                    <Route path="/" element={<AuthPage />} />
                    
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password/:token" element={<ResetPassword />} /> 

                    {/* Rutas Protegidas (requieren autenticación, usan AuthenticatedLayout) */}
                    <Route element={<AuthenticatedLayout />}>
                        <Route path="/home" element={<Home />} />
                        
                        {/* Rutas de Ministerios */}
                        <Route path="/escuela-sabatica" element={<EscuelaSabatica />} />
                        <Route path="/mayordomia-cristiana" element={<MayordomiaCristiana />} />
                        <Route path="/ministerio-musica" element={<MinisterioMusica />} />
                        <Route path="/jovenes-adventistas" element={<JovenesAdventistas />} />
                        <Route path="/ministerio-familia" element={<MinisterioFamilia />} /> 
                        <Route path="/ministerio-comunicacion" element={<MinisterioComunicacion />} /> 
                        <Route path="/ministerio-mujer" element={<MinisterioMujer />} /> 
                        <Route path="/ministerio-personal-evangelismo" element={<MinisterioPersonal />} /> 
                        
                        {/* RUTA DE ADMINISTRACIÓN */}
                        <Route path="/admin" element={<AdminDashboard />} /> 

                        <Route path="/files" element={<Files />} />
                        <Route path="/quienes-somos" element={<QuienesSomos />} />
                    </Route>
                </Routes>
            </div>
        </Router>
    );
}

export default App;