import React, { useState, useCallback } from "react";
import Logo from "../assets/sr_logo.png";
import styles from './Contactanos.module.css';

import type { Errors, ContactData, UserData } from '../types/PerfilesType';
import type { NotificacionCreationDTO } from '../types/ComunicacionType';

import FormField from '../components/Formulario'; 
import { useAuth } from '../hooks/useAuth'; 
import NotificacionService from "../service/services/comunicaciones/NotificacionService";

import {
    validateEmail,
    validatePhoneNumber,
    validateNameLettersOnly,
    validateIsRequired,
    validateMessage
} from '../utils/Validaciones';

// Funciones para manejo de teléfono
const cleanPhoneNumber = (formattedValue: string): string => {
    return formattedValue.replace(/[^\d]/g, '');
};

const formatPhoneNumber = (value: string): string => {
    const cleanValue = cleanPhoneNumber(value);
    const limit = 9;
    let formattedValue = cleanValue.substring(0, limit);

    if (formattedValue.length > 5) {
        formattedValue = formattedValue.replace(/^(\d)(\d{4})(\d{0,4})$/, '$1 $2 $3');
    } else if (formattedValue.length > 1) {
        formattedValue = formattedValue.replace(/^(\d)(\d{0,4})$/, '$1 $2');
    }

    return formattedValue.trim();
};

// Interface actualizada sin dirección - usando correo en lugar de email
interface ContactDataSinDireccion {
    nombre: string;
    correo: string;
    telefono: string;
    mensaje: string;
}

const Contactanos: React.FC = () => {
    const { authData: user, isLoggedIn: isAuthenticated } = useAuth();
    
    const [authError, setAuthError] = useState<string | null>(null);
    const [formData, setFormData] = useState<ContactDataSinDireccion>({
        nombre: "",
        correo: "",
        telefono: "",
        mensaje: "",
    });
    const [errors, setErrors] = useState<Errors>({});
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [useProfile, setUseProfile] = useState(false);

    // ID del administrador debe ser numérico
    const ID_ADMIN_RECEPTOR = 1;

    // Función de validación de campos
    const validateField = (field: keyof ContactDataSinDireccion, value: string): string | null => {
        const valueToValidate = field === 'telefono' ? cleanPhoneNumber(value) : value;

        switch (field) {
            case 'nombre':
                return validateNameLettersOnly(valueToValidate);
            case 'correo':
                return validateEmail(valueToValidate);
            case 'telefono':
                return validatePhoneNumber(valueToValidate);
            case 'mensaje':
                return validateMessage(valueToValidate);
            default:
                return null; 
        }
    };

    // CORRECCIÓN: Manejo de cambios que incluye HTMLSelectElement
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        const targetId = id as keyof ContactDataSinDireccion;
        let newValue: string = value;

        if (targetId === 'telefono') {
            const cleanValue = cleanPhoneNumber(value);
            newValue = formatPhoneNumber(cleanValue);
        }

        setFormData(prev => ({
            ...prev,
            [targetId]: newValue
        }));

        if (useProfile && isAuthenticated) {
            setUseProfile(false);
        }
        setAuthError(null);
        setMessage(null);
    };

    // CORRECCIÓN: Manejo de blur que incluye HTMLSelectElement
    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        const field = id as keyof ContactDataSinDireccion;
        const error = validateField(field, value);

        setErrors(prev => ({ ...prev, [field]: error }));
    };

    // Manejo del toggle de perfil
    const handleProfileToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        setUseProfile(checked);
        setAuthError(null);

        if (checked) {
            if (isAuthenticated && user) {
                setFormData(prev => ({
                    ...prev,
                    nombre: user.nombre,
                    correo: user.correo,
                    telefono: formatPhoneNumber(user.telefono),
                    mensaje: prev.mensaje,
                }));
                setErrors({});
            } else {
                setAuthError("⚠️ Debes iniciar sesión para usar la información de tu perfil.");
                setUseProfile(false);
            }
        } else {
            setFormData(prev => ({
                ...prev,
                nombre: "",
                correo: "",
                telefono: "",
            }));
        }
    };

    // Validación del formulario completo
    const validateForm = useCallback((): boolean => {
        const newErrors: Errors = {};
        let isValid = true;

        (Object.keys(formData) as Array<keyof ContactDataSinDireccion>).forEach(field => {
            const error = validateField(field, formData[field]);
            if (error) {
                newErrors[field] = error; 
                isValid = false;
            }
        });

        setErrors(newErrors);
        return isValid;
    }, [formData]);

    // Crear notificación de contacto
    const crearNotificacionContacto = async (contactData: ContactDataSinDireccion): Promise<void> => {
        try {
            const detalleNotificacion = `
NUEVO MENSAJE DE CONTACTO

Nombre: ${contactData.nombre}
Correo: ${contactData.correo}
Teléfono: ${contactData.telefono}

Mensaje:
${contactData.mensaje}

${user ? ` Usuario autenticado: ${user.nombre} ${user.aPaterno} (ID: ${user.idUsuario})` : '👤 Usuario no autenticado'}
 Fecha: ${new Date().toLocaleString()}
            `.trim();

            const notificacionDTO: NotificacionCreationDTO = {
                idUsuarioReceptor: ID_ADMIN_RECEPTOR,
                detalle: detalleNotificacion,
                idEstado: 1,
                idConversacion: null
            };

            console.log("📤 Creando notificación:", notificacionDTO);
            
            const respuesta = await NotificacionService.crearNotificacion(notificacionDTO);
            console.log("✅ Notificación creada exitosamente:", respuesta);
            
        } catch (error: any) {
            console.error("❌ Error creando notificación:", error);
            throw new Error("No se pudo crear la notificación de contacto");
        }
    };

    // Manejo del envío del formulario
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setAuthError(null);

        if (validateForm()) {
            setIsSubmitting(true);

            try {
                const dataToSend: ContactDataSinDireccion = {
                    ...formData,
                    telefono: cleanPhoneNumber(formData.telefono),
                };

                console.log("Datos a enviar:", dataToSend);

                await crearNotificacionContacto(dataToSend);

                setMessage({ 
                    type: 'success', 
                    text: `¡Gracias ${formData.nombre}, tu mensaje ha sido enviado con éxito! 😊 Te contactaremos pronto.` 
                });

                setFormData({ 
                    nombre: "", 
                    correo: "", 
                    telefono: "", 
                    mensaje: "" 
                });
                setUseProfile(false);
                setErrors({});

            } catch (error: any) {
                console.error("Error en el proceso de envío:", error);
                setMessage({ 
                    type: 'error', 
                    text: 'Hubo un problema al enviar tu mensaje. Por favor, intenta nuevamente.' 
                });
            } finally {
                setIsSubmitting(false);
            }
        } else {
            setMessage({ 
                type: 'error', 
                text: 'Por favor, corrige los errores antes de enviar.' 
            });
        }
    };

    return (
        <div className={styles.contactPageContainer} data-testid="contact-page-container">
            <div className={styles.contenedorPrincipal}>
                <div className={styles.seccionFormulario}>

                    <div className={styles.logoFormulario}>
                        <img
                            src={Logo}
                            alt="SAFE Rescue Logo"
                            data-testid="contact-logo"
                        />
                    </div>

                    <h2 className={styles.tituloFormulario} data-testid="contact-title">Contáctanos</h2>
                    <p className={styles.subtituloFormulario}>Envíanos un mensaje y te responderemos a la brevedad.</p>

                    {message && (
                        <div className={`successMessageBox ${message.type === 'error' ? 'error' : ''}`} data-testid="contact-message-box">
                            <span style={{ marginRight: '10px' }}>{message.type === 'success' ? '✅' : '❌'}</span>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className={styles.form} id="contactForm" noValidate data-testid="contact-form">
                        
                        <FormField
                            id="nombre"
                            label="Nombre Completo"
                            placeholder="Juan Pérez González"
                            type="text"
                            value={formData.nombre}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.nombre}
                            disabled={useProfile} 
                            dataTestId="contact-nombre"
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
                            disabled={useProfile} 
                            dataTestId="contact-email"
                        />

                        <FormField
                            id="telefono"
                            label="Número Teléfono"
                            placeholder="9 1234 5678"
                            type="tel"
                            value={formData.telefono}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.telefono}
                            disabled={useProfile} 
                            dataTestId="contact-telefono"
                        />

                        <FormField
                            id="mensaje"
                            label="Mensaje"
                            placeholder="Escribe tu mensaje aquí (mínimo 20 caracteres)..."
                            value={formData.mensaje}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.mensaje}
                            isTextArea={true} 
                            dataTestId="contact-mensaje"
                        />

                        {isAuthenticated && ( 
                            <div className={styles.checkboxContainer} data-testid="autofill-container">
                                <input
                                    type="checkbox"
                                    name="autofill"
                                    id="autofillCheckbox"
                                    checked={useProfile}
                                    onChange={handleProfileToggle}
                                    className="form-check-input"
                                    data-testid="autofill-checkbox"
                                />
                                <label htmlFor="autofillCheckbox" data-testid="autofill-label">
                                    Usar mis datos de perfil
                                </label>
                                {authError && (
                                    <p className={styles.authError} data-testid="auth-error">
                                        {authError}
                                    </p>
                                )}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btnRegistro mt-4"
                            disabled={isSubmitting}
                            data-testid="contact-submit-button"
                        >
                            {isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Contactanos;