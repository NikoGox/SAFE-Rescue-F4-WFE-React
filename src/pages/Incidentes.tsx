// src/pages/Incidentes.tsx
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./Incidentes.css";

interface Incident {
    id: number;
    type: string;
    description: string;
    location: string;
    dateTime: string;
    status: string;
    imageUrl: string;
}

interface IncidentForm {
    type: string;
    description: string;
    location: string;
    imageUrl: string;
}

interface EditForm {
    description: string;
    location: string;
    type: string;
    status: string;
    imageUrl: string;
}

const Incidentes: React.FC = () => {
    // Estados del componente
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [showForm, setShowForm] = useState<boolean>(false);
    const [expandedIncident, setExpandedIncident] = useState<number | null>(null);
    const [editingIncident, setEditingIncident] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Estados de formularios
    const [editForm, setEditForm] = useState<EditForm>({
        description: "",
        location: "",
        type: "",
        status: "",
        imageUrl: ""
    });

    const [newIncident, setNewIncident] = useState<IncidentForm>({
        type: "",
        description: "",
        location: "",
        imageUrl: ""
    });

    // Datos iniciales de incidentes
    const initialIncidentsData: Incident[] = [
        { id: 1, type: 'Incendio', description: 'Incendio en una casa', location: 'Renca, El Montijo 2212', dateTime: '03/09/2024 22:50', status: 'En progreso', imageUrl: '../assets/incendio.png' },
        { id: 2, type: 'Explosión', description: 'Explosión de transformador', location: 'Renca, El Montijo 2212', dateTime: '03/09/2024 14:20', status: 'Cerrado', imageUrl: '../assets/default_incident.png' },
        { id: 3, type: 'Accidente', description: 'Atropellamiento', location: 'Av. Vicuña Mackenna 6100', dateTime: '03/09/2024 13:15', status: 'Cerrado', imageUrl: '../assets/accidente.png' },
        { id: 4, type: 'Accidente', description: 'Colisión múltiple en vía', location: 'Autopista Central, Santiago', dateTime: '03/09/2024 12:50', status: 'En progreso', imageUrl: '../assets/accidente.png' },
        { id: 5, type: 'Fuga de gas', description: 'Fuga en cocina residencial', location: 'Av. Providencia 1234, Providencia', dateTime: '03/09/2024 12:25', status: 'Localizado', imageUrl: '../assets/fuga-gas.png' },
        { id: 6, type: 'Incendio', description: 'Fuego en almacén industrial', location: 'Av. Santa Rosa 1300, Santiago', dateTime: '03/09/2024 12:00', status: 'Cerrado', imageUrl: '../assets/incendio.png' },
        { id: 7, type: 'Fuga de gas', description: 'Fuga en instituto', location: 'Huechuraba, la calle 2212', dateTime: '03/09/2024 11:50', status: 'Cerrado', imageUrl: '../assets/fuga-gas.png' },
        { id: 8, type: 'Accidente', description: 'Colisión múltiple en vía', location: 'Av. Américo Vespucio, Las Condes', dateTime: '03/09/2024 09:30', status: 'Cerrado', imageUrl: '../assets/accidente.png' },
        { id: 9, type: 'Derrumbe', description: 'Colapso de estructura', location: 'Av. Santa Rosa 1300, Santiago', dateTime: '03/09/2024 09:50', status: 'En progreso', imageUrl: '../assets/derrumbe.png' },
        { id: 10, type: 'Incendio', description: 'Incendio en una casa', location: 'Av. Macul 4700, Macul', dateTime: '03/09/2024 09:50', status: 'En progreso', imageUrl: '../assets/incendio.png' },
        { id: 11, type: 'Derrame químico', description: 'Derrame de líquidos tóxicos', location: 'Av. Américo Vespucio Las Condes', dateTime: '03/09/2024 09:22', status: 'En progreso', imageUrl: '../assets/derrame-quimico.png' },
        { id: 12, type: 'Incendio', description: 'Incendio forestal', location: 'Av. La Florida 9600, La Florida', dateTime: '03/09/2024 08:57', status: 'Cerrado', imageUrl: '../assets/incendio.png' },
        { id: 13, type: 'Accidente', description: 'Atropellamiento', location: 'Av. Quilín 4500, Ñuñoa', dateTime: '03/09/2024 08:55', status: 'Cerrado', imageUrl: '../assets/accidente.png' },
        { id: 14, type: 'Explosión', description: 'Explosión de horno industrial', location: 'Av. Manquehue Norte 1400, Santiago', dateTime: '03/09/2024 08:22', status: 'Cerrado', imageUrl: '../assets/default_incident.png' },
        { id: 15, type: 'Desplome', description: 'Árbol caído', location: 'Av. Irarrazaval 5200, Ñuñoa', dateTime: '03/09/2024 06:52', status: 'En progreso', imageUrl: '../assets/default_incident.png' },
        { id: 16, type: 'Explosión', description: 'Explosión de tuberías', location: 'Av. Los Leones 2200, Providencia', dateTime: '03/09/2024 05:40', status: 'Cerrado', imageUrl: '../assets/default_incident.png' },
    ];

    // Efecto para cargar incidentes al montar el componente
    useEffect(() => {
        loadIncidents();
    }, []);

    /**
     * Carga los incidentes desde localStorage o inicializa con datos por defecto
     */
    const loadIncidents = useCallback(async (): Promise<void> => {
        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500)); // Simular carga

            const storedIncidents = localStorage.getItem('incidentes');
            if (storedIncidents) {
                const parsedIncidents: Incident[] = JSON.parse(storedIncidents);
                const sortedIncidents = parsedIncidents.sort((a, b) => b.id - a.id);
                setIncidents(sortedIncidents);
            } else {
                saveIncidentsToLocalStorage(initialIncidentsData);
                const sortedIncidents = initialIncidentsData.sort((a, b) => b.id - a.id);
                setIncidents(sortedIncidents);
            }
        } catch (error) {
            console.error('❌ Error al cargar incidentes:', error);
            // Podrías agregar un toast de error aquí
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Guarda los incidentes en localStorage
     */
    const saveIncidentsToLocalStorage = (data: Incident[]): void => {
        try {
            localStorage.setItem('incidentes', JSON.stringify(data));
        } catch (error) {
            console.error('❌ Error al guardar incidentes:', error);
        }
    };

    /**
     * Genera un nuevo ID para un incidente
     */
    const generateIncidentId = (): number => {
        const incidents = JSON.parse(localStorage.getItem('incidentes') || '[]');
        const maxId = incidents.reduce((max: number, inc: Incident) => Math.max(max, inc.id), 0);
        return maxId + 1;
    };

    /**
     * Maneja el cambio en los campos del formulario
     */
    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
        formType: 'new' | 'edit'
    ): void => {
        const { id, value } = e.target;

        if (formType === 'new') {
            setNewIncident(prev => ({ ...prev, [id]: value }));
        } else {
            // El ID de los campos de edición comienza con 'edit-'
            setEditForm(prev => ({ ...prev, [id.replace('edit-', '')]: value }));
        }
    };

    /**
     * Maneja el envío del formulario de nuevo incidente
     */
    const handleSubmitIncident = (e: React.FormEvent): void => {
        e.preventDefault();

        const now = new Date();
        const dateTime = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;

        const incident: Incident = {
            id: generateIncidentId(),
            type: newIncident.type.trim(),
            description: newIncident.description.trim(),
            location: newIncident.location.trim(),
            dateTime,
            status: 'En progreso',
            imageUrl: newIncident.imageUrl.trim() || '../assets/default_incident.png'
        };

        const updatedIncidents = [...incidents, incident];
        const sortedIncidents = updatedIncidents.sort((a, b) => b.id - a.id);

        setIncidents(sortedIncidents);
        saveIncidentsToLocalStorage(updatedIncidents);

        // Resetear formulario
        setShowForm(false);
        setNewIncident({
            type: "",
            description: "",
            location: "",
            imageUrl: ""
        });

        // Mostrar feedback al usuario
        alert("✅ ¡Incidente añadido correctamente!");
    };

    /**
     * Maneja la eliminación de un incidente
     */
    const handleDeleteIncident = (id: number): void => {
        if (window.confirm("⚠️ ¿Estás seguro de que quieres eliminar este incidente?")) {
            const updatedIncidents = incidents.filter(incident => incident.id !== id);
            setIncidents(updatedIncidents);
            saveIncidentsToLocalStorage(updatedIncidents);
            setExpandedIncident(null);
            setEditingIncident(null);

            // Feedback al usuario
            alert("🗑️ Incidente eliminado correctamente");
        }
    };

    /**
     * Maneja la edición de un incidente
     */
    const handleEditIncident = (id: number): void => {
        const incident = incidents.find(inc => inc.id === id);
        if (incident) {
            setEditingIncident(id);
            // Asegurar que el formulario de edición se inicialice con los datos correctos
            setEditForm({
                description: incident.description,
                location: incident.location,
                type: incident.type,
                status: incident.status,
                imageUrl: incident.imageUrl
            });
            // Opcional: expandir la fila para ver el formulario si no está expandida
            if (expandedIncident !== id) {
                setExpandedIncident(id);
            }
        }
    };

    /**
     * Guarda los cambios de un incidente editado
     */
    const handleSaveIncident = (id: number): void => {
        const updatedIncidents = incidents.map(incident => {
            if (incident.id === id) {
                return {
                    ...incident,
                    description: editForm.description.trim(),
                    location: editForm.location.trim(),
                    type: editForm.type.trim(),
                    status: editForm.status.trim(),
                    imageUrl: editForm.imageUrl.trim()
                };
            }
            return incident;
        });

        setIncidents(updatedIncidents);
        saveIncidentsToLocalStorage(updatedIncidents);
        setEditingIncident(null);
        setExpandedIncident(null); // Opcional: cerrar los detalles al guardar
        setEditForm({
            description: "",
            location: "",
            type: "",
            status: "",
            imageUrl: ""
        });

        alert("✏️ Incidente actualizado correctamente");
    };

    /**
     * Obtiene la clase CSS para el estado del incidente
     */
    const getStatusClass = (status: string): string => {
        const statusMap: { [key: string]: string } = {
            'en progreso': 'estado-progreso',
            'localizado': 'estado-localizado',
            'cerrado': 'estado-cerrado'
        };

        return statusMap[status.toLowerCase()] || 'estado-default';
    };

    /**
     * Obtiene el ícono para el tipo de incidente
     */
    const getIncidentIcon = (type: string): string => {
        const iconMap: { [key: string]: string } = {
            'incendio': '🔥',
            'explosión': '💥',
            'accidente': '🚗',
            'fuga de gas': '⚠️',
            'derrumbe': '🏚️',
            'derrame químico': '🧪',
            'desplome': '🌳'
        };

        return iconMap[type.toLowerCase()] || '📋';
    };

    // Renderizado condicional para loading
    if (isLoading) {
        return (
            <div className="cuerpo">
                <Navbar />
                <div className="fondo-navbar"></div>
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Cargando incidentes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="cuerpo">
            <Navbar />
            <div className="fondo-navbar"></div>

            <section className="contenedor-incidentes">
                {/* Header de la página */}
                <header className="header-incidentes">
                    <div className="titulo-container">
                        <h1 className="titulo-principal">
                            🚨 Gestión de Incidentes
                        </h1>
                        <p className="subtitulo">
                            Monitoriza y gestiona todos los incidentes reportados en tiempo real
                        </p>
                    </div>

                    <button
                        className="btn-primario btn-grande"
                        onClick={() => setShowForm(true)}
                        disabled={showForm}
                    >
                        <span className="btn-icon">➕</span>
                        Reportar Nuevo Incidente
                    </button>
                </header>

                {/* Formulario de nuevo incidente */}
                {showForm && (
                    <div className="overlay-form mt-5">
                        <div className="formulario-container mt-3">
                            <div className="form-header">
                                <h2>📝 Reportar Nuevo Incidente</h2>
                                <button
                                    className="btn-cerrar"
                                    onClick={() => {
                                        setShowForm(false);
                                        setNewIncident({
                                            type: "",
                                            description: "",
                                            location: "",
                                            imageUrl: ""
                                        });
                                    }}
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleSubmitIncident} className="formulario-incidente">
                                <div className="grid-form">
                                    <div className="form-group">
                                        <label htmlFor="type" className="form-label">
                                            🔧 Tipo de Incidente
                                        </label>
                                        <input
                                            type="text"
                                            id="type"
                                            value={newIncident.type}
                                            onChange={(e) => handleInputChange(e, 'new')}
                                            placeholder="Ej: Incendio, Accidente, Fuga de gas..."
                                            className="form-input"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="location" className="form-label">
                                            📍 Ubicación
                                        </label>
                                        <input
                                            type="text"
                                            id="location"
                                            value={newIncident.location}
                                            onChange={(e) => handleInputChange(e, 'new')}
                                            placeholder="Dirección exacta o referencia..."
                                            className="form-input"
                                            required
                                        />
                                    </div>

                                    <div className="form-group full-width">
                                        <label htmlFor="description" className="form-label">
                                            📄 Descripción Detallada
                                        </label>
                                        <textarea
                                            id="description"
                                            value={newIncident.description}
                                            onChange={(e) => handleInputChange(e, 'new')}
                                            placeholder="Describe el incidente con todos los detalles relevantes..."
                                            className="form-textarea"
                                            rows={4}
                                            required
                                        />
                                    </div>

                                    <div className="form-group full-width">
                                        <label htmlFor="imageUrl" className="form-label">
                                            🖼️ URL de Imagen (Opcional)
                                        </label>
                                        <input
                                            type="url"
                                            id="imageUrl"
                                            value={newIncident.imageUrl}
                                            onChange={(e) => handleInputChange(e, 'new')}
                                            placeholder="https://ejemplo.com/imagen.jpg"
                                            className="form-input"
                                        />
                                        <small className="form-help">
                                            Proporciona una URL de imagen para mejor identificación del incidente
                                        </small>
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button type="submit" className="btn-primario">
                                        🚀 Enviar Reporte
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-secundario"
                                        onClick={() => {
                                            setShowForm(false);
                                            setNewIncident({
                                                type: "",
                                                description: "",
                                                location: "",
                                                imageUrl: ""
                                            });
                                        }}
                                    >
                                        ↩️ Cancelar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Panel de estadísticas */}
                <div className="panel-estadisticas">
                    <div className="estadistica">
                        <span className="estadistica-numero">{incidents.length}</span>
                        <span className="estadistica-label">Total Incidentes</span>
                    </div>
                    <div className="estadistica">
                        <span className="estadistica-numero">
                            {incidents.filter(i => i.status === 'En progreso').length}
                        </span>
                        <span className="estadistica-label">En Progreso</span>
                    </div>
                    <div className="estadistica">
                        <span className="estadistica-numero">
                            {incidents.filter(i => i.status === 'Cerrado').length}
                        </span>
                        <span className="estadistica-label">Resueltos</span>
                    </div>
                </div>

                {/* Tabla de incidentes */}
                <div className="contenedor-tabla">
                    <div className="tabla-header">
                        <h2>📊 Lista de Incidentes Activos</h2>
                        <button
                            className="btn-secundario btn-pequeno"
                            onClick={loadIncidents}
                        >
                            🔄 Actualizar
                        </button>
                    </div>

                    <div className="tabla-responsive">
                        {incidents.length === 0 ? (
                            <div className="estado-vacio">
                                <div className="icono-vacio">📋</div>
                                <h3>No hay incidentes reportados</h3>
                                <p>Comienza reportando el primer incidente usando el botón superior</p>
                            </div>
                        ) : (
                            <table className="tabla-incidentes">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Tipo</th>
                                        <th>Ubicación</th>
                                        <th>Estado</th>
                                        <th>Fecha/Hora</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {incidents.map(incident => (
                                        <React.Fragment key={incident.id}>
                                            {/* Fila principal del incidente */}
                                            <tr className={`fila-incidente ${expandedIncident === incident.id ? 'expandida' : ''}`}>
                                                <td className="celda-id">#{incident.id}</td>
                                                <td className="celda-tipo">
                                                    <span className="icono-tipo">
                                                        {getIncidentIcon(incident.type)}
                                                    </span>
                                                    {incident.type}
                                                </td>
                                                <td className="celda-ubicacion">{incident.location}</td>
                                                <td>
                                                    <span className={`badge-estado ${getStatusClass(incident.status)}`}>
                                                        {incident.status}
                                                    </span>
                                                </td>
                                                <td className="celda-fecha">{incident.dateTime}</td>
                                                <td className="celda-acciones">
                                                    <div className="contenedor-acciones">
                                                        <button
                                                            className="btn-accion btn-info"
                                                            onClick={() => setExpandedIncident(
                                                                expandedIncident === incident.id ? null : incident.id
                                                            )}
                                                            title="Ver detalles"
                                                        >
                                                            {expandedIncident === incident.id ? '👁️‍🗨️ Ocultar' : '👁️ Ver'}
                                                        </button>
                                                        <button
                                                            className="btn-accion btn-warning"
                                                            onClick={() => handleEditIncident(incident.id)}
                                                            title="Editar incidente"
                                                        >
                                                            ✏️ Editar
                                                        </button>
                                                        <button
                                                            className="btn-accion btn-danger"
                                                            onClick={() => handleDeleteIncident(incident.id)}
                                                            title="Eliminar incidente"
                                                        >
                                                            🗑️ Eliminar
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>

                                            {/* Fila expandida con detalles */}
                                            {expandedIncident === incident.id && (
                                                <tr className="fila-detalles">
                                                    <td colSpan={6}>
                                                        <div className="contenedor-detalles">
                                                            {editingIncident === incident.id ? (
                                                                // Formulario de edición
                                                                <div className="formulario-edicion">
                                                                    <h4>✏️ Editando Incidente #{incident.id}</h4>
                                                                    <div className="grid-form">
                                                                        {/* Tipo de Incidente */}
                                                                        <div className="form-group">
                                                                            <label htmlFor="edit-type" className="form-label">🔧 Tipo de Incidente</label>
                                                                            <input
                                                                                type="text"
                                                                                id="edit-type"
                                                                                value={editForm.type}
                                                                                onChange={(e) => handleInputChange(e, 'edit')}
                                                                                className="form-input"
                                                                                required
                                                                            />
                                                                        </div>

                                                                        {/* Ubicación */}
                                                                        <div className="form-group">
                                                                            <label htmlFor="edit-location" className="form-label">📍 Ubicación</label>
                                                                            <input
                                                                                type="text"
                                                                                id="edit-location"
                                                                                value={editForm.location}
                                                                                onChange={(e) => handleInputChange(e, 'edit')}
                                                                                className="form-input"
                                                                                required
                                                                            />
                                                                        </div>

                                                                        {/* Estado */}
                                                                        <div className="form-group">
                                                                            <label htmlFor="edit-status" className="form-label">📊 Estado</label>
                                                                            <select
                                                                                id="edit-status"
                                                                                value={editForm.status}
                                                                                onChange={(e) => handleInputChange(e as React.ChangeEvent<HTMLSelectElement>, 'edit')}
                                                                                className="form-input"
                                                                            >
                                                                                <option value="En progreso">En progreso</option>
                                                                                <option value="Localizado">Localizado</option>
                                                                                <option value="Cerrado">Cerrado</option>
                                                                            </select>
                                                                        </div>

                                                                        {/* Descripción */}
                                                                        <div className="form-group full-width">
                                                                            <label htmlFor="edit-description" className="form-label">📄 Descripción Detallada</label>
                                                                            <textarea
                                                                                id="edit-description"
                                                                                value={editForm.description}
                                                                                onChange={(e) => handleInputChange(e, 'edit')}
                                                                                className="form-textarea"
                                                                                rows={3}
                                                                                required
                                                                            />
                                                                        </div>

                                                                        {/* URL de Imagen */}
                                                                        <div className="form-group full-width">
                                                                            <label htmlFor="edit-imageUrl" className="form-label">🖼️ URL de Imagen (Opcional)</label>
                                                                            <input
                                                                                type="url"
                                                                                id="edit-imageUrl"
                                                                                value={editForm.imageUrl}
                                                                                onChange={(e) => handleInputChange(e, 'edit')}
                                                                                className="form-input"
                                                                                placeholder="https://ejemplo.com/imagen.jpg"
                                                                            />
                                                                        </div>

                                                                    </div>
                                                                    <div className="acciones-edicion">
                                                                        <button
                                                                            className="btn-primario"
                                                                            onClick={() => handleSaveIncident(incident.id)}
                                                                        >
                                                                            💾 Guardar Cambios
                                                                        </button>
                                                                        <button
                                                                            className="btn-secundario"
                                                                            onClick={() => setEditingIncident(null)}
                                                                        >
                                                                            ↩️ Cancelar
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                // Vista de detalles
                                                                <div className="vista-detalles">
                                                                    <div className="detalles-contenido">
                                                                        <div className="detalles-texto">
                                                                            <h4>📋 Descripción Completa</h4>
                                                                            <p>{incident.description}</p>

                                                                            <div className="info-adicional">
                                                                                <div className="info-item">
                                                                                    <strong>📍 Ubicación:</strong>
                                                                                    <span>{incident.location}</span>
                                                                                </div>
                                                                                <div className="info-item">
                                                                                    <strong>🕐 Reportado:</strong>
                                                                                    <span>{incident.dateTime}</span>
                                                                                </div>
                                                                                <div className="info-item">
                                                                                    <strong>🔧 Tipo:</strong>
                                                                                    <span>{incident.type}</span>
                                                                                </div>
                                                                                <div className="info-item">
                                                                                    <strong>📊 Estado:</strong>
                                                                                    <span className={`badge-estado ${getStatusClass(incident.status)}`}>
                                                                                        {incident.status}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {incident.imageUrl && incident.imageUrl !== '../assets/default_incident.png' && (
                                                                            <div className="detalles-imagen">
                                                                                <h4>🖼️ Evidencia Visual</h4>
                                                                                <img
                                                                                    src={incident.imageUrl}
                                                                                    alt={`Imagen del incidente ${incident.id}`}
                                                                                    className="imagen-incidente"
                                                                                    onError={(e) => {
                                                                                        (e.target as HTMLImageElement).src = '../assets/default_incident.png';
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment> 
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Incidentes;