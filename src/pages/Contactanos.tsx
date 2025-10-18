import React, { useState } from "react";
import Logo from "../assets/sr_logo.png"; 
import "./Contactanos.css";

// Define una interfaz para los datos del usuario (simulados)
interface UserData {
    name: string;
    email: string;
    phone: string;
    address: string;
}


const getProfileData = (): UserData | null => {

    const isAuthenticated = true; 
    if (isAuthenticated) {
        return {
            name: "Juanito Pérez (Perfil)",
            email: "juanito.perez@safesite.com",
            phone: "987654321",
            address: "Avenida Ejemplo 500, Santiago",
        };
    }
    return null;
};

const Contactanos: React.FC = () => {
    const profileData = getProfileData();

    // 1. Estados Iniciales
    const [nombre, setNombre] = useState("");
    const [email, setEmail] = useState("");
    const [telefono, setTelefono] = useState("");
    const [direccion, setDireccion] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [useProfile, setUseProfile] = useState(false); // Estado para el checkbox de perfil

    // 2. Manejo del Checkbox de Perfil
    const handleProfileToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        setUseProfile(checked);

        if (checked && profileData) {
            // Aplicar datos del perfil si el checkbox está marcado
            setNombre(profileData.name);
            setEmail(profileData.email);
            setTelefono(profileData.phone);
            setDireccion(profileData.address);
            // Dejamos el mensaje vacío
        } else {
            // Si se desmarca, o si no hay datos, resetear los campos (opcional)
            setNombre("");
            setEmail("");
            setTelefono("");
            setDireccion("");
        }
    };


    // 3. Manejo del Envío
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // 🚨 Aquí es donde enviarías los datos a un servicio backend (API, EmailJS, etc.)
        console.log("Datos del Formulario:", { nombre, email, telefono, direccion, mensaje, useProfile });
        
        // Muestra alerta (temporal, usar un modal o mensaje de éxito real)
        alert(`Gracias ${nombre}, tu mensaje ha sido enviado!`); 

        // Limpiar el formulario
        setNombre("");
        setEmail("");
        setTelefono("");
        setDireccion("");
        setMensaje("");
        setUseProfile(false); // Resetear el checkbox después del envío
    };

    return (
        <div className="contact-page-container contenedor-principal"> {/* Mantener la clase de layout */}
            
            {/* SECCIÓN FORMULARIO */}
            <div className="seccion-formulario">
                
                <div className="logo-formulario">
                    <img
                        src={Logo}
                        alt="SAFE Rescue Logo"
                        width="60" 
                        height="60"
                        className="d-inline-block align-text-top"
                    />
                </div>

                {/* Usamos H2 si el H1 es el logo o el título de la aplicación */}
                <h2 className="titulo-formulario">Contáctanos</h2> 
                <p className="subtitulo-formulario">Envíanos un mensaje y te responderemos a la brevedad.</p>

                <form onSubmit={handleSubmit} className="form" id="contactForm">
                    
                    {/* Nombre */}
                    <div className="form-group-registro">
                        <label htmlFor="nombre">Nombre Completo</label>
                        <input
                            type="text"
                            className="form-control form-control-registro" // Usar la clase de estilo de registro
                            id="nombre"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            required
                            placeholder="Juan Pérez González"
                        />
                        <p className="mensajeError"></p>
                    </div>

                    {/* Correo Electrónico */}
                    <div className="form-group-registro">
                        <label htmlFor="correo">Correo Electrónico</label>
                        <input
                            type="email"
                            className="form-control form-control-registro"
                            id="correo"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="tu.correo@ejemplo.com"
                        />
                        <p className="mensajeError"></p>
                    </div>

                    <div className="form-row">
                        {/* Teléfono */}
                        <div className="form-col">
                            <div className="form-group-registro">
                                <label htmlFor="telefono">Número Teléfono</label>
                                <input
                                    type="tel"
                                    className="form-control form-control-registro"
                                    id="telefono"
                                    value={telefono}
                                    onChange={(e) => setTelefono(e.target.value)}
                                    required
                                    placeholder="912345678"
                                />
                                <p className="mensajeError"></p>
                            </div>
                        </div>
                        {/* Dirección */}
                        <div className="form-col">
                            <div className="form-group-registro">
                                <label htmlFor="direccion">Dirección</label>
                                <input
                                    type="text"
                                    className="form-control form-control-registro"
                                    id="direccion"
                                    value={direccion}
                                    onChange={(e) => setDireccion(e.target.value)}
                                    required
                                    placeholder="Calle 123, Comuna"
                                />
                                <p className="mensajeError"></p>
                            </div>
                        </div>
                    </div>

                    {/* Mensaje */}
                    <div className="form-group-registro">
                        <label htmlFor="mensaje">Mensaje</label>
                        <textarea
                            id="mensaje"
                            className="form-control form-control-registro"
                            value={mensaje}
                            onChange={(e) => setMensaje(e.target.value)}
                            required
                            rows={5}
                            placeholder="Escribe tu mensaje aquí..."
                        ></textarea>
                        <p className="mensajeError"></p>
                    </div>

                    {/* Checkbox de Autocompletar */}
                    {profileData && ( // Solo muestra el checkbox si hay datos de perfil disponibles
                        <div className="checkbox-container">
                            <input
                                type="checkbox"
                                name="autofill"
                                id="autofillCheckbox"
                                checked={useProfile} // Controlado por el estado
                                onChange={handleProfileToggle} // Manejador de cambio
                                className="form-check-input" // Clase de Bootstrap para checkboxes
                            />
                            <label htmlFor="autofillCheckbox">Usar mis datos de perfil</label>
                        </div>
                    )}

                    <button type="submit" className="btn-registro mt-4">Enviar Mensaje</button>
                </form>
            </div>

            {/* SECCIÓN IMAGEN/INFORMACIÓN ADICIONAL */}
            <div className="seccion-imagen">
                <div className="contenido-imagen">
                    <h3 className="titulo-imagen">Estamos aquí para ayudarte</h3> 
                    <p className="texto-imagen">Si tienes alguna duda o sugerencia, no dudes en contactarnos. Tu
                        retroalimentación es muy valiosa para nosotros.</p>
                    <ul className="beneficios-lista">
                        <li>Resuelve tus dudas</li>
                        <li>Envía sugerencias</li>
                        <li>Reporta errores</li>
                        <li>Colabora con nosotros</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Contactanos;