import React from "react";
import "./Home.css";

import Carrusel1 from "../assets/carrusel_1.mp4";
import Carrusel2 from "../assets/carrusel_2.png";
import Carrusel3 from "../assets/carrusel_3.png";

const Home: React.FC = () => {
    return (
        <div className="home-page-content"> 
            
            <div id="mainCarousel" className="carousel slide" data-bs-ride="carousel">
                <div className="carousel-inner">
                    
                    <div className="carousel-item active" data-bs-interval="6000"> 
                            <video
                                className="d-block w-100"
                                autoPlay
                                loop
                                muted
                                playsInline
                                aria-label="Video promocional de Safe Rescue"
                            >
                                <source src={Carrusel1} type="video/mp4" />
                                Tu navegador no soporta el elemento de video.
                            </video>
                    </div>

                    <div className="carousel-item" data-bs-interval="6000">
                        <img
                            src={Carrusel2}
                            alt="Rescatistas preparándose para la acción"
                            className="d-block w-100"
                        />
                    </div>
                    
                    <div className="carousel-item" data-bs-interval="6000">
                        <img
                            src={Carrusel3}
                            alt="Mapa de incidentes activos"
                            className="d-block w-100"
                        />
                    </div>
                </div>

                <button
                    className="carousel-control-prev"
                    type="button"
                    data-bs-target="#mainCarousel"
                    data-bs-slide="prev"
                    aria-label="Anterior"
                    onMouseUp={(e) => (e.currentTarget as HTMLElement).blur()}
                    onClick={(e) => (e.currentTarget as HTMLElement).blur()}
                >
                    <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Previous</span>
                </button>

                <button
                    className="carousel-control-next"
                    type="button"
                    data-bs-target="#mainCarousel"
                    data-bs-slide="next"
                    aria-label="Siguiente"
                    onMouseUp={(e) => (e.currentTarget as HTMLElement).blur()}
                    onClick={(e) => (e.currentTarget as HTMLElement).blur()}
                >
                    <span className="carousel-control-next-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Next</span>
                </button>
            </div>

            <div className="card-base card-contenido mt-4" id="contenido-home"> 
                
                <h2 className="titulo-info-home color-3-12">
                    <span className="titulo-L color-3-12">Bienvenido a </span>
                    <span className="titulo-L_Negrita color-3-12">SAFE Rescue</span>
                </h2>

                <h3 className="text-p-L_Negrita color-3-12 text-center mt-4">
                    En Safe Rescue, nuestra misión es facilitar la comunicación y la respuesta ante
                    situaciones de emergencia.
                </h3>
                
                <h3 className="text-p-L_Negrita color-3-12 text-center mb-5">
                    Con una interfaz intuitiva y herramientas avanzadas, podrás:
                </h3>

                <ul id="lista-funcionalidades" className="list-unstyled">
                    <li className="texto-info-home text-p-S mb-3">
                        <strong className="color-primary">Visualizar incidentes en tiempo real:</strong> Accede a un mapa interactivo que muestra los
                        eventos reportados, clasificados como "localizados", "en progreso" o "cerrados".
                    </li>
                    <li className="texto-info-home text-p-S mb-3">
                        <strong className="color-primary">Recibir notificaciones instantáneas:</strong> Mantente informado con alertas enviadas directamente
                        a tu dispositivo móvil, asegurando una respuesta rápida y efectiva.
                    </li>
                    <li className="texto-info-home text-p-S mb-3">
                        <strong className="color-primary">Registrar y gestionar incidentes:</strong> Reporta situaciones de emergencia fácilmente y colabora
                        con los cuerpos de bomberos para garantizar la seguridad de tu comunidad.
                    </li>
                    <li className="texto-info-home text-p-S mb-3">
                        <strong className="color-primary">Generar reportes:</strong> Análisis de la frecuencia y el tipo de incidentes en diferentes áreas,
                        ayudando a mejorar la prevención y respuesta en el futuro.
                    </li>
                </ul>

                <p className="text-p-L_Negrita color-3-12 mt-4 text-center">
                    Únete a nosotros en la creación de un entorno más seguro y conectado. Comienza hoy mismo a explorar todas
                    las funcionalidades que Safe Rescue tiene para ofrecer.
                </p>

            </div>
        </div>
    );
};

export default Home;