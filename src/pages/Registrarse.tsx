import React, { useState, useCallback, useEffect } from "react";
import Logo from "../assets/sr_logo.png";
import styles from "./Registrarse.module.css"; 
import { useNavigate } from "react-router-dom"; 

// --- FUNCIÓN PURA: VALIDACIÓN CHILENA (Módulo 11) ---
const validateRut = (rut: string): boolean => {
    let cleanedRut = rut.replace(/[^0-9kK]/g, "").toUpperCase();
    
    if (cleanedRut.length < 8) {
        return false;
    }

    const body = cleanedRut.slice(0, -1);
    const digit = cleanedRut.slice(-1);

    if (!/^\d+$/.test(body)) {
        return false;
    }

    let sum = 0;
    let multiplier = 2;

    for (let i = body.length - 1; i >= 0; i--) {
        sum += parseInt(body.charAt(i), 10) * multiplier;
        multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }

    const calculatedDigit = 11 - (sum % 11);
    let expectedDigit;

    if (calculatedDigit === 11) {
        expectedDigit = '0';
    } else if (calculatedDigit === 10) {
        expectedDigit = 'K';
    } else {
        expectedDigit = calculatedDigit.toString();
    }

    return expectedDigit === digit;
};

// --- FUNCIÓN PARA FORMATEAR RUT ---
const formatRut = (rut: string): string => {
    // Limpiar el RUT (solo números y K)
    const cleanRut = rut.replace(/[^0-9kK]/g, "").toUpperCase();
    
    if (cleanRut.length <= 1) return cleanRut;
    
    let result = '';
    
    // Formato X.XXX.XXX-K
    const body = cleanRut.slice(0, -1);
    const digit = cleanRut.slice(-1);
    
    let bodyFormatted = '';
    for (let j = body.length - 1, counter = 0; j >= 0; j--, counter++) {
        bodyFormatted = body.charAt(j) + bodyFormatted;
        if (counter % 3 === 2 && j > 0) {
            bodyFormatted = '.' + bodyFormatted;
        }
    }
    
    result = bodyFormatted + (digit ? '-' + digit : '');
    return result;
};

// --- FUNCIÓN DE FORMATO DE TELÉFONO (Reutilizada del componente anterior) ---
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
// FIN FUNCIONES DE FORMATO DE TELÉFONO

// --- Definiciones de Tipos ---
interface UserType {
    rut: string;
    nombre: string;
    correo: string;
    direccion: string;
    telefono: string;
    nombreUsuario: string;
    contrasena: string;
}

interface Errors {
    rut?: string;
    nombre?: string;
    correo?: string;
    direccion?: string;
    telefono?: string;
    nombreUsuario?: string;
    contrasena?: string;
    confirmarContrasena?: string;
    terminos?: string;
    general?: string;
}

// --- Sub-Componente Campo de Entrada Reutilizable ---
const InputField: React.FC<{
    id: keyof UserType | 'confirmarContrasena';
    label: string;
    placeholder: string;
    type?: 'text' | 'email' | 'tel' | 'password';
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error: string | undefined;
}> = ({ id, label, placeholder, type = 'text', value, onChange, error }) => (
    <div className={styles.formGroupRegistro}>
        <label htmlFor={id}>{label}</label>
        <input
            type={type}
            className={`${styles.formControlRegistro} ${error ? styles.inputError : ''}`}
            id={id}
            placeholder={placeholder}
            required
            value={value}
            onChange={onChange}
            autoComplete={id.includes('contrasena') ? 'new-password' : 'on'}
        />
        {error && (
            <p className={`${styles.mensajeError} ${styles.errorText}`}>{error}</p>
        )}
    </div>
);

// --- Componente Específico para RUT con Formato ---
const RutInputField: React.FC<{
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error: string | undefined;
}> = ({ value, onChange, error }) => {
    const [displayValue, setDisplayValue] = useState(value);

    useEffect(() => {
        // Actualiza el valor mostrado cada vez que cambia el valor 'limpio' (value)
        setDisplayValue(formatRut(value));
    }, [value]);

    const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        
        // Limpiar el valor para guardar (solo números y K)
        const cleanValue = inputValue.replace(/[^0-9kK]/g, "").toUpperCase();
        
        // Crear un evento sintético con el valor limpio para que React lo maneje
        const syntheticEvent = {
            ...e,
            target: {
                ...e.target,
                value: cleanValue,
                id: 'rut'
            }
        };
        
        onChange(syntheticEvent);
    };

    return (
        <div className={styles.formGroupRegistro}>
            <label htmlFor="rut">RUT</label>
            <input
                type="text"
                className={`${styles.formControlRegistro} ${error ? styles.inputError : ''}`}
                id="rut"
                placeholder="12.345.678-9"
                required
                value={displayValue} // Usamos el valor formateado para la visualización
                onChange={handleRutChange} // Usamos el manejador que limpia y formatea
                autoComplete="rut"
                maxLength={12} 
            />
            {error && (
                <p className={`${styles.mensajeError} ${styles.errorText}`}>{error}</p>
            )}
        </div>
    );
};

// --- Componente Específico para Teléfono con Formato ---
const PhoneInputField: React.FC<{
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error: string | undefined;
}> = ({ value, onChange, error }) => {

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        
        // Limpiar el valor para validación y luego formatear para display/state
        const cleanValue = cleanPhoneNumber(inputValue);
        const formattedValue = formatPhoneNumber(cleanValue);
        
        // Crear un evento sintético con el valor formateado para que React lo maneje
        const syntheticEvent = {
            ...e,
            target: {
                ...e.target,
                value: formattedValue, // Guardamos el valor formateado en el estado
                id: 'telefono'
            }
        };
        
        onChange(syntheticEvent);
    };

    return (
        <div className={styles.formGroupRegistro}>
            <label htmlFor="telefono">Número Teléfono</label>
            <input
                id="telefono" 
                // Usamos el valor del estado (que ya estará formateado) para el display
                value={value} 
                onChange={handlePhoneChange} 
                type="tel"
                className={`${styles.formControlRegistro} ${error ? styles.inputError : ''}`}
                placeholder="9 1234 5678" 
                required
                // Se establece un maxLength más alto para permitir el espacio y el "9" inicial
                maxLength={11} 
                autoComplete="tel"
            />
            {error && (
                <p className={`${styles.mensajeError} ${styles.errorText}`}>{error}</p>
            )}
        </div>
    );
};


// --- Componente Registrarse Principal ---
const Registrarse: React.FC = () => {
    // 1. Estados del Formulario
    const [formData, setFormData] = useState<UserType & { 
        confirmarContrasena: string; 
        terminos: boolean;
    }>({
        rut: "", 
        nombre: "", 
        correo: "", 
        direccion: "", 
        telefono: "",
        nombreUsuario: "", 
        contrasena: "", 
        confirmarContrasena: "", 
        terminos: false,
    });

    const [errors, setErrors] = useState<Errors>({});
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    // 2. Manejo de Cambios (Centralizado)
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value, type, checked } = e.target;
        const targetId = id as keyof typeof formData;

        setFormData(prev => ({
            ...prev,
            [targetId]: type === 'checkbox' ? checked : value
        }));

        // Limpiar error reactivamente
        if (errors[targetId as keyof Errors] || (targetId === 'contrasena' || targetId === 'confirmarContrasena')) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[targetId as keyof Errors];
                if (targetId === 'contrasena' || targetId === 'confirmarContrasena') {
                    delete newErrors.confirmarContrasena;
                }
                 delete newErrors.general; 
                return newErrors;
            });
        }

        if (successMessage) {
            setSuccessMessage(null);
        }
    };

    // 3. Lógica de Validación Principal 
    const validateForm = useCallback((): boolean => {
        const newErrors: Errors = {};
        let isValid = true;
        
        // Limpiar y normalizar datos (teléfono se limpia para validación)
        const cleanData = {
            rut: formData.rut.trim(),
            nombre: formData.nombre.trim(),
            correo: formData.correo.trim(),
            direccion: formData.direccion.trim(),
            telefono: cleanPhoneNumber(formData.telefono), // Teléfono limpio para validación
            nombreUsuario: formData.nombreUsuario.trim(),
            contrasena: formData.contrasena,
            confirmarContrasena: formData.confirmarContrasena,
        };

        // Validación de RUT
        if (!cleanData.rut) {
            newErrors.rut = "El RUT es obligatorio.";
            isValid = false;
        } else if (!validateRut(cleanData.rut)) {
            newErrors.rut = "RUT inválido. Verifique el formato y dígito verificador.";
            isValid = false;
        }

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
        if (!cleanData.correo) {
            newErrors.correo = "El correo electrónico es obligatorio.";
            isValid = false;
        } else if (!emailRegex.test(cleanData.correo)) {
            newErrors.correo = "Formato de correo electrónico inválido.";
            isValid = false;
        } else if (cleanData.correo.length > 100) {
            newErrors.correo = "El correo no puede exceder los 100 caracteres.";
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

        // Validación de Teléfono (usando el valor limpio)
        if (!cleanData.telefono) {
            newErrors.telefono = "El teléfono es obligatorio.";
            isValid = false;
        } else if (!/^[0-9]{9}$/.test(cleanData.telefono)) { // Validar exactamente 9 dígitos
            newErrors.telefono = "El teléfono debe tener 9 dígitos (ej. 912345678).";
            isValid = false;
        }

        // Validación de Nombre de Usuario
        if (!cleanData.nombreUsuario) {
            newErrors.nombreUsuario = "El nombre de usuario es obligatorio.";
            isValid = false;
        } else if (cleanData.nombreUsuario.length < 4 || cleanData.nombreUsuario.length > 20) {
            newErrors.nombreUsuario = "El nombre de usuario debe tener entre 4 y 20 caracteres.";
            isValid = false;
        }

        // Validación de Contraseña
        if (!cleanData.contrasena) {
            newErrors.contrasena = "La contraseña es obligatoria.";
            isValid = false;
        } else if (cleanData.contrasena.length < 8 || cleanData.contrasena.length > 15) {
            newErrors.contrasena = "La contraseña debe tener entre 8 y 15 caracteres.";
            isValid = false;
        }

        // Validación de Confirmación de Contraseña
        if (!cleanData.confirmarContrasena) {
            newErrors.confirmarContrasena = "Debe confirmar la contraseña.";
            isValid = false;
        } else if (cleanData.contrasena !== cleanData.confirmarContrasena) {
            newErrors.confirmarContrasena = "Las contraseñas no coinciden.";
            isValid = false;
        }

        // Validación de Términos y Condiciones
        if (!formData.terminos) {
            newErrors.terminos = "Debes aceptar los términos y condiciones del servicio.";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    }, [formData]);

    // 4. Lógica de Envío (handleSend - Simulación)
    const handleSend = useCallback((user: UserType) => {
        setIsSubmitting(true);
        
        setTimeout(() => {
            try {
                // Simulación de búsqueda en localStorage
                const usuarios = JSON.parse(localStorage.getItem('usuariosRegistrados') || '[]') as UserType[];
                
                // Verificar si el correo o nombre de usuario ya existe
                const usuarioExiste = usuarios.some(u => 
                    u.correo === user.correo || u.nombreUsuario === user.nombreUsuario
                );

                if (usuarioExiste) {
                    setErrors(prev => ({ 
                        ...prev, 
                        general: "El correo electrónico o nombre de usuario ya está registrado." 
                    }));
                    setIsSubmitting(false);
                    return;
                }

                // Simulación de guardar usuario
                usuarios.push(user);
                localStorage.setItem('usuariosRegistrados', JSON.stringify(usuarios));

                setSuccessMessage(`¡Registro exitoso, ${user.nombre}! Ahora puedes iniciar sesión.`);
                
                // Limpiar el formulario
                setFormData({
                    rut: "", 
                    nombre: "", 
                    correo: "", 
                    direccion: "", 
                    telefono: "",
                    nombreUsuario: "", 
                    contrasena: "", 
                    confirmarContrasena: "", 
                    terminos: false,
                });
            } catch (error) {
                console.error('Error al guardar usuario:', error);
                setErrors(prev => ({ 
                    ...prev, 
                    general: "Error al registrar usuario. Intente nuevamente." 
                }));
            } finally {
                setIsSubmitting(false);
            }
        }, 1000);
    }, []);

    // 5. Manejo del Submit principal
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMessage(null);
        setErrors({}); 

        if (validateForm()) {
            const newUser: UserType = {
                rut: formData.rut,
                nombre: formData.nombre,
                correo: formData.correo,
                direccion: formData.direccion,
                // Limpiar el teléfono antes de enviarlo
                telefono: cleanPhoneNumber(formData.telefono),
                nombreUsuario: formData.nombreUsuario,
                contrasena: formData.contrasena,
            };
            handleSend(newUser);
        }
    };

    // --- Renderizado JSX ---
    return (
        // Nuevo contenedor para el centrado vertical (registroPageContainer)
        <div className={styles.registroPageContainer}>
            <div className={styles.contenedorPrincipal}>
                <div className={styles.seccionFormulario}>
                    <div className={styles.logoFormulario}>
                        <img
                            src={Logo} 
                            alt="SAFE Rescue Logo" 
                            width="70" 
                            height="70"
                            className="d-inline-block align-text-top"
                        />
                    </div>

                    <h1 className={styles.tituloFormulario}>Crear una cuenta</h1>
                    <p className={styles.subtituloFormulario}>Completa tus datos para unirte a nuestra comunidad</p>

                    {successMessage && (
                        <div className={styles.successMessageBox}>
                            <span style={{ marginRight: '10px' }}></span> 
                            {successMessage}
                        </div>
                    )}
                    
                    {errors.general && (
                        <div className={`${styles.successMessageBox} ${styles.inputError}`} style={{backgroundColor: 'rgba(255, 0, 0, 0.1)', color: 'var(--color-error)', borderColor: 'var(--color-error)'}}>
                            <span style={{ marginRight: '10px' }}></span> 
                            {errors.general}
                        </div>
                    )}


                    <form className={styles.form} id="form" onSubmit={handleSubmit} noValidate>
                        {/* Fila 1: RUT y Nombre */}
                        <div className={styles.formRow}>
                            <div className={styles.formCol}>
                                <InputField 
                                    id="nombre" 
                                    label="Nombre Completo" 
                                    placeholder="Juan Pérez González" 
                                    type="text"
                                    value={formData.nombre} 
                                    onChange={handleChange} 
                                    error={errors.nombre} 
                                />
                            </div>
                            <div className={styles.formCol}>
                                <RutInputField 
                                    value={formData.rut} 
                                    onChange={handleChange} 
                                    error={errors.rut} 
                                />
                            </div>
                        </div>

                        {/* Fila 2: Correo */}
                        <InputField 
                            id="correo" 
                            label="Correo Electrónico" 
                            placeholder="tu.correo@ejemplo.com" 
                            type="email"
                            value={formData.correo} 
                            onChange={handleChange} 
                            error={errors.correo} 
                        />

                        {/* Fila 3: Dirección y Teléfono */}
                        <div className={styles.formRow}>
                            <div className={styles.formCol}>
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
                            <div className={styles.formCol}>
                                <PhoneInputField 
                                    value={formData.telefono} 
                                    onChange={handleChange} 
                                    error={errors.telefono} 
                                />
                            </div>
                        </div>

                        {/* Fila 4: Nombre de Usuario */}
                        <InputField 
                            id="nombreUsuario" 
                            label="Nombre de Usuario" 
                            placeholder="Elige un nombre de usuario" 
                            type="text"
                            value={formData.nombreUsuario} 
                            onChange={handleChange} 
                            error={errors.nombreUsuario} 
                        />

                        {/* Fila 5: Contraseña y Confirmar Contraseña */}
                        <div className={styles.formRow}>
                            <div className={styles.formCol}>
                                <InputField 
                                    id="contrasena" 
                                    label="Contraseña" 
                                    placeholder="Crea una contraseña segura" 
                                    type="password"
                                    value={formData.contrasena} 
                                    onChange={handleChange} 
                                    error={errors.contrasena} 
                                />
                            </div>
                            <div className={styles.formCol}>
                                <InputField 
                                    id="confirmarContrasena" 
                                    label="Confirmar Contraseña" 
                                    placeholder="Repite tu contraseña" 
                                    type="password"
                                    value={formData.confirmarContrasena} 
                                    onChange={handleChange} 
                                    error={errors.confirmarContrasena} 
                                />
                            </div>
                        </div>

                        {/* Términos y Condiciones */}
                        <div className={styles.checkboxContainer}>
                            <input
                                type="checkbox" 
                                id="terminos" 
                                name="terminos" 
                                required
                                checked={formData.terminos} 
                                onChange={handleChange}
                            />
                            <label htmlFor="terminos">Acepto los términos y condiciones del servicio</label>
                            {errors.terminos && (
                                <p className={`${styles.mensajeError} ${styles.errorText} ${styles.terminosErrorPosition}`}>{errors.terminos}</p>
                            )}
                        </div>

                        <button 
                            type="submit" 
                            className={styles.btnRegistro} 
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Registrando...' : 'Crear Cuenta'}
                        </button>
                    </form>
                </div>

                {/* SECCIÓN IMAGEN/INFORMACIÓN ADICIONAL - Restaurada y Estilizada */}
                <div className={styles.seccionImagen}>
                    <div className={styles.contenidoImagen}>
                        <h2 className={styles.tituloImagen}>Únete a nuestra comunidad</h2>
                        <p className={styles.textoImagen}>
                            Tu registro nos ayuda a seguir protegiendo a la comunidad y a nuestros bomberos voluntarios.
                        </p>
                        <ul className={styles.beneficiosLista}>
                            <li>Acceso a información en tiempo real</li>
                            <li>Alertas personalizadas en tu zona</li>
                            <li>Noticias exclusivas del cuerpo de bomberos</li>
                            <li>Posibilidad de realizar donaciones</li>
                            <li>Soporte prioritario</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Registrarse;