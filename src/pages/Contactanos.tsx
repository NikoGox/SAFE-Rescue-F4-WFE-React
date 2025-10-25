import React, { useState, useCallback } from "react";
import Logo from "../assets/sr_logo.png";
import styles from './Contactanos.module.css';

// Importamos los tipos optimizados
import type { Errors, ContactData, AuthContextType, UserData } from '../types/UserType';

// ⭐ IMPORTAMOS EL COMPONENTE FormField CENTRAL
import FormField from '../components/Formulario'; 

// ⭐ IMPORTAMOS EL HOOK REAL (Ajustamos la desestructuración)
import { useAuth } from '../components/UseAuth'; // 💡

import {
    validateEmail,
    validatePhoneNumber,
    validateNameLettersOnly,
    validateIsRequired,
    validateMessage
} from '../utils/Validaciones';

// =================================================================
// 1. FUNCIONES DE UTILIDAD (Formato de Teléfono) - Se mantienen igual
// =================================================================

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

// =================================================================
// 3. COMPONENTE PRINCIPAL: CONTACTANOS
// =================================================================

const Contactanos: React.FC = () => {
    // ⭐ CAMBIO CRUCIAL: Usamos la desestructuración correcta del hook
    // Renombramos 'authData' a 'user' y 'isLoggedIn' a 'isAuthenticated'
    const { authData: user, isLoggedIn: isAuthenticated } = useAuth();
    
    // Nuevo estado para el error de autenticación del autocompletado
    const [authError, setAuthError] = useState<string | null>(null);

    // 1. Estados
    const [formData, setFormData] = useState<ContactData>({
        nombre: "",
        email: "",
        telefono: "",
        direccion: "",
        mensaje: "",
    });
    const [errors, setErrors] = useState<Errors>({});
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [useProfile, setUseProfile] = useState(false);

    // 2. Lógica de Validación de Campo Único (Usando validadores importados)
    const validateField = (field: keyof ContactData, value: string): string | null => {
        const valueToValidate = field === 'telefono' ? cleanPhoneNumber(value) : value;

        switch (field) {
            case 'nombre':
                return validateNameLettersOnly(valueToValidate);
            case 'email':
                return validateEmail(valueToValidate);
            case 'telefono':
                return validatePhoneNumber(valueToValidate);
            case 'direccion':
                return validateIsRequired(valueToValidate, "La Dirección");
            case 'mensaje':
                return validateMessage(valueToValidate);
            default:
                return null; 
        }
    };


    // 3. Manejo de Cambios y Blur (usando validateField)
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        const targetId = id as keyof ContactData; 
        let newValue: string | boolean = value;

        if (targetId === 'telefono') {
            const cleanValue = cleanPhoneNumber(value);
            newValue = formatPhoneNumber(cleanValue);
        }

        setFormData(prev => ({
            ...prev,
            [targetId]: newValue as string 
        }));

        // Al escribir, se desactiva el autocompletado y se limpia el error de auth
        if (useProfile && isAuthenticated) {
            setUseProfile(false);
        }
        setAuthError(null);
        setMessage(null);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        const field = id as keyof ContactData;
        const error = validateField(field, value);

        setErrors(prev => ({ ...prev, [field]: error }));
    };

    // 4. Lógica de Autollenado 
    const handleProfileToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        setUseProfile(checked);
        setAuthError(null); // Limpiar errores anteriores

        if (checked) {
            // 🛑 Usamos 'isAuthenticated' y el objeto 'user' real
            if (isAuthenticated && user) {
                // Autocompletar con UserData (datos del usuario logueado)
                setFormData(prev => ({
                    ...prev,
                    nombre: user.nombre, // 🛑 Datos reales
                    email: user.email, // 🛑 Datos reales
                    // Formatear el teléfono antes de establecerlo
                    telefono: formatPhoneNumber(user.telefono), // 🛑 Datos reales
                    direccion: user.direccion, // 🛑 Datos reales
                    mensaje: prev.mensaje, 
                }));
                setErrors({}); // Limpiar errores de validación de campos
            } else {
                // MENSAJE DE ERROR DE AUTENTICACIÓN
                setAuthError("⚠️ Debes iniciar sesión para usar la información de tu perfil.");
                setUseProfile(false); // Desmarcar el checkbox si no está logueado
            }
        } else {
            // Limpiar campos de perfil, manteniendo el mensaje
            setFormData(prev => ({
                ...prev,
                nombre: "",
                email: "",
                telefono: "",
                direccion: "",
            }));
        }
    };

    // 5. Lógica de Validación Completa (antes de enviar)
    const validateForm = useCallback((): boolean => {
        const newErrors: Errors = {};
        let isValid = true;

        (Object.keys(formData) as Array<keyof ContactData>).forEach(field => {
            const error = validateField(field, formData[field]);
            if (error) {
                newErrors[field] = error; 
                isValid = false;
            }
        });

        setErrors(newErrors);
        return isValid;
    }, [formData]);


    // 6. Manejo del Envío
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setAuthError(null);

        if (validateForm()) {
            setIsSubmitting(true);

            const dataToSend: ContactData = {
                ...formData,
                // Asegurarse de enviar el teléfono limpio
                telefono: cleanPhoneNumber(formData.telefono),
            };

            console.log("Datos a enviar:", dataToSend);

            // Simulación de envío
            setTimeout(() => {
                setIsSubmitting(false);
                setMessage({ type: 'success', text: `¡Gracias ${formData.nombre}, tu mensaje ha sido enviado con éxito! 😊` });

                // Resetear el formulario
                setFormData({ nombre: "", email: "", telefono: "", direccion: "", mensaje: "" });
                setUseProfile(false);
                setErrors({});

            }, 1500);
        } else {
            setMessage({ type: 'error', text: ' Por favor, corrige los errores antes de enviar.' });
        }
    };

    // --- Renderizado JSX ---
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

                    {/* Mensaje de Éxito/Error */}
                    {message && (
                        <div className={`successMessageBox ${message.type === 'error' ? 'error' : ''}`} data-testid="contact-message-box">
                            <span style={{ marginRight: '10px' }}>{message.type === 'success' ? '✅' : '❌'}</span>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className={styles.form} id="contactForm" noValidate data-testid="contact-form">


                        {/* Nombre */}
                        <FormField
                            id="nombre"
                            label="Nombre Completo"
                            placeholder="Juan Pérez González"
                            type="text"
                            value={formData.nombre}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.nombre}
                            // El campo se deshabilita si la opción "Usar perfil" está activa
                            disabled={useProfile} 
                            dataTestId="contact-nombre"
                        />

                        {/* Correo Electrónico */}
                        <FormField
                            id="email"
                            label="Correo Electrónico"
                            placeholder="tu.correo@ejemplo.com"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.email}
                            // El campo se deshabilita si la opción "Usar perfil" está activa
                            disabled={useProfile} 
                            dataTestId="contact-email"
                        />

                        <div className="formRow">
                            {/* Teléfono */}
                            <div className="formCol">
                                <FormField
                                    id="telefono"
                                    label="Número Teléfono"
                                    placeholder="9 1234 5678"
                                    type="tel"
                                    value={formData.telefono}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={errors.telefono}
                                    // El campo se deshabilita si la opción "Usar perfil" está activa
                                    disabled={useProfile} 
                                    dataTestId="contact-telefono"
                                />
                            </div>
                            {/* Dirección */}
                            <div className="formCol">
                                <FormField
                                    id="direccion"
                                    label="Dirección"
                                    placeholder="Calle 123, Comuna"
                                    type="text"
                                    value={formData.direccion}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={errors.direccion}
                                    // El campo se deshabilita si la opción "Usar perfil" está activa
                                    disabled={useProfile} 
                                    dataTestId="contact-direccion"
                                />
                            </div>
                        </div>

                        {/* Mensaje (TextArea) - Usando isTextArea={true} */}
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

                        {/* Checkbox de Autocompletar */}
                        {isAuthenticated && ( // 🛑 Usamos 'isAuthenticated' real
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
                                <label htmlFor="autofillCheckbox" data-testid="autofill-label">Usar mis datos de perfil</label>
                                {/* Mensaje de error de autenticación (si aplica) */}
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