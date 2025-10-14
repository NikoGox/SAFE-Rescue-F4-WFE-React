// src/components/Navbar/Dropdown.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PerfilDefault from "../assets/perfil-default.png";

interface AuthProps {
    isLoggedIn: boolean;
    userName?: string;
    onLogin?: (userData: any) => void;
    onLogout?: () => void;
}

const Dropdown: React.FC<AuthProps> = ({ isLoggedIn, userName, onLogin, onLogout }) => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [loginError, setLoginError] = useState("");

    const closeDropdown = () => {
        // Cerrar dropdown haciendo click fuera
        document.body.click();
    };

    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError("");

        try {
            const usuarios = JSON.parse(localStorage.getItem('usuariosRegistrados') || '[]');
            const usuarioEncontrado = usuarios.find((u: any) =>
                u.correo === email && u.contrasena === pass
            );

            if (usuarioEncontrado) {
                const userData = {
                    nombre: usuarioEncontrado.nombre,
                    correo: usuarioEncontrado.correo,
                    nombreUsuario: usuarioEncontrado.nombreUsuario,
                    rut: usuarioEncontrado.rut
                };

                localStorage.setItem('usuarioLogueado', JSON.stringify(userData));

                if (onLogin) {
                    onLogin(userData);
                }

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

        if (onLogout) {
            onLogout();
        }

        closeDropdown();
        navigate('/');
    };

    const loginContent = (
        <form onSubmit={handleLoginSubmit} className="px-4 py-3" style={{ minWidth: '280px' }}>
            <div className="mb-3">
                <label htmlFor="loginEmail" className="form-label">Correo</label>
                <input
                    type="email"
                    className="form-control"
                    id="loginEmail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="email@example.com"
                />
            </div>
            <div className="mb-3">
                <label htmlFor="loginPassword" className="form-label">Contraseña</label>
                <input
                    type="password"
                    className="form-control"
                    id="loginPassword"
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
                    required
                    placeholder="Password"
                />
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
            <Link
                className="dropdown-item"
                to="/perfil"
                onClick={closeDropdown}
            >
                <i className="bi bi-person me-2"></i>Mi Perfil
            </Link>
            <Link
                className="dropdown-item"
                to="/configuracion"
                onClick={closeDropdown}
            >
                <i className="bi bi-gear me-2"></i>Configuración
            </Link>
            <div className="dropdown-divider"></div>
            <button
                className="dropdown-item text-danger"
                onClick={handleLogout}
            >
                <i className="bi bi-box-arrow-right me-2"></i>Cerrar Sesión
            </button>
        </>
    );

    return (
        <li className="nav-item dropdown">
            {/* Botón del dropdown - CORREGIDO */}
            <a
                className="nav-link dropdown-toggle d-flex align-items-center"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{
                    cursor: 'pointer',
                    textDecoration: 'none'
                }}
            >
                {isLoggedIn ? (
                    <div className="d-flex align-items-center text-dark">
                        <span className="me-2">{userName || "Usuario"}</span>
                        <img
                            src={PerfilDefault}
                            alt="Perfil de usuario"
                            className="rounded-circle"
                            style={{
                                width: '32px',
                                height: '32px',
                                objectFit: 'cover'
                            }}
                        />
                    </div>
                ) : (
                    <span className="text-dark">Iniciar Sesión</span>
                )}
            </a>

            {/* Menú dropdown - CORREGIDO */}
            <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                {isLoggedIn ? userOptionsContent : (
                    <li>
                        <div className="login-dropdown-content">
                            {loginContent}
                            <div className="dropdown-divider"></div>
                            <Link
                                className="dropdown-item"
                                to="/registrarse"
                                onClick={closeDropdown}
                            >
                                <i className="bi bi-person-plus me-2"></i>¿No tienes cuenta? Regístrate
                            </Link>
                            <Link
                                className="dropdown-item"
                                to="/recuperar-contrasena"
                                onClick={closeDropdown}
                            >
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