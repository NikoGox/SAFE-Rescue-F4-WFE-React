// src/components/Footer/Footer.tsx
import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

import LogoBomberos from "../assets/bomberos_logo.png";
import LogoCorfo from "../assets/corfo_logo.png";


const Footer: React.FC = () => {
    return (
        // ⚠️ Eliminamos el div contenedor y empezamos directamente con el footer
        <footer className="custom-footer py-4 mt-auto">
            <div className="container-fluid">

                {/* Sección de Logos y Derechos */}
                <div className="container-fluid border-bottom pb-3">
                    <div className="d-flex justify-content-between align-items-center">
                        
                        {/* Contenedor de Logos */}
                        <div className="d-flex align-items-center">
                            <img
                                src={LogoBomberos}
                                className="d-inline-block align-text-top me-3" // Añadimos margen derecho
                                alt="Logo Bomberos"
                                width="100" // Reducir un poco el tamaño para el footer
                                height="50"
                            />
                            {/* Separador Visual (usando una línea simple y clases de espaciado) */}
                            <div className="vr mx-3 d-none d-sm-block" style={{ height: '50px', backgroundColor: 'var(--color-light-gray)' }}></div>

                            <img
                                src={LogoCorfo}
                                className="d-inline-block align-text-top ms-3"
                                alt="Logo Corfo"
                                width="100" // Reducir un poco el tamaño para el footer
                                height="50"
                            />
                        </div>

                        {/* Texto de Copyright */}
                        <p className="text-end mb-0 text-white">
                            . {new Date().getFullYear()} SAFE Rescue.
                        </p>
                    </div>
                </div>

                {/* Sección de Navegación */}
                <ul className="nav justify-content-center pt-2">
                    <li className="nav-item"><Link className="nav-link px-3" to="/">Inicio</Link></li>
                    <li className="nav-item"><Link className="nav-link px-3" to="/incidentes">Incidentes</Link></li>
                    <li className="nav-item"><Link className="nav-link px-3" to="/contactanos">Contáctanos</Link></li>
                    <li className="nav-item"><Link className="nav-link px-3" to="/donar">Donar</Link></li>
                    
                </ul>

            </div>
        </footer>
    )
}

export default Footer;