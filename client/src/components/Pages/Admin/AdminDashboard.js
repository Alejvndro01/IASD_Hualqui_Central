/*
 * =============================================
 * Archivo: AdminDashboard.js
 * Descripción: Panel de administración con gestión CRUD de usuarios, roles y ministerios.
 * FIX: Estructura mejorada para solucionar definitivamente la pérdida de enfoque.
 * Autor: Dilan Baltras | Fecha: 2025-10-19
 * =============================================
 */

import React, { useState, useEffect, useCallback, memo } from 'react'; // Importar memo
import axios from 'axios';
import Swal from 'sweetalert2';
import styles from './AdminDashboard.module.css';
import { useNavigate } from 'react-router-dom';

// URL base de tu backend (Asegúrate de que coincida con tu configuración)
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Componente para manejar los campos de entrada editables de forma estable
const EditableInput = memo(({ name, type = 'text', value, onChange, placeholder }) => (
    <input 
        type={type} 
        name={name} 
        value={value || ''} 
        onChange={onChange} 
        className={styles.usersTableInput}
        placeholder={placeholder}
    />
));

// Componente para manejar los selectores editables de forma estable
const EditableSelect = memo(({ name, value, options, onChange, placeholder = "Selecciona..." }) => (
    <select 
        name={name} 
        value={value || ''} 
        onChange={onChange} 
        className={styles.usersTableSelect}
    >
        <option value="">{placeholder}</option>
        {options.map(opt => (
            <option key={opt.id} value={opt.id}>{opt.name}</option>
        ))}
    </select>
));

// --- COMPONENTE DE CREACIÓN DE USUARIO AISLADO ---
const CreateUserForm = memo(({ newUserData, roles, ministries, handleNewUserChange, handleCreateUser, setIsCreating }) => (
    <section className={styles.creationSection}>
        <h3>Crear Nuevo Usuario</h3>
        <div className={styles.creationGrid}>
            {/* Nombre */}
            <EditableInput name="Nombre" placeholder="Nombre Completo" value={newUserData.Nombre} onChange={handleNewUserChange} />
            {/* Email */}
            <EditableInput name="Email" type="email" placeholder="Correo Electrónico" value={newUserData.Email} onChange={handleNewUserChange} />
            {/* Contraseña */}
            <EditableInput name="Contraseña" type="password" placeholder="Contraseña" value={newUserData.Contraseña} onChange={handleNewUserChange} />
            {/* Rol */}
            <EditableSelect 
                name="RolID" 
                value={newUserData.RolID} 
                options={roles} 
                onChange={handleNewUserChange} 
                placeholder="Selecciona Rol *"
            />
            {/* Ministerio */}
            <EditableSelect 
                name="MinisterioID" 
                value={newUserData.MinisterioID} 
                options={ministries} 
                onChange={handleNewUserChange} 
                placeholder="Ministerio"
            />

            <div className={styles.creationActions}>
                <button onClick={handleCreateUser} className={styles.createButton}>
                    <i className='bx bx-user-plus'></i> Crear Usuario
                </button>
                <button onClick={() => setIsCreating(false)} className={styles.cancelCreationButton}>
                    Cancelar
                </button>
            </div>
        </div>
    </section>
));


function AdminDashboard() {
    const navigate = useNavigate();

    // --- 1. ESTADO ---
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [ministries, setMinistries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Estados para Edición
    const [editingUser, setEditingUser] = useState(null); 
    const [editData, setEditData] = useState({}); 

    // Estado para Creación
    const [isCreating, setIsCreating] = useState(false);
    const [newUserData, setNewUserData] = useState({
        Nombre: '',
        Email: '',
        Contraseña: '', 
        RolID: '',
        MinisterioID: ''
    });

    // --- 2. UTILIDADES ---
    
    const showSwalAlert = (title, text, icon, callback = () => {}) => {
        Swal.fire({
            title: title,
            text: text,
            icon: icon,
            confirmButtonText: 'Entendido',
            buttonsStyling: false,
            customClass: {
                confirmButton: 'swal2-confirm-button',
                popup: 'swal2-custom-popup'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                callback();
            }
        });
    };

    const handleResetAuth = () => {
        localStorage.removeItem('authToken');
        navigate('/');
    };

    // --- 3. CARGA DE DATOS (FETCHING) ---

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(`${API_BASE_URL}/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data);
        } catch (err) {
            console.error("ADMIN_FETCH_USERS_ERROR:", err.response || err);
            
            let errorMessage = "No se pudo cargar la lista de usuarios. Verifica que el backend esté corriendo en puerto 3001.";
            if (err.response) {
                if (err.response.status === 403) {
                     errorMessage = "Acceso Denegado. No tiene permisos de Administrador para ver esta lista. (Error 403)";
                } else if (err.response.status === 401) {
                     errorMessage = "Sesión Expirada. Por favor, restablece la sesión. (Error 401)";
                } else if (err.response.data && err.response.data.message) {
                    errorMessage = `Error del Servidor: ${err.response.data.message}`;
                }
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchSelectData = useCallback(async () => {
        try {
            const [rolesRes, ministriesRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/roles`),
                axios.get(`${API_BASE_URL}/ministerios`)
            ]);
            // Formatear datos para el componente Select (id, name)
            const formattedRoles = rolesRes.data.map(r => ({ id: r.RolID, name: r.NombreRol }));
            const formattedMinistries = ministriesRes.data.map(m => ({ id: m.MinisterioID, name: m.NombreMinisterio }));
            
            setRoles(formattedRoles);
            setMinistries(formattedMinistries);
        } catch (err) {
            console.error("ADMIN_FETCH_SELECT_DATA_ERROR:", err);
            showSwalAlert('Atención', 'No se pudieron cargar los roles y ministerios para la edición.', 'warning');
        }
    }, []);

    useEffect(() => {
        fetchUsers();
        fetchSelectData();
    }, [fetchUsers, fetchSelectData]);

    // --- 4. MANEJO DE ESTADO LOCAL ---

    const handleEditClick = (user) => {
        setEditingUser(user.UsuarioID);
        setIsCreating(false);
        setEditData({
            Nombre: user.Nombre,
            Email: user.Email,
            RolID: user.RolID,
            MinisterioID: user.MinisterioID || '' 
        });
    };

    const handleCancelEdit = () => {
        setEditingUser(null);
        setEditData({});
    };

    // Función de cambio unificada para Edición
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        const isID = name === 'RolID' || name === 'MinisterioID';
        const parsedValue = isID ? (parseInt(value) || null) : value;

        setEditData(prev => ({
            ...prev,
            [name]: parsedValue 
        }));
    };

    // Función de cambio unificada para Creación
    const handleNewUserChange = (e) => {
        const { name, value } = e.target;

        const isID = name === 'RolID' || name === 'MinisterioID';
        const parsedValue = isID ? (parseInt(value) || null) : value;
                            
        setNewUserData(prev => ({
            ...prev,
            [name]: parsedValue 
        }));
    };

    // --- 5. OPERACIONES CRUD (Backend) ---

    const handleCreateUser = async () => {
        if (!newUserData.Nombre || !newUserData.Email || !newUserData.Contraseña || !newUserData.RolID) {
            showSwalAlert('Error', 'Nombre, Email, Contraseña y Rol son obligatorios para crear un usuario.', 'error');
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            await axios.post(`${API_BASE_URL}/users`, newUserData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            showSwalAlert('¡Creación Exitosa!', 'Nuevo usuario registrado correctamente.', 'success', fetchUsers);
            setNewUserData({ Nombre: '', Email: '', Contraseña: '', RolID: '', MinisterioID: '' });
            setIsCreating(false);

        } catch (err) {
            console.error("ADMIN_CREATE_ERROR:", err.response ? err.response.data : err.message);
            const msg = err.response && err.response.data && err.response.data.message 
                        ? err.response.data.message 
                        : 'No se pudo crear el usuario. Verifica que el email no esté ya registrado.';
            showSwalAlert('Error de Creación', msg, 'error');
        }
    };


    const handleSaveUser = async (usuarioID) => {
        if (!editData.Nombre || !editData.Email || !editData.RolID) {
            showSwalAlert('Error', 'El Nombre, Email y Rol son obligatorios.', 'error');
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            await axios.put(`${API_BASE_URL}/users/${usuarioID}`, editData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            showSwalAlert('¡Éxito!', 'Usuario actualizado correctamente.', 'success', fetchUsers);
            setEditingUser(null);
            setEditData({});

        } catch (err) {
            console.error("ADMIN_UPDATE_ERROR:", err.response ? err.response.data.message : err.message);
            showSwalAlert('Error', err.response ? err.response.data.message : 'No se pudo actualizar el usuario.', 'error');
        }
    };

    const handleDeleteUser = async (usuarioID, nombre) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `Estás a punto de eliminar al usuario "${nombre}". ¡Esta acción no se puede deshacer!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            customClass: {
                confirmButton: 'swal2-confirm-button',
                cancelButton: 'swal2-cancel-button',
                popup: 'swal2-custom-popup'
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const token = localStorage.getItem('authToken');
                    await axios.delete(`${API_BASE_URL}/users/${usuarioID}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    
                    showSwalAlert('¡Eliminado!', 'El usuario ha sido eliminado.', 'success', fetchUsers);

                } catch (err) {
                    console.error("ADMIN_DELETE_ERROR:", err.response ? err.response.data.message : err.message);
                    showSwalAlert('Error', err.response ? err.response.data.message : 'No se pudo eliminar el usuario.', 'error');
                }
            }
        });
    };

    // --- 6. RENDERIZADO DE FILA DE USUARIO ---

    const renderUserRow = (user) => {
        const isEditing = editingUser === user.UsuarioID;
        
        // Obtener nombres completos del rol y ministerio para la vista
        const roleName = roles.find(r => r.id === user.RolID)?.name || 'N/A';
        const ministryName = ministries.find(m => m.id === user.MinisterioID)?.name || 'N/A';
        
        return (
            <tr key={user.UsuarioID}>
                <td>{user.UsuarioID}</td>
                {/* Nombre (Editable) */}
                <td>
                    {isEditing ? (
                         <EditableInput name="Nombre" value={editData.Nombre} onChange={handleInputChange} />
                    ) : (
                        user.Nombre
                    )}
                </td>
                {/* Email (Editable) */}
                <td>
                    {isEditing ? (
                         <EditableInput name="Email" type="email" value={editData.Email} onChange={handleInputChange} />
                    ) : (
                        user.Email
                    )}
                </td>
                {/* Rol (Editable Select) */}
                <td>
                    {isEditing ? (
                        <EditableSelect 
                            name="RolID" 
                            value={editData.RolID} 
                            options={roles} 
                            onChange={handleInputChange} 
                            placeholder="Selecciona Rol"
                        />
                    ) : (
                        roleName
                    )}
                </td>
                {/* Ministerio (Editable Select) */}
                <td>
                    {isEditing ? (
                        <EditableSelect 
                            name="MinisterioID" 
                            value={editData.MinisterioID} 
                            options={ministries} 
                            onChange={handleInputChange} 
                            placeholder="Ninguno"
                        />
                    ) : (
                        ministryName
                    )}
                </td>
                {/* Fecha de Registro */}
                <td>{user.FechaRegistro}</td>
                {/* Acciones */}
                <td className={styles.actionButtons}>
                    {isEditing ? (
                        <>
                            <button onClick={() => handleSaveUser(user.UsuarioID)} className={styles.saveButton}>
                                <i className='bx bx-save'></i> Guardar
                            </button>
                            <button onClick={handleCancelEdit} className={styles.cancelButton}>
                                <i className='bx bx-x'></i> Cancelar
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => handleEditClick(user)} className={styles.editButton}>
                                <i className='bx bx-edit-alt'></i> Editar
                            </button>
                            <button onClick={() => handleDeleteUser(user.UsuarioID, user.Nombre)} className={styles.deleteButton}>
                                <i className='bx bx-trash'></i> Eliminar
                            </button>
                        </>
                    )}
                </td>
            </tr>
        );
    };
    
    // --- 7. RENDERIZADO PRINCIPAL ---

    const totalUsers = users.length;
    const totalMinisterios = ministries.length;

    return (
        <div className={styles.adminContainer}>
            <div className={styles.header}>
                <h1 className={styles.headerTitle}>Panel de Administración General ⚙️</h1>
            </div>
            
            {/* Tarjetas de Métricas */}
            <div className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                    <div className={styles.metricValue}>{totalUsers}</div>
                    <div className={styles.metricLabel}>Usuarios Registrados</div>
                </div>
                <div className={styles.metricCard}>
                    <div className={styles.metricValue}>{totalMinisterios}</div>
                    <div className={styles.metricLabel}>Ministerios Activos</div>
                </div>
                <div className={styles.metricCard}>
                    {/* Botón para Abrir/Cerrar Formulario de Creación */}
                    <button 
                        onClick={() => { setIsCreating(prev => !prev); setEditingUser(null); }}
                        className={styles.newButton}
                    >
                        <i className='bx bx-user-plus'></i> {isCreating ? 'Cancelar Creación' : 'Crear Nuevo Usuario'}
                    </button>
                    <div className={styles.metricLabel}>
                         <button onClick={handleResetAuth} className={styles.resetButton}>
                            <i className='bx bx-log-out-circle'></i> Restablecer Sesión
                         </button>
                    </div>
                </div>
            </div>

            {/* Formulario de Creación (Renderizado condicional) */}
            {isCreating && <CreateUserForm 
                newUserData={newUserData}
                roles={roles}
                ministries={ministries}
                handleNewUserChange={handleNewUserChange}
                handleCreateUser={handleCreateUser}
                setIsCreating={setIsCreating}
            />}

            {/* Mensajes de Estado */}
            {loading && (
                <div className={styles.loadingContainer}>
                    <i className='bx bx-loader bx-spin'></i> Cargando datos de administración...
                </div>
            )}
            
            {error && (
                <div className={styles.errorContainer}>
                    <i className='bx bx-error-alt'></i> {error}
                </div>
            )}

            {/* Sección de Gestión de Usuarios */}
            {!loading && !error && (
                <section className={styles.usersSection}>
                    <h3>Gestión de Usuarios y Roles</h3>
                    <table className={styles.usersTable}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Email</th>
                                <th>Rol</th>
                                <th>Ministerio</th>
                                <th>Registro</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(renderUserRow)}
                            {totalUsers === 0 && (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>No hay usuarios registrados.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </section>
            )}

            {/* Advertencia de Seguridad */}
            <section className={styles.warningMessage}>
                <i className='bx bx-shield-alt-2'></i>
                <p>¡Advertencia! Esta es una zona de administración con privilegios totales. Los cambios realizados aquí son irreversibles. Procede con extrema precaución.</p>
            </section>
        </div>
    );
}

export default AdminDashboard;
