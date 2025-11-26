import React, { useState, useEffect, useCallback } from "react";
import styles from './Incidentes.module.css';

import DefaultIncidente from "../assets/default_incident.png";

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
import { DireccionService } from "../service/services/geolocalizacion/DireccionService";
import { ComunaService } from "../service/services/geolocalizacion/ComunaService";
import { RegionService } from "../service/services/geolocalizacion/RegionService";
import { FotoService } from "../service/services/registros/FotoService";
import { CoordenadasService } from "../service/services/geolocalizacion/CoordenadaService";

import type {
    IncidenteFrontendConGeolocalizacion,
    EditForm
} from "../types/IncidenteType";
import type { Direccion, Comuna, Region } from "../types/GeolocalizacionType";

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
    const [isLoadingGeografia, setIsLoadingGeografia] = useState<boolean>(false);

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
        isModalOpen: isImageModalOpenHook,
        currentImageUrl: hookCurrentImageUrl,
        temporaryImageUrl: hookTemporaryImageUrl,
        isLoading: isImageLoading,
        isUploading: isImageUploading,
        openModal: openImageModalHook,
        closeModal: closeImageModalHook,
        uploadError: imageUploadError,
        handleImageSelect,
        handleImageSave: handleImageSaveHook,
        handleImageDelete,
        clearTemporaryImage,
        temporaryFile: hookTemporaryFile,
    } = useImageUpload({
        incidentId: imageUploadContext === 'edit' && editingIncident ? editingIncident : undefined,
        onImageUpdated: (newUrl) => {
            if (imageUploadContext === 'new') {
                setNewIncident(prev => ({ ...prev, imageUrl: newUrl || "" }));
            } else {
                setEditForm(prev => ({ ...prev, imageUrl: newUrl || "" }));
            }
        }
    });

    const loadDatosGeograficos = useCallback(async (): Promise<void> => {
        setIsLoadingGeografia(true);
        try {
            console.log('Cargando datos geográficos...');

            const [comunasData, regionesData] = await Promise.all([
                ComunaService.getAll().catch(error => {
                    console.error('Error cargando comunas:', error);
                    return [];
                }),
                RegionService.getAll().catch(error => {
                    console.error('Error cargando regiones:', error);
                    return [];
                })
            ]);

            console.log('Comunas recibidas:', comunasData.length);
            console.log('Regiones recibidas:', regionesData.length);

            // Log detallado de las primeras comunas
            if (comunasData.length > 0) {
                console.log('Primeras 5 comunas:', comunasData.slice(0, 5).map(c => ({
                    id: c.idComuna,
                    nombre: c.nombre,
                    regionId: c.region?.idRegion
                })));
            }

            setComunas(comunasData);
            setRegiones(regionesData);

        } catch (error) {
            console.error('Error crítico al cargar datos geográficos:', error);
            setComunas([]);
            setRegiones([]);
        } finally {
            setIsLoadingGeografia(false);
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

    // Función simplificada para obtener dirección básica
    const obtenerDireccionBasica = async (idDireccion: number): Promise<string | null> => {
        try {
            if (!idDireccion || idDireccion <= 0) {
                console.warn('ID de dirección inválido:', idDireccion);
                return null;
            }

            console.log(`Obteniendo dirección básica para ID: ${idDireccion}`);

            const direccion = await DireccionService.getById(idDireccion);
            if (!direccion) {
                console.warn(`No se encontró dirección con ID: ${idDireccion}`);
                return null;
            }

            // Formatear dirección básica: calle + numero
            const direccionBasica = `${direccion.calle || ''} ${direccion.numero || ''}`.trim();
            console.log(`✅ Dirección básica obtenida: ${direccionBasica}`);

            return direccionBasica || 'Dirección no disponible';

        } catch (error) {
            console.error(`❌ Error obteniendo dirección ${idDireccion}:`, error);
            return null;
        }
    };

    const obtenerUrlImagenBackend = (incidente: any): string => {
        // Si no hay incidente o no tiene ID, usar imagen por defecto
        if (!incidente || !incidente.idIncidente || incidente.idIncidente <= 0) {
            return getDefaultImageByType(incidente?.tipoIncidente?.nombre || 'default');
        }
        // El backend espera: http://localhost:8080/api-registros/v1/fotos/7/archivo
        const urlPorId = FotoService.obtenerUrlPublicaPorId(incidente.idIncidente);
        console.log(`🖼️ URL generada para incidente ${incidente.idIncidente}:`, urlPorId);

        // Si hay una imagenUrl específica y es diferente del ID del incidente
        if (incidente.imagenUrl && incidente.imagenUrl.trim() !== '' && incidente.imagenUrl !== incidente.idIncidente.toString()) {
            // Si ya es una URL completa
            if (incidente.imagenUrl.startsWith('http') || incidente.imagenUrl.startsWith('data:')) {
                console.log(`📸 Usando imagenUrl directa:`, incidente.imagenUrl);
                return incidente.imagenUrl;
            }

            // Si es un ID numérico diferente
            if (/^\d+$/.test(incidente.imagenUrl)) {
                const urlAlternativa = FotoService.obtenerUrlPublicaPorId(parseInt(incidente.imagenUrl));
                console.log(`📸 Usando imagenUrl como ID alternativo:`, urlAlternativa);
                return urlAlternativa;
            }
        }

        // Por defecto, usar la URL construida con el ID del incidente
        return urlPorId;
    };

    const loadIncidents = useCallback(async (): Promise<void> => {
        setIsLoading(true);
        try {
            console.log('🔄 Cargando incidentes...');

            const incidentesBackend = await IncidenteService.listarIncidentes();
            console.log('📊 Incidentes cargados del backend:', incidentesBackend);

            if (!incidentesBackend || incidentesBackend.length === 0) {
                console.log('📭 No hay incidentes para mostrar');
                setIncidents([]);
                return;
            }

            // Enriquecer incidentes
            const incidentesEnriquecidos: IncidenteFrontendConGeolocalizacion[] = await Promise.all(
                incidentesBackend.map(async (incidente) => {
                    try {
                        let direccionTexto = 'Ubicación no disponible';

                        // Obtener información de dirección básica
                        if (incidente.idDireccion && incidente.idDireccion > 0) {
                            try {
                                const direccionBasica = await obtenerDireccionBasica(incidente.idDireccion);
                                if (direccionBasica) {
                                    direccionTexto = direccionBasica;
                                }
                            } catch (error) {
                                console.error(`❌ Error obteniendo dirección ${incidente.idDireccion}:`, error);
                            }
                        }

                        // ✅ CORREGIDO: Usar la función mejorada para obtener URL de imagen
                        const imagenUrlFinal = obtenerUrlImagenBackend(incidente);

                        console.log(`📸 Imagen final para incidente ${incidente.idIncidente}:`, {
                            imagenUrlFinal,
                            imagenUrlOriginal: incidente.imagenUrl,
                            tipo: incidente.tipoIncidente.nombre
                        });

                        const incidenteEnriquecido: IncidenteFrontendConGeolocalizacion = {
                            idIncidente: incidente.idIncidente,
                            titulo: incidente.titulo,
                            detalle: incidente.detalle,
                            fechaRegistro: incidente.fechaRegistro,
                            tipoIncidente: incidente.tipoIncidente,
                            estadoIncidente: getEstadoFromId(incidente.idEstadoIncidente),
                            imagenUrl: imagenUrlFinal, // ✅ URL corregida
                            direccionCompletaIncidente: {
                                idDireccion: incidente.idDireccion || 0,
                                calle: incidente.direccion || '',
                                numero: '',
                                comuna: {
                                    idComuna: 0,
                                    nombre: '',
                                    idRegion: 0,
                                    region: {
                                        idRegion: 0,
                                        nombre: '',
                                        identificacion: ''
                                    }
                                }
                            },
                            direccionTexto: direccionTexto,
                            idEstadoIncidente: incidente.idEstadoIncidente,
                            idRegion: 0
                        };

                        return incidenteEnriquecido;
                    } catch (error) {
                        console.error(`❌ Error procesando incidente ${incidente.idIncidente}:`, error);
                        // En caso de error, retornar con imagen por defecto
                        const incidenteBasico: IncidenteFrontendConGeolocalizacion = {
                            idIncidente: incidente.idIncidente,
                            titulo: incidente.titulo,
                            detalle: incidente.detalle,
                            fechaRegistro: incidente.fechaRegistro,
                            tipoIncidente: incidente.tipoIncidente,
                            estadoIncidente: getEstadoFromId(incidente.idEstadoIncidente),
                            imagenUrl: getDefaultImageByType(incidente.tipoIncidente.nombre), // Imagen por defecto
                            direccionCompletaIncidente: {
                                idDireccion: 0,
                                calle: '',
                                numero: '',
                                comuna: {
                                    idComuna: 0,
                                    nombre: '',
                                    idRegion: 0,
                                    region: {
                                        idRegion: 0,
                                        nombre: '',
                                        identificacion: ''
                                    }
                                }
                            },
                            direccionTexto: 'Ubicación no disponible',
                            idEstadoIncidente: incidente.idEstadoIncidente,
                            idRegion: 0
                        };
                        return incidenteBasico;
                    }
                })
            );

            const sortedIncidents = incidentesEnriquecidos.sort((a, b) => b.idIncidente - a.idIncidente);
            setIncidents(sortedIncidents);
            console.log('✅ Incidentes cargados exitosamente:', sortedIncidents.length);

        } catch (error) {
            console.error('❌ Error al cargar incidentes:', error);
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

            'Incendio': "../assets/incendio.png",
            'Explosión': "../assets/default_incident.png",
            'Accidente Vehicular': "../assets/accidente.png",
            'Fuga de gas': "../assets/fuga-gas.png",
            'Derrumbe': "../assets/derrumbe.png",
            'Derrame químico': "../assets/derrame-quimico.png",
            'Desplome': "../assets/default_incident.png"
        };
        return imageMap[tipo] || "../assets/default_incident.png";
    };


    // Cargar datos en el orden correcto
    useEffect(() => {
        const loadData = async () => {
            try {
                console.log('🔃 Iniciando carga de datos...');

                // 1. Cargar datos geográficos
                await loadDatosGeograficos();

                // 2. Cargar tipos de incidente
                await loadTiposIncidente();

                // 3. Cargar incidentes
                await loadIncidents();

                console.log('✅ Todos los datos cargados exitosamente');
            } catch (error) {
                console.error('❌ Error loading initial data:', error);
            }
        };

        loadData();
    }, []);

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

    const handleImageSaveAdapted = async (file: File): Promise<number> => {
        try {
            console.log('🔄 Subiendo imagen...');
            console.log('📝 Contexto:', imageUploadContext);
            console.log('🆔 Editing Incident ID:', editingIncident);

            // Si estamos editando, usar el ID del incidente existente
            if (editingIncident) {
                const imageUrl = await handleImageSaveHook(file);
                console.log('✅ Imagen subida, URL obtenida:', imageUrl);

                // Forzar recarga para ver cambios
                setTimeout(() => {
                    loadIncidents();
                }, 500);

                return editingIncident;
            }

            // Para nuevo incidente, generar ID temporal
            const tempId = Date.now() % 1000000;
            console.log('🆔 ID temporal generado:', tempId);
            return tempId;

        } catch (error) {
            console.error('❌ Error subiendo imagen:', error);
            throw error;
        }
    };



    const handleImageSave = async (imageUrl: string): Promise<void> => {
        if (imageUploadContext === 'new') {
            setNewIncident(prev => ({
                ...prev,
                imageUrl: imageUrl
            }));
        } else if (imageUploadContext === 'edit' && editingIncident) {
            try {
                setIsLoading(true);

                // Usar el método que SÍ existe en tu Service
                await IncidenteService.actualizarParcialIncidente(editingIncident, {
                    imagenUrl: imageUrl
                });

                setEditForm(prev => ({
                    ...prev,
                    imageUrl: imageUrl
                }));

                // 🔄 ACTUALIZAR CRÍTICO: Recargar los incidentes para reflejar el cambio
                await loadIncidents();

                alert("Imagen actualizada correctamente");
            } catch (error) {
                console.error('Error al actualizar imagen:', error);
                alert('Error al actualizar imagen. Por favor, intenta nuevamente.');
            } finally {
                setIsLoading(false);
            }
        }
    };


    const openImageModal = (context: 'new' | 'edit', currentImage: string = ""): void => {
        setImageUploadContext(context);
        // No necesitas setCurrentImageUrl porque el hook maneja esto
        openImageModalHook(); // Usar la función del hook
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

            // Usar PATCH para actualización parcial
            const camposActualizados: any = {
                titulo: editForm.title,
                detalle: editForm.description,
                tipoIncidenteId: parseInt(editForm.type),
                idEstadoIncidente: getEstadoId(editForm.status)
            };

            // Solo incluir imagenUrl si ha cambiado
            if (editForm.imageUrl && editForm.imageUrl !== incidents.find(inc => inc.idIncidente === id)?.imagenUrl) {
                camposActualizados.imagenUrl = editForm.imageUrl;
            }

            console.log('Actualizando incidente con PATCH:', camposActualizados);

            if (Object.keys(camposActualizados).length === 1 && camposActualizados.imagenUrl) {
                // Si solo se actualiza la imagen, usar el endpoint específico
                await IncidenteService.actualizarFotoIncidente(id, camposActualizados.imagenUrl);
            } else {
                // Para múltiples campos, usar PATCH general
                await IncidenteService.actualizarParcialIncidente(id, camposActualizados);
            }

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

        return true;
    };

    const crearCoordenadasPorDefecto = async (): Promise<number | null> => {
        try {
            console.log('📍 Creando coordenadas por defecto...');

            // Coordenadas por defecto (Santiago centro)
            const coordenadasData = {
                latitud: -33.448889,
                longitud: -70.669265,
                precision: 100,
                fechaRegistro: new Date().toISOString()
            };

            console.log('📤 Enviando coordenadas al backend:', JSON.stringify(coordenadasData, null, 2));
            const respuesta = await CoordenadasService.create(coordenadasData);
            console.log('✅ Respuesta de coordenadas:', respuesta);
            console.log('✅ Tipo de respuesta:', typeof respuesta);

            // Manejar diferentes tipos de respuesta de manera segura
            let idCoordenadas: number | undefined;

            // Si la respuesta es un objeto
            if (respuesta && typeof respuesta === 'object') {
                // Usar type assertion para acceder a las propiedades
                const respuestaObj = respuesta as any;
                idCoordenadas = respuestaObj.idCoordenadas || respuestaObj.id;

                if (idCoordenadas) {
                    console.log('✅ ID de coordenadas del objeto:', idCoordenadas);
                    return idCoordenadas;
                }
            }

            // Si es string, intentar extraer ID
            if (typeof respuesta === 'string') {
                const idMatch = respuesta.match(/\d+/);
                if (idMatch) {
                    idCoordenadas = parseInt(idMatch[0]);
                    console.log('✅ ID de coordenadas extraído del string:', idCoordenadas);
                    return idCoordenadas;
                }
            }

            // Si no se pudo extraer el ID, buscar las coordenadas recién creadas
            console.log('🔍 Buscando coordenadas creadas...');
            await new Promise(resolve => setTimeout(resolve, 1000));

            const todasCoordenadas = await CoordenadasService.getAll();
            console.log('📍 Todas las coordenadas disponibles:', todasCoordenadas.length);

            if (todasCoordenadas.length > 0) {
                // Buscar la coordenada más reciente (última creada)
                const coordenadaMasReciente = todasCoordenadas.reduce((latest, current) => {
                    return (!latest || current.idCoordenadas > latest.idCoordenadas) ? current : latest;
                });

                console.log('📍 Coordenada más reciente encontrada:', coordenadaMasReciente.idCoordenadas);
                return coordenadaMasReciente.idCoordenadas;
            }

            console.warn('⚠️ No se pudieron crear o encontrar coordenadas');
            return null;

        } catch (error) {
            console.warn('⚠️ No se pudieron crear coordenadas:', error);
            return null;
        }
    };

    const crearDireccionYObtenerId = async (direccionData: {
        calle: string;
        numero: string;
        villa?: string;
        complemento?: string;
        idComuna: number;
    }): Promise<number> => {
        try {
            console.log('🔍 Datos de dirección recibidos:', direccionData);

            if (!comunas || comunas.length === 0) {
                throw new Error('No se han cargado las comunas.');
            }

            const comunaExiste = comunas.find(c => c.idComuna === direccionData.idComuna);
            if (!comunaExiste) {
                throw new Error(`Comuna no válida. ID: ${direccionData.idComuna}`);
            }

            console.log('📍 Comuna encontrada:', comunaExiste);

            // 1. PRIMERO CREAR LAS COORDENADAS en el backend
            let idCoordenadasCreado: number;
            try {
                // Generar coordenadas realistas
                const getCoordenadasPorComuna = (comuna: any) => {
                    const coordenadasComunas: { [key: number]: { lat: number, lng: number } } = {
                        3: { lat: -33.416, lng: -70.583 }, // Las Condes
                        10: { lat: -33.367, lng: -70.750 }, // Quilicura
                        // Agrega más comunas según necesites
                    };

                    const coords = coordenadasComunas[comuna.idComuna] || { lat: -33.448, lng: -70.669 };

                    return {
                        latitud: coords.lat + (Math.random() * 0.01 - 0.005),
                        longitud: coords.lng + (Math.random() * 0.01 - 0.005)
                    };
                };

                const coordenadas = getCoordenadasPorComuna(comunaExiste);

                // Crear coordenadas en el backend
                const coordenadasData = {
                    latitud: coordenadas.latitud,
                    longitud: coordenadas.longitud,
                    precision: 30,
                    fechaRegistro: new Date().toISOString().replace('Z', '')
                };

                console.log('📍 Creando coordenadas en backend:', coordenadasData);
                const respuestaCoordenadas = await CoordenadasService.create(coordenadasData);
                console.log('✅ Respuesta creación coordenadas:', respuestaCoordenadas);

                // Extraer el ID de las coordenadas creadas
                if (respuestaCoordenadas && typeof respuestaCoordenadas === 'object') {
                    idCoordenadasCreado = respuestaCoordenadas.idCoordenadas;
                } else if (typeof respuestaCoordenadas === 'string') {
                    const idMatch = respuestaCoordenadas.match(/\d+/);
                    idCoordenadasCreado = idMatch ? parseInt(idMatch[0]) : 0;
                } else {
                    // Si no podemos obtener el ID, buscar la coordenada más reciente
                    await new Promise(resolve => setTimeout(resolve, 500));
                    const todasCoordenadas = await CoordenadasService.getAll();
                    const coordenadaMasReciente = todasCoordenadas.reduce((latest, current) => {
                        return (!latest || current.idCoordenadas > latest.idCoordenadas) ? current : latest;
                    });
                    idCoordenadasCreado = coordenadaMasReciente.idCoordenadas;
                }

                console.log('✅ Coordenadas creadas con ID:', idCoordenadasCreado);

            } catch (error) {
                console.error('❌ Error creando coordenadas:', error);
                throw new Error('No se pudieron crear las coordenadas para la dirección');
            }

            // 2. LUEGO CREAR LA DIRECCIÓN con las coordenadas ya existentes
            const comunaCompleta = {
                idComuna: comunaExiste.idComuna,
                nombre: comunaExiste.nombre,
                codigoPostal: comunaExiste.codigoPostal || '0000000',
                region: comunaExiste.region || {
                    idRegion: 7,
                    nombre: 'Región Metropolitana de Santiago',
                    identificacion: 'RM'
                }
            };

            // 🎯 ESTRUCTURA CORRECTA - Usar coordenadas que ya existen en la BD
            const datosDireccion = {
                calle: direccionData.calle.trim(),
                numero: direccionData.numero.trim(),
                villa: direccionData.villa?.trim() || null,
                complemento: direccionData.complemento?.trim() || null,
                comuna: comunaCompleta,
                coordenadas: {
                    idCoordenadas: idCoordenadasCreado // ✅ ID que SÍ existe en la BD
                }
            };

            console.log('📤 Enviando dirección al backend con coordenadas existentes:', datosDireccion);
            const respuesta = await DireccionService.create(datosDireccion);
            console.log('✅ Respuesta del backend:', respuesta);

            const idDireccion = await extraerIdDeDireccion(respuesta, datosDireccion);
            console.log('✅ Dirección creada con ID:', idDireccion);
            return idDireccion;

        } catch (error) {
            console.error('❌ Error creando dirección:', error);
            throw new Error('No se pudo crear la dirección para el incidente: ' + (error as Error).message);
        }
    };

    const extraerIdDeDireccion = async (respuesta: any, datosOriginales: any): Promise<number> => {
        console.log('🔍 Procesando respuesta para extraer ID:', respuesta);

        // Si la respuesta es un objeto con idDireccion
        if (respuesta && typeof respuesta === 'object') {
            if (respuesta.idDireccion) {
                console.log('✅ ID del objeto respuesta:', respuesta.idDireccion);
                return respuesta.idDireccion;
            }

            // Si es un objeto de respuesta HTTP con data
            if (respuesta.data && respuesta.data.idDireccion) {
                console.log('✅ ID del objeto data:', respuesta.data.idDireccion);
                return respuesta.data.idDireccion;
            }
        }

        // Si es string, extraer ID numérico
        if (typeof respuesta === 'string') {
            const idMatch = respuesta.match(/\d+/);
            if (idMatch) {
                const idDireccion = parseInt(idMatch[0]);
                console.log('✅ ID extraído del mensaje:', idDireccion);
                return idDireccion;
            }
        }

        // Buscar la dirección recién creada como fallback
        console.log('🔍 Buscando dirección creada en el sistema...');
        await new Promise(resolve => setTimeout(resolve, 1500));

        try {
            const direcciones = await DireccionService.getAll();
            console.log(`📍 Total de direcciones en sistema: ${direcciones.length}`);

            // Buscar por calle y número
            const direccionCreada = direcciones.find(dir =>
                dir.calle === datosOriginales.calle &&
                dir.numero === datosOriginales.numero
            );

            if (direccionCreada && direccionCreada.idDireccion) {
                console.log('✅ Dirección encontrada con ID:', direccionCreada.idDireccion);
                return direccionCreada.idDireccion;
            }
        } catch (error) {
            console.warn('⚠️ No se pudieron obtener direcciones:', error);
        }

        throw new Error('No se pudo obtener el ID de la dirección creada');
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

        const comunaSeleccionada = comunas.find(c => c.idComuna === idComuna);
        if (!comunaSeleccionada) {
            alert('La comuna seleccionada no es válida. Por favor, recargue la página.');
            return;
        }

        const tipoIncidenteId = parseInt(newIncident.type);
        if (isNaN(tipoIncidenteId) || tipoIncidenteId <= 0) {
            alert('Por favor, seleccione un tipo de incidente válido');
            return;
        }

        // Buscar el tipo de incidente completo
        const tipoIncidenteCompleto = tiposIncidente.find(t => t.idTipoIncidente === tipoIncidenteId);
        if (!tipoIncidenteCompleto) {
            alert('Tipo de incidente no válido');
            return;
        }

        console.log('🔍 Comuna seleccionada confirmada:', comunaSeleccionada);
        console.log('🔍 Tipo incidente completo:', tipoIncidenteCompleto);

        setIsLoading(true);
        try {
            console.log('🔄 Creando dirección para el incidente...');
            const idDireccion = await crearDireccionYObtenerId({
                calle: newIncident.calle,
                numero: newIncident.numero,
                villa: newIncident.villa || undefined,
                complemento: newIncident.complemento || undefined,
                idComuna: idComuna
            });

            console.log('✅ Dirección creada con ID:', idDireccion);

            // 🎯 FORMATO DE FECHA CORREGIDO
            const formatDateForBackend = (date: Date): string => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                const seconds = String(date.getSeconds()).padStart(2, '0');

                return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
            };

            const fechaFormateada = formatDateForBackend(new Date());

            // 🎯 ESTRUCTURA EXACTA que funciona en Postman
            const incidenteData = {
                titulo: newIncident.title,
                detalle: newIncident.description,
                fechaRegistro: fechaFormateada,

                // ✅ CAMPOS DE PERSISTENCIA VISUAL
                region: comunaSeleccionada.region?.nombre || 'Región Metropolitana de Santiago',
                comuna: comunaSeleccionada.nombre,
                direccion: `${newIncident.calle} ${newIncident.numero}`.trim(),

                // ✅ RELACIONES - Objeto completo como en Postman
                tipoIncidente: {
                    idTipoIncidente: tipoIncidenteCompleto.idTipoIncidente,
                    nombre: tipoIncidenteCompleto.nombre
                },
                idDireccion: idDireccion,
                idCiudadano: 1,
                idEstadoIncidente: 1,
                idUsuarioAsignado: null,
                idFoto: null
            };

            console.log('📤 Enviando incidente al backend:', JSON.stringify(incidenteData, null, 2));
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
            console.error('❌ Error al crear incidente:', error);
            const errorMessage = (error as Error).message;

            if (errorMessage.includes('Tipo Incidente obligatorio')) {
                alert('Error: El tipo de incidente es obligatorio. Verifique que esté seleccionado correctamente.');
            } else if (errorMessage.includes('validación') || errorMessage.includes('validation')) {
                alert('Error: Los datos del incidente no son válidos. Verifique que todos los campos requeridos estén completos.');
            } else {
                alert('Error al crear incidente: ' + errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };

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
                location: incident.direccionTexto ||
                    (incident.direccionCompletaIncidente ?
                        `${incident.direccionCompletaIncidente.calle || ''} ${incident.direccionCompletaIncidente.numero || ''}`.trim()
                        : ''),
                type: incident.tipoIncidente.idTipoIncidente.toString(),
                status: getEstadoNombre(incident.idEstadoIncidente || 1),
                imageUrl: incident.imagenUrl || DefaultIncidente
            });
            setExpandedIncident(id);
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

    useEffect(() => {
        if (imageUploadContext === 'edit' && editingIncident && editForm.imageUrl) {
            console.log('🔄 Detectado cambio de imagen en edición, recargando incidentes...');
            const timer = setTimeout(() => {
                loadIncidents();
            }, 800);

            return () => clearTimeout(timer);
        }
    }, [editForm.imageUrl, imageUploadContext, editingIncident, loadIncidents]);

    const formatearUbicacionTabla = (incident: IncidenteFrontendConGeolocalizacion): string => {
        if (incident.direccionTexto) {
            return incident.direccionTexto;
        }

        if (incident.direccionCompletaIncidente) {
            const direccion = `${incident.direccionCompletaIncidente.calle || ''} ${incident.direccionCompletaIncidente.numero || ''}`.trim();
            return direccion || 'Ubicación no disponible';
        }

        return 'Ubicación no disponible';
    };

    if (isLoading) {
        return (
            <div className={styles.cuerpo}>
                <div className={styles['loading-container']}>
                    <div className={styles['loading-spinner']}></div>
                    <p>
                        {isLoadingTipos
                            ? 'Cargando tipos de incidente...'
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
                        disabled={showForm || isLoadingTipos}
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
                                            disabled={isLoadingGeografia}
                                        >
                                            <option value="">Seleccione una comuna</option>
                                            {comunas.map(comuna => (
                                                <option key={comuna.idComuna} value={comuna.idComuna.toString()}> {/* ✅ Asegurar string */}
                                                    {comuna.nombre}
                                                </option>
                                            ))}
                                        </select>
                                        {isLoadingGeografia && (
                                            <small className={styles['loading-text']}>Cargando comunas...</small>
                                        )}
                                        {comunas.length === 0 && !isLoadingGeografia && (
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
                                        disabled={isLoading || isLoadingGeografia}
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
                                                                                        onClick={() => openImageModal('new')}
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
                                                                                        {formatearUbicacionTabla(incident)}
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

                                                                        {incident.imagenUrl ? (
                                                                            <div className={styles['detalles-imagen']}>
                                                                                <h4>Evidencia Visual</h4>
                                                                                <div className={styles['image-preview-container']}>
                                                                                    <img
                                                                                        src={incident.imagenUrl}
                                                                                        alt={`Imagen del incidente ${incident.idIncidente}`}
                                                                                        className={styles['image-preview']}
                                                                                        onError={(e) => {
                                                                                            console.warn(`❌ Error cargando imagen para incidente ${incident.idIncidente}:`, incident.imagenUrl);
                                                                                            // Fallback a imagen por tipo
                                                                                            (e.target as HTMLImageElement).src = getDefaultImageByType(incident.tipoIncidente.nombre);
                                                                                        }}
                                                                                        onLoad={() => {
                                                                                            console.log(`✅ Imagen cargada correctamente para incidente ${incident.idIncidente}`);
                                                                                        }}
                                                                                    />
                                                                                </div>
                                                                                {/* Debug info */}
                                                                                <small style={{ display: 'block', marginTop: '5px', color: '#666', fontSize: '10px' }}>
                                                                                    URL: {incident.imagenUrl}
                                                                                </small>
                                                                            </div>
                                                                        ) : (
                                                                            <div className={styles['detalles-imagen']}>
                                                                                <h4>Evidencia Visual</h4>
                                                                                <div className={styles['image-preview-container']}>
                                                                                    <img
                                                                                        src={getDefaultImageByType(incident.tipoIncidente.nombre)}
                                                                                        alt="Imagen por defecto del incidente"
                                                                                        className={styles['image-preview']}
                                                                                    />
                                                                                    <div className={styles['image-placeholder']}>
                                                                                        <small>No hay imagen específica disponible</small>
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
                isOpen={isImageModalOpenHook}
                onClose={() => {
                    closeImageModalHook();
                    clearTemporaryImage();
                }}
                currentImage={hookCurrentImageUrl}
                isLoading={isImageLoading}
                isUploading={isImageUploading}
                uploadError={imageUploadError}
                onImageSelect={handleImageSelect}
                onImageSave={handleImageSaveAdapted}
                onImageDelete={handleImageDelete}
                onSave={(imageUrl, photoId) => {
                    console.log('🔄 Imagen guardada - URL:', imageUrl, 'Photo ID:', photoId);

                    // 🔄 FORZAR ACTUALIZACIÓN: Recargar incidentes cuando se guarda imagen
                    if (imageUploadContext === 'edit' && editingIncident) {
                        console.log('🔄 Recargando incidentes después de guardar imagen...');
                        setTimeout(() => {
                            loadIncidents();
                        }, 300);
                    }
                }}
                onError={(error) => {
                    console.error('Error en el modal de imagen:', error);
                    alert('Error al subir imagen: ' + error.message);
                }}
                hasTemporaryImage={!!hookTemporaryImageUrl}
                clearTemporaryImage={clearTemporaryImage}
            />
        </div>
    );
};

export default Incidentes;