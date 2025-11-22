import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import { useAuth } from '../hooks/useAuth';
import { validateEmail, validateIsRequired } from '../utils/Validaciones';
import PerfilDefault from "../assets/perfil-default.png";
import "./Dropdown.css"; 

const Dropdown: React.FC = () => {
    const { isLoggedIn, authData, userName, profileImage, login, logout, error } = useAuth();
    const navigate = useNavigate();
    
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState("");
    const [emailError, setEmailError] = useState(""); 
    const [passwordError, setPasswordError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                closeDropdown();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const closeDropdown = () => {
        setIsOpen(false);
        setEmail("");
        setPassword("");
        setEmailError("");
        setPasswordError("");
        setLoginError("");
    };

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        setLoginError("");
        setEmailError("");
        setPasswordError("");

        // Usar tus validaciones importadas
        const emailValidation = validateEmail(email);
        const passwordValidation = validateIsRequired(password, "La contraseña");

        if (emailValidation) {
            setEmailError(emailValidation);
            return;
        }

        if (passwordValidation) {
            setPasswordError(passwordValidation);
            return;
        }

        try {
            setIsLoggingIn(true);
            const success = await login({ correo: email, contrasena: password });
            
            if (success) {
                setEmail("");
                setPassword("");
                closeDropdown();
                navigate('/');
            } else {
                setLoginError(error || "Error al iniciar sesión");
            }
        } catch (err) {
            setLoginError("Error de conexión. Intente nuevamente.");
            console.error('Error en login:', err);
        } finally {
            setIsLoggingIn(false);
        }
    };

    const handleLogout = () => {
        logout();
        closeDropdown();
        navigate('/');
    };

    const togglePasswordVisibility = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setShowPassword(prev => !prev);
    };

    // Limpiar errores cuando el usuario escribe
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        if (emailError) setEmailError("");
        if (loginError) setLoginError("");
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        if (passwordError) setPasswordError("");
        if (loginError) setLoginError("");
    };

    const displayName = userName || "Usuario";
    const userProfileImage = profileImage || PerfilDefault;

    const loginContent = (
        <form onSubmit={handleLoginSubmit} className="px-4 py-3">
            <div className="mb-3">
                <label htmlFor="loginEmail" className="form-label">Correo Electrónico</label>
                <input
                    type="email"
                    className={`form-control ${emailError ? 'is-invalid' : ''}`}
                    id="loginEmail"
                    data-testid="loginEmail"
                    value={email}
                    onChange={handleEmailChange}
                    required
                    placeholder="tu.correo@ejemplo.com"
                    disabled={isLoggingIn}
                />
                {emailError && <div className="invalid-feedback">{emailError}</div>}
            </div>
            <div className="mb-3">
                <label htmlFor="loginPassword" className="form-label">Contraseña</label>
                <div className="input-group has-validation">
                    <input
                        type={showPassword ? "text" : "password"}
                        className={`form-control ${passwordError ? 'is-invalid' : ''}`}
                        id="loginPassword"
                        data-testid="loginPassword"
                        value={password}
                        onChange={handlePasswordChange}
                        required
                        placeholder="•••••••••"
                        disabled={isLoggingIn}
                    />
                    <button
                        className="btn btn-outline-secondary boton-ojo"
                        type="button"
                        onClick={togglePasswordVisibility}
                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        disabled={isLoggingIn}
                    >
                        {showPassword ? <BsEyeSlash size={20} /> : <BsEye size={20} />}
                    </button>
                    {passwordError && <div className="invalid-feedback">{passwordError}</div>}
                </div>
            </div>
            {loginError && (
                <div className="alert alert-danger py-2 mb-3" role="alert">
                    <small>{loginError}</small>
                </div>
            )}
            <button 
                type="submit" 
                className="btn btn-primary w-100" 
                data-testid="login-submit-button"
                disabled={isLoggingIn}
            >
                {isLoggingIn ? (
                    <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Iniciando sesión...
                    </>
                ) : (
                    "Iniciar Sesión"
                )}
            </button>
        </form>
    );
    
    const userOptionsContent = (
        <>
            <div className="dropdown-header text-center user-info-header">
                <img
                    src={userProfileImage}
                    alt="Foto de perfil"
                    className="rounded-circle mb-2"
                    style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                />
                <strong>Hola, {displayName}</strong>
            </div>
            <div className="dropdown-divider"></div>
            <Link className="dropdown-item" to="/perfil" onClick={closeDropdown}>
                <i className="bi bi-person me-2"></i>Mi Perfil
            </Link>
            
            {/* Incidentes en el dropdown para acceso rápido */}
            <Link className="dropdown-item" to="/incidentes" onClick={closeDropdown}>
                <i className="bi bi-list-ul me-2"></i>Incidentes
            </Link>

            <div className="dropdown-divider"></div>
            <button className="dropdown-item text-danger" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right me-2"></i>Cerrar Sesión
            </button>
        </>
    );

    return (
        <div className={`nav-item dropdown ${isOpen ? 'show' : ''}`} ref={dropdownRef}>
            <a
                className={
                    isLoggedIn
                        ? "nav-link dropdown-toggle d-flex align-items-center botonUsuario"
                        : "botonIniciarSesion dropdown-toggle d-flex align-items-center btn"
                }
                href="#"
                role="button"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                data-testid="login-dropdown-toggle"
                style={{ cursor: 'pointer', textDecoration: 'none' }}
            >
                {isLoggedIn ? (
                    <div className="d-flex align-items-center text-dark">
                        <span className="me-2">{displayName}</span>
                        <img
                            src={userProfileImage}
                            alt="Perfil de usuario"
                            className="rounded-circle"
                            style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                        />
                    </div>
                ) : (
                    <span>Iniciar Sesión</span>
                )}
            </a>

            <ul
                className={`dropdown-menu dropdown-menu-end ${isOpen ? 'show' : ''}`}
                aria-labelledby="navbarDropdown"
            >
                {isLoggedIn ? userOptionsContent : (
                    <li onClick={(e) => e.stopPropagation()}>
                        <div className="login-dropdown-content">
                            {loginContent}
                            <div className="dropdown-divider"></div>
                            <Link className="dropdown-item" to="/registrarse" onClick={closeDropdown}>
                                <i className="bi bi-person-plus me-2"></i>¿No tienes cuenta? Regístrate
                            </Link>
                            <Link className="dropdown-item" to="/recuperar-contrasena" onClick={closeDropdown}>
                                <i className="bi bi-key me-2"></i>¿Olvidaste tu contraseña?
                            </Link>
                        </div>
                    </li>
                )}
            </ul>
        </div>
    );
};

export default Dropdown;