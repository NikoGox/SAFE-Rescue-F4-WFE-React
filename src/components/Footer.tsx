import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

import LogoBomberos from "../assets/bomberos_logo.png";
import LogoCorfo from "../assets/corfo_logo.png";

const Footer: React.FC = () => {
    
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,        
            behavior: 'smooth' 
        });
    };

    return (
        <footer className="custom-footer py-4 mt-auto">
            <div className="container-fluid">

                {/* Sección de logos */}
                <div className="container-fluid border-bottom pb-3">
                    <div className="d-flex justify-content-between align-items-center">
                        
                        <div className="d-flex align-items-center">
                            <img
                                src={LogoBomberos}
                                className="d-inline-block align-text-top me-3" 
                                alt="Logo Bomberos"
                                width="200" 
                                height="100" 
                            />
                            <div className="vr mx-3 d-none d-sm-block" style={{ height: '50px', backgroundColor: 'var(--color-light-gray)' }}></div>

                            <img
                                src={LogoCorfo}
                                className="d-inline-block align-text-top ms-3"
                                alt="Logo Corfo"
                                width="200" 
                                height="100" 
                            />
                        </div>

                        <p className="text-end mb-0 text-white">
                            {new Date().getFullYear()} SAFE Rescue
                        </p>
                    </div>
                </div>

                {/* Navegación del footer - SIN INCIDENTES */}
                <div className="d-flex justify-content-center align-items-center footer-nav-section"> 
                    
                    <ul className="nav">
                        <li className="nav-item">
                            <Link className="nav-link px-3" to="/" onClick={scrollToTop}>
                                Inicio
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link px-3" to="/nosotros" onClick={scrollToTop}>
                                Nosotros
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link px-3" to="/contactanos" onClick={scrollToTop}>
                                Contáctanos
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link px-3" to="/donar" onClick={scrollToTop}>
                                Donar
                            </Link>
                        </li>
                    </ul>

                </div>
            </div>
        </footer>
    )
}

export default Footer;