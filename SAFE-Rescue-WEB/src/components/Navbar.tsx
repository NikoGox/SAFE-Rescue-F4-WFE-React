import React from "react";
import { Link } from "react-router-dom";
import AuthButtonAndDropdown from "./AuthButtonAndDropdown";
import "./Navbar.css";

import Logo from "../assets/sr_logo.png";

interface NavbarProps {
    isLoggedIn: boolean; 
    userName?: string; 
}

const Navbar: React.FC<NavbarProps> = ({ isLoggedIn, userName }) => {
    return (
        // La clase 'fixed-top' puede ser útil si quieres que siempre esté visible
        <nav className="navbar navbar-expand-lg bg-body-tertiary">
            <div className="container-fluid">
                
                {/* 1. LOGO Y TÍTULO: Usamos un solo Link para envolver la imagen y el texto.
                  La clase 'navbar-brand' se aplica al Link, y la clase 'titulo' se usa
                  para los estilos específicos del texto dentro del Link.
                */}
                <Link className="navbar-brand logo-brand" to="/">
                    <img
                        src={Logo}
                        alt="SAFE Rescue Logo - Inicio"
                        width="50"
                        height="50"
                        className="d-inline-block align-text-top me-2" // Agregamos margen a la derecha de Bootstrap
                    />
                    <span className="titulo">SAFE Rescue</span>
                </Link>

                {/* Botón Toggler (Bootstrap estándar) */}
                <button 
                    className="navbar-toggler" 
                    type="button" 
                    data-bs-toggle="collapse" 
                    data-bs-target="#navbarNavAltMarkup"
                    aria-controls="navbarNavAltMarkup" 
                    aria-expanded="false" 
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
                    {/* ms-auto: Mueve los links a la derecha */}
                    <div className="navbar-nav ms-auto"> 
                        
                        {/* Links de Navegación: Usamos 'nav-link' directamente en el Link */}
                        <Link className="text-a-navbar nav-link color-11" to="/incidentes">Incidentes</Link>
                        
                        <span className="espaciador-navbar color-10-1" aria-hidden="true">|</span>
                        <Link className="text-a-navbar nav-link color-11" to="/contactanos">Contáctanos</Link>
                        
                        <span className="espaciador-navbar color-10-1" aria-hidden="true">|</span>
                        <Link className="text-a-navbar nav-link color-11" to="/donaciones">Donar</Link>

                        {/* Componente Modular de Autenticación */}
                        {/* Usualmente, aquí va un separador final antes del botón de login */}
                        {/* <span className="espaciador-navbar color-10-1" aria-hidden="true">|</span> */}

                        <AuthButtonAndDropdown isLoggedIn={isLoggedIn} userName={userName} />
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;