// src/components/Navbar/Navbar.tsx
import React from "react";
import { Link } from "react-router-dom";
import Dropdown from "./Dropdown";
import styles from "./Navbar.module.css"; 
import Logo from "../assets/sr_logo.png";
import { useAuth } from "./UseAuth";

const Navbar: React.FC = () => {
    const { isLoggedIn, userName, login, logout, loading } = useAuth();

    // El estado de carga puede mantener las clases de Bootstrap sin cambios
    if (loading) {
        return (
            <nav className="navbar navbar-expand-lg navbar-light bg-light fixed-top ">
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
        // 2. Se combinan las clases de Bootstrap con las del módulo
        <nav className={`${styles.navbarWrapper} navbar navbar-expand-lg navbar-light bg-light fixed-top shadow`}>
            <div className={`${styles.container} container-fluid`}>
                {/* Logo y marca */}
                <Link className={`${styles.logoBrand} navbar-brand`} to="/">
                    <img
                        src={Logo}
                        alt="SAFE Rescue Logo"
                        width="50"
                        height="50"
                        className="d-inline-block align-text-top me-2"
                    />
                    {/* 3. Se aplica la clase de módulo directamente */}
                    <span className={styles.titulo}>SAFE Rescue</span>
                </Link>

                {/* Botón toggler (no requiere estilos de módulo) */}
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
                        {/* Incidentes */}
                        <li className="nav-item">
                            <Link className={`${styles.textANavbar} nav-link`} to="/incidentes">
                                Incidentes
                            </Link>
                        </li>
                        
                        {/* Separador */}
                        <li className="nav-item">
                            <span className={styles.espaciadorNavbar}>|</span>
                        </li>
                        
                        {/* Contáctanos */}
                        <li className="nav-item">
                            <Link className={`${styles.textANavbar} nav-link`} to="/contactanos">
                                Contáctanos
                            </Link>
                        </li>
                        
                        {/* Separador */}
                        <li className="nav-item">
                            <span className={styles.espaciadorNavbar}>|</span>
                        </li>
                        
                        {/* Donar */}
                        <li className="nav-item">
                            <Link className={`${styles.textANavbar} nav-link`} to="/donar">
                                Donar
                            </Link>
                        </li>
                        
                        {/* 4. Se pasan los estilos al componente hijo Dropdown */}
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