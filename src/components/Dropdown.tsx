import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BsEye, BsEyeSlash } from "react-icons/bs";

// 🛑 MODIFICACIÓN 1: Importar el hook de autenticación
import { useAuth } from '../components/UseAuth';

// Importar tipos y recursos
import type { UserType, UserData } from "../types/UserType"; 
import PerfilDefault from "../assets/perfil-default.png";
import "./Dropdown.css"; 

// Función de validación simple
const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// 🛑 MODIFICACIÓN 2: Ya no acepta props de autenticación
const Dropdown: React.FC = () => {

    // 🛑 MODIFICACIÓN 3: Uso del hook useAuth
    const { isLoggedIn, authData, login, logout } = useAuth();

    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [loginError, setLoginError] = useState("");
    const [emailError, setEmailError] = useState(""); 
    const [passError, setPassError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    
    // 🛑 MODIFICACIÓN 4: Cambio el tipo de useRef a HTMLDivElement (soluciona error <li> dentro de <li>)
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Lógica para cerrar el dropdown al hacer clic afuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                // Limpiar errores si se cierra sin iniciar sesión
                setEmailError("");
                setPassError("");
                setLoginError("");
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
        setPass("");
        setEmailError("");
        setPassError("");
        setLoginError("");
    };

    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // 1. Limpiar errores previos
        setLoginError("");
        setEmailError("");
        setPassError("");

        let hasError = false;

        // 2. Validación de formato simple
        if (!isValidEmail(email)) {
            setEmailError("Formato de correo inválido.");
            hasError = true;
        }

        if (pass.length === 0) {
            setPassError("Debe ingresar la contraseña.");
            hasError = true;
        }

        if (hasError) {
            return; // Detener si hay errores de validación
        }

        // 3. Lógica de inicio de sesión
        try {
            const usuarios: UserType[] = JSON.parse(localStorage.getItem('usuariosRegistrados') || '[]');
            
            // Búsqueda por 'email' y 'contrasena'
            const usuarioEncontrado = usuarios.find(
                (u: UserType) => u.email === email && u.contrasena === pass
            );

            if (usuarioEncontrado) {
                
                // Desestructurar para obtener datos seguros (sin contraseña)
                const { contrasena, ...userDataSafe }: UserType = usuarioEncontrado; 
                const userDataForStorage: UserData = userDataSafe; 

                // 🛑 USAMOS LA FUNCIÓN LOGIN DEL HOOK
                login(userDataForStorage); 
                
                // Limpiar estados y cerrar
                setEmail("");
                setPass("");
                closeDropdown();
                navigate('/');
            } else {
                setLoginError("Correo o contraseña incorrectos");
            }
        } catch (error) {
            console.error('Error en login:', error);
            setLoginError("Error al iniciar sesión");
        }
    };

    const handleLogout = () => {
        // 🛑 USAMOS LA FUNCIÓN LOGOUT DEL HOOK
        logout();
        closeDropdown();
        navigate('/');
    };

    const togglePasswordVisibility = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setShowPassword(prev => !prev);
    };

    // 🛑 OBTENCIÓN DE DATOS DE useAuth PARA RENDERIZADO
    const userName = authData?.nombreUsuario || authData?.nombre || "Usuario";
    const profileImage = authData?.profileImage;

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
                    onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailError(""); 
                        setLoginError("");
                    }}
                    required
                    placeholder="tu.correo@ejemplo.com"
                />
                {emailError && <div className="invalid-feedback">{emailError}</div>}
            </div>
            <div className="mb-3">
                <label htmlFor="loginPassword" className="form-label">Contraseña</label>
                <div className="input-group has-validation">
                    <input
                        type={showPassword ? "text" : "password"}
                        className={`form-control ${passError ? 'is-invalid' : ''}`}
                        id="loginPassword"
                        data-testid="loginPassword"
                        value={pass}
                        onChange={(e) => {
                            setPass(e.target.value);
                            setPassError("");
                            setLoginError("");
                        }}
                        required
                        placeholder="•••••••••"
                    />
                    <button
                        className="btn btn-outline-secondary boton-ojo"
                        type="button"
                        onClick={togglePasswordVisibility}
                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                        {showPassword ? <BsEyeSlash size={20} /> : <BsEye size={20} />}
                    </button>
                    {passError && <div className="invalid-feedback">{passError}</div>}
                </div>
            </div>
            {loginError && (
                <div className="alert alert-danger py-2 mb-3" role="alert">
                    <small>{loginError}</small>
                </div>
            )}
            <button type="submit" className="btn btn-primary w-100" data-testid="login-submit-button">Iniciar Sesión</button>
        </form>
    );
    
    const userOptionsContent = (
        <>
            {/* Encabezado con foto de perfil más grande */}
            <div className="dropdown-header text-center user-info-header">
                <img
                    src={profileImage || PerfilDefault} // Usa el profileImage del estado global
                    alt="Foto de perfil"
                    className="rounded-circle mb-2"
                    style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                />
                <strong>Hola, {userName}</strong>
            </div>
            <div className="dropdown-divider"></div>
            <Link className="dropdown-item" to="/perfil" onClick={closeDropdown}>
                <i className="bi bi-person me-2"></i>Mi Perfil
            </Link>
            <Link className="dropdown-item" to="/configuracion" onClick={closeDropdown}>
                <i className="bi bi-gear me-2"></i>Configuración
            </Link>
            <div className="dropdown-divider"></div>
            <button className="dropdown-item text-danger" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right me-2"></i>Cerrar Sesión
            </button>
        </>
    );

    return (
        // 🛑 MODIFICACIÓN 5: Cambiar <li> por <div> para evitar el error de anidación
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
                        <span className="me-2">{userName}</span>
                        {/* INTEGRACIÓN DE LA IMAGEN EN EL BOTÓN PRINCIPAL */}
                        <img
                            src={profileImage || PerfilDefault} // Usa el profileImage del estado global
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