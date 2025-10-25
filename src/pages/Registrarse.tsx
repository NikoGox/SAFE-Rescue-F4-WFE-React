import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/sr_logo.png";
import styles from "./Registrarse.module.css";
import FormField from '../components/Formulario';
import { RutInputField, PhoneInputField } from '../components/SpecializedFields';
import {
    validateChileanRUT,
    validateEmail,
    validatePhoneNumber,
    validateStrongPassword,
    validateConfirmPassword,
    validateNameLettersOnly,
    validateIsRequired
} from '../utils/Validaciones';
import type { FormDataType, Errors} from '../types/UserType';

const Registrarse: React.FC = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [formData, setFormData] = useState<FormDataType>({
        rut: "",
        nombre: "",
        email: "",
        direccion: "",
        telefono: "",
        nombreUsuario: "",
        contrasena: "",
        confirmarContrasena: "",
        terminos: false
    });

    const [errors, setErrors] = useState<Errors>({});

    // 2. FUNCIÓN DE VALIDACIÓN COMPLETA (solo para el envío)
    const validateForm = useCallback((): boolean => {
        const newErrors: Errors = {};

        // Aplica todas las validaciones usando el patrón string | null
        newErrors.nombre = validateNameLettersOnly(formData.nombre);
        newErrors.rut = validateChileanRUT(formData.rut);
        newErrors.email = validateEmail(formData.email);
        newErrors.direccion = validateIsRequired(formData.direccion, "La dirección");
        newErrors.telefono = validatePhoneNumber(formData.telefono);
        newErrors.nombreUsuario = validateIsRequired(formData.nombreUsuario, "El nombre de usuario");
        newErrors.contrasena = validateStrongPassword(formData.contrasena);
        newErrors.confirmarContrasena = validateConfirmPassword(formData.contrasena, formData.confirmarContrasena);

        if (!formData.terminos) {
            newErrors.terminos = "Debe aceptar los términos y condiciones";
        }

        // Filtra los errores para dejar solo los mensajes (no los null)
        const finalErrors: Errors = Object.fromEntries(
            Object.entries(newErrors).filter(([, value]) => value !== null && value !== undefined)
        );

        setErrors(finalErrors);
        return Object.keys(finalErrors).length === 0;
    }, [formData]);

    // 3. MANEJO DE CAMBIOS (simplificado, sin limpiar errores complejos)
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value, type, checked } = e.target;
        const targetId = id as keyof typeof formData;

        setFormData(prev => ({
            ...prev,
            [targetId]: type === 'checkbox' ? checked : value
        }));

        if (successMessage) {
            setSuccessMessage(null);
        }
    };

    // 4. NUEVO MANEJADOR DE BLUR (Validación en tiempo real)
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        const targetId = id as keyof typeof formData;
        let error: string | null = null;

        // Aplica el validador específico para el campo
        switch (targetId) {
            case 'nombre':
                error = validateNameLettersOnly(value);
                break;
            case 'rut':
                error = validateChileanRUT(value);
                break;
            case 'email':
                error = validateEmail(value);
                break;
            case 'direccion':
                error = validateIsRequired(value, "La dirección");
                break;
            case 'telefono':
                error = validatePhoneNumber(value);
                break;
            case 'nombreUsuario':
                error = validateIsRequired(value, "El nombre de usuario");
                break;
            case 'contrasena':
                error = validateStrongPassword(value);
                break;
            case 'confirmarContrasena':
                error = validateConfirmPassword(formData.contrasena, value);
                break;
            case 'terminos':
                // Nota: formData.terminos ya se actualizó en el handleChange
                error = formData.terminos ? null : "Debe aceptar los términos y condiciones";
                break;
        }

        setErrors(prev => {
            let updates: Errors = {
                ...prev,
                [targetId]: error
            };

            // REVALIDACIÓN DE LA CONFIRMACIÓN DE CONTRASEÑA si la contraseña principal cambió
            if (targetId === 'contrasena') {
                const confirmError = validateConfirmPassword(value, formData.confirmarContrasena);
                updates.confirmarContrasena = confirmError;
            }

            return updates;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMessage(null);

        if (validateForm()) {
            setIsSubmitting(true);
            try {
                // 1. Obtener la lista actual de usuarios (o una lista vacía)
                const usuarios: FormDataType[] = JSON.parse(localStorage.getItem('usuariosRegistrados') || '[]');

                // 2. Verificar si el email o el nombre de usuario ya existe
                const emailExists = usuarios.some(u => u.email === formData.email);
                const usernameExists = usuarios.some(u => u.nombreUsuario === formData.nombreUsuario);

                if (emailExists) {
                    setErrors({ general: "El correo electrónico ya está registrado." });
                    setIsSubmitting(false);
                    return;
                }
                if (usernameExists) {
                    setErrors({ general: "El nombre de usuario ya está en uso." });
                    setIsSubmitting(false);
                    return;
                }

                // 3. Crear el nuevo objeto de usuario (quitando la confirmación de contraseña)
                const { confirmarContrasena, terminos, ...newUser } = formData;
                
                // 4. Añadir el nuevo usuario a la lista
                const updatedUsuarios = [...usuarios, newUser];

                // 5. Guardar la lista actualizada en localStorage
                localStorage.setItem('usuariosRegistrados', JSON.stringify(updatedUsuarios));

                setSuccessMessage("¡Registro exitoso! Serás redirigido para iniciar sesión.");
                
                // 6. Redirigir después del mensaje de éxito
                setTimeout(() => navigate('/'), 4000);

            } catch (error) {
                console.error("Error al registrar usuario:", error);
                setErrors(prev => ({
                    ...prev,
                    general: "Error al registrar usuario. Inténtalo de nuevo."
                }));
            } finally {
                setIsSubmitting(false);
            }
        }
    };


    // --- Renderizado JSX ---
    return (
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
                            <span style={{ marginRight: '10px' }}>✅</span>
                            {successMessage}
                        </div>
                    )}

                    {errors.general && (
                        <div className={`${styles.successMessageBox} ${styles.inputError}`} style={{ backgroundColor: 'rgba(255, 0, 0, 0.1)', color: 'var(--color-error)', borderColor: 'var(--color-error)' }}>
                            <span style={{ marginRight: '10px' }}>⚠️</span>
                            {errors.general}
                        </div>
                    )}

                    <form className={styles.form} id="form" onSubmit={handleSubmit} noValidate>
                        {/* Fila 1: RUT y Nombre */}
                        <div className={styles.formRow}>
                            <div className={styles.formCol}>
                                <FormField
                                    id="nombre"
                                    label="Nombre Completo"
                                    placeholder="Juan Pérez González"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={errors.nombre}
                                    data-testid="register-nombre"
                                />
                            </div>
                            <div className={styles.formCol}>
                                <RutInputField
                                    value={formData.rut}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={errors.rut}
                                />
                            </div>
                        </div>

                        {/* Fila 2: Correo */}
                        <FormField
                            id="email"
                            data-testid="register-email"
                            label="Correo Electrónico"
                            placeholder="tu.correo@ejemplo.com"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.email}
                        />

                        {/* Fila 3: Dirección y Teléfono */}
                        <div className={styles.formRow}>
                            <div className={styles.formCol}>
                                <FormField
                                    id="direccion"
                                    data-testid="register-direccion"
                                    label="Dirección"
                                    placeholder="Calle 123, Comuna"
                                    type="text"
                                    value={formData.direccion}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={errors.direccion}
                                />
                            </div>
                            <div className={styles.formCol}>
                                <PhoneInputField
                                    value={formData.telefono}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={errors.telefono}
                                />
                            </div>
                        </div>

                        {/* Fila 4: Nombre de Usuario */}
                        <FormField
                            id="nombreUsuario"
                            data-testid="register-nombreUsuario"
                            label="Nombre de Usuario"
                            placeholder="Elige un nombre de usuario"
                            type="text"
                            value={formData.nombreUsuario}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.nombreUsuario}
                        />

                        {/* Fila 5: Contraseña y Confirmar Contraseña */}
                        <div className={styles.formRow}>
                            <div className={styles.formCol}>
                                <FormField
                                    id="contrasena"
                                    data-testid="register-contrasena"
                                    label="Contraseña"
                                    placeholder="Crea una contraseña segura"
                                    type="password"
                                    value={formData.contrasena}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={errors.contrasena}
                                />
                            </div>
                            <div className={styles.formCol}>
                                <FormField
                                    id="confirmarContrasena"
                                    data-testid="register-confirmarContrasena"
                                    label="Confirmar Contraseña"
                                    placeholder="Repite tu contraseña"
                                    type="password"
                                    value={formData.confirmarContrasena}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={errors.confirmarContrasena}
                                />
                            </div>
                        </div>

                        {/* Términos y Condiciones */}
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
                            <label htmlFor="terminos">Acepto los términos y condiciones del servicio</label>
                            {errors.terminos && (
                                <p className={`${styles.mensajeError} ${styles.errorText} ${styles.terminosErrorPosition}`}>{errors.terminos}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            className={styles.btnRegistro}
                            data-testid="register-submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Registrando...' : 'Crear Cuenta'}
                        </button>
                    </form>
                </div>

                {/* SECCIÓN IMAGEN/INFORMACIÓN ADICIONAL */}
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