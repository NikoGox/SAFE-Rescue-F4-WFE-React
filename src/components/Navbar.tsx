// src/components/Navbar/Navbar.tsx
import React from "react";
import { Link } from "react-router-dom";
import Dropdown from "./Dropdown";
import "./Navbar.css";
import Logo from "../assets/sr_logo.png";
import { useAuth } from "./UseAuth";

const Navbar: React.FC = () => {
    const { isLoggedIn, userName, login, logout, loading } = useAuth();

    // Mostrar estado de carga
    if (loading) {
        return (
            <nav className="navbar navbar-expand-lg navbar-light bg-light fixed-top">
                <div className="container-fluid">
                    <div className="navbar-brand d-flex align-items-center">
                        <div className="spinner-border spinner-border-sm me-2" role="status">
                            <span className="visually-hidden">Cargando...</span>
                        </div>
                        <span>Cargando...</span>
                    </div>
                </div>
            </nav>
        );
    }

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light fixed-top">
            <div className="container-fluid">
                {/* Logo y marca */}
                <Link className="navbar-brand logo-brand" to="/">
                    <img
                        src={Logo}
                        alt="SAFE Rescue Logo"
                        width="50"
                        height="50"
                        className="d-inline-block align-text-top me-2"
                    />
                    <span className="titulo">SAFE Rescue</span>
                </Link>

                {/* Botón toggler */}
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarMainContent"
                    aria-controls="navbarMainContent"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* Contenido colapsable - CORREGIDO: usar ul/li */}
                <div className="collapse navbar-collapse" id="navbarMainContent">
                    <ul className="navbar-nav ms-auto align-items-center">
                        {/* Incidentes */}
                        <li className="nav-item">
                            <Link className="nav-link text-a-navbar" to="/incidentes">
                                Incidentes
                            </Link>
                        </li>
                        
                        {/* Separador */}
                        <li className="nav-item">
                            <span className="espaciador-navbar">|</span>
                        </li>
                        
                        {/* Contáctanos */}
                        <li className="nav-item">
                            <Link className="nav-link text-a-navbar" to="/contactanos">
                                Contáctanos
                            </Link>
                        </li>
                        
                        {/* Separador */}
                        <li className="nav-item">
                            <span className="espaciador-navbar">|</span>
                        </li>
                        
                        {/* Donar */}
                        <li className="nav-item">
                            <Link className="nav-link text-a-navbar" to="/donar">
                                Donar
                            </Link>
                        </li>
                        
                        {/* Dropdown - CORREGIDO: está dentro de un li */}
                        <Dropdown
                            isLoggedIn={isLoggedIn}
                            userName={userName}
                            onLogin={login}
                            onLogout={logout}
                        />
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;