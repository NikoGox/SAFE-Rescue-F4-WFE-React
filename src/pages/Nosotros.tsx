import React, { useState, useEffect } from 'react';
import styles from './Nosotros.module.css';

const images = [
  'https://www.udalba.cl/wp-content/uploads/2023/01/Bomberos-UDALBA-1.jpg', 
  'https://www.bomberos.cl/contenidos/2636_logo952.jpg', 
  'https://raw.githubusercontent.com/NikoGox/SAFE-Rescue-F4-WFE-React/main/src/assets/readme/SafeRescueLogo.png', 
];

const Nosotros: React.FC = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 4000);
        return () => clearInterval(interval); 
    }, []);


    return (
        <div className={styles.nosotrosPageContainer}>
            <div className={styles.nosotrosContent}>
                
                <header className={styles.header}>
                    <h1 className={styles.tituloPrincipal}>Nosotros</h1>
                </header>

                <main className={styles.contentCard}>

                    <section className={styles.seccion}>
                        <h2>Misión</h2>
                        <div className={styles.misionGrid}> 
                            
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

                            <div className={styles.misionCarruselWrapper}>
                                <div className={styles.carouselContainer}>
                                    <img 
                                        src={images[currentImageIndex]} 
                                        alt={`Carrusel ${currentImageIndex + 1}`} 
                                        className={styles.carouselImage} 
                                    />
                                </div>
                            </div>

                        </div>
                    </section>

                    <section className={styles.seccion}>
                        <h2>¿Quiénes somos?</h2>
                        
                        <div className={styles.creadoresGrid}>
                            
                            <div className={styles.creadorCard}>
                                <h3>Mauricio Tapia</h3>
                                <p className={styles.rolTitulo}>Co-Fundador / CEO</p>
                                <p className={styles.rolDescripcion}>
                                    Sus responsabilidades incluyen la 
                                    programación, bases de datos y la dirección estratégica de los proyectos.
                                </p>
                                <ul className={styles.rolesLista}>
                                    <li>Product Owner</li>
                                    <li>DBA (Database Administrator) </li>
                                    <li>API Designer</li>
                                    <li>Backend Developer</li>
                                </ul>
                            </div>
                            
                            <div className={styles.creadorCard}>
                                <h3>Rubén Parada</h3>
                                <p className={styles.rolTitulo}>Co-Fundador / CTO</p>
                                <p className={styles.rolDescripcion}>
                                    Su labor se centrá en la programación, el diseño 
                                    creativo y el liderazgo en el desarrollo de soluciones innovadoras.
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