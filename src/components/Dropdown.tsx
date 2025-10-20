import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import PerfilDefault from "../assets/perfil-default.png";
import "./Dropdown.css"; 

interface AuthProps {
    isLoggedIn: boolean;
    userName?: string;
    onLogin?: (userData: any) => void;
    onLogout?: () => void;
}

const Dropdown: React.FC<AuthProps> = ({ isLoggedIn, userName, onLogin, onLogout }) => {
    // ... (todo el resto del código es idéntico)
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [loginError, setLoginError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLLIElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const closeDropdown = () => {
        setIsOpen(false);
    };

    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError("");
        try {
            const usuarios = JSON.parse(localStorage.getItem('usuariosRegistrados') || '[]');
            const usuarioEncontrado = usuarios.find((u: any) => u.correo === email && u.contrasena === pass);
            if (usuarioEncontrado) {
                const userData = {
                    nombre: usuarioEncontrado.nombre,
                    correo: usuarioEncontrado.correo,
                    nombreUsuario: usuarioEncontrado.nombreUsuario,
                    rut: usuarioEncontrado.rut
                };
                localStorage.setItem('usuarioLogueado', JSON.stringify(userData));
                if (onLogin) onLogin(userData);
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
        localStorage.removeItem('usuarioLogueado');
        if (onLogout) onLogout();
        closeDropdown();
        navigate('/');
    };

    const togglePasswordVisibility = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setShowPassword(prev => !prev);
    };

const loginContent = (
    <form onSubmit={handleLoginSubmit} className="px-4 py-3">
        <div className="mb-3">
            <label htmlFor="loginEmail" className="form-label">Correo</label>
            <input
                type="email"
                className="form-control"
                id="loginEmail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu.correo@ejemplo.com"
            />
        </div>
        <div className="mb-3">
            <label htmlFor="loginPassword" className="form-label">Contraseña</label>
            <div className="input-group">
                <input
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    id="loginPassword"
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
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
            </div>
        </div>
        {loginError && (
            <div className="alert alert-danger py-2 mb-3" role="alert">
                <small>{loginError}</small>
            </div>
        )}
        <button type="submit" className="btn btn-primary w-100">Iniciar Sesión</button>
    </form>
);
    const userOptionsContent = (
        <>
            <div className="dropdown-header text-center">
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
        // 🔥 *** CAMBIO REALIZADO AQUÍ *** 🔥
        <li className={`nav-item dropdown ${isOpen ? 'show' : ''}`} ref={dropdownRef}>
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
                style={{ cursor: 'pointer', textDecoration: 'none' }}
            >
                {isLoggedIn ? (
                    <div className="d-flex align-items-center text-dark">
                        <span className="me-2">{userName || "Usuario"}</span>
                        <img
                            src={PerfilDefault}
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
        </li>
    );
};

export default Dropdown;