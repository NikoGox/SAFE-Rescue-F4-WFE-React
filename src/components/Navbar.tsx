import React, { useCallback } from "react";
import { Link } from "react-router-dom";
import Dropdown from "./Dropdown"; // Asumiré que existe por ahora
import styles from "./Navbar.module.css";
import Logo from "../assets/sr_logo.png";
import { useAuth } from "../hooks/useAuth"; 

const Navbar: React.FC = () => {
    const { isLoggedIn, loading } = useAuth();
    
    const scrollToTop = useCallback(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

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
        <nav className={`${styles.navbarWrapper} navbar navbar-expand-lg navbar-light bg-light fixed-top shadow`}>
            <div className={`${styles.container} container-fluid`}>
                
                {/* Logo y marca */}
                <Link className={`${styles.logoBrand} navbar-brand`} to="/" onClick={scrollToTop}>
                    <img
                        src={Logo}
                        alt="SAFE Rescue Logo"
                        width="50"
                        height="50"
                        className="d-inline-block align-text-top me-2"
                    />
                    <span className={styles.titulo}>SAFE Rescue</span>
                </Link>

                {/* Botón toggler para móviles */}
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

                {/* Contenido colapsable */}
                <div className="collapse navbar-collapse" id="navbarMainContent">
                    <ul className={`${styles.navbarNav} navbar-nav ms-auto align-items-center`}>
                        
                        {/* Enlaces públicos para todos los usuarios */}
                        <li className="nav-item">
                            <Link className={`${styles.textANavbar} nav-link`} to="/nosotros" onClick={scrollToTop}>
                                Nosotros
                            </Link>
                        </li>
                        <li className="nav-item"><span className={styles.espaciadorNavbar}>|</span></li>
                        
                        <li className="nav-item">
                            <Link className={`${styles.textANavbar} nav-link`} to="/contactanos" onClick={scrollToTop}>
                                Contáctanos
                            </Link>
                        </li>
                        <li className="nav-item"><span className={styles.espaciadorNavbar}>|</span></li>
                        
                        <li className="nav-item">
                            <Link className={`${styles.textANavbar} nav-link`} to="/donar" onClick={scrollToTop}>
                                Donar
                            </Link>
                        </li>

                        
                        {/* Dropdown para acciones de usuario */}
                        <li className={`${styles['boton-login']} nav-item`}>
                            <Dropdown />
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;