import React, { useState, useEffect } from 'react';
import styles from './Nosotros.module.css';

// Array de imágenes para el carrusel (ajústalos con tus rutas reales)
const images = [
  'https://www.udalba.cl/wp-content/uploads/2023/01/Bomberos-UDALBA-1.jpg', 
  'https://www.bomberos.cl/contenidos/2636_logo952.jpg', 
  'https://raw.githubusercontent.com/NikoGox/SAFE-Rescue-F4-WFE-React/main/src/assets/readme/SafeRescueLogo.png', 
];

const Nosotros: React.FC = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Lógica para el cambio automático de imágenes
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 4000); // Cambia cada 4 segundos
        return () => clearInterval(interval); // Limpia el intervalo al desmontar el componente
    }, []);

    // Ya no se necesitan las funciones goToPrev, goToNext, ni goToSlide

    return (
        <div className={styles.nosotrosPageContainer}>
            <div className={styles.nosotrosContent}>
                
                {/* Header con el título degradado */}
                <header className={styles.header}>
                    <h1 className={styles.tituloPrincipal}>Nosotros</h1>
                </header>

                {/* Contenedor blanco principal para el contenido de texto */}
                <main className={styles.contentCard}>

                    {/* Sección: Misión (CON CARRUSEL SIMPLIFICADO) */}
                    <section className={styles.seccion}>
                        <h2>Misión</h2>
                        <div className={styles.misionGrid}> {/* Contenedor Grid para texto y carrusel */}
                            
                            {/* Columna de Texto */}
                            <div className={styles.misionTexto}>
                                <p>
                                    La misión de SAFE Rescue es liderar la innovación tecnológica para transformar la vida de las personas 
                                    y empresas. Como startup, nos comprometemos a crear soluciones tecnológicas avanzadas que mejoren 
                                    la calidad de vida, fomenten el progreso y generen un impacto positivo en el mundo.
                                </p>
                                <p>
                                    Nuestra visión es hacer que la tecnología sea accesible, intuitiva y verdaderamente inclusiva, 
                                    brindando a nuestros clientes herramientas que les permitan aprovechar al máximo su potencial, 
                                    de manera sencilla y efectiva.
                                </p>
                            </div>

                            {/* Columna de Carrusel */}
                            <div className={styles.misionCarruselWrapper}>
                                <div className={styles.carouselContainer}>
                                    {/* Ya no hay botones de flechas */}
                                    <img 
                                        src={images[currentImageIndex]} 
                                        alt={`Carrusel ${currentImageIndex + 1}`} 
                                        className={styles.carouselImage} 
                                    />
                                    {/* Ya no hay div para los puntos */}
                                </div>
                            </div>

                        </div> {/* Fin de .misionGrid */}
                    </section>

                    {/* Sección: Fundadores */}
                    <section className={styles.seccion}>
                        <h2>¿Quiénes somos?</h2>
                        
                        <div className={styles.creadoresGrid}>
                            
                            {/* Tarjeta de Mauricio Tapia */}
                            <div className={styles.creadorCard}>
                                <h3>Mauricio Tapia</h3>
                                <p className={styles.rolTitulo}>Co-Fundador / CEO</p>
                                <p className={styles.rolDescripcion}>
                                    Designado como Administrador y Desarrollador. Sus responsabilidades incluyen la 
                                    programación, el diseño y la dirección estratégica de los proyectos.
                                </p>
                                <ul className={styles.rolesLista}>
                                    <li>Product Owner</li>
                                    <li>Database Administrator (DBA)</li>
                                    <li>API Designer</li>
                                    <li>Backend Developer</li>
                                </ul>
                            </div>
                            
                            {/* Tarjeta de Rubén Parada */}
                            <div className={styles.creadorCard}>
                                <h3>Rubén Parada</h3>
                                <p className={styles.rolTitulo}>Co-Fundador / CTO</p>
                                <p className={styles.rolDescripcion}>
                                    Designado como Desarrollador. Su labor se centrará en la programación, el diseño 
                                    técnico y el liderazgo en el desarrollo de soluciones innovadoras.
                                </p>
                                <ul className={styles.rolesLista}>
                                    <li>Scrum Master</li>
                                    <li>QA (Quality Assurance)</li>
                                    <li>UI/UX Designer</li>
                                    <li>Frontend Developer</li>
                                </ul>
                            </div>

                        </div>
                    </section>

                </main>
            </div>
        </div>
    );
};

export default Nosotros;