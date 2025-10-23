import React, { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import "./RecuperarContrasena.css";

// Definición de tipos para errores, similar a tu archivo Registrarse.

interface ForgotPasswordErrors {
    email?: string;

    general?: string; // Para errores de API o proceso
}

interface ForgotPasswordProps { }

const ForgotPassword: React.FC<ForgotPasswordProps> = () => {

    // Estados clave
    const [email, setEmail] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const [errors, setErrors] = useState<ForgotPasswordErrors>({}); // Usamos un objeto de errores
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // 1. Manejo de Cambios (Similar a handleChange de Registrarse)
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        setEmail(value);

        // Limpiar errores reactivamente

        if (errors.email || errors.general || message) {
            setErrors({});

            setMessage("");
        }
    };

    // 2. Lógica de Validación (Derivada de la validación de correo de Registrarse)

    const validateForm = (): boolean => {
        const newErrors: ForgotPasswordErrors = {};

        let isValid = true;
        const cleanEmail = email.trim();
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        // Validación de Correo

        if (!cleanEmail) {
            newErrors.email = "El correo electrónico es obligatorio.";

            isValid = false;
        } else if (!emailRegex.test(cleanEmail)) {
            newErrors.email =
                "Formato de correo electrónico inválido. El formato correcto es: ejemplo@correo.cl";

            isValid = false;
        }

        setErrors(newErrors);

        return isValid;
    };

    // 3. Manejo del Submit principal (handleRecovery)

    const handleRecovery = async (e: FormEvent) => {
        e.preventDefault();

        setMessage("");

        setErrors({});

        // Ejecutar validación

        if (!validateForm()) {
            // Si la validación local falla, los errores ya se establecieron en 'errors'

            return;
        }

        setIsLoading(true);

        try {
            console.log(`Intentando enviar correo de recuperación a: ${email}`);

            // Simulación de llamada a API

            await new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve(null);
                }, 2000);
            });

            // Simulación de éxito

            setMessage(
                "Se ha enviado un enlace de recuperación a tu correo electrónico."
            );

            setEmail(""); // Limpiamos el campo al tener éxito
        } catch (apiError) {
            console.error("Error durante la recuperación:", apiError);

            // Establecer el error general o el error específico de la API

            setErrors({
                general:
                    "Error al procesar la solicitud. Inténtalo de nuevo más tarde.",
            });
        } finally {
            setIsLoading(false);
        }

        
    };

    const handleBlur = () => {
            validateForm();
        };

    return (
        <div className="cuerpo py-4">
            <div className="forgot-password-container container py-4 text-center">
                <div className="titulo-container">
                    <h1 className="titulo-principal">Recuperar Contraseña</h1>

                    <p className="subtitulo mb-3">
                        Ingresa la dirección de correo electrónico asociada a tu cuenta para
                        recibir un enlace de restablecimiento.
                    </p>
                </div>

                {/* Muestra mensaje de éxito o error GENERAL (Mantenemos estos) */}

                {message && (
                    <div className="success-message-box" data-testid="success-message">
                        <span style={{ marginRight: "10px" }}></span>
                        {message}
                    </div>
                )}

                {errors.general && (
                    <div className="error-message-box" data-testid="error-message">
                        <span style={{ marginRight: "10px" }}></span>
                        {errors.general}
                    </div>
                )}

                {message ? (
                    <div className="form-group-registro mt-4">
                        <Link
                            to="/"
                            className="btn-centrado btn-primario submit-button text-decoration-none"
                            data-testid="back-to-login"
                        >
                            Volver al Inicio de Sesión
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleRecovery} className="recovery-form" noValidate>
                        <div className="form-group-registro">
                            <label htmlFor="email">Correo Electrónico:</label>
                            <input
                                className={`form-pass form-control form-control-registro ${errors.email ? "input-error" : ""
                                    }`}
                                type="email"
                                id="email"
                                data-testid="recovery-email"
                                value={email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                                disabled={isLoading}
                                placeholder="tu.correo@ejemplo.com"
                            />
                            {errors.email && (
                                <p className="mensajeError error-text form-pass" data-testid="email-error">
                                    {errors.email}
                                </p>
                            )}
                        </div>
                        <div className="form-group-registro mt-4">
                            <button
                                type="submit"
                                disabled={isLoading || !email}
                                className="btn-centrado btn-primario submit-button"
                                data-testid="submit-button"
                            >
                                {isLoading ? "Enviando..." : "Enviar Enlace de Restablecimiento"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
