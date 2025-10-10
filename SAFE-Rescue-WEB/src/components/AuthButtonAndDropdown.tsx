// src/components/Navbar/AuthButtonAndDropdown.tsx

import React, { useState } from "react";
import { Link } from "react-router-dom";
import PerfilDefault from "../assets/perfil-default.png"; // Ajustar ruta de importación

interface AuthProps {
    isLoggedIn: boolean;
    userName?: string;
}

const AuthButtonAndDropdown: React.FC<AuthProps> = ({ isLoggedIn, userName }) => {
    // ⚠️ Mantenemos el estado local del formulario de login aquí, donde se usa.
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");

    const handleSumbit = (e: React.FormEvent) => {
        e.preventDefault();
        // 🚨 Aquí va la lógica real para intentar iniciar sesión (API call, etc.)
        console.log("Intentando iniciar sesión con:", email);
        setEmail("");
        setPass("");
    }

    // 💡 Aquí podrías usar el estado de React para controlar si el dropdown está abierto,
    // en lugar de depender únicamente de los atributos de Bootstrap (si buscas más control).
    // Por ahora, lo mantenemos como está para no cambiar la estructura HTML de Bootstrap.

    const loginContent = (
        <form onSubmit={handleSumbit} className="px-4 py-3">
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
            <p id="loginErrorMessage"></p>
            <button type="submit" className="btn btn-primary">Iniciar Sesión</button>
        </form>
    );

    const userOptionsContent = (
        <>
            <div id="userMenuOptions">
                <div className="dropdown-divider"></div>
                <Link className="dropdown-item" to="/perfil">Mi Perfil</Link>
                <Link className="dropdown-item" to="#" /* onClick={handleLogout} */>Cerrar Sesión</Link>
            </div>
        </>
    );

    return (
        <li className="nav-item dropdown">
            <a className="nav-link" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown"
                aria-expanded="false">

                {/* Botón que se muestra según el estado de autenticación */}
                {isLoggedIn ? (
                    <button className="boton-usuario text-p-XS color-negro">
                        <span /* id="lblNombre_usu_nav" */>{userName || "Usuario"}</span>
                        <div className="imagen-box-nav">
                            <img
                                src={PerfilDefault} // Asume que la URL de imagen del usuario se pasa por prop
                                alt="Perfil de usuario"
                            /* id="imgPerfilNav" */
                            />
                        </div>
                    </button>
                ) : (
                    <button className="boton-iniciar-sesion text-p-XS color-blanco">
                        Iniciar Sesión
                    </button>
                )}
            </a>

            <div className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">

                {isLoggedIn ? (
                    <>
                        {userOptionsContent}
                    </>
                ) : (
                    <>
                        <div id="loginDropdownContent">
                            {loginContent}
                            <div className="dropdown-divider"></div>
                            <Link className="dropdown-item" to="/registrarse">¿No tienes cuenta? Regístrate</Link>
                            <Link className="dropdown-item" to="#" /* onClick={handleForgotPassword} */>¿Olvidaste tu contraseña?</Link>
                        </div>
                    </>
                )}
            </div>
        </li>
    );
};

export default AuthButtonAndDropdown;