import React, { useState, useCallback } from "react";
import Logo from "../assets/sr_logo.png";
import styles from './Contactanos.module.css';

// --- UTILITIES Y TIPOS REQUERIDOS ---

// Tipos
interface ContactData {
    nombre: string;
    email: string;
    telefono: string;
    direccion: string;
    mensaje: string;
}

interface Errors {
    nombre?: string;
    email?: string;
    telefono?: string;
    direccion?: string;
    mensaje?: string;
    general?: string;
}

// Datos de Perfil (Simulado, basado en la función original)
interface UserData {
    name: string;
    email: string;
    phone: string;
    address: string;
}

// FUNCIONES DE FORMATO DE TELÉFONO
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
// FIN FUNCIONES DE FORMATO

const getProfileData = (): UserData | null => {
    const isAuthenticated = true;
    if (isAuthenticated) {
        return {
            name: "Juan Pérez González",
            email: "tu.correo@ejemplo.com",
            phone: "912345678",
            address: "Calle 123, Comuna",
        };
    }
    return null;
};

// --- Sub-Componente Campo de Entrada Reutilizable para Contactanos ---
const InputField: React.FC<{
    id: keyof ContactData;
    label: string;
    placeholder: string;
    type?: 'text' | 'email' | 'tel';
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    error: string | undefined;
    isTextArea?: boolean;
}> = ({ id, label, placeholder, type = 'text', value, onChange, error, isTextArea = false }) => (
    // CLASE GLOBAL: formGroupRegistro
    <div className="formGroupRegistro"> 
        <label htmlFor={id}>{label}</label>
        {isTextArea ? (
            <textarea
                id={id}
                // CLASES GLOBALES: formControlRegistro, inputError
                className={`formControlRegistro form-control ${error ? 'inputError' : ''}`}
                placeholder={placeholder}
                required
                value={value}
                onChange={onChange}
                rows={5}
            ></textarea>
        ) : (
            <input
                type={type}
                // CLASES GLOBALES: formControlRegistro, inputError
                className={`formControlRegistro form-control ${error ? 'inputError' : ''}`}
                id={id}
                placeholder={placeholder}
                required
                value={value}
                onChange={onChange}
            />
        )}
        {error && (
            // CLASES GLOBALES: mensajeError, errorText
            <p className="mensajeError errorText">{error}</p>
        )}
    </div>
);


// --- Componente Contactanos Principal ---
const Contactanos: React.FC = () => {
    const profileData = getProfileData();

    // 1. Estados del Formulario
    const [formData, setFormData] = useState<ContactData>({
        nombre: "",
        email: "",
        telefono: "",
        direccion: "",
        mensaje: "",
    });

    const [errors, setErrors] = useState<Errors>({});
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Por defecto el checkbox debe estar desactivado (no seleccionado)
    const [useProfile, setUseProfile] = useState(false);

    // 2. Manejo de Cambios (Centralizado y adaptado para Input y TextArea)
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        const targetId = id as keyof ContactData;
        let newValue = value;

        if (targetId === 'telefono') {
            const cleanValue = cleanPhoneNumber(value);
            newValue = formatPhoneNumber(cleanValue);
        }

        setFormData(prev => ({
            ...prev,
            [targetId]: newValue
        }));

        // Limpiar error reactivamente
        if (errors[targetId as keyof Errors]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[targetId as keyof Errors];
                return newErrors;
            });
        }
        if (successMessage) setSuccessMessage(null);
    };

    // 3. Lógica de Autollenado (adaptada para usar formData)
    const handleProfileToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        setUseProfile(checked);

        if (checked && profileData) {
            // Cargar datos de perfil, aplicando formato al teléfono
            setFormData(prev => ({
                ...prev,
                nombre: profileData.name,
                email: profileData.email,
                telefono: formatPhoneNumber(profileData.phone),
                direccion: profileData.address,
            }));
            setErrors({}); // Limpiar errores al autocompletar
        } else if (!checked) {
            // Desmarcar: Limpiar campos de perfil, manteniendo el mensaje actual
            setFormData(prev => ({
                ...prev,
                nombre: "",
                email: "",
                telefono: "",
                direccion: "",
            }));
        }
    };
    
    // 4. Lógica de Validación Principal
    const validateForm = useCallback((): boolean => {
        const newErrors: Errors = {};
        let isValid = true;

        // Limpiar y normalizar datos
        const cleanData = {
            nombre: formData.nombre.trim(),
            email: formData.email.trim(),
            telefono: cleanPhoneNumber(formData.telefono), // Usar teléfono limpio para validación
            direccion: formData.direccion.trim(),
            mensaje: formData.mensaje.trim(),
        };
        
        // --- VALIDACIONES ---

        // Validación de Nombre
        if (!cleanData.nombre) {
            newErrors.nombre = "El nombre es obligatorio.";
            isValid = false;
        } else if (cleanData.nombre.length < 2 || cleanData.nombre.length > 50) {
            newErrors.nombre = "El nombre debe tener entre 2 y 50 caracteres.";
            isValid = false;
        }

        // Validación de Correo
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!cleanData.email) {
            newErrors.email = "El correo electrónico es obligatorio.";
            isValid = false;
        } else if (!emailRegex.test(cleanData.email)) {
            newErrors.email = "Formato de correo electrónico inválido.";
            isValid = false;
        } else if (cleanData.email.length > 100) {
            newErrors.email = "El correo no puede exceder los 100 caracteres.";
            isValid = false;
        }

        // Validación de Teléfono (usando el valor limpio)
        const phoneRegex = /^[0-9]+$/;
        if (!cleanData.telefono) {
            newErrors.telefono = "El teléfono es obligatorio.";
            isValid = false;
        } else if (!phoneRegex.test(cleanData.telefono)) {
            newErrors.telefono = "El teléfono solo puede contener números.";
            isValid = false;
        } else if (cleanData.telefono.length !== 9) { // Asumimos 9 dígitos exactos
            newErrors.telefono = "El teléfono debe tener 9 dígitos (ej. 912345678).";
            isValid = false;
        }
        
        // Validación de Dirección
        if (!cleanData.direccion) {
            newErrors.direccion = "La dirección es obligatoria.";
            isValid = false;
        } else if (cleanData.direccion.length < 10 || cleanData.direccion.length > 100) {
            newErrors.direccion = "La dirección debe tener entre 10 y 100 caracteres.";
            isValid = false;
        }

        // Validación de Mensaje
        if (!cleanData.mensaje) {
            newErrors.mensaje = "El mensaje es obligatorio.";
            isValid = false;
        } else if (cleanData.mensaje.length < 20) {
            newErrors.mensaje = "El mensaje es demasiado corto (mínimo 20 caracteres).";
            isValid = false;
        } else if (cleanData.mensaje.length > 500) {
             newErrors.mensaje = "El mensaje es demasiado largo (máximo 500 caracteres).";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    }, [formData]);

    // 5. Manejo del Envío
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMessage(null);

        if (validateForm()) {
            setIsSubmitting(true);
            
            // Usar datos limpios para el envío, especialmente el teléfono
            const dataToSend = {
                ...formData,
                telefono: cleanPhoneNumber(formData.telefono),
            };

            console.log("Datos a enviar:", dataToSend);
            
            // Simulación de envío de API
            setTimeout(() => {
                setIsSubmitting(false);
                setSuccessMessage(`¡Gracias ${formData.nombre}, tu mensaje ha sido enviado con éxito!`);
                
                // Limpiar el formulario completamente después del envío
                setFormData({
                    nombre: "",
                    email: "",
                    telefono: "",
                    direccion: "",
                    mensaje: "",
                });
                // Asegurarse de que el checkbox esté desactivado
                setUseProfile(false);

            }, 1500);
        }
    };
    
    // --- Renderizado JSX ---
    return (
        <div className={styles.contactPageContainer}>
            <div className={styles.contenedorPrincipal}>
                {/* SECCIÓN FORMULARIO */}
                <div className={styles.seccionFormulario}>

                    <div className={styles.logoFormulario}>
                        <img
                            src={Logo}
                            alt="SAFE Rescue Logo"
                            width="60"
                            height="60"
                            className="d-inline-block align-text-top"
                        />
                    </div>

                    <h2 className={styles.tituloFormulario}>Contáctanos</h2>
                    <p className={styles.subtituloFormulario}>Envíanos un mensaje y te responderemos a la brevedad.</p>

                    {successMessage && (
                        // CLASE GLOBAL: successMessageBox
                        <div className="successMessageBox">
                            <span style={{ marginRight: '10px' }}>✅</span> 
                            {successMessage}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className={styles.form} id="contactForm" noValidate>

                        {/* Nombre */}
                        <InputField 
                            id="nombre" 
                            label="Nombre Completo" 
                            placeholder="Juan Pérez González" 
                            type="text"
                            value={formData.nombre} 
                            onChange={handleChange} 
                            error={errors.nombre} 
                        />

                        {/* Correo Electrónico */}
                        <InputField 
                            id="email" 
                            label="Correo Electrónico" 
                            placeholder="tu.correo@ejemplo.com" 
                            type="email"
                            value={formData.email} 
                            onChange={handleChange} 
                            error={errors.email} 
                        />

                        {/* CLASE GLOBAL: formRow */}
                        <div className="formRow">
                            {/* Teléfono */}
                            {/* CLASE GLOBAL: formCol */}
                            <div className="formCol"> 
                                <InputField 
                                    id="telefono" 
                                    label="Número Teléfono" 
                                    placeholder="9 1234 5678" 
                                    type="tel"
                                    value={formData.telefono} 
                                    onChange={handleChange} 
                                    error={errors.telefono} 
                                />
                            </div>
                            {/* Dirección */}
                            {/* CLASE GLOBAL: formCol */}
                            <div className="formCol"> 
                                <InputField 
                                    id="direccion" 
                                    label="Dirección" 
                                    placeholder="Calle 123, Comuna" 
                                    type="text"
                                    value={formData.direccion} 
                                    onChange={handleChange} 
                                    error={errors.direccion} 
                                />
                            </div>
                        </div>
                        
                        {/* Mensaje */}
                        <InputField 
                            id="mensaje" 
                            label="Mensaje" 
                            placeholder="Escribe tu mensaje aquí (mínimo 20 caracteres)..." 
                            value={formData.mensaje} 
                            onChange={handleChange} 
                            error={errors.mensaje} 
                            isTextArea={true}
                        />

                        {/* Checkbox de Autocompletar */}
                        {profileData && (
                            // CLASE GLOBAL: checkboxContainer
                            <div className="checkboxContainer">
                                <input
                                    type="checkbox"
                                    name="autofill"
                                    id="autofillCheckbox"
                                    checked={useProfile}
                                    onChange={handleProfileToggle}
                                    className="form-check-input"
                                />
                                <label htmlFor="autofillCheckbox">Usar mis datos de perfil</label>
                            </div>
                        )}

                        <button 
                            type="submit" 
                            // CLASE GLOBAL: btnRegistro
                            className="btnRegistro mt-4"
                            disabled={isSubmitting}
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