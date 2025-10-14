import "./Registrarse.css";
import React, { useState, useCallback, useEffect } from "react";
import Logo from "../assets/sr_logo.png";

// En tu componente Registrarse, agrega:
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
    let counter = 0;
    
    // Recorrer de atrás hacia adelante para agregar puntos
    for (let i = cleanRut.length - 1; i >= 0; i--) {
        counter++;
        result = cleanRut.charAt(i) + result;
        
        // Agregar puntos cada 3 dígitos, pero no al inicio
        if (counter === 3 && i > 0) {
            result = '.' + result;
            counter = 0;
        }
        
        // Agregar guion antes del dígito verificador
        if (counter === 1 && i === 1) {
            result = '-' + result;
            counter = 0;
        }
    }
    
    return result;
};

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
    <div className="form-group-registro">
        <label htmlFor={id}>{label}</label>
        <input
            type={type}
            className={`form-control-registro ${error ? 'input-error' : ''}`}
            id={id}
            placeholder={placeholder}
            required
            value={value}
            onChange={onChange}
            autoComplete={id.includes('contrasena') ? 'new-password' : 'on'}
        />
        {error && (
            <p className="mensajeError error-text">{error}</p>
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
        setDisplayValue(formatRut(value));
    }, [value]);

    const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        
        // Limpiar el valor para guardar (sin puntos ni guion)
        const cleanValue = inputValue.replace(/[^0-9kK]/g, "").toUpperCase();
        
        // Crear un evento sintético con el valor limpio
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
        <div className="form-group-registro">
            <label htmlFor="rut">RUT</label>
            <input
                type="text"
                className={`form-control-registro ${error ? 'input-error' : ''}`}
                id="rut"
                placeholder="12.345.678-9"
                required
                value={displayValue}
                onChange={handleRutChange}
                autoComplete="rut"
                maxLength={12} // Longitud máxima con formato
            />
            {error && (
                <p className="mensajeError error-text">{error}</p>
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

        // Limpiar y normalizar datos
        const cleanData = {
            rut: formData.rut.trim(),
            nombre: formData.nombre.trim(),
            correo: formData.correo.trim(),
            direccion: formData.direccion.trim(),
            telefono: formData.telefono.trim(),
            nombreUsuario: formData.nombreUsuario.trim(),
            contrasena: formData.contrasena,
            confirmarContrasena: formData.confirmarContrasena,
        };

        // Validación de RUT
        if (!cleanData.rut) {
            newErrors.rut = "El RUT es obligatorio.";
            isValid = false;
        } else if (!validateRut(cleanData.rut)) {
            newErrors.rut = "RUT inválido. Verifique el formato.";
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

        // Validación de Teléfono
        const phoneRegex = /^[0-9]+$/;
        if (!cleanData.telefono) {
            newErrors.telefono = "El teléfono es obligatorio.";
            isValid = false;
        } else if (!phoneRegex.test(cleanData.telefono)) {
            newErrors.telefono = "El teléfono solo puede contener números.";
            isValid = false;
        } else if (cleanData.telefono.length < 9 || cleanData.telefono.length > 10) {
            newErrors.telefono = "El teléfono debe tener entre 9 y 10 dígitos.";
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
                const usuarios = JSON.parse(localStorage.getItem('usuariosRegistrados') || '[]') as UserType[];
                const usuarioExiste = usuarios.some(u => 
                    u.correo === user.correo || u.nombreUsuario === user.nombreUsuario
                );

                if (usuarioExiste) {
                    setErrors(prev => ({ 
                        ...prev, 
                        correo: "El correo electrónico o nombre de usuario ya está registrado." 
                    }));
                    setIsSubmitting(false);
                    return;
                }

                usuarios.push(user);
                localStorage.setItem('usuariosRegistrados', JSON.stringify(usuarios));

                setSuccessMessage(`¡Registro exitoso, ${user.nombre}! Ahora puedes iniciar sesión.`);
                
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

        if (validateForm()) {
            const newUser: UserType = {
                rut: formData.rut,
                nombre: formData.nombre,
                correo: formData.correo,
                direccion: formData.direccion,
                telefono: formData.telefono,
                nombreUsuario: formData.nombreUsuario,
                contrasena: formData.contrasena,
            };
            handleSend(newUser);
        }
    };

    // --- Renderizado JSX ---
    return (
        <div className="contenedor-principal">
            <div className="seccion-formulario">
                <div className="logo-formulario">
                    <img
                        src={Logo} 
                        alt="SAFE Rescue Logo" 
                        width="60" 
                        height="60"
                        className="d-inline-block align-text-top"
                    />
                </div>

                <h1 className="titulo-formulario">Crear una cuenta</h1>
                <p className="subtitulo-formulario">Completa tus datos para unirte a nuestra comunidad</p>

                {successMessage && (
                    <div className="success-message-box">
                        <span style={{ marginRight: '10px' }}>✅</span> 
                        {successMessage}
                    </div>
                )}

                <form className="form" id="form" onSubmit={handleSubmit} noValidate>
                    <div className="form-row">
                        <div className="form-col">
                            {/* Usamos el componente especial para RUT */}
                            <RutInputField 
                                value={formData.rut} 
                                onChange={handleChange} 
                                error={errors.rut} 
                            />
                        </div>
                        <div className="form-col">
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
                    </div>

                    <InputField 
                        id="correo" 
                        label="Correo Electrónico" 
                        placeholder="tu.correo@ejemplo.com" 
                        type="email"
                        value={formData.correo} 
                        onChange={handleChange} 
                        error={errors.correo} 
                    />

                    <div className="form-row">
                        <div className="form-col">
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
                        <div className="form-col">
                            <InputField 
                                id="telefono" 
                                label="Número Teléfono" 
                                placeholder="912345678" 
                                type="tel"
                                value={formData.telefono} 
                                onChange={handleChange} 
                                error={errors.telefono} 
                            />
                        </div>
                    </div>

                    <InputField 
                        id="nombreUsuario" 
                        label="Nombre de Usuario" 
                        placeholder="Elige un nombre de usuario" 
                        type="text"
                        value={formData.nombreUsuario} 
                        onChange={handleChange} 
                        error={errors.nombreUsuario} 
                    />

                    <div className="form-row">
                        <div className="form-col">
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
                        <div className="form-col">
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
                    <div className="checkbox-container">
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
                            <p className="mensajeError error-text terminos-error-position">{errors.terminos}</p>
                        )}
                    </div>

                    <button 
                        type="submit" 
                        className="btn-registro" 
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Registrando...' : 'Crear Cuenta'}
                    </button>
                </form>
            </div>

            {/* SECCIÓN IMAGEN/INFORMACIÓN ADICIONAL */}
            <div className="seccion-imagen">
                <div className="contenido-imagen">
                    <h2 className="titulo-imagen">Únete a nuestra comunidad</h2>
                    <p className="texto-imagen">
                        Tu registro nos ayuda a seguir protegiendo a la comunidad y a nuestros bomberos voluntarios.
                    </p>
                    <ul className="beneficios-lista">
                        <li>Acceso a información en tiempo real</li>
                        <li>Alertas personalizadas en tu zona</li>
                        <li>Noticias exclusivas del cuerpo de bomberos</li>
                        <li>Posibilidad de realizar donaciones</li>
                        <li>Soporte prioritario</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Registrarse;