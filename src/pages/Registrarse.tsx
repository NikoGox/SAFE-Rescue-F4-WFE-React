import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/sr_logo.png";
import styles from "./Registrarse.module.css";
import FormField from '../components/Formulario';
import { RutInputField, PhoneInputField, PasswordInputField } from '../components/SpecializedFields';
import {
    validateChileanRUT,
    validateEmail,
    validatePhoneNumber,
    validateStrongPassword,
    validateConfirmPassword,
    validateNameLettersOnly,
    validateIsRequired
} from '../utils/Validaciones';
import type {
    UserRegistroFormType,
    UserRegistroBackendType,
    Errors
} from '../types/PerfilesType';
import type { Region, Comuna } from '../types/GeolocalizacionType';
import UseAuthService from '../service/services/perfiles/UseAuthService';
import CiudadanoService from '../service/services/perfiles/CiudadanoService';
import { RegionService } from '../service/services/geolocalizacion/RegionService';
import { ComunaService } from '../service/services/geolocalizacion/ComunaService';

// Extendemos el tipo para incluir los campos de dirección manual
interface RegistroConDireccionManual {
    // Datos personales
    rutCompleto: string;
    nombre: string;
    aPaterno: string;
    aMaterno: string;
    correo: string;
    telefono: string;
    contrasena: string;
    confirmarContrasena: string;
    terminos: boolean;
    idTipoUsuario: number;

    // Dirección anidada
    direccion: {
        calle: string;
        numero: string;
        villa?: string;
        complemento?: string;
        idComuna: number;
        coordenadas?: {
            latitud: number;
            longitud: number;
        };
    };

    // Campos de selección geográfica
    idRegion: number;
    comunaPersonalizada: string;
    regionPersonalizada: string;
    usarComunaPersonalizada: boolean;
    usarRegionPersonalizada: boolean;
}

const Registrarse: React.FC = () => {

    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [regiones, setRegiones] = useState<Region[]>([]);
    const [comunas, setComunas] = useState<Comuna[]>([]);
    const [comunasFiltradas, setComunasFiltradas] = useState<Comuna[]>([]);
    const [loadingGeografia, setLoadingGeografia] = useState(true);
    const [esRegionMetropolitana, setEsRegionMetropolitana] = useState(false);
    const [regionMetropolitanaId, setRegionMetropolitanaId] = useState<number>(7);

    const [formData, setFormData] = useState<RegistroConDireccionManual>({
        rutCompleto: "",
        nombre: "",
        aPaterno: "",
        aMaterno: "",
        correo: "",
        telefono: "",
        contrasena: "",
        confirmarContrasena: "",
        terminos: false,
        idTipoUsuario: 5,
        direccion: {
            calle: "",
            numero: "",
            villa: "",
            complemento: "",
            idComuna: 0,
            coordenadas: {
                latitud: -33.45694,
                longitud: -70.64827
            }
        },
        idRegion: 0,
        comunaPersonalizada: "",
        regionPersonalizada: "",
        usarComunaPersonalizada: false,
        usarRegionPersonalizada: false
    });

    const [errors, setErrors] = useState<Errors>({});

    // Función para detectar la Región Metropolitana
    const detectarRegionMetropolitana = (regiones: Region[]): number => {
        const nombresRM = [
            'Región Metropolitana de Santiago',
            'santiago',
            'rm',
            'región metropolitana',
            'metropolitan',
            'capital'
        ];

        const regionEncontrada = regiones.find(region =>
            nombresRM.some(nombre =>
                region.nombre.toLowerCase().includes(nombre)
            )
        );

        return regionEncontrada?.idRegion || 7;
    };

    // Cargar regiones y comunas al montar el componente
    useEffect(() => {
        const cargarGeografia = async () => {
            try {
                const [regionesData, comunasData] = await Promise.all([
                    RegionService.getAll(),
                    ComunaService.getAll()
                ]);

                // Detectar dinámicamente la Región Metropolitana
                const idRM = detectarRegionMetropolitana(regionesData);
                setRegionMetropolitanaId(idRM);

                console.log("📍 Región Metropolitana detectada con ID:", idRM);
                console.log("📊 Total de regiones cargadas:", regionesData.length);
                console.log("📊 Total de comunas cargadas:", comunasData.length);

                // Filtrar comunas de la RM
                const comunasRM = comunasData.filter(c => c.idRegion === idRM);
                console.log(`✅ Comunas filtradas para RM (ID ${idRM}):`, comunasRM.length);

                setRegiones(regionesData);
                setComunas(comunasData);
            } catch (error) {
                console.error("❌ Error cargando geografía:", error);
            } finally {
                setLoadingGeografia(false);
            }
        };

        cargarGeografia();
    }, []);

    // Filtrar comunas cuando cambia la región seleccionada
    useEffect(() => {
        const regionSeleccionada = formData.idRegion;
        const usarPersonalizada = formData.usarRegionPersonalizada;

        console.log("🔄 useEffect filtrado - regionSeleccionada:", regionSeleccionada, "regionMetropolitanaId:", regionMetropolitanaId);

        if (regionSeleccionada > 0 && !usarPersonalizada && regionMetropolitanaId > 0) {
            const esMetropolitana = regionSeleccionada === regionMetropolitanaId;
            setEsRegionMetropolitana(esMetropolitana);

            if (esMetropolitana) {
                setComunasFiltradas(comunas);

                if (formData.direccion.idComuna > 0 && !comunas.some(c => c.idComuna === formData.direccion.idComuna)) {
                    setFormData(prev => ({
                        ...prev,
                        direccion: { ...prev.direccion, idComuna: 0 }
                    }));
                }
            } else {
                setComunasFiltradas([]);
                setFormData(prev => ({
                    ...prev,
                    direccion: { ...prev.direccion, idComuna: 0 }
                }));
            }
        } else {
            setComunasFiltradas([]);
            setEsRegionMetropolitana(false);
        }
    }, [formData.idRegion, formData.usarRegionPersonalizada, comunas, regionMetropolitanaId]);

    // FUNCIÓN DE VALIDACIÓN COMPLETA - MEJORADA USANDO TUS VALIDACIONES
    const validateForm = useCallback((): boolean => {
        console.log("🔍 INICIANDO VALIDACIÓN COMPLETA");

        const newErrors: Errors = {};

        // ✅ USANDO TUS VALIDACIONES EXISTENTES PARA CADA CAMPO
        newErrors.rutCompleto = validateChileanRUT(formData.rutCompleto) || undefined;
        newErrors.nombre = validateNameLettersOnly(formData.nombre) || undefined;
        newErrors.aPaterno = validateNameLettersOnly(formData.aPaterno) || undefined;
        newErrors.aMaterno = validateNameLettersOnly(formData.aMaterno) || undefined;
        newErrors.correo = validateEmail(formData.correo) || undefined;
        newErrors.telefono = validatePhoneNumber(formData.telefono) || undefined;
        newErrors.contrasena = validateStrongPassword(formData.contrasena) || undefined;
        newErrors.confirmarContrasena = validateConfirmPassword(formData.contrasena, formData.confirmarContrasena) || undefined;

        // Validación de dirección usando tus funciones
        const direccionErrors: any = {};

        direccionErrors.calle = validateIsRequired(formData.direccion.calle, "La calle") || undefined;

        if (!formData.direccion.numero.trim()) {
            direccionErrors.numero = "El número es obligatorio";
        } else if (!/^\d+$/.test(formData.direccion.numero)) {
            direccionErrors.numero = "El número debe contener solo dígitos";
        }

        // Validación de comuna
        if (!formData.usarComunaPersonalizada && esRegionMetropolitana) {
            if (!formData.direccion.idComuna || formData.direccion.idComuna <= 0) {
                direccionErrors.idComuna = "Debe seleccionar una comuna";
            }
        }

        // Solo agregar direccionErrors si hay errores
        if (Object.keys(direccionErrors).filter(key => direccionErrors[key]).length > 0) {
            newErrors.direccion = direccionErrors;
        }

        // Validación de región
        if (formData.usarRegionPersonalizada) {
            newErrors.regionPersonalizada = validateIsRequired(formData.regionPersonalizada, "La región") || undefined;
        } else {
            newErrors.idRegion = (!formData.idRegion || formData.idRegion <= 0) ? "Debe seleccionar una región" : undefined;
        }

        // Validación de comuna personalizada
        if (formData.usarComunaPersonalizada) {
            newErrors.comunaPersonalizada = validateIsRequired(formData.comunaPersonalizada, "La comuna") || undefined;
        }

        // Validación de términos
        if (!formData.terminos) {
            newErrors.general = "Debe aceptar los términos y condiciones";
        }

        // Filtrar solo los errores que realmente existen
        const filteredErrors: Errors = {};

        // Campos de nivel superior
        (Object.keys(newErrors) as Array<keyof Errors>).forEach(key => {
            const errorValue = newErrors[key];
            if (errorValue !== undefined && errorValue !== null) {
                // Para el campo 'direccion', necesitamos manejo especial
                if (key === 'direccion') {
                    const direccionErrorObj = errorValue as any;
                    if (direccionErrorObj && Object.keys(direccionErrorObj).some(k => direccionErrorObj[k])) {
                        filteredErrors.direccion = direccionErrorObj;
                    }
                } else {
                    // Para otros campos, asignar directamente
                    filteredErrors[key] = errorValue as any;
                }
            }
        });

        console.log("🔍 Errores finales:", filteredErrors);
        setErrors(filteredErrors);

        return Object.keys(filteredErrors).length === 0;
    }, [formData, esRegionMetropolitana]);

    // ✅ FUNCIÓN AUXILIAR PARA MANEJAR BLUR EN SELECTS
    const handleSelectBlur = (fieldId: string, value: string) => {
        let error: string | null = null;

        switch (fieldId) {
            case 'idRegion':
                if (!formData.usarRegionPersonalizada) {
                    error = Number(value) <= 0 ? "Debe seleccionar una región" : null;
                }
                break;

            case 'idComuna':
                if (!formData.usarComunaPersonalizada && esRegionMetropolitana) {
                    error = Number(value) <= 0 ? "Debe seleccionar una comuna" : null;
                }
                break;
        }

        handleFieldError(fieldId, error);
    };

    // 3. MANEJO DE CAMBIOS - CORREGIDO
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const target = e.target;
        const targetId = target.id;

        let value: string | number | boolean;

        if (target.type === 'checkbox') {
            value = (target as HTMLInputElement).checked;
        } else if (target.type === 'select-one') {
            value = (target as HTMLSelectElement).value;
        } else {
            value = target.value;
        }

        // ✅ CORREGIDO: Usamos el ID como string y manejamos cada caso específicamente
        switch (targetId) {
            // Campos de nivel superior
            case 'rutCompleto':
            case 'nombre':
            case 'aPaterno':
            case 'aMaterno':
            case 'correo':
            case 'telefono':
            case 'contrasena':
            case 'confirmarContrasena':
            case 'terminos':
            case 'idTipoUsuario':
            case 'idRegion':
            case 'comunaPersonalizada':
            case 'regionPersonalizada':
            case 'usarComunaPersonalizada':
            case 'usarRegionPersonalizada':
                setFormData(prev => ({
                    ...prev,
                    [targetId]: targetId === 'idRegion' || targetId === 'idTipoUsuario' ? Number(value) : value
                }));
                break;

            // Campos anidados de dirección - texto e input
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

            // Campo numero con validación especial
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

            // Select de comuna
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

            default:
                console.warn(`Campo no manejado: ${targetId}`);
                break;
        }

        if (successMessage) {
            setSuccessMessage(null);
        }

        if (errors[targetId as keyof Errors]) {
            setErrors(prev => ({
                ...prev,
                [targetId]: undefined
            }));
        }

        // Limpiar errores de campos anidados
        if (['calle', 'numero', 'villa', 'complemento', 'idComuna'].includes(targetId)) {
            setErrors(prev => {
                const updatedErrors = { ...prev };

                // Si existe el objeto direccion, actualizarlo
                if (updatedErrors.direccion) {
                    updatedErrors.direccion = {
                        ...updatedErrors.direccion,
                        [targetId]: undefined
                    };

                    // Si después de actualizar, el objeto direccion está vacío, eliminarlo
                    if (Object.keys(updatedErrors.direccion).every(key =>
                        updatedErrors.direccion![key as keyof typeof updatedErrors.direccion] === undefined
                    )) {
                        delete updatedErrors.direccion;
                    }
                }

                return updatedErrors;
            });
        }
    };


    // 4. MANEJADOR DE BLUR - MEJORADO USANDO TUS VALIDACIONES EXISTENTES
    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        const targetId = id;
        let error: string | null = null;

        // ✅ USANDO TUS FUNCIONES DE VALIDACIÓN EXISTENTES
        switch (targetId) {
            case 'rutCompleto':
                error = validateChileanRUT(value);
                break;

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

            case 'contrasena':
                error = validateStrongPassword(value);
                break;

            case 'confirmarContrasena':
                error = validateConfirmPassword(formData.contrasena, value);
                break;

            case 'terminos':
                const isChecked = (e.target as HTMLInputElement).checked;
                error = isChecked ? null : "Debe aceptar los términos y condiciones";
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

            case 'regionPersonalizada':
                if (formData.usarRegionPersonalizada) {
                    error = validateIsRequired(value, "La región");
                }
                break;

            case 'comunaPersonalizada':
                if (formData.usarComunaPersonalizada) {
                    error = validateIsRequired(value, "La comuna");
                }
                break;

            case 'idRegion':
                if (!formData.usarRegionPersonalizada) {
                    error = formData.idRegion <= 0 ? "Debe seleccionar una región" : null;
                }
                break;

            case 'idComuna':
                if (!formData.usarComunaPersonalizada && esRegionMetropolitana) {
                    error = formData.direccion.idComuna <= 0 ? "Debe seleccionar una comuna" : null;
                }
                break;
        }

        handleFieldError(targetId, error);
    };

    // FUNCIÓN AUXILIAR PARA MANEJAR ERRORES DE FORMA CENTRALIZADA
    const handleFieldError = (fieldId: string, error: string | null) => {
        if (['calle', 'numero', 'idComuna'].includes(fieldId)) {
            // Campos anidados de dirección
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
                'contrasena', 'confirmarContrasena', 'terminos', 'idTipoUsuario',
                'idRegion', 'comunaPersonalizada', 'regionPersonalizada',
                'usarComunaPersonalizada', 'usarRegionPersonalizada', 'general',
                'detalleHomenaje', 'mensaje'
            ];

            // Verificar si fieldId es una clave válida
            if (validErrorKeys.includes(fieldId as keyof Errors)) {
                const validFieldId = fieldId as keyof Errors;

                if (error) {
                    setErrors(prev => ({
                        ...prev,
                        [validFieldId]: error
                    }));
                } else {
                    setErrors(prev => {
                        const { [validFieldId]: _, ...rest } = prev;
                        return rest;
                    });
                }
            } else {
                console.warn(`⚠️ Campo no válido para errores: ${fieldId}`);
            }
        }
    };

    // Función para crear el DTO de registro - CORREGIDA
    const crearRegistroDTO = (): UserRegistroBackendType => {
        const rutLimpio = formData.rutCompleto.replace(/[^0-9kK]/g, "").toUpperCase();
        const run = rutLimpio.slice(0, -1);
        const dv = rutLimpio.slice(-1);

        let idComunaFinal = formData.direccion.idComuna;

        if (formData.usarComunaPersonalizada) {
            idComunaFinal = 1; // ID de comuna por defecto
        }

        return {
            run: run,
            dv: dv,
            nombre: formData.nombre,
            apaterno: formData.aPaterno,
            amaterno: formData.aMaterno,
            telefono: formData.telefono.replace(/\s/g, ''),
            correo: formData.correo,
            contrasenia: formData.contrasena,
            idTipoUsuario: 5,
            direccion: {
                calle: formData.direccion.calle || "",
                numero: formData.direccion.numero || "",
                villa: formData.direccion.villa || undefined,
                complemento: formData.direccion.complemento || undefined,
                idComuna: idComunaFinal,
                coordenadas: formData.direccion.coordenadas || {
                    latitud: -33.45694,
                    longitud: -70.64827
                }
            }
        };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMessage(null);
        setErrors({});

        if (!formData.terminos) {
            setErrors({ general: "Debe aceptar los términos y condiciones" });
            return;
        }

        const esValido = validateForm();

        if (esValido) {
            setIsSubmitting(true);

            try {
                const usuarioParaBackend = crearRegistroDTO();
                console.log("📤 Enviando registro:", usuarioParaBackend);

                const usuarioCreado = await UseAuthService.register(usuarioParaBackend);
                console.log("✅ Usuario registrado:", usuarioCreado);

                //  MOSTRAR MENSAJE DE ÉXITO Y REDIRIGIR AL HOME
                setSuccessMessage("✅ ¡Registro exitoso! Serás redirigido al inicio...");

                // Redirigir después de 3 segundos
                setTimeout(() => {
                    navigate('/'); // Cambia '/home' por la ruta de tu página de inicio
                }, 3000);

            } catch (error: any) {
                console.error("❌ Error en registro:", error);
                setErrors({ general: error.message });
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    // Funciones para alternar entre selección y texto personalizado
    const toggleModoRegion = (usarPersonalizada: boolean) => {
        setFormData(prev => ({
            ...prev,
            usarRegionPersonalizada: usarPersonalizada,
            idRegion: usarPersonalizada ? 0 : prev.idRegion,
            regionPersonalizada: usarPersonalizada ? prev.regionPersonalizada : ""
        }));
    };

    const toggleModoComuna = (usarPersonalizada: boolean) => {
        setFormData(prev => ({
            ...prev,
            usarComunaPersonalizada: usarPersonalizada,
            direccion: {
                ...prev.direccion,
                idComuna: usarPersonalizada ? 0 : prev.direccion.idComuna
            },
            comunaPersonalizada: usarPersonalizada ? prev.comunaPersonalizada : ""
        }));
    };

    const formatLabel = (label: string): string => {
        return `${label}:`;
    };

    return (
        <div className={styles.registroPageContainer}>
            <div className={styles.contenedorPrincipalCentrado}>
                <div className={styles.seccionFormularioCentrada}>
                    <div className={styles.logoFormulario}>
                        <img
                            src={Logo}
                            alt="SAFE Rescue Logo"
                            width="80"
                            height="80"
                            className={styles.logoCentrado}
                        />
                    </div>

                    <h1 className={styles.tituloFormulario}>Crear una cuenta</h1>
                    <p className={styles.subtituloFormulario}>Completa tus datos para unirte a nuestra comunidad</p>

                    {successMessage && (
                        <div className={styles.successMessageBox}>
                            <div className={styles.successContent}>
                                <span style={{ marginRight: '10px' }}>✅</span>
                                {successMessage}
                                <div className={styles.progressBar}>
                                    <div className={styles.progressFill}></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {errors.general && (
                        <div className={`${styles.successMessageBox} ${styles.inputError}`} style={{ backgroundColor: 'rgba(255, 0, 0, 0.1)', color: 'var(--color-error)', borderColor: 'var(--color-error)' }}>
                            <span style={{ marginRight: '10px' }}>⚠️</span>
                            {errors.general}
                        </div>
                    )}

                    <form className={styles.form} id="form" onSubmit={handleSubmit} noValidate>
                        {/* SECCIÓN 1: DATOS PERSONALES */}
                        <div className={styles.seccionFormularioGrupo}>
                            <h3 className={styles.tituloSeccion}>Datos Personales</h3>

                            <div className={styles.formRow}>
                                <div className={styles.formColFull}>
                                    <RutInputField
                                        value={formData.rutCompleto}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={errors.rutCompleto}
                                        fieldId="rutCompleto"
                                        label={formatLabel("RUT")}
                                    />
                                </div>
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formColFull}>
                                    <FormField
                                        id="nombre"
                                        dataTestId="register-nombre"
                                        label={formatLabel("Nombre Completo")}
                                        placeholder="Juan"
                                        value={formData.nombre}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={errors.nombre}
                                    />
                                </div>
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formCol}>
                                    <FormField
                                        id="aPaterno"
                                        dataTestId="register-aPaterno"
                                        label={formatLabel("Apellido Paterno")}
                                        placeholder="Pérez"
                                        value={formData.aPaterno}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={errors.aPaterno}
                                    />
                                </div>
                                <div className={styles.formCol}>
                                    <FormField
                                        id="aMaterno"
                                        dataTestId="register-aMaterno"
                                        label={formatLabel("Apellido Materno")}
                                        placeholder="González"
                                        value={formData.aMaterno}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={errors.aMaterno}
                                    />
                                </div>
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formColFull}>
                                    <FormField
                                        id="correo"
                                        dataTestId="register-correo"
                                        label={formatLabel("Correo Electrónico")}
                                        placeholder="tu.correo@ejemplo.com"
                                        type="email"
                                        value={formData.correo}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={errors.correo}
                                    />
                                </div>
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formColFull}>
                                    <PhoneInputField
                                        value={formData.telefono}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={errors.telefono}
                                        fieldId="telefono"
                                        label={formatLabel("Número de Teléfono")}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={styles.separadorSeccion}></div>

                        {/* SECCIÓN 2: DIRECCIÓN */}
                        <div className={styles.seccionFormularioGrupo}>
                            <h3 className={styles.tituloSeccion}>Dirección</h3>

                            <div className={styles.formRow}>
                                <div className={styles.formCol}>
                                    <FormField
                                        id="calle"
                                        dataTestId="register-calle"
                                        label={formatLabel("Calle")}
                                        placeholder="Nombre de la calle"
                                        value={formData.direccion.calle}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={errors.direccion?.calle}
                                    />
                                </div>
                                <div className={styles.formCol}>
                                    <FormField
                                        id="numero"
                                        dataTestId="register-numero"
                                        label={formatLabel("Número")}
                                        placeholder="123"
                                        value={formData.direccion.numero}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={errors.direccion?.numero}
                                        type="number"
                                    />
                                </div>
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formCol}>
                                    <FormField
                                        id="villa"
                                        dataTestId="register-villa"
                                        label={formatLabel("Villa/Población") + " (Opcional)"}
                                        placeholder="Nombre de la villa"
                                        value={formData.direccion.villa || ""}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={errors.direccion?.villa}
                                        required={false}
                                    />
                                </div>
                                <div className={styles.formCol}>
                                    <FormField
                                        id="complemento"
                                        dataTestId="register-complemento"
                                        label={formatLabel("Complemento") + " (Opcional)"}
                                        placeholder="Depto, block, etc."
                                        value={formData.direccion.complemento || ""}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={errors.direccion?.complemento}
                                        required={false}
                                    />
                                </div>
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formColFull}>
                                    <div className={styles.formGroupRegistro}>
                                        <div className={styles.checkboxContainer}>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.usarRegionPersonalizada}
                                                    onChange={(e) => toggleModoRegion(e.target.checked)}
                                                />
                                                ¿Tu región no está en la lista? Escríbela
                                            </label>
                                        </div>

                                        {formData.usarRegionPersonalizada ? (
                                            <FormField
                                                id="regionPersonalizada"
                                                dataTestId="register-regionPersonalizada"
                                                label={formatLabel("Región")}
                                                placeholder="Escribe tu región"
                                                value={formData.regionPersonalizada}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                error={errors.regionPersonalizada}
                                            />
                                        ) : (
                                            <>
                                                <label htmlFor="idRegion">{formatLabel("Región")}</label>
                                                <select
                                                    id="idRegion"
                                                    className={`${styles.formControlRegistro} ${styles.fullWidthSelect} ${styles.selectMejorado} ${errors.idRegion ? styles.inputError : ''}`}
                                                    value={formData.idRegion}
                                                    onChange={handleChange}
                                                    onBlur={(e) => handleSelectBlur('idRegion', e.target.value)}
                                                    required
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
                                                    <p className={`${styles.mensajeError} ${styles.errorText}`}>{errors.idRegion}</p>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formColFull}>
                                    <div className={styles.formGroupRegistro}>
                                        <div className={styles.checkboxContainer}>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.usarComunaPersonalizada}
                                                    onChange={(e) => toggleModoComuna(e.target.checked)}
                                                />
                                                ¿Tu comuna no está en la lista? Escríbela
                                            </label>
                                        </div>

                                        {formData.usarComunaPersonalizada ? (
                                            <FormField
                                                id="comunaPersonalizada"
                                                dataTestId="register-comunaPersonalizada"
                                                label={formatLabel("Comuna")}
                                                placeholder="Escribe tu comuna"
                                                value={formData.comunaPersonalizada}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                error={errors.comunaPersonalizada}
                                            />
                                        ) : (
                                            <>
                                                <label htmlFor="idComuna">{formatLabel("Comuna")}</label>
                                                <select
                                                    id="idComuna"
                                                    className={`${styles.formControlRegistro} ${styles.fullWidthSelect} ${styles.selectMejorado} ${errors.direccion?.idComuna ? styles.inputError : ''}`}
                                                    value={formData.direccion.idComuna}
                                                    onChange={handleChange}
                                                    onBlur={(e) => handleSelectBlur('idComuna', e.target.value)}
                                                    required
                                                    disabled={loadingGeografia || !esRegionMetropolitana || comunasFiltradas.length === 0}
                                                >
                                                    <option value={0}>
                                                        {!formData.idRegion && !formData.usarRegionPersonalizada
                                                            ? 'Primero selecciona una región'
                                                            : loadingGeografia
                                                                ? 'Cargando comunas...'
                                                                : !esRegionMetropolitana
                                                                    ? 'Comunas no disponibles para esta región'
                                                                    : comunasFiltradas.length === 0
                                                                        ? 'Sin comunas registradas para la RM'
                                                                        : 'Selecciona una comuna'}
                                                    </option>

                                                    {!loadingGeografia && comunasFiltradas.length > 0 && comunasFiltradas.map(comuna => (
                                                        <option key={comuna.idComuna} value={comuna.idComuna}>
                                                            {comuna.nombre}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.direccion?.idComuna && (
                                                    <p className={`${styles.mensajeError} ${styles.errorText}`}>{errors.direccion.idComuna}</p>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.separadorSeccion}></div>

                        {/* SECCIÓN 3: CONTRASEÑA Y TÉRMINOS */}
                        <div className={styles.seccionFormularioGrupo}>
                            <h3 className={styles.tituloSeccion}>Seguridad</h3>

                            <div className={styles.formRow}>
                                <div className={styles.formCol}>
                                    <PasswordInputField
                                        fieldId="contrasena"
                                        label={formatLabel("Contraseña")}
                                        placeholder="Crea una contraseña segura"
                                        value={formData.contrasena}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={errors.contrasena}
                                    />
                                </div>
                                <div className={styles.formCol}>
                                    <PasswordInputField
                                        fieldId="confirmarContrasena"
                                        label={formatLabel("Confirmar Contraseña")}
                                        placeholder="Repite tu contraseña"
                                        value={formData.confirmarContrasena}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={errors.confirmarContrasena}
                                    />
                                </div>
                            </div>

                            <div className={styles.checkboxContainer}>
                                <input
                                    type="checkbox"
                                    id="terminos"
                                    data-testid="register-terms"
                                    name="terminos"
                                    required
                                    checked={formData.terminos}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                                <label htmlFor="terminos">{formatLabel("Acepto los términos y condiciones del servicio")}</label>
                                {errors.terminos && (
                                    <p className={`${styles.mensajeError} ${styles.errorText} ${styles.terminosErrorPosition}`}>{errors.terminos}</p>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            className={styles.btnRegistro}
                            data-testid="register-submit"
                            disabled={isSubmitting || loadingGeografia}
                        >
                            {isSubmitting ? 'Registrando...' : 'Crear Cuenta'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Registrarse;