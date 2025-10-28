import React, { useState, useCallback } from "react";
import Logo from "../assets/sr_logo.png";
import styles from './Contactanos.module.css';

import type { Errors, ContactData, AuthContextType, UserData } from '../types/UserType';

import FormField from '../components/Formulario'; 

import { useAuth } from '../components/UseAuth'; // 💡

import {
    validateEmail,
    validatePhoneNumber,
    validateNameLettersOnly,
    validateIsRequired,
    validateMessage
} from '../utils/Validaciones';

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


const Contactanos: React.FC = () => {
    const { authData: user, isLoggedIn: isAuthenticated } = useAuth();
    
    const [authError, setAuthError] = useState<string | null>(null);

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

    const handleProfileToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        setUseProfile(checked);
        setAuthError(null); 

        if (checked) {
            if (isAuthenticated && user) {
                setFormData(prev => ({
                    ...prev,
                    nombre: user.nombre,
                    email: user.email,
                    telefono: formatPhoneNumber(user.telefono),
                    direccion: user.direccion,
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
                email: "",
                telefono: "",
                direccion: "",
            }));
        }
    };

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


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setAuthError(null);

        if (validateForm()) {
            setIsSubmitting(true);

            const dataToSend: ContactData = {
                ...formData,
                telefono: cleanPhoneNumber(formData.telefono),
            };

            console.log("Datos a enviar:", dataToSend);

            setTimeout(() => {
                setIsSubmitting(false);
                setMessage({ type: 'success', text: `¡Gracias ${formData.nombre}, tu mensaje ha sido enviado con éxito! 😊` });

                setFormData({ nombre: "", email: "", telefono: "", direccion: "", mensaje: "" });
                setUseProfile(false);
                setErrors({});

            }, 1500);
        } else {
            setMessage({ type: 'error', text: ' Por favor, corrige los errores antes de enviar.' });
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
                            id="email"
                            label="Correo Electrónico"
                            placeholder="tu.correo@ejemplo.com"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.email}
                            disabled={useProfile} 
                            dataTestId="contact-email"
                        />

                        <div className="formRow">
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
                                    disabled={useProfile} 
                                    dataTestId="contact-telefono"
                                />
                            </div>
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
                                    disabled={useProfile} 
                                    dataTestId="contact-direccion"
                                />
                            </div>
                        </div>

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
                                <label htmlFor="autofillCheckbox" data-testid="autofill-label">Usar mis datos de perfil</label>
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