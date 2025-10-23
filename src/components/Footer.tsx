import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

import LogoBomberos from "../assets/bomberos_logo.png";
import LogoCorfo from "../assets/corfo_logo.png";


const Footer: React.FC = () => {
    
    // FUNCIÓN CLAVE PARA EL DESPLAZAMIENTO SUAVE
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,         // Mueve la ventana a la coordenada vertical 0 (el inicio de la página)
            behavior: 'smooth' 
        });
    };

    return (
        <footer className="custom-footer py-4 mt-auto">
            <div className="container-fluid">

                {/* Sección de Logos y Derechos */}
                <div className="container-fluid border-bottom pb-3">
                    <div className="d-flex justify-content-between align-items-center">
                        
                        {/* Contenedor de Logos */}
                        <div className="d-flex align-items-center">
                            <img
                                src={LogoBomberos}
                                className="d-inline-block align-text-top me-3" 
                                alt="Logo Bomberos"
                                width="200" // Duplicado
                                height="100" // Duplicado
                            />
                            {/* Separador Visual */}
                            <div className="vr mx-3 d-none d-sm-block" style={{ height: '50px', backgroundColor: 'var(--color-light-gray)' }}></div>

                            <img
                                src={LogoCorfo}
                                className="d-inline-block align-text-top ms-3"
                                alt="Logo Corfo"
                                width="200" // Duplicado
                                height="100" // Duplicado
                            />
                        </div>

                        {/* Texto de Derechos */}
                        <p className="text-end mb-0 text-white">
                            {new Date().getFullYear()} SAFE Rescue
                        </p>
                    </div>
                </div>

                {/* Sección de Navegación - AHORA CENTRADA Y CON PADDING DE 40PX */}
                <div className="d-flex justify-content-center align-items-center footer-nav-section"> 
                    
                    {/* Lista de Navegación con scroll al tope */}
                    <ul className="nav">
                        <li className="nav-item">
                            <Link className="nav-link px-3" to="/" onClick={scrollToTop}>Inicio</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link px-3" to="/incidentes" onClick={scrollToTop}>Incidentes</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link px-3" to="/contactanos" onClick={scrollToTop}>Contáctanos</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link px-3" to="/nosotros" onClick={scrollToTop}>Nosotros</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link px-3" to="/donar" onClick={scrollToTop}>Donar</Link>
                        </li>
                    </ul>

                </div>
            </div>
        </footer>
    )
}

export default Footer;