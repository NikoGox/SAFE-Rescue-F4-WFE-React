// src/pages/Incidentes.tsx
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import styles from './Incidentes.module.css';
import DefaultIncidente from "../assets/default_incident.png";
import Incendio from "../assets/incendio.png";
import Derrumbe from "../assets/derrumbe.png";
import Accidente from "../assets/accidente.png";
import DerrameQuimico from "../assets/derrame-quimico.png";
import FugaGas from "../assets/fuga-gas.png";

// Importacion de iconos
import { RiEditFill } from "react-icons/ri";
import { BsTrashFill } from "react-icons/bs";
import { TiArrowSortedUp } from "react-icons/ti";
import { TiArrowSortedDown } from "react-icons/ti";
import { TbRefresh } from "react-icons/tb";
import { TiPlus } from "react-icons/ti";

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
    // Datos iniciales de incidentes

    const initialIncidentsData: Incident[] = [

        { id: 1, type: 'Incendio', description: 'Incendio en una casa', location: 'Renca, El Montijo 2212', dateTime: '03/09/2024 22:50', status: 'En progreso', imageUrl: Incendio },
        { id: 2, type: 'Explosión', description: 'Explosión de transformador', location: 'Renca, El Montijo 2212', dateTime: '03/09/2024 14:20', status: 'Cerrado', imageUrl: DefaultIncidente },
        { id: 3, type: 'Accidente', description: 'Atropellamiento', location: 'Av. Vicuña Mackenna 6100', dateTime: '03/09/2024 13:15', status: 'Cerrado', imageUrl: Accidente },
        { id: 4, type: 'Accidente', description: 'Colisión múltiple en vía', location: 'Autopista Central, Santiago', dateTime: '03/09/2024 12:50', status: 'En progreso', imageUrl: Accidente },
        { id: 5, type: 'Fuga de gas', description: 'Fuga en cocina residencial', location: 'Av. Providencia 1234, Providencia', dateTime: '03/09/2024 12:25', status: 'Localizado', imageUrl: FugaGas },
        { id: 6, type: 'Incendio', description: 'Fuego en almacén industrial', location: 'Av. Santa Rosa 1300, Santiago', dateTime: '03/09/2024 12:00', status: 'Cerrado', imageUrl: Incendio },
        { id: 7, type: 'Fuga de gas', description: 'Fuga en instituto', location: 'Huechuraba, la calle 2212', dateTime: '03/09/2024 11:50', status: 'Cerrado', imageUrl: FugaGas },
        { id: 8, type: 'Accidente', description: 'Colisión múltiple en vía', location: 'Av. Américo Vespucio, Las Condes', dateTime: '03/09/2024 09:30', status: 'Cerrado', imageUrl: Accidente },
        { id: 9, type: 'Derrumbe', description: 'Colapso de estructura', location: 'Av. Santa Rosa 1300, Santiago', dateTime: '03/09/2024 09:50', status: 'En progreso', imageUrl: Derrumbe },
        { id: 10, type: 'Incendio', description: 'Incendio en una casa', location: 'Av. Macul 4700, Macul', dateTime: '03/09/2024 09:50', status: 'En progreso', imageUrl: Incendio },
        { id: 11, type: 'Derrame químico', description: 'Derrame de líquidos tóxicos', location: 'Av. Américo Vespucio Las Condes', dateTime: '03/09/2024 09:22', status: 'En progreso', imageUrl: DerrameQuimico },
        { id: 12, type: 'Incendio', description: 'Incendio forestal', location: 'Av. La Florida 9600, La Florida', dateTime: '03/09/2024 08:57', status: 'Cerrado', imageUrl: Incendio },
        { id: 13, type: 'Accidente', description: 'Atropellamiento', location: 'Av. Quilín 4500, Ñuñoa', dateTime: '03/09/2024 08:55', status: 'Cerrado', imageUrl: Accidente },
        { id: 14, type: 'Explosión', description: 'Explosión de horno industrial', location: 'Av. Manquehue Norte 1400, Santiago', dateTime: '03/09/2024 08:22', status: 'Cerrado', imageUrl: DefaultIncidente },
        { id: 15, type: 'Desplome', description: 'Árbol caído', location: 'Av. Irarrazaval 5200, Ñuñoa', dateTime: '03/09/2024 06:52', status: 'En progreso', imageUrl: DefaultIncidente },
        { id: 16, type: 'Explosión', description: 'Explosión de tuberías', location: 'Av. Los Leones 2200, Providencia', dateTime: '03/09/2024 05:40', status: 'Cerrado', imageUrl: DefaultIncidente },

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
            console.error(' Error al cargar incidentes:', error);
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
            console.error('Error al guardar incidentes:', error);
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
            imageUrl: newIncident.imageUrl.trim() || DefaultIncidente
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
        if (window.confirm("¿Estás seguro de que quieres eliminar este incidente?")) {
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

        alert("Incidente actualizado correctamente");
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


    //iconos




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
            <div className={styles.cuerpo}>
                <div className={styles['fondo-navbar']}></div>
                <div className={styles['loading-container']}>
                    <div className={styles['loading-spinner']}></div>
                    <p>Cargando incidentes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.cuerpo}>
            <section className={styles['contenedor-incidentes']}>
                {/* Header de la página */}
                <header className={styles['header-incidentes']}>
                    <div className={styles['titulo-container']}>
                        <h1 className={styles['titulo-principal']}>
                            Gestión de Incidentes
                        </h1>
                        <p className={styles.subtitulo}>
                            Monitoriza y gestiona todos los incidentes reportados en tiempo real
                        </p>
                    </div>

                    <button
                        className={`${styles['btn-primario']} ${styles['btn-grande']}`}
                        onClick={() => setShowForm(true)}
                        disabled={showForm}
                    >
                        Reportar Nuevo Incidente<TiPlus />

                    </button>
                </header>

                {/* Formulario de nuevo incidente */}
                {showForm && (
                    <div className={`${styles['overlay-form']} ${styles['mt-5']}`}>
                        <div className={`${styles['formulario-container']} ${styles['mt-3']}`}>
                            <div className={styles['form-header']}>
                                <h2>Reportar Nuevo Incidente</h2>
                                <button
                                    className={styles['btn-cerrar']}
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

                            <form onSubmit={handleSubmitIncident} className={styles['formulario-incidente']}>
                                <div className={styles['grid-form']}>
                                    <div className={styles['form-group']}>
                                        <label htmlFor="type" className={styles['form-label']}>
                                            🔧 Tipo de Incidente
                                        </label>
                                        <input
                                            type="text"
                                            id="type"
                                            value={newIncident.type}
                                            onChange={(e) => handleInputChange(e, 'new')}
                                            placeholder="Ej: Incendio, Accidente, Fuga de gas..."
                                            className={styles['form-input']}
                                            required
                                        />
                                    </div>

                                    <div className={styles['form-group']}>
                                        <label htmlFor="location" className={styles['form-label']}>
                                            📍 Ubicación
                                        </label>
                                        <input
                                            type="text"
                                            id="location"
                                            value={newIncident.location}
                                            onChange={(e) => handleInputChange(e, 'new')}
                                            placeholder="Dirección exacta o referencia..."
                                            className={styles['form-input']}
                                            required
                                        />
                                    </div>

                                    <div className={`${styles['form-group']} ${styles['full-width']}`}>
                                        <label htmlFor="description" className={styles['form-label']}>
                                            Descripción Detallada
                                        </label>
                                        <textarea
                                            id="description"
                                            value={newIncident.description}
                                            onChange={(e) => handleInputChange(e, 'new')}
                                            placeholder="Describe el incidente con todos los detalles relevantes..."
                                            className={styles['form-textarea']}
                                            rows={4}
                                            required
                                        />
                                    </div>

                                    <div className={`${styles['form-group']} ${styles['full-width']}`}>
                                        <label htmlFor="imageUrl" className={styles['form-label']}>
                                            URL de Imagen (Opcional)
                                        </label>
                                        <input
                                            type="url"
                                            id="imageUrl"
                                            value={newIncident.imageUrl}
                                            onChange={(e) => handleInputChange(e, 'new')}
                                            placeholder="https://ejemplo.com/imagen.jpg"
                                            className={styles['form-input']}
                                        />
                                        <small className={styles['form-help']}>
                                            Proporciona una URL de imagen para mejor identificación del incidente
                                        </small>
                                    </div>
                                </div>

                                <div className={styles['form-actions']}>
                                    <button type="submit" className={styles['btn-primario']}>
                                        🚀 Enviar Reporte
                                    </button>
                                    <button
                                        type="button"
                                        className={styles['btn-secundario']}
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
                <div className={styles['panel-estadisticas']}>
                    <div className={styles.estadistica}>
                        <span className={styles['estadistica-numero']}>{incidents.length}</span>
                        <span className={styles['estadistica-label']}>Total Incidentes</span>
                    </div>
                    <div className={styles.estadistica}>
                        <span className={styles['estadistica-numero']}>
                            {incidents.filter(i => i.status === 'En progreso').length}
                        </span>
                        <span className={styles['estadistica-label']}>En Progreso</span>
                    </div>
                    <div className={styles.estadistica}>
                        <span className={styles['estadistica-numero']}>
                            {incidents.filter(i => i.status === 'Cerrado').length}
                        </span>
                        <span className={styles['estadistica-label']}>Resueltos</span>
                    </div>
                </div>

                {/* Tabla de incidentes */}
                <div className={styles['contenedor-tabla']}>
                    <div className={styles['tabla-header']}>
                        <h2>Lista de Incidentes Activos</h2>
                        <button
                            className={`${styles['btn-secundario']} ${styles['btn-pequeno']}`}
                            onClick={loadIncidents}
                        >
                            <span className={styles.btnContenido}>
                                Actualizar <TbRefresh />
                            </span>
                        </button>
                    </div>

                    <div className={styles['tabla-responsive']}>
                        {incidents.length === 0 ? (
                            <div className={styles['estado-vacio']}>
                                <div className={styles['icono-vacio']}>📋</div>
                                <h3>No hay incidentes reportados</h3>
                                <p>Comienza reportando el primer incidente usando el botón superior</p>
                            </div>
                        ) : (
                            <table className={styles['tabla-incidentes']}>
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
                                            <tr className={`${styles['fila-incidente']} ${expandedIncident === incident.id ? styles.expandida : ''}`}>
                                                <td className={styles['celda-id']}>{incident.id}</td>
                                                <td className={styles['celda-tipo']}>
                                                    <span className={styles['icono-tipo']}>
                                                        {getIncidentIcon(incident.type)}
                                                    </span>
                                                    {incident.type}
                                                </td>
                                                <td className={styles['celda-ubicacion']}>{incident.location}</td>
                                                <td>
                                                    <span className={`${styles['badge-estado']} ${styles[getStatusClass(incident.status)]}`}>
                                                        {incident.status}
                                                    </span>
                                                </td>
                                                <td className={styles['celda-fecha']}>{incident.dateTime}</td>
                                                <td className={styles['celda-acciones']}>
                                                    <div className={styles['contenedor-acciones']}>
                                                        <button
                                                            className={`${styles['btn-accion']} ${styles['btn-info']}`}
                                                            onClick={() => setExpandedIncident(
                                                                expandedIncident === incident.id ? null : incident.id
                                                            )}
                                                            title="Ver detalles"
                                                        >
                                                            {expandedIncident === incident.id ? <TiArrowSortedUp /> : <TiArrowSortedDown />}
                                                        </button>
                                                        <button
                                                            className={`${styles['btn-accion']} ${styles['btn-warning']}`}
                                                            onClick={() => handleEditIncident(incident.id)}
                                                            title="Editar incidente"
                                                        >
                                                            Editar
                                                            <RiEditFill />

                                                        </button>
                                                        <button
                                                            className={`${styles['btn-accion']} ${styles['btn-danger']}`}
                                                            onClick={() => handleDeleteIncident(incident.id)}
                                                            title="Eliminar incidente"
                                                        >
                                                            Eliminar
                                                            <BsTrashFill />

                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>

                                            {/* Fila expandida con detalles */}
                                            {expandedIncident === incident.id && (
                                                <tr className={styles['fila-detalles']}>
                                                    <td colSpan={6}>
                                                        <div className={styles['contenedor-detalles']}>
                                                            {editingIncident === incident.id ? (
                                                                // Formulario de edición
                                                                <div className={styles['formulario-edicion']}>
                                                                    <h4>✏️ Editando Incidente #{incident.id}</h4>
                                                                    <div className={styles['grid-form']}>
                                                                        {/* Tipo de Incidente */}
                                                                        <div className={styles['form-group']}>
                                                                            <label htmlFor="edit-type" className={styles['form-label']}>🔧 Tipo de Incidente</label>
                                                                            <input
                                                                                type="text"
                                                                                id="edit-type"
                                                                                value={editForm.type}
                                                                                onChange={(e) => handleInputChange(e, 'edit')}
                                                                                className={styles['form-input']}
                                                                                required
                                                                            />
                                                                        </div>

                                                                        {/* Ubicación */}
                                                                        <div className={styles['form-group']}>
                                                                            <label htmlFor="edit-location" className={styles['form-label']}>📍 Ubicación</label>
                                                                            <input
                                                                                type="text"
                                                                                id="edit-location"
                                                                                value={editForm.location}
                                                                                onChange={(e) => handleInputChange(e, 'edit')}
                                                                                className={styles['form-input']}
                                                                                required
                                                                            />
                                                                        </div>

                                                                        {/* Estado */}
                                                                        <div className={styles['form-group']}>
                                                                            <label htmlFor="edit-status" className={styles['form-label']}>📊 Estado</label>
                                                                            <select
                                                                                id="edit-status"
                                                                                value={editForm.status}
                                                                                onChange={(e) => handleInputChange(e as React.ChangeEvent<HTMLSelectElement>, 'edit')}
                                                                                className={styles['form-input']}
                                                                            >
                                                                                <option value="En progreso">En progreso</option>
                                                                                <option value="Localizado">Localizado</option>
                                                                                <option value="Cerrado">Cerrado</option>
                                                                            </select>
                                                                        </div>

                                                                        {/* Descripción */}
                                                                        <div className={`${styles['form-group']} ${styles['full-width']}`}>
                                                                            <label htmlFor="edit-description" className={styles['form-label']}>📄 Descripción Detallada</label>
                                                                            <textarea
                                                                                id="edit-description"
                                                                                value={editForm.description}
                                                                                onChange={(e) => handleInputChange(e, 'edit')}
                                                                                className={styles['form-textarea']}
                                                                                rows={3}
                                                                                required
                                                                            />
                                                                        </div>

                                                                        {/* URL de Imagen */}
                                                                        <div className={`${styles['form-group']} ${styles['full-width']}`}>
                                                                            <label htmlFor="edit-imageUrl" className={styles['form-label']}>🖼️ URL de Imagen (Opcional)</label>
                                                                            <input
                                                                                type="url"
                                                                                id="edit-imageUrl"
                                                                                value={editForm.imageUrl}
                                                                                onChange={(e) => handleInputChange(e, 'edit')}
                                                                                className={styles['form-input']}
                                                                                placeholder="https://ejemplo.com/imagen.jpg"
                                                                            />
                                                                        </div>

                                                                    </div>
                                                                    <div className={styles['acciones-edicion']}>
                                                                        <button
                                                                            className={styles['btn-primario']}
                                                                            onClick={() => handleSaveIncident(incident.id)}
                                                                        >
                                                                            💾 Guardar Cambios
                                                                        </button>
                                                                        <button
                                                                            className={styles['btn-secundario']}
                                                                            onClick={() => setEditingIncident(null)}
                                                                        >
                                                                            ↩️ Cancelar
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                // Vista de detalles
                                                                <div className={styles['vista-detalles']}>
                                                                    <div className={styles['detalles-contenido']}>
                                                                        <div className={styles['detalles-texto']}>
                                                                            <h4>Descripción Completa</h4>
                                                                            <p>{incident.description}</p>

                                                                            <div className={styles['info-adicional']}>
                                                                                <div className={styles['info-item']}>
                                                                                    <strong>📍 Ubicación:</strong>
                                                                                    <span>{incident.location}</span>
                                                                                </div>
                                                                                <div className={styles['info-item']}>
                                                                                    <strong>🕐 Reportado:</strong>
                                                                                    <span>{incident.dateTime}</span>
                                                                                </div>
                                                                                <div className={styles['info-item']}>
                                                                                    <strong>🏷️ Tipo:</strong>
                                                                                    <span>{incident.type}</span>
                                                                                </div>
                                                                                <div className={styles['info-item']}>
                                                                                    <strong>📊 Estado:</strong>
                                                                                    <span className={`${styles['badge-estado']} ${styles[getStatusClass(incident.status)]}`}>
                                                                                        {incident.status}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {incident.imageUrl && incident.imageUrl !== '../assets/default_incident.png' && (
                                                                            <div className={styles['detalles-imagen']}>
                                                                                <h4>Evidencia Visual</h4>
                                                                                <img
                                                                                    src={incident.imageUrl}
                                                                                    alt={`Imagen del incidente ${incident.id}`}
                                                                                    className={styles['imagen-incidente']}
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