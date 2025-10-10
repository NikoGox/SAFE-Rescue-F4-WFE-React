import React from "react";
import "./Home.css"; // Estilos de la página de Home

// Asegúrate de que las rutas sean relativas al archivo Home.tsx
import Carrusel1 from "../assets/carrusel_1.mp4";
import Carrusel2 from "../assets/carrusel_2.png";
import Carrusel3 from "../assets/carrusel_3.png";

const Home: React.FC = () => {
    return (
        // ⚠️ Usamos una clase específica en lugar de 'contenedor-principal' genérica
        <div className="home-page-content"> 
            
            {/* 1. CARRUSEL */}
            <div id="mainCarousel" className="carousel slide" data-bs-ride="carousel">
                <div className="carousel-inner">
                    
                    {/* Item 1: El VIDEO debe ser el primer 'active' o el que quieras mostrar primero */}
                    <div className="carousel-item active" data-bs-interval="4100"> 
                        <video
                            src={Carrusel1}
                            className="d-block w-100"
                            autoPlay  
                            loop      
                            muted   
                            playsInline  
                            type="video/mp4" // Usamos 'type' en lugar de 'typeof' para el elemento video
                            aria-label="Video promocional de Safe Rescue"
                        >
                            Tu navegador no soporta el elemento de video.
                        </video>
                    </div>

                    {/* Item 2: Ya no es 'active' */}
                    <div className="carousel-item" data-bs-interval="4100">
                        <img
                            src={Carrusel2}
                            alt="Rescatistas preparándose para la acción"
                            className="d-block w-100"
                        />
                    </div>
                    
                    {/* Item 3 */}
                    <div className="carousel-item" data-bs-interval="4100">
                        <img
                            src={Carrusel3}
                            alt="Mapa de incidentes activos"
                            className="d-block w-100"
                        />
                    </div>
                </div>
            </div>

            {/* 2. TARJETA DE CONTENIDO PRINCIPAL */}
            {/* Usamos clases de Bootstrap (mt-4, mb-4, p-4) para centrar la tarjeta si es necesario */}
            <div className="card-base card-contenido mt-5" id="contenido-home"> 
                
                {/* TÍTULO PRINCIPAL - Usamos etiqueta semántica H2 */}
                <h2 className="titulo-info-home color-3-12">
                    <span className="titulo-L color-3-12">Bienvenido a </span>
                    <span className="titulo-L_Negrita color-3-12">SAFE Rescue</span>
                </h2>

                {/* Subtítulos - Usamos etiquetas semánticas H3, eliminamos los ID redundantes */}
                <h3 className="text-p-L_Negrita color-3-12 text-center mt-4">
                    En Safe Rescue, nuestra misión es facilitar la comunicación y la respuesta ante
                    situaciones de emergencia.
                </h3>
                
                <h3 className="text-p-L_Negrita color-3-12 text-center mb-5">
                    Con una interfaz intuitiva y herramientas avanzadas, podrás:
                </h3>

                {/* ⚠️ Eliminamos los espaciadores HTML - El espaciado se maneja en Home.css */}
                {/* <p className="espaciador-blanco">Hola soy un espaciador</p> */}

                {/* Lista de Funcionalidades */}
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

                {/* ⚠️ Eliminamos el espaciador HTML */}

                {/* Párrafo Final */}
                <p className="text-p-L_Negrita color-3-12 mt-4 text-center">
                    Únete a nosotros en la creación de un entorno más seguro y conectado. Comienza hoy mismo a explorar todas
                    las funcionalidades que Safe Rescue tiene para ofrecer.
                </p>

            </div>
        </div>
    );
};

export default Home;