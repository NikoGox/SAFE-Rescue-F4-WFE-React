// src/pages/Incidentes.tsx
import React, { useState, useEffect, useCallback } from "react";
import styles from './Incidentes.module.css';

import DefaultIncidente from "../assets/default_incident.png";
import Incendio from "../assets/incendio.png";
import Derrumbe from "../assets/derrumbe.png";
import Accidente from "../assets/accidente.png";
import DerrameQuimico from "../assets/derrame-quimico.png";
import FugaGas from "../assets/fuga-gas.png";

import { RiEditFill } from "react-icons/ri";
import { BsTrashFill } from "react-icons/bs";
import { TiArrowSortedUp } from "react-icons/ti";
import { TiArrowSortedDown } from "react-icons/ti";
import { TbRefresh, TbMapPin } from "react-icons/tb";
import { TiPlus } from "react-icons/ti";

import { useImageUpload } from "../hooks/useImageUpload";
import ImageUploadModal from "../components/ImageUploadModal";
import IncidenteService from "../service/services/incidentes/IncidenteService";
import TipoIncidenteService from "../service/services/incidentes/TipoIncidenteService";
import { IncidenteGeolocalizacionService } from "../service/services/incidentes/IncidenteGeolocalizacionService";
import { ComunaService } from "../service/services/geolocalizacion/ComunaService";
import { RegionService } from "../service/services/geolocalizacion/RegionService";
import { DireccionService } from "../service/services/geolocalizacion/DireccionService";
import { CoordenadasService } from "../service/services/geolocalizacion/CoordenadaService";

import type {
    IncidenteFrontendConGeolocalizacion,
    IncidenteCreationFrontendConGeolocalizacion,
    IncidenteUpdateFrontend,
    EditForm
} from "../types/IncidenteType";
import type { Comuna, Region, Direccion } from "../types/GeolocalizacionType";

interface TipoIncidenteOption {
    idTipoIncidente: number;
    nombre: string;
}

const Incidentes: React.FC = () => {
    const [incidents, setIncidents] = useState<IncidenteFrontendConGeolocalizacion[]>([]);
    const [tiposIncidente, setTiposIncidente] = useState<TipoIncidenteOption[]>([]);
    const [comunas, setComunas] = useState<Comuna[]>([]);
    const [regiones, setRegiones] = useState<Region[]>([]);
    const [showForm, setShowForm] = useState<boolean>(false);
    const [expandedIncident, setExpandedIncident] = useState<number | null>(null);
    const [editingIncident, setEditingIncident] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isLoadingTipos, setIsLoadingTipos] = useState<boolean>(false);
    const [isLoadingGeolocalizacion, setIsLoadingGeolocalizacion] = useState<boolean>(false);
    const [isLoadingGeografia, setIsLoadingGeografia] = useState(true);

    const [isImageModalOpen, setIsImageModalOpen] = useState<boolean>(false);
    const [currentImageUrl, setCurrentImageUrl] = useState<string>("");
    const [imageUploadContext, setImageUploadContext] = useState<'new' | 'edit'>('new');

    const [editForm, setEditForm] = useState<EditForm>({
        title: "",
        description: "",
        location: "",
        type: "",
        status: "",
        imageUrl: ""
    });

    const [newIncident, setNewIncident] = useState({
        title: "",
        type: "",
        description: "",
        calle: "",
        numero: "",
        villa: "",
        complemento: "",
        idComuna: "",
        imageUrl: ""
    });

    const {
        uploadedImageUrl,
        isUploading,
        uploadError,
        handleFileUpload,
        clearUploadedImage,
        handleFileDelete
    } = useImageUpload();

    const loadDatosGeograficos = useCallback(async (): Promise<void> => {
        setIsLoadingGeolocalizacion(true);
        try {
            console.log(' Cargando datos geográficos...');

            const [comunasData, regionesData] = await Promise.all([
                ComunaService.getAll().catch(error => {
                    console.error(' Error cargando comunas:', error);
                    // Datos de respaldo como en Registrarse.tsx
                    return [
                        { idComuna: 1, nombre: 'Santiago', idRegion: 1 },
                        { idComuna: 2, nombre: 'Providencia', idRegion: 1 },
                        { idComuna: 3, nombre: 'Las Condes', idRegion: 1 },
                        { idComuna: 4, nombre: 'Ñuñoa', idRegion: 1 }
                    ];
                }),
                RegionService.getAll().catch(error => {
                    console.error(' Error cargando regiones:', error);
                    // Datos de respaldo
                    return [
                        { idRegion: 1, nombre: 'Metropolitana de Santiago', identificacion: 'RM' }
                    ];
                })
            ]);

            console.log(' Comunas cargadas:', comunasData.length);
            console.log(' Regiones cargadas:', regionesData.length);

            setComunas(comunasData);
            setRegiones(regionesData);

        } catch (error) {
            console.error(' Error crítico al cargar datos geográficos:', error);
            // Datos de ejemplo de respaldo (igual que en Registrarse.tsx)
            setComunas([
                { idComuna: 1, nombre: 'Santiago', idRegion: 1 },
                { idComuna: 2, nombre: 'Providencia', idRegion: 1 },
                { idComuna: 3, nombre: 'Las Condes', idRegion: 1 },
                { idComuna: 4, nombre: 'Ñuñoa', idRegion: 1 }
            ]);
            setRegiones([
                { idRegion: 1, nombre: 'Metropolitana de Santiago', identificacion: 'RM' }
            ]);
        } finally {
            setIsLoadingGeolocalizacion(false);
        }
    }, []);

    // Cargar tipos de incidente
    const loadTiposIncidente = useCallback(async (): Promise<void> => {
        setIsLoadingTipos(true);
        try {
            const tipos = await TipoIncidenteService.listarTiposIncidente();
            setTiposIncidente(tipos);
        } catch (error) {
            console.error('Error al cargar tipos de incidente:', error);
            setTiposIncidente([
                { idTipoIncidente: 1, nombre: 'Incendio' },
                { idTipoIncidente: 2, nombre: 'Explosión' },
                { idTipoIncidente: 3, nombre: 'Accidente' },
                { idTipoIncidente: 4, nombre: 'Fuga de gas' },
                { idTipoIncidente: 5, nombre: 'Derrumbe' },
                { idTipoIncidente: 6, nombre: 'Derrame químico' },
                { idTipoIncidente: 7, nombre: 'Desplome' }
            ]);
        } finally {
            setIsLoadingTipos(false);
        }
    }, []);

    const loadIncidents = useCallback(async (): Promise<void> => {
        setIsLoading(true);
        try {
            console.log(' Cargando incidentes...');

            const incidentesBackend = await IncidenteService.listarIncidentes();
            console.log(' Incidentes cargados del backend:', incidentesBackend);

            if (!incidentesBackend || incidentesBackend.length === 0) {
                console.log(' No hay incidentes para mostrar');
                setIncidents([]);
                return;
            }

            // Enriquecer incidentes de forma más robusta
            const incidentesEnriquecidos = await Promise.all(
                incidentesBackend.map(async (incidente) => {
                    try {
                        let direccionCompletaIncidente = null;

                        // Obtener información de dirección (con manejo de errores mejorado)
                        if (incidente.idDireccion && incidente.idDireccion > 0) {
                            try {
                                direccionCompletaIncidente = await IncidenteGeolocalizacionService.obtenerDireccionCompleta(incidente.idDireccion);
                            } catch (error) {
                                console.error(` Error obteniendo dirección ${incidente.idDireccion}:`, error);
                                // Continuar sin información de dirección
                            }
                        }

                        return {
                            idIncidente: incidente.idIncidente,
                            titulo: incidente.titulo,
                            detalle: incidente.detalle,
                            fechaRegistro: incidente.fechaRegistro,
                            tipoIncidente: incidente.tipoIncidente,
                            estadoIncidente: getEstadoFromId(incidente.idEstadoIncidente),
                            imagenUrl: getDefaultImageByType(incidente.tipoIncidente.nombre),
                            direccionCompletaIncidente,
                            idEstadoIncidente: incidente.idEstadoIncidente
                        };
                    } catch (error) {
                        console.error(` Error procesando incidente ${incidente.idIncidente}:`, error);
                        // Retornar incidente básico
                        return {
                            idIncidente: incidente.idIncidente,
                            titulo: incidente.titulo,
                            detalle: incidente.detalle,
                            fechaRegistro: incidente.fechaRegistro,
                            tipoIncidente: incidente.tipoIncidente,
                            estadoIncidente: getEstadoFromId(incidente.idEstadoIncidente),
                            imagenUrl: getDefaultImageByType(incidente.tipoIncidente.nombre),
                            direccionCompletaIncidente: null,
                            idEstadoIncidente: incidente.idEstadoIncidente
                        };
                    }
                })
            );

            const sortedIncidents = incidentesEnriquecidos.sort((a, b) => b.idIncidente - a.idIncidente);
            setIncidents(sortedIncidents);
            console.log(' Incidentes cargados exitosamente:', sortedIncidents.length);

        } catch (error) {
            console.error(' Error al cargar incidentes:', error);
            setIncidents([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Función auxiliar para obtener estado por ID
    const getEstadoFromId = (idEstado: number): string => {
        const estados = {
            1: 'En progreso',
            2: 'Localizado',
            3: 'Cerrado'
        };
        return estados[idEstado as keyof typeof estados] || 'En progreso';
    };

    // Función auxiliar para obtener imagen por tipo
    const getDefaultImageByType = (tipo: string): string => {
        const imageMap: { [key: string]: string } = {
            'Incendio': Incendio,
            'Explosión': DefaultIncidente,
            'Accidente': Accidente,
            'Fuga de gas': FugaGas,
            'Derrumbe': Derrumbe,
            'Derrame químico': DerrameQuimico,
            'Desplome': DefaultIncidente
        };
        return imageMap[tipo] || DefaultIncidente;
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                await Promise.all([
                    loadDatosGeograficos(),
                    loadTiposIncidente(),
                    loadIncidents()
                ]);
            } catch (error) {
                console.error('Error loading initial data:', error);
            }
        };

        loadData();
    }, [loadDatosGeograficos, loadTiposIncidente, loadIncidents]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
        formType: 'new' | 'edit'
    ): void => {
        const { id, value } = e.target;

        if (formType === 'new') {
            setNewIncident(prev => ({ ...prev, [id]: value }));
        } else {
            setEditForm(prev => ({ ...prev, [id.replace('edit-', '')]: value }));
        }
    };

    const handleImageSave = async (): Promise<void> => {
        // Aquí deberías guardar la uploadedImageUrl en el estado correspondiente
        if (uploadedImageUrl) {
            if (imageUploadContext === 'new') {
                setNewIncident(prev => ({
                    ...prev,
                    imageUrl: uploadedImageUrl
                }));
            } else {
                setEditForm(prev => ({
                    ...prev,
                    imageUrl: uploadedImageUrl
                }));
            }
        }
        setIsImageModalOpen(false);
    };

    const openImageModal = (context: 'new' | 'edit', currentImage: string = ""): void => {
        setImageUploadContext(context);
        setCurrentImageUrl(currentImage);
        setIsImageModalOpen(true);
    };

    const validateForm = (): boolean => {
        if (!newIncident.title || !newIncident.type || !newIncident.description || !newIncident.calle || !newIncident.numero || !newIncident.idComuna) {
            window.alert('Por favor, complete todos los campos requeridos');
            return false;
        }

        if (newIncident.title.length < 5) {
            window.alert('Por favor, ingrese un título más descriptivo (mínimo 5 caracteres)');
            return false;
        }

        if (newIncident.description.length < 10) {
            window.alert('Por favor, proporcione una descripción más detallada');
            return false;
        }

        // Validar que la comuna sea de la región metropolitana
        const idComuna = parseInt(newIncident.idComuna);
        const comunaSeleccionada = comunas.find(c => c.idComuna === idComuna);
        if (comunaSeleccionada) {
            const regionComuna = regiones.find(r => r.idRegion === comunaSeleccionada.idRegion);
            const esRegionMetropolitana = regionComuna?.identificacion === 'RM' || regionComuna?.nombre.includes('Metropolitana');

            if (!esRegionMetropolitana) {
                window.alert('Por el momento solo se pueden reportar incidentes en la Región Metropolitana');
                return false;
            }
        }

        return true;
    };

    const handleSubmitIncident = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const idComuna = parseInt(newIncident.idComuna);
        if (isNaN(idComuna) || idComuna <= 0) {
            alert('Por favor, seleccione una comuna válida');
            return;
        }

        setIsLoading(true);
        try {
            // PRIMERO crear la dirección y obtener el ID
            const idDireccion = await crearDireccionYObtenerId({
                calle: newIncident.calle,
                numero: newIncident.numero,
                villa: newIncident.villa || undefined,
                complemento: newIncident.complemento || undefined,
                idComuna: idComuna
            });

            // Obtener información de la comuna para persistencia visual
            const comunaSeleccionada = comunas.find(c => c.idComuna === idComuna);
            const regionSeleccionada = regiones.find(r => r.idRegion === comunaSeleccionada?.idRegion);

            // CORREGIR: Estructura completa del incidente según el backend
            const incidenteData = {
                titulo: newIncident.title,
                detalle: newIncident.description,
                fechaRegistro: new Date().toISOString(), // Fecha actual
                region: regionSeleccionada?.nombre || '',
                comuna: comunaSeleccionada?.nombre || '',
                direccion: `${newIncident.calle} ${newIncident.numero}`,
                tipoIncidenteId: parseInt(newIncident.type),
                idDireccion: idDireccion,
                idCiudadano: 1,
                idEstadoIncidente: 1,
                idUsuarioAsignado: null,
                imagenUrl: newIncident.imageUrl || DefaultIncidente
            };

            console.log('Enviando incidente al backend:', incidenteData);
            await IncidenteService.crearIncidente(incidenteData);

            await loadIncidents();

            setShowForm(false);
            setNewIncident({
                title: "",
                type: "",
                description: "",
                calle: "",
                numero: "",
                villa: "",
                complemento: "",
                idComuna: "",
                imageUrl: ""
            });

            alert("¡Incidente añadido correctamente!");
        } catch (error) {
            console.error('Error al crear incidente:', error);
            alert('Error al crear incidente. Por favor, intenta nuevamente.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        console.log(' Estado actual de comunas:', comunas);
        console.log(' Estado actual de regiones:', regiones);
        console.log(' Comunas de RM:', getComunasRM());
    }, [comunas, regiones]);

    const crearDireccionYObtenerId = async (direccionData: {
        calle: string;
        numero: string;
        villa?: string;
        complemento?: string;
        idComuna: number;
        coordenadas?: number;
    }): Promise<number> => {
        try {
            console.log('Datos de dirección a crear:', direccionData);
            console.log('ID Comuna recibido:', direccionData.idComuna);
            console.log('Tipo de ID Comuna:', typeof direccionData.idComuna);

            // Verificar que la comuna existe
            const comunaExiste = comunas.find(c => c.idComuna === direccionData.idComuna);
            console.log('Comuna encontrada:', comunaExiste);

            if (!comunaExiste) {
                throw new Error(`Comuna con ID ${direccionData.idComuna} no existe en la lista cargada`);
            }

            // Crear el objeto dirección
            const datosDireccion: Omit<Direccion, 'idDireccion'> = {
                calle: direccionData.calle,
                numero: direccionData.numero,
                villa: direccionData.villa || undefined,
                complemento: direccionData.complemento || undefined,
                idComuna: direccionData.idComuna,
                idCoordenadas: direccionData.coordenadas || undefined
            };

            console.log('Enviando al servicio DireccionService.create:', datosDireccion);
            const mensajeRespuesta = await DireccionService.create(datosDireccion);
            console.log('Dirección creada exitosamente:', mensajeRespuesta);

            // Buscar la dirección recién creada
            const direcciones = await DireccionService.getAll();
            const direccionCreada = direcciones.find(dir =>
                dir.calle === direccionData.calle &&
                dir.numero === direccionData.numero &&
                dir.idComuna === direccionData.idComuna
            );

            if (direccionCreada && direccionCreada.idDireccion) {
                console.log('ID de dirección obtenido:', direccionCreada.idDireccion);
                return direccionCreada.idDireccion;
            } else {
                throw new Error('No se pudo obtener el ID de la dirección creada');
            }
        } catch (error) {
            console.error('Error creando dirección:', error);
            throw new Error('No se pudo crear la dirección para el incidente');
        }
    };

    // Función auxiliar para obtener comunas de la región metropolitana
    const getComunasRM = useCallback((): Comuna[] => {
        return comunas.filter(comuna => {
            const region = regiones.find(r => r.idRegion === comuna.idRegion);
            return region?.identificacion === 'RM' ||
                region?.nombre.includes('Metropolitana') ||
                region?.nombre.includes('Santiago');
        });
    }, [comunas, regiones]);

    const handleDeleteIncident = async (id: number): Promise<void> => {
        if (window.confirm("¿Estás seguro de que quieres eliminar este incidente?")) {
            setIsLoading(true);
            try {
                await IncidenteService.eliminarIncidente(id);
                await loadIncidents();
                setExpandedIncident(null);
                setEditingIncident(null);
                alert("🗑️ Incidente eliminado correctamente");
            } catch (error) {
                console.error('Error al eliminar incidente:', error);
                alert('Error al eliminar incidente. Por favor, intenta nuevamente.');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleEditIncident = (id: number): void => {
        const incident = incidents.find(inc => inc.idIncidente === id);
        if (incident) {
            // Convertir ID de estado a nombre para el formulario
            const getEstadoNombre = (idEstado: number): string => {
                const estados = {
                    1: 'En progreso',
                    2: 'Localizado',
                    3: 'Cerrado'
                };
                return estados[idEstado as keyof typeof estados] || 'En progreso';
            };

            setEditingIncident(id);
            setEditForm({
                title: incident.titulo,
                description: incident.detalle,
                location: incident.direccionCompletaIncidente
                    ? IncidenteGeolocalizacionService.formatearDireccion(incident.direccionCompletaIncidente)
                    : "",
                type: incident.tipoIncidente.idTipoIncidente.toString(),
                status: getEstadoNombre(incident.idEstadoIncidente || 1), // ← CORREGIDO
                imageUrl: incident.imagenUrl || DefaultIncidente
            });
            setExpandedIncident(id);
        }
    };


    const handleSaveIncident = async (id: number): Promise<void> => {
        if (!editForm.description || !editForm.type || !editForm.title) {
            alert('Por favor, complete los campos requeridos');
            return;
        }

        setIsLoading(true);
        try {
            // Convertir estado a ID numérico
            const getEstadoId = (estado: string): number => {
                const estadosMap: { [key: string]: number } = {
                    'En progreso': 1,
                    'Localizado': 2,
                    'Cerrado': 3
                };
                return estadosMap[estado] || 1;
            };

            const incidenteData: IncidenteUpdateFrontend = {
                titulo: editForm.title,
                detalle: editForm.description,
                tipoIncidenteId: parseInt(editForm.type),
                idEstadoIncidente: getEstadoId(editForm.status), // ← CORREGIDO: usar ID numérico
                imagenUrl: editForm.imageUrl
            };

            console.log('Actualizando incidente con datos:', incidenteData);
            await IncidenteService.actualizarIncidente(id, incidenteData as any);

            await loadIncidents();
            setEditingIncident(null);
            setExpandedIncident(null);

            setEditForm({
                title: "",
                description: "",
                location: "",
                type: "",
                status: "",
                imageUrl: ""
            });

            alert("Incidente actualizado correctamente");
        } catch (error) {
            console.error('Error al actualizar incidente:', error);
            alert('Error al actualizar incidente. Por favor, intenta nuevamente.');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusClass = (status: string): string => {
        const statusMap: { [key: string]: string } = {
            'en progreso': 'estado-progreso',
            'localizado': 'estado-localizado',
            'cerrado': 'estado-cerrado'
        };
        return statusMap[status.toLowerCase()] || 'estado-default';
    };

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

    const formatearUbicacionTabla = (incident: IncidenteFrontendConGeolocalizacion): string => {
        if (!incident.direccionCompletaIncidente) {
            return 'Ubicación no disponible';
        }

        const { calle, numero, comuna } = incident.direccionCompletaIncidente;

        // Manejar casos donde la comuna no está disponible
        const nombreComuna = comuna?.nombre || 'Comuna no disponible';

        return `${calle} ${numero}, ${nombreComuna}`;
    };

    if (isLoading) {
        return (
            <div className={styles.cuerpo}>
                <div className={styles['loading-container']}>
                    <div className={styles['loading-spinner']}></div>
                    <p>
                        {isLoadingGeolocalizacion || isLoadingTipos
                            ? 'Cargando datos del sistema...'
                            : 'Cargando incidentes...'
                        }
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.cuerpo}>
            <section className={styles['contenedor-incidentes']}>
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
                        data-testid="btn-nuevo-incidente"
                        className={`${styles['btn-primario']} ${styles['btn-grande']}`}
                        onClick={() => setShowForm(true)}
                        disabled={showForm || isLoadingTipos || isLoadingGeolocalizacion}
                    >
                        Reportar Nuevo Incidente<TiPlus />
                    </button>
                </header>

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
                                            title: "",
                                            description: "",
                                            calle: "",
                                            numero: "",
                                            villa: "",
                                            complemento: "",
                                            idComuna: "",
                                            imageUrl: ""
                                        });
                                    }}
                                >
                                    ✕
                                </button>
                            </div>

                            <form role="form" onSubmit={handleSubmitIncident} className={styles['formulario-incidente']}>
                                <div className={styles['grid-form']}>

                                    {/* NUEVO CAMPO TÍTULO */}
                                    <div className={`${styles['form-group']} ${styles['full-width']}`}>
                                        <label htmlFor="title" className={styles['form-label']}>
                                            Título del Incidente *
                                        </label>
                                        <input
                                            type="text"
                                            id="title"
                                            value={newIncident.title}
                                            onChange={(e) => handleInputChange(e, 'new')}
                                            placeholder="Ej: Incendio en edificio residencial"
                                            className={styles['form-input']}
                                            required
                                            minLength={5}
                                        />
                                        <small className={styles['form-help']}>
                                            Describe brevemente el incidente (mínimo 5 caracteres)
                                        </small>
                                    </div>

                                    <div className={styles['form-group']}>
                                        <label htmlFor="type" className={styles['form-label']}>
                                            Tipo de Incidente *
                                        </label>
                                        <select
                                            id="type"
                                            value={newIncident.type}
                                            onChange={(e) => handleInputChange(e, 'new')}
                                            className={styles['form-input']}
                                            required
                                            disabled={isLoadingTipos}
                                        >
                                            <option value="">Seleccione un tipo</option>
                                            {tiposIncidente.map(tipo => (
                                                <option key={tipo.idTipoIncidente} value={tipo.idTipoIncidente}>
                                                    {tipo.nombre}
                                                </option>
                                            ))}
                                        </select>
                                        {isLoadingTipos && <small>Cargando tipos...</small>}
                                    </div>

                                    <div className={styles['form-group']}>
                                        <label htmlFor="calle" className={styles['form-label']}>
                                            Calle *
                                        </label>
                                        <input
                                            type="text"
                                            id="calle"
                                            value={newIncident.calle}
                                            onChange={(e) => handleInputChange(e, 'new')}
                                            placeholder="Nombre de la calle"
                                            className={styles['form-input']}
                                            required
                                        />
                                    </div>

                                    <div className={styles['form-group']}>
                                        <label htmlFor="numero" className={styles['form-label']}>
                                            Número *
                                        </label>
                                        <input
                                            type="text"
                                            id="numero"
                                            value={newIncident.numero}
                                            onChange={(e) => handleInputChange(e, 'new')}
                                            placeholder="Número"
                                            className={styles['form-input']}
                                            required
                                        />
                                    </div>

                                    <div className={styles['form-group']}>
                                        <label htmlFor="villa" className={styles['form-label']}>
                                            Villa/Población
                                        </label>
                                        <input
                                            type="text"
                                            id="villa"
                                            value={newIncident.villa}
                                            onChange={(e) => handleInputChange(e, 'new')}
                                            placeholder="Opcional"
                                            className={styles['form-input']}
                                        />
                                    </div>

                                    <div className={styles['form-group']}>
                                        <label htmlFor="complemento" className={styles['form-label']}>
                                            Complemento
                                        </label>
                                        <input
                                            type="text"
                                            id="complemento"
                                            value={newIncident.complemento}
                                            onChange={(e) => handleInputChange(e, 'new')}
                                            placeholder="Departamento, block, etc."
                                            className={styles['form-input']}
                                        />
                                    </div>

                                    <div className={styles['form-group']}>
                                        <label htmlFor="idComuna" className={styles['form-label']}>
                                            Comuna *
                                        </label>
                                        <select
                                            id="idComuna"
                                            value={newIncident.idComuna}
                                            onChange={(e) => handleInputChange(e, 'new')}
                                            className={styles['form-input']}
                                            required
                                            disabled={isLoadingGeolocalizacion}
                                        >
                                            <option value="">Seleccione una comuna</option>
                                            {isLoadingGeolocalizacion ? (
                                                <option disabled>Cargando comunas...</option>
                                            ) : comunas.length > 0 ? (
                                                getComunasRM().map(comuna => (
                                                    <option key={comuna.idComuna} value={comuna.idComuna}>
                                                        {comuna.nombre}
                                                    </option>
                                                ))
                                            ) : (
                                                <>
                                                    <option value="1">Santiago</option>
                                                    <option value="2">Providencia</option>
                                                    <option value="3">Las Condes</option>
                                                    <option value="4">Ñuñoa</option>
                                                </>
                                            )}
                                        </select>

                                        {isLoadingGeolocalizacion && (
                                            <small className={styles['loading-text']}>Cargando comunas...</small>
                                        )}

                                        {comunas.length === 0 && !isLoadingGeolocalizacion && (
                                            <small className={styles['warning-text']}>
                                                No se pudieron cargar las comunas. Usando lista local.
                                            </small>
                                        )}
                                    </div>

                                    <div className={`${styles['form-group']} ${styles['full-width']}`}>
                                        <label htmlFor="description" className={styles['form-label']}>
                                            Descripción Detallada *
                                        </label>
                                        <textarea
                                            id="description"
                                            data-testid="incident-description"
                                            value={newIncident.description}
                                            onChange={(e) => handleInputChange(e, 'new')}
                                            placeholder="Describe el incidente con todos los detalles relevantes..."
                                            className={styles['form-textarea']}
                                            rows={4}
                                            required
                                        />
                                    </div>

                                    <div className={`${styles['form-group']} ${styles['full-width']}`}>
                                        <label className={styles['form-label']}>
                                            Imagen del Incidente
                                        </label>
                                        <div className={styles['image-upload-section']}>
                                            {newIncident.imageUrl ? (
                                                <div className={styles['image-preview-container']}>
                                                    <img
                                                        src={newIncident.imageUrl}
                                                        alt="Vista previa"
                                                        className={styles['image-preview']}
                                                    />
                                                    <div className={styles['image-actions']}>
                                                        <button
                                                            type="button"
                                                            className={styles['btn-secundario']}
                                                            onClick={() => openImageModal('new', newIncident.imageUrl)}
                                                        >
                                                            Cambiar Imagen
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className={styles['btn-peligro']}
                                                            onClick={() => setNewIncident(prev => ({ ...prev, imageUrl: "" }))}
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className={styles['btn-secundario']}
                                                    onClick={() => openImageModal('new')}
                                                >
                                                    Subir Imagen
                                                </button>
                                            )}
                                        </div>
                                        <small className={styles['form-help']}>
                                            Agrega una imagen para mejor identificación del incidente
                                        </small>
                                    </div>
                                </div>

                                <div className={styles['form-actions']}>
                                    <button
                                        data-testid="submit-incident"
                                        type="submit"
                                        className={styles['btn-primario']}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Enviando...' : 'Enviar Reporte'}
                                    </button>
                                    <button
                                        type="button"
                                        className={styles['btn-secundario']}
                                        onClick={() => {
                                            setShowForm(false);
                                            setNewIncident({
                                                title: "",
                                                type: "",
                                                description: "",
                                                calle: "",
                                                numero: "",
                                                villa: "",
                                                complemento: "",
                                                idComuna: "",
                                                imageUrl: ""
                                            });
                                        }}
                                        disabled={isLoading}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <div className={styles['panel-estadisticas']}>
                    <div className={styles.estadistica}>
                        <span data-testid="estadistica-numero" className={styles['estadistica-numero']}>{incidents.length}</span>
                        <span data-testid="estadistica-label" className={styles['estadistica-label']}>Total Incidentes</span>
                    </div>
                    <div className={styles.estadistica}>
                        <span data-testid="estadistica-numero" className={styles['estadistica-numero']}>
                            {incidents.filter(i => i.estadoIncidente === 'En progreso').length}
                        </span>
                        <span className={styles['estadistica-label']}>En Progreso</span>
                    </div>
                    <div className={styles.estadistica}>
                        <span data-testid="estadistica-numero" className={styles['estadistica-numero']}>
                            {incidents.filter(i => i.estadoIncidente === 'Cerrado').length}
                        </span>
                        <span className={styles['estadistica-label']}>Resueltos</span>
                    </div>
                </div>

                <div className={styles['contenedor-tabla']}>
                    <div className={styles['tabla-header']}>
                        <h2>Lista de Incidentes Activos</h2>
                        <button
                            className={`${styles['btn-secundario']} ${styles['btn-pequeno']}`}
                            onClick={loadIncidents}
                            disabled={isLoading}
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
                                        <th>Título</th> 
                                        <th>Ubicación</th>
                                        <th>Estado</th>
                                        <th>Fecha/Hora</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {incidents.map(incident => (
                                        <React.Fragment key={incident.idIncidente}>
                                            <tr className={`${styles['fila-incidente']} ${expandedIncident === incident.idIncidente ? styles.expandida : ''}`}>
                                                <td className={styles['celda-id']}>{incident.idIncidente}</td>
                                                <td className={styles['celda-tipo']}>
                                                    <span className={styles['icono-tipo']}>
                                                        {getIncidentIcon(incident.tipoIncidente.nombre)}
                                                    </span>
                                                    {incident.tipoIncidente.nombre}
                                                </td>
                                                <td className={styles['celda-titulo']}> 
                                                    <strong>{incident.titulo}</strong>
                                                </td>
                                                <td className={styles['celda-ubicacion']}>
                                                    <div className={styles['ubicacion-completa']}>
                                                        <TbMapPin className={styles['icono-ubicacion']} />
                                                        {formatearUbicacionTabla(incident)}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`${styles['badge-estado']} ${styles[getStatusClass(incident.estadoIncidente || 'En progreso')]}`}>
                                                        {incident.estadoIncidente || 'Indeterminado'}
                                                    </span>
                                                </td>
                                                <td className={styles['celda-fecha']}>{incident.fechaRegistro}</td>
                                                <td className={styles['celda-acciones']}>
                                                    <div className={styles['contenedor-acciones']}>
                                                        <button
                                                            className={`${styles['btn-accion']} ${styles['btn-info']}`}
                                                            onClick={() => setExpandedIncident(
                                                                expandedIncident === incident.idIncidente ? null : incident.idIncidente
                                                            )}
                                                            title="Ver detalles"
                                                        >
                                                            {expandedIncident === incident.idIncidente ? <TiArrowSortedUp /> : <TiArrowSortedDown />}
                                                        </button>
                                                        <button
                                                            className={`${styles['btn-accion']} ${styles['btn-warning']}`}
                                                            onClick={() => handleEditIncident(incident.idIncidente)}
                                                            title="Editar incidente"
                                                        >
                                                            Editar
                                                            <RiEditFill />
                                                        </button>
                                                        <button
                                                            className={`${styles['btn-accion']} ${styles['btn-danger']}`}
                                                            onClick={() => handleDeleteIncident(incident.idIncidente)}
                                                            title="Eliminar incidente"
                                                        >
                                                            Eliminar
                                                            <BsTrashFill />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>

                                            {expandedIncident === incident.idIncidente && (
                                                <tr className={styles['fila-detalles']}>
                                                    <td colSpan={6}>
                                                        <div className={styles['contenedor-detalles']}>
                                                            {editingIncident === incident.idIncidente ? (
                                                                <div className={styles['formulario-edicion']}>
                                                                    <h4>{`✏️Editando Incidente #${incident.idIncidente}`}</h4>
                                                                    <div className={`${styles['grid-form']} ${styles['full-width']}`}>

                                                                        <div className={`${styles['form-group']} ${styles['full-width']}`}>
                                                                            <label htmlFor="edit-title" className={styles['form-label']}>Título del Incidente</label>
                                                                            <input
                                                                                type="text"
                                                                                id="edit-title"
                                                                                value={editForm.title}
                                                                                onChange={(e) => handleInputChange(e, 'edit')}
                                                                                className={styles['form-input']}
                                                                                required
                                                                                minLength={5}
                                                                            />
                                                                        </div>

                                                                        <div className={styles['form-group']}>
                                                                            <label htmlFor="edit-type" className={styles['form-label']}>Tipo de Incidente</label>
                                                                            <select
                                                                                id="edit-type"
                                                                                data-testid="incident-type"
                                                                                value={editForm.type}
                                                                                onChange={(e) => handleInputChange(e, 'edit')}
                                                                                className={styles['form-input']}
                                                                                required
                                                                                disabled={isLoadingTipos}
                                                                            >
                                                                                <option value="">Seleccione un tipo</option>
                                                                                {tiposIncidente.map(tipo => (
                                                                                    <option key={tipo.idTipoIncidente} value={tipo.idTipoIncidente}>
                                                                                        {tipo.nombre}
                                                                                    </option>
                                                                                ))}
                                                                            </select>
                                                                        </div>

                                                                        <div className={styles['form-group']}>
                                                                            <label htmlFor="edit-status" className={styles['form-label']}>Estado</label>
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

                                                                        <div className={`${styles['form-group']} ${styles['full-width']}`}>
                                                                            <label htmlFor="edit-description" className={styles['form-label']}>
                                                                                Descripción Detallada
                                                                            </label>
                                                                            <textarea
                                                                                id="edit-description"
                                                                                data-testid="edit-description-textarea"
                                                                                value={editForm.description}
                                                                                onChange={(e) => handleInputChange(e, 'edit')}
                                                                                className={styles['form-textarea']}
                                                                                rows={3}
                                                                                required
                                                                            />
                                                                        </div>

                                                                        <div className={`${styles['form-group']} ${styles['full-width']}`}>
                                                                            <label className={styles['form-label']}>
                                                                                Imagen del Incidente
                                                                            </label>
                                                                            <div className={styles['image-upload-section']}>
                                                                                {editForm.imageUrl ? (
                                                                                    <div className={styles['image-preview-container']}>
                                                                                        <img
                                                                                            src={editForm.imageUrl}
                                                                                            alt="Vista previa"
                                                                                            className={styles['image-preview']}
                                                                                        />
                                                                                        <div className={styles['image-actions']}>
                                                                                            <button
                                                                                                type="button"
                                                                                                className={styles['btn-secundario']}
                                                                                                onClick={() => openImageModal('edit', editForm.imageUrl)}
                                                                                            >
                                                                                                Cambiar Imagen
                                                                                            </button>
                                                                                            <button
                                                                                                type="button"
                                                                                                className={styles['btn-peligro']}
                                                                                                onClick={() => setEditForm(prev => ({ ...prev, imageUrl: "" }))}
                                                                                            >
                                                                                                Eliminar
                                                                                            </button>
                                                                                        </div>
                                                                                    </div>
                                                                                ) : (
                                                                                    <button
                                                                                        type="button"
                                                                                        className={styles['btn-secundario']}
                                                                                        onClick={() => openImageModal('edit')}
                                                                                    >
                                                                                        Subir Imagen
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className={styles['acciones-edicion']}>
                                                                        <button
                                                                            data-testid="save-changes"
                                                                            className={styles['btn-primario']}
                                                                            onClick={() => handleSaveIncident(incident.idIncidente)}
                                                                            disabled={isLoading}
                                                                        >
                                                                            {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                                                                        </button>
                                                                        <button
                                                                            className={styles['btn-secundario']}
                                                                            onClick={() => setEditingIncident(null)}
                                                                            disabled={isLoading}
                                                                        >
                                                                            Cancelar
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className={styles['vista-detalles']}>
                                                                    <div className={styles['detalles-contenido']}>
                                                                        <div className={styles['detalles-texto']}>

                                                                            <h4 className={styles['titulo-detalle']}>{incident.titulo}</h4>
                                                                            <h6>Descripción Completa</h6>
                                                                            <p data-testid="incident-description-text">{incident.detalle}</p>

                                                                            <div className={styles['info-adicional']}>
                                                                                <div className={styles['info-item']}>
                                                                                    <strong>🏷️ Título:</strong>
                                                                                    <span>{incident.titulo}</span>
                                                                                </div>
                                                                                
                                                                                <div className={styles['info-item']}>
                                                                                    <strong>📍 Ubicación:</strong>
                                                                                    <span>
                                                                                        {incident.direccionCompletaIncidente ? (
                                                                                            <div className={styles['direccion-completa']}>
                                                                                                <div>{incident.direccionCompletaIncidente.calle} {incident.direccionCompletaIncidente.numero}</div>
                                                                                                {incident.direccionCompletaIncidente.villa && (
                                                                                                    <div>Villa: {incident.direccionCompletaIncidente.villa}</div>
                                                                                                )}
                                                                                                {incident.direccionCompletaIncidente.complemento && (
                                                                                                    <div>Complemento: {incident.direccionCompletaIncidente.complemento}</div>
                                                                                                )}
                                                                                                
                                                                                            </div>
                                                                                        ) : (
                                                                                            'Ubicación no disponible'
                                                                                        )}
                                                                                    </span>
                                                                                </div>
                                                                                <div className={styles['info-item']}>
                                                                                    <strong>🕐 Reportado:</strong>
                                                                                    <span>{incident.fechaRegistro}</span>
                                                                                </div>
                                                                                <div className={styles['info-item']}>
                                                                                    <strong>🏷️ Tipo:</strong>
                                                                                    <span>{incident.tipoIncidente.nombre}</span>
                                                                                </div>
                                                                                <div className={styles['info-item']}>
                                                                                    <strong>📊 Estado:</strong>
                                                                                    <span className={`${styles['badge-estado']} ${styles[getStatusClass(incident.estadoIncidente || 'En progreso')]}`}>
                                                                                        {incident.estadoIncidente || 'En progreso'}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {incident.imagenUrl && incident.imagenUrl !== DefaultIncidente ? (
                                                                            <div className={styles['detalles-imagen']}>
                                                                                <h4>Evidencia Visual</h4>
                                                                                <div className={styles['image-preview-container']}>
                                                                                    <img
                                                                                        src={incident.imagenUrl}
                                                                                        alt={`Imagen del incidente ${incident.idIncidente}`}
                                                                                        className={styles['image-preview']}
                                                                                        onError={(e) => {
                                                                                            (e.target as HTMLImageElement).src = DefaultIncidente;
                                                                                        }}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            <div className={styles['detalles-imagen']}>
                                                                                <h4>Evidencia Visual</h4>
                                                                                <div className={styles['image-preview-container']}>
                                                                                    <img
                                                                                        src={DefaultIncidente}
                                                                                        alt="Imagen por defecto del incidente"
                                                                                        className={styles['image-preview']}
                                                                                    />
                                                                                    <div className={styles['image-placeholder']}>
                                                                                        <small>No hay imagen disponible</small>
                                                                                    </div>
                                                                                </div>
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

            <ImageUploadModal
                isOpen={isImageModalOpen}
                onClose={() => {
                    setIsImageModalOpen(false);
                    clearUploadedImage();
                }}
                onSave={(imageUrl) => {
                    // Esta función se llama cuando se hace clic en "Guardar Imagen"
                    if (imageUploadContext === 'new') {
                        setNewIncident(prev => ({
                            ...prev,
                            imageUrl: imageUrl || ""
                        }));
                    } else {
                        setEditForm(prev => ({
                            ...prev,
                            imageUrl: imageUrl || ""
                        }));
                    }
                    setIsImageModalOpen(false);
                    clearUploadedImage();
                }}
                currentImage={currentImageUrl}
                isLoading={isUploading}
                uploadError={uploadError}
                onImageUpload={handleFileUpload}
                onImageDelete={handleFileDelete}
                onImageReplace={handleFileUpload}
            />
        </div>
    );
};

export default Incidentes;