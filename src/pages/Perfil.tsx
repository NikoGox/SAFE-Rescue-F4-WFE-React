import React, { useState, useCallback, useEffect } from "react";
import styles from "./Perfil.module.css";

//HOOKS Y CONTEXTOS

import { useImageUpload } from '../hooks/useImageUpload';
import { useAuth } from '../hooks/useAuth';
import { useSincronizacion } from '../hooks/useSincronizacion';
import { useCiudadano } from '../hooks/useCiudadano';

//imagenes y iconos 
import Logo from "../assets/sr_logo.png";
import PerfilDefault from "../assets/perfil-default.png";

//utils y types
import {
    validateChileanRUT,
    validateEmail,
    validatePhoneNumber,
    validateNameLettersOnly,
    validateIsRequired
} from '../utils/Validaciones';
import type { Errors, UserData, UserUpdateRequest, CiudadanoData, Bombero } from '../types/PerfilesType';
import type { Region, Comuna } from '../types/GeolocalizacionType';

//service
import { RegionService } from '../service/services/geolocalizacion/RegionService';
import { ComunaService } from '../service/services/geolocalizacion/ComunaService';

//componentes
import FormField from '../components/Formulario';
import { RutInputField, PhoneInputField } from '../components/SpecializedFields';
import ImageUploadModal from '../components/ImageUploadModal';

// Interface para los datos del formulario de perfil
interface PerfilFormData {
    nombre: string;
    aPaterno: string;
    aMaterno: string;
    correo: string;
    telefono: string;
    rutCompleto: string;
    direccion: {
        calle: string;
        numero: string;
        villa?: string;
        complemento?: string;
        idComuna: number;
    };
    idRegion: number;
}

const Perfil: React.FC = () => {
    const { authData, updateProfile, loading: authLoading, isLoggedIn, refreshProfile } = useAuth();
    const [perfilData, setPerfilData] = useState<CiudadanoData | Bombero | null>(null);

    const {
        sincronizando,
        errores: erroresSincronizacion
    } = useSincronizacion();

    const {
        isModalOpen,
        currentImageUrl,
        isLoading: isImageLoading,
        openModal,
        closeModal,
        handleImageUpload,
        handleImageDelete,
    } = useImageUpload({
        entityType: 'USUARIO',
        entityId: authData?.idUsuario,
        onImageUpdated: (newUrl) => {
            console.log(" Imagen actualizada:", newUrl);
            // Refrescar perfil después de actualizar imagen
            if (authData) {
                refreshProfile(authData.idUsuario, authData.tipoPerfil).catch(console.error);
            }
        }
    });

    // Estados para geografía
    const [regiones, setRegiones] = useState<Region[]>([]);
    const [comunas, setComunas] = useState<Comuna[]>([]);
    const [comunasFiltradas, setComunasFiltradas] = useState<Comuna[]>([]);
    const [loadingGeografia, setLoadingGeografia] = useState(true);
    const [regionMetropolitanaId, setRegionMetropolitanaId] = useState<number>(7);
    const [esRegionMetropolitana, setEsRegionMetropolitana] = useState<boolean>(false);

    const [formData, setFormData] = useState<PerfilFormData>({
        nombre: "",
        aPaterno: "",
        aMaterno: "",
        correo: "",
        telefono: "",
        rutCompleto: "",
        direccion: {
            calle: "",
            numero: "",
            villa: "",
            complemento: "",
            idComuna: 0
        },
        idRegion: 0
    });

    const [isEditing, setIsEditing] = useState(false);
    const [originalData, setOriginalData] = useState<PerfilFormData>({
        nombre: "",
        aPaterno: "",
        aMaterno: "",
        correo: "",
        telefono: "",
        rutCompleto: "",
        direccion: {
            calle: "",
            numero: "",
            villa: "",
            complemento: "",
            idComuna: 0
        },
        idRegion: 0
    });
    const [errors, setErrors] = useState<Errors>({});
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const enriquecerComunasConRegion = async (comunasData: Comuna[], regionesData: Region[]): Promise<Comuna[]> => {
        try {
            console.log("Iniciando enriquecimiento de comunas");

            // Las comunas vienen con estructura: {region: {idRegion, nombre}}
            // Extraer el idRegion de ese objeto anidado
            const comunasEnriquecidas = comunasData.map(comuna => {
                let regionId = 0;

                // Intentar obtener idRegion desde diferentes rutas
                if ((comuna as any).region && typeof (comuna as any).region === 'object') {
                    regionId = (comuna as any).region.idRegion || 0;
                    console.log(`Comuna ${comuna.nombre}: region encontrada =`, regionId);
                }

                // Si aún no tiene regionId, asignar por defecto
                if (!regionId) {
                    regionId = 7; // Región Metropolitana como fallback
                    console.log(`Comuna ${comuna.nombre}: asignada región por defecto = 7`);
                }

                return {
                    ...comuna,
                    idRegion: regionId
                };
            });

            console.log("Comunas enriquecidas:", comunasEnriquecidas.map(c => ({ nombre: c.nombre, idRegion: c.idRegion })));
            return comunasEnriquecidas;
        } catch (error) {
            console.warn("Error en enriquecimiento:", error);
            // Fallback: asignar todas a RM
            return comunasData.map(c => ({
                ...c,
                idRegion: 7
            }));
        }
    };

    const BuscadorCiudadano = () => {
        const [idBusqueda, setIdBusqueda] = useState<number | ''>('');
        const { ciudadano, cargando, error, buscarPorId } = useCiudadano();

        const handleBuscar = async () => {
            if (idBusqueda !== '' && idBusqueda > 0) {
                await buscarPorId(idBusqueda);
            }
        };

        return (
            <div className="contenedor-busqueda">
                <input
                    type="number"
                    placeholder="Ingresa ID del ciudadano"
                    value={idBusqueda}
                    onChange={(e) => setIdBusqueda(e.target.value === '' ? '' : Number(e.target.value))}
                />

                <button onClick={handleBuscar} disabled={cargando}>
                    {cargando ? 'Buscando...' : 'Buscar'}
                </button>

                {error && (
                    <div className="error">
                        <p> Error: {error}</p>
                    </div>
                )}

                {ciudadano && (
                    <div className="resultado">
                        <h3> Ciudadano Encontrado</h3>
                        <p><strong>Nombre:</strong> {ciudadano.nombre} {ciudadano.aPaterno}</p>
                        <p><strong>Correo:</strong> {ciudadano.correo}</p>
                        <p><strong>Teléfono:</strong> {ciudadano.telefono}</p>
                        <p><strong>RUT:</strong> {ciudadano.run}-{ciudadano.dv}</p>
                    </div>
                )}
            </div>
        );
    };

    //  CARGAR REGIONES Y COMUNAS AL MONTAR
    useEffect(() => {
        const loadGeografia = async () => {
            try {
                setLoadingGeografia(true);
                const regionesData = await RegionService.getAll();
                let comunasData = await ComunaService.getAll();

                console.log("Comunas cargadas del backend:", comunasData);
                console.log("Primera comuna estructura completa:", JSON.stringify(comunasData[0], null, 2));

                // Enriquecer comunas
                comunasData = await enriquecerComunasConRegion(comunasData, regionesData);

                setRegiones(regionesData);
                setComunas(comunasData);

                const rmId = detectarRegionMetropolitana(regionesData);
                setRegionMetropolitanaId(rmId);

                console.log("Geografía cargada:", regionesData.length, "regiones,", comunasData.length, "comunas con idRegion");
            } catch (error) {
                console.error("Error al cargar geografía:", error);
                setMessage({
                    type: 'error',
                    text: 'Error al cargar la información geográfica. Por favor, recarga la página.'
                });
            } finally {
                setLoadingGeografia(false);
            }
        };

        loadGeografia();
    }, []);



    //  CARGAR DATOS DEL USUARIO EN EL FORMULARIO
    useEffect(() => {
        if (authData) {
            console.log(" Cargando perfil desde authData...");
            console.log("   Tipo de perfil:", authData.tipoPerfil);
            console.log("   ¿Tiene equipo?", (authData as any).equipo);
            console.log("   ¿Tiene dirección?", (authData as any).direccion);

            setPerfilData(authData as CiudadanoData | Bombero);

            // Usar la función helper para construir los datos del formulario
            const datosFormulario = buildFormDataFromUserData(authData);
            setFormData(datosFormulario);
            setOriginalData(datosFormulario);
        }
    }, [authData]);

    //  FILTRAR COMUNAS CUANDO CAMBIE LA REGIÓN
    useEffect(() => {
        const regionSeleccionada = formData.idRegion;

        console.log("Filtrando comunas para región:", regionSeleccionada);
        console.log("Total de comunas disponibles:", comunas.length);

        if (regionSeleccionada > 0) {
            // Filtrar TODAS las comunas de la región seleccionada (como en Registrarse)
            const comunasDeRegion = comunas.filter(c => {
                console.log("Comparando: c.idRegion =", c.idRegion, "regionSeleccionada =", regionSeleccionada, "Coincide:", c.idRegion === regionSeleccionada);
                return c.idRegion === regionSeleccionada;
            });

            console.log("Comunas filtradas para región", regionSeleccionada, ":", comunasDeRegion.length);
            setComunasFiltradas(comunasDeRegion);

            // Verificar si es región metropolitana (solo para UI purposes)
            const esRM = regionSeleccionada === regionMetropolitanaId;
            setEsRegionMetropolitana(esRM);

            // Si la comuna seleccionada no existe en esta región, limpiarla
            if (formData.direccion.idComuna > 0 && !comunasDeRegion.some(c => c.idComuna === formData.direccion.idComuna)) {
                setFormData(prev => ({
                    ...prev,
                    direccion: { ...prev.direccion, idComuna: 0 }
                }));
            }
        } else {
            setComunasFiltradas([]);
            setEsRegionMetropolitana(false);
        }
    }, [formData.idRegion, comunas, regionMetropolitanaId]);


    //  DETECTAR REGIÓN METROPOLITANA
    const detectarRegionMetropolitana = (regiones: Region[]): number => {
        const nombresRM = [
            'Región Metropolitana de Santiago'
        ];

        const regionEncontrada = regiones.find(region =>
            nombresRM.some(nombre =>
                region.nombre.toLowerCase().includes(nombre.toLowerCase())
            )
        );

        return regionEncontrada?.idRegion || 7;
    };

    const buildFormDataFromUserData = (userData: UserData): PerfilFormData => {
        console.log("Construyendo datos desde UserData:", userData);
        console.log("Tipo de perfil:", userData.tipoPerfil);
        console.log("Datos completos:", JSON.stringify(userData, null, 2));

        const baseData = {
            nombre: userData.nombre || "",
            aPaterno: userData.aPaterno || userData.apaterno || "",
            aMaterno: userData.aMaterno || userData.amaterno || "",
            correo: userData.correo || "",
            telefono: userData.telefono || "",
            rutCompleto: userData.run && userData.dv ? `${userData.run}-${userData.dv}` : "",
        };

        // Manejar tanto CiudadanoData como Bombero
        if (userData.tipoPerfil === 'CIUDADANO') {
            console.log("Tipo verificado como CIUDADANO");
            console.log("userData.direccion:", userData.direccion);

            // Verificar si direccion existe y tiene contenido
            if (userData.direccion && typeof userData.direccion === 'object' && Object.keys(userData.direccion).length > 0) {
                const ciudadano = userData as CiudadanoData;
                console.log("Datos completos de dirección:", ciudadano.direccion);

                let regionId = 0;
                let comunaId = 0;

                // Extraer región y comuna correctamente
                if (ciudadano.direccion) {
                    console.log("Analizando dirección...");
                    console.log("  - calle:", ciudadano.direccion.calle);
                    console.log("  - numero:", ciudadano.direccion.numero);
                    console.log("  - villa:", ciudadano.direccion.villa);
                    console.log("  - complemento:", ciudadano.direccion.complemento);
                    console.log("  - comuna:", ciudadano.direccion.comuna);
                    console.log("  - region:", ciudadano.direccion.region);

                    // Intentar obtener desde comuna primero
                    if (ciudadano.direccion.comuna && typeof ciudadano.direccion.comuna === 'object' && ciudadano.direccion.comuna.idComuna) {
                        regionId = ciudadano.direccion.comuna.idRegion || 0;
                        comunaId = ciudadano.direccion.comuna.idComuna || 0;
                        console.log("Region desde comuna:", regionId, "Comuna:", comunaId);
                    }
                    // Si no existe region en comuna, intentar desde region
                    if (regionId === 0 && ciudadano.direccion.region && typeof ciudadano.direccion.region === 'object') {
                        regionId = ciudadano.direccion.region.idRegion || 0;
                        console.log("Region desde region object:", regionId);
                    }
                }

                console.log("Datos finales: regionId =", regionId, "comunaId =", comunaId);

                return {
                    ...baseData,
                    direccion: {
                        calle: ciudadano.direccion?.calle || "",
                        numero: (ciudadano.direccion?.numero || "").toString(),
                        villa: ciudadano.direccion?.villa || "",
                        complemento: ciudadano.direccion?.complemento || "",
                        idComuna: comunaId
                    },
                    idRegion: regionId
                };
            } else {
                console.log("No hay dirección válida en los datos del ciudadano");
            }
        } else {
            console.log("Usuario es bombero o tipo de perfil:", userData.tipoPerfil);
        }

        // Fallback: retornar datos sin dirección
        return {
            ...baseData,
            direccion: {
                calle: "",
                numero: "",
                villa: "",
                complemento: "",
                idComuna: 0
            },
            idRegion: 0
        };
    };

    //  VALIDAR FORMULARIO
    const validateForm = useCallback((): boolean => {
        console.log(" INICIANDO VALIDACIÓN DE PERFIL");

        const newErrors: Errors = {};

        newErrors.nombre = validateNameLettersOnly(formData.nombre) || undefined;
        newErrors.aPaterno = validateNameLettersOnly(formData.aPaterno) || undefined;
        newErrors.aMaterno = validateNameLettersOnly(formData.aMaterno) || undefined;
        newErrors.correo = validateEmail(formData.correo) || undefined;
        newErrors.telefono = validatePhoneNumber(formData.telefono) || undefined;
        newErrors.rutCompleto = validateChileanRUT(formData.rutCompleto) || undefined;

        if (authData?.tipoPerfil === 'CIUDADANO') {
            const direccionErrors: any = {};
            direccionErrors.calle = validateIsRequired(formData.direccion.calle, "La calle") || undefined;

            if (!formData.direccion.numero.trim()) {
                direccionErrors.numero = "El número es obligatorio";
            } else if (!/^\d+$/.test(formData.direccion.numero)) {
                direccionErrors.numero = "El número debe contener solo dígitos";
            }

            newErrors.idRegion = (!formData.idRegion || formData.idRegion <= 0) ? "Debe seleccionar una región" : undefined;

            if (formData.idRegion > 0) {
                direccionErrors.idComuna = (!formData.direccion.idComuna || formData.direccion.idComuna <= 0) ? "Debe seleccionar una comuna" : undefined;
            }

            if (Object.keys(direccionErrors).filter(key => direccionErrors[key]).length > 0) {
                newErrors.direccion = direccionErrors;
            }
        }

        const filteredErrors: Errors = Object.fromEntries(
            Object.entries(newErrors).filter(([, value]) => value !== null && value !== undefined)
        );

        console.log("🔍 Errores finales en perfil:", filteredErrors);
        setErrors(filteredErrors);

        return Object.keys(filteredErrors).length === 0;
    }, [formData, authData]);

    //  MANEJADOR DE CAMBIOS
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const target = e.target;
        const targetId = target.id;

        let value: string | number;

        if (target.type === 'select-one') {
            value = (target as HTMLSelectElement).value;
        } else {
            value = target.value;
        }

        switch (targetId) {
            case 'nombre':
            case 'aPaterno':
            case 'aMaterno':
            case 'correo':
            case 'telefono':
            case 'rutCompleto':
            case 'idRegion':
                setFormData(prev => ({
                    ...prev,
                    [targetId]: targetId === 'idRegion' ? Number(value) : value
                }));
                break;
            case 'calle':
            case 'villa':
            case 'complemento':
                setFormData(prev => ({
                    ...prev,
                    direccion: {
                        ...prev.direccion,
                        [targetId]: value as string
                    }
                }));
                break;
            case 'numero':
                const numeroValue = (value as string).replace(/[^\d]/g, '');
                setFormData(prev => ({
                    ...prev,
                    direccion: {
                        ...prev.direccion,
                        numero: numeroValue
                    }
                }));
                break;
            case 'idComuna':
                if (target.type === 'select-one') {
                    setFormData(prev => ({
                        ...prev,
                        direccion: {
                            ...prev.direccion,
                            idComuna: Number((target as HTMLSelectElement).value)
                        }
                    }));
                }
                break;
        }

        if (message) {
            setMessage(null);
        }

        if (errors[targetId as keyof Errors]) {
            setErrors(prev => ({
                ...prev,
                [targetId]: undefined
            }));
        }
    };

    //  MANEJADOR DE BLUR
    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!isEditing) return;

        const { id, value } = e.target;
        const targetId = id;
        let error: string | null = null;

        switch (targetId) {
            case 'nombre':
                error = validateNameLettersOnly(value);
                break;
            case 'aPaterno':
                error = validateNameLettersOnly(value);
                break;
            case 'aMaterno':
                error = validateNameLettersOnly(value);
                break;
            case 'correo':
                error = validateEmail(value);
                break;
            case 'telefono':
                error = validatePhoneNumber(value);
                break;
            case 'rutCompleto':
                error = validateChileanRUT(value);
                break;
            case 'calle':
                error = validateIsRequired(formData.direccion.calle, "La calle");
                break;
            case 'numero':
                if (!formData.direccion.numero.trim()) {
                    error = "El número es obligatorio";
                } else if (!/^\d+$/.test(formData.direccion.numero)) {
                    error = "El número debe contener solo dígitos";
                }
                break;
        }

        handleFieldError(targetId, error);
    };

    //  MANEJO DE ERRORES POR CAMPO
    const handleFieldError = (fieldId: string, error: string | null) => {
        if (['calle', 'numero', 'idComuna'].includes(fieldId)) {
            setErrors(prev => {
                const updatedErrors: any = { ...prev };
                if (error) {
                    if (!updatedErrors.direccion) {
                        updatedErrors.direccion = {};
                    }
                    updatedErrors.direccion[fieldId] = error;
                } else {
                    if (updatedErrors.direccion) {
                        delete updatedErrors.direccion[fieldId];
                        if (Object.keys(updatedErrors.direccion).length === 0) {
                            delete updatedErrors.direccion;
                        }
                    }
                }
                return updatedErrors;
            });
        } else {
            const validErrorKeys: (keyof Errors)[] = [
                'rutCompleto', 'nombre', 'aPaterno', 'aMaterno', 'correo', 'telefono',
                'idRegion'
            ];

            if (validErrorKeys.includes(fieldId as keyof Errors)) {
                const validFieldId = fieldId as keyof Errors;
                if (error) {
                    setErrors(prev => ({ ...prev, [validFieldId]: error }));
                } else {
                    setErrors(prev => {
                        const { [validFieldId]: _, ...rest } = prev;
                        return rest;
                    });
                }
            }
        }
    };

    const handleEdit = () => {
        setOriginalData({ ...formData });
        setIsEditing(true);
        setErrors({});
        setMessage(null);
    };

    const handleCancel = () => {
        setFormData({ ...originalData });
        setErrors({});
        setIsEditing(false);
        setMessage({ type: 'error', text: 'Edición cancelada. Los cambios fueron descartados.' });
    };

    const isDataChanged = useCallback(() => {
        return JSON.stringify(formData) !== JSON.stringify(originalData);
    }, [formData, originalData]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (!isLoggedIn || !authData) {
            setMessage({ type: 'error', text: 'No hay sesión activa para guardar.' });
            return;
        }

        if (!isDataChanged()) {
            setMessage({ type: 'error', text: 'No se detectaron cambios para guardar.' });
            return;
        }

        if (validateForm()) {
            setIsSaving(true);
            try {
                const updateData: UserUpdateRequest = {
                    nombre: formData.nombre,
                    aPaterno: formData.aPaterno,
                    aMaterno: formData.aMaterno,
                    telefono: formData.telefono,
                    correo: formData.correo,
                };

                console.log(" Enviando actualización de perfil:", updateData);

                const success = await updateProfile(updateData);

                if (success) {
                    setIsEditing(false);
                    setMessage({ type: 'success', text: ' Perfil actualizado exitosamente.' });

                    setTimeout(() => {
                        setMessage(null);
                    }, 3000);
                } else {
                    setMessage({ type: 'error', text: ' Error al actualizar el perfil en el servidor.' });
                }

            } catch (error: any) {
                console.error(" Error en actualización:", error);
                setMessage({
                    type: 'error',
                    text: error.message || 'Error al guardar los cambios en el perfil.'
                });
            } finally {
                setIsSaving(false);
            }
        } else {
            setMessage({ type: 'error', text: ' Por favor, corrige los errores en el formulario para guardar.' });
        }
    };

    const handleImageSaveClick = async (fotoFile: File) => {
        try {
            console.log(" Iniciando upload de imagen...");
            await handleImageUpload(fotoFile);
            setMessage({
                type: 'success',
                text: ' Foto de perfil actualizada exitosamente.'
            });
            setTimeout(() => setMessage(null), 3000);
        } catch (error: any) {
            console.error(" Error al subir imagen:", error);
            setMessage({
                type: 'error',
                text: error.message || 'Error al actualizar la foto de perfil.'
            });
        }
    };

    const isFormActiveForEditing = isEditing;

    useEffect(() => {
        if (erroresSincronizacion.length > 0) {
            setMessage({
                type: 'error',
                text: `Problemas de conexión: ${erroresSincronizacion[0]}`
            });
        }
    }, [erroresSincronizacion]);

    if (authLoading || loadingGeografia) {
        return (
            <div className="text-center p-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando perfil...</span>
                </div>
                <p className="mt-2">{loadingGeografia ? 'Cargando datos geográficos...' : 'Cargando perfil...'}</p>
            </div>
        );
    }

    if (!isLoggedIn) {
        return (
            <div className={styles['pagina-perfil']}>
                <div className="contenedor-perfil">
                    <div className="alert alert-danger text-center" role="alert">
                        Error: Acceso denegado. Debes iniciar sesión para ver tu perfil.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles['pagina-perfil']}>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-12 col-lg-8 col-xl-6">
                        <div className={`${styles['card-perfil']} card`}>
                            <div className={`${styles['card-header-perfil']} text-center`}>
                                <div className={styles.logoFormulario}>
                                    <img
                                        src={Logo}
                                        alt="SAFE Rescue Logo"
                                        className={styles.logoCentrado}
                                    />
                                </div>

                                <h2 className={styles.tituloFormulario}>Mi Perfil</h2>
                                <p className={styles.subtituloFormulario}>
                                    {authData?.tipoPerfil === 'CIUDADANO' ? ' Ciudadano' : ' Bombero'}
                                </p>

                                <div className={styles['profile-image-container']}>
                                    <img
                                        src={authData?.idFoto ? `/api/fotos/${authData.idFoto}` : PerfilDefault}
                                        alt="Foto de perfil"
                                        className={`${styles['foto-perfil']} rounded-circle`}
                                        data-testid="profile-image"
                                        key={authData?.idFoto}
                                    />
                                    <button
                                        className={`${styles['btn-edit-image']} btn-sm btn-light`}
                                        onClick={openModal}
                                        aria-label="Cambiar imagen de perfil"
                                        data-testid="edit-image-button"
                                    >
                                        <i className="bi bi-pencil-fill">+ </i>
                                    </button>
                                </div>

                                <h3>{`${formData.nombre} ${formData.aPaterno} ${formData.aMaterno}`.trim() || "Usuario"}</h3>
                            </div>

                            <div className="card-body">
                                {message && (
                                    <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'}`} role="alert" data-testid="perfil-message">
                                        {message.text}
                                    </div>
                                )}

                                <form onSubmit={handleSave} noValidate>
                                    <div className={styles['lista-datos-perfil']}>
                                        {/* DATOS PERSONALES */}
                                        <FormField
                                            id="nombre"
                                            label="Nombre"
                                            placeholder="Juan"
                                            value={formData.nombre}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={errors.nombre}
                                            disabled={!isFormActiveForEditing}
                                            dataTestId='perfil-nombre'
                                        />
                                        <div className="row">
                                            <div className="col-md-6">
                                                <FormField
                                                    id="aPaterno"
                                                    label="Apellido Paterno"
                                                    placeholder="Pérez"
                                                    value={formData.aPaterno}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    error={errors.aPaterno}
                                                    disabled={!isFormActiveForEditing}
                                                    dataTestId='perfil-aPaterno'
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <FormField
                                                    id="aMaterno"
                                                    label="Apellido Materno"
                                                    placeholder="González"
                                                    value={formData.aMaterno}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    error={errors.aMaterno}
                                                    disabled={!isFormActiveForEditing}
                                                    dataTestId='perfil-aMaterno'
                                                />
                                            </div>
                                        </div>

                                        <RutInputField
                                            value={formData.rutCompleto}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={errors.rutCompleto}
                                            disabled={true}
                                            fieldId="rutCompleto"
                                            label="RUT"
                                            dataTestId='perfil-rut'
                                        />

                                        <FormField
                                            id="correo"
                                            label="Correo Electrónico"
                                            placeholder="tu.correo@ejemplo.com"
                                            type="email"
                                            value={formData.correo}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={errors.correo}
                                            disabled={true}
                                            dataTestId='perfil-correo'
                                        />

                                        <PhoneInputField
                                            value={formData.telefono}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={errors.telefono}
                                            disabled={!isFormActiveForEditing}
                                            fieldId="telefono"
                                            label="Teléfono"
                                            dataTestId='perfil-telefono'
                                        />

                                        {/* INFORMACIÓN DEL EQUIPO (Solo para bomberos) */}
                                        {authData?.tipoPerfil === 'BOMBERO' && (authData as any).equipo && (
                                            <>
                                                <hr className="my-4" />
                                                <h5 className="mb-3"> Información del Equipo</h5>
                                                <FormField
                                                    id="equipo"
                                                    label="Equipo"
                                                    placeholder="Nombre del equipo"
                                                    value={(authData as any).equipo?.nombre || "No asignado"}
                                                    onChange={() => { }}
                                                    onBlur={() => { }}
                                                    disabled={true}
                                                    dataTestId='perfil-equipo'
                                                />
                                                <FormField
                                                    id="tipoEquipo"
                                                    label="Tipo de Equipo"
                                                    placeholder="Tipo"
                                                    value={(authData as any).equipo?.tipoEquipo?.nombre || "No disponible"}
                                                    onChange={() => { }}
                                                    onBlur={() => { }}
                                                    disabled={true}
                                                    dataTestId='perfil-tipo-equipo'
                                                />
                                                {(authData as any).equipo?.compania && (
                                                    <FormField
                                                        id="compania"
                                                        label="Compañía"
                                                        placeholder="Compañía"
                                                        value={(authData as any).equipo.compania?.nombre || "No disponible"}
                                                        onChange={() => { }}
                                                        onBlur={() => { }}
                                                        disabled={true}
                                                        dataTestId='perfil-compania'
                                                    />
                                                )}
                                            </>
                                        )}

                                        {/* DIRECCIÓN (Solo para ciudadanos) */}
                                        {authData?.tipoPerfil === 'CIUDADANO' && (
                                            <>
                                                <hr className="my-4" />
                                                <h5 className="mb-3"> Dirección</h5>

                                                <div className="row">
                                                    <div className="col-md-8">
                                                        <FormField
                                                            id="calle"
                                                            label="Calle"
                                                            placeholder="Nombre de la calle"
                                                            value={formData.direccion.calle}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            error={errors.direccion?.calle}
                                                            disabled={!isFormActiveForEditing}
                                                            dataTestId='perfil-calle'
                                                        />
                                                    </div>
                                                    <div className="col-md-4">
                                                        <FormField
                                                            id="numero"
                                                            label="Número"
                                                            placeholder="123"
                                                            value={formData.direccion.numero}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            error={errors.direccion?.numero}
                                                            disabled={!isFormActiveForEditing}
                                                            dataTestId='perfil-numero'
                                                            type="number"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <FormField
                                                            id="villa"
                                                            label="Villa/Población (Opcional)"
                                                            placeholder="Nombre de la villa"
                                                            value={formData.direccion.villa || ""}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            error={errors.direccion?.villa}
                                                            disabled={!isFormActiveForEditing}
                                                            required={false}
                                                            dataTestId='perfil-villa'
                                                        />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <FormField
                                                            id="complemento"
                                                            label="Complemento (Opcional)"
                                                            placeholder="Depto, block, etc."
                                                            value={formData.direccion.complemento || ""}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            error={errors.direccion?.complemento}
                                                            disabled={!isFormActiveForEditing}
                                                            required={false}
                                                            dataTestId='perfil-complemento'
                                                        />
                                                    </div>
                                                </div>

                                                {/* REGIÓN Y COMUNA */}
                                                <div className="row">
                                                    <div className="col-12">
                                                        <div className="mb-3">
                                                            <label htmlFor="idRegion" className="form-label">Región</label>
                                                            <select
                                                                id="idRegion"
                                                                className={`form-select ${errors.idRegion ? 'is-invalid' : ''}`}
                                                                value={formData.idRegion}
                                                                onChange={handleChange}
                                                                required
                                                                disabled={!isFormActiveForEditing || loadingGeografia}
                                                            >
                                                                <option value={0}>Selecciona una región</option>
                                                                {loadingGeografia ? (
                                                                    <option disabled>Cargando regiones...</option>
                                                                ) : (
                                                                    regiones.map(region => (
                                                                        <option key={region.idRegion} value={region.idRegion}>
                                                                            {region.nombre}
                                                                        </option>
                                                                    ))
                                                                )}
                                                            </select>
                                                            {errors.idRegion && (
                                                                <div className="invalid-feedback">{errors.idRegion}</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="row">
                                                    <div className="col-12">
                                                        <div className="mb-3">
                                                            <label htmlFor="idComuna" className="form-label">Comuna</label>
                                                            <select
                                                                id="idComuna"
                                                                className={`form-select ${errors.direccion?.idComuna ? 'is-invalid' : ''}`}
                                                                value={formData.direccion.idComuna}
                                                                onChange={handleChange}
                                                                required
                                                                disabled={
                                                                    !isFormActiveForEditing ||
                                                                    loadingGeografia ||
                                                                    formData.idRegion <= 0
                                                                }
                                                            >
                                                                <option value={0}>
                                                                    {!formData.idRegion && !loadingGeografia
                                                                        ? 'Primero selecciona una región'
                                                                        : loadingGeografia
                                                                            ? 'Cargando comunas...'
                                                                            : comunasFiltradas.length === 0
                                                                                ? 'No hay comunas disponibles para esta región'
                                                                                : 'Selecciona una comuna'}
                                                                </option>


                                                                {!loadingGeografia && comunasFiltradas.length > 0 && comunasFiltradas.map(comuna => (
                                                                    <option key={comuna.idComuna} value={comuna.idComuna}>
                                                                        {comuna.nombre}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            {errors.direccion?.idComuna && (
                                                                <div className="invalid-feedback">{errors.direccion.idComuna}</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div className={`${styles['botones-perfil']} text-center mt-4`}>
                                        {!isFormActiveForEditing ? (
                                            <button
                                                type="button"
                                                onClick={handleEdit}
                                                className={`${styles['btn-editar-perfil']} btn btn-primary`}
                                                data-testid="perfil-edit-button"
                                                disabled={sincronizando}
                                            >
                                                {sincronizando ? 'Sincronizando...' : 'Editar Perfil'}
                                            </button>
                                        ) : (
                                            <>
                                                <button
                                                    type="submit"
                                                    className={`${styles['btn-guardar-perfil']} btn btn-success me-2`}
                                                    disabled={isSaving || Object.values(errors).some(e => e) || !isDataChanged() || sincronizando}
                                                    data-testid="perfil-save-button"
                                                >
                                                    {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleCancel}
                                                    className={`${styles['btn-cancelar-perfil']} btn btn-secondary`}
                                                    disabled={isSaving || sincronizando}
                                                    data-testid="perfil-cancel-button"
                                                >
                                                    Cancelar
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL DE IMAGEN */}
            <ImageUploadModal
                isOpen={isModalOpen}
                onClose={closeModal}
                currentImage={currentImageUrl}
                onImageUpload={handleImageSaveClick}
                onImageDelete={handleImageDelete}
                isLoading={isImageLoading}
            />
        </div>
    );
};

export default Perfil;