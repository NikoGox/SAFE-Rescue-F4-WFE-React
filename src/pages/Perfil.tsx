import React, { useState, useEffect } from "react";
import PerfilDefault from "../assets/perfil-default.png";
import "./Perfil.css";

interface UserData {
    nombre: string;
    email: string;
    telefono: string;
    direccion: string;
    rut: string;
    nombreUsuario?: string;
}

const Perfil: React.FC = () => {
    // Estados para los datos del usuario
    const [userData, setUserData] = useState<UserData>({
        nombre: "",
        email: "",
        telefono: "",
        direccion: "",
        rut: ""
    });
    
    // Estado para controlar el modo edición
    const [isEditing, setIsEditing] = useState(false);
    const [originalData, setOriginalData] = useState<UserData>({
        nombre: "",
        email: "",
        telefono: "",
        direccion: "",
        rut: ""
    });

    // Cargar datos del usuario al montar el componente
    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = () => {
        try {
            const usuarioLogueado = localStorage.getItem('usuarioLogueado');
            if (usuarioLogueado) {
                const userDataFromStorage = JSON.parse(usuarioLogueado);
                setUserData({
                    nombre: userDataFromStorage.nombre || "",
                    email: userDataFromStorage.correo || "",
                    telefono: userDataFromStorage.telefono || "",
                    direccion: userDataFromStorage.direccion || "",
                    rut: userDataFromStorage.rut || "",
                    nombreUsuario: userDataFromStorage.nombreUsuario || ""
                });
            }
        } catch (error) {
            console.error('Error al cargar datos del usuario:', error);
        }
    };

    const handleEdit = () => {
        setOriginalData({...userData});
        setIsEditing(true);
    };

    const handleSave = () => {
        // Aquí iría la lógica para guardar en la base de datos
        console.log("Guardando datos:", userData);
        
        // Actualizar localStorage
        const updatedUserData = {
            ...JSON.parse(localStorage.getItem('usuarioLogueado') || '{}'),
            nombre: userData.nombre,
            correo: userData.email,
            telefono: userData.telefono,
            direccion: userData.direccion,
            rut: userData.rut
        };
        localStorage.setItem('usuarioLogueado', JSON.stringify(updatedUserData));
        
        setIsEditing(false);
        alert("Cambios guardados exitosamente");
    };

    const handleCancel = () => {
        setUserData({...originalData});
        setIsEditing(false);
    };

    const handleInputChange = (field: keyof UserData) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserData(prev => ({
            ...prev,
            [field]: e.target.value
        }));
    };

    return (
        <div className="pagina-perfil">
            <div className="contenedor-perfil">
                <h2 className="text-center mb-4 titulo-perfil">Mi Perfil</h2>
                <div className="row justify-content-center">
                    <div className="col-12 col-lg-8 col-xl-6">
                        <div className="card card-perfil">
                            <div className="card-header-perfil text-center">
                                <img
                                    src={PerfilDefault}
                                    alt="Perfil de usuario"
                                    className="foto-perfil"
                                />
                                <h4 className="nombre-usuario mt-3">
                                    {userData.nombreUsuario || userData.nombre || "Usuario"}
                                </h4>
                            </div>
                            
                            <div className="card-body">
                                <div className="lista-datos-perfil">
                                    {/* Campo Nombre */}
                                    <div className="campo-perfil">
                                        <label htmlFor="nombre" className="form-label">
                                            <strong>Nombre Completo:</strong>
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="nombre"
                                                value={userData.nombre}
                                                onChange={handleInputChange('nombre')}
                                                placeholder="Juan Pérez González"
                                            />
                                        ) : (
                                            <p className="valor">{userData.nombre || "No especificado"}</p>
                                        )}
                                    </div>

                                    {/* Campo RUT */}
                                    <div className="campo-perfil">
                                        <label htmlFor="rut" className="form-label">
                                            <strong>RUT:</strong>
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="rut"
                                                value={userData.rut}
                                                onChange={handleInputChange('rut')}
                                                placeholder="20.000.000-k"
                                            />
                                        ) : (
                                            <p className="valor">{userData.rut || "No especificado"}</p>
                                        )}
                                    </div>

                                    {/* Campo Correo */}
                                    <div className="campo-perfil">
                                        <label htmlFor="email" className="form-label">
                                            <strong>Correo Electrónico:</strong>
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="email"
                                                className="form-control"
                                                id="email"
                                                value={userData.email}
                                                onChange={handleInputChange('email')}
                                                placeholder="tu.correo@ejemplo.com"
                                            />
                                        ) : (
                                            <p className="valor">{userData.email || "No especificado"}</p>
                                        )}
                                    </div>

                                    {/* Campo Dirección */}
                                    <div className="campo-perfil">
                                        <label htmlFor="direccion" className="form-label">
                                            <strong>Dirección:</strong>
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="direccion"
                                                value={userData.direccion}
                                                onChange={handleInputChange('direccion')}
                                                placeholder="Calle 123, Comuna"
                                            />
                                        ) : (
                                            <p className="valor">{userData.direccion || "No especificado"}</p>
                                        )}
                                    </div>

                                    {/* Campo Teléfono */}
                                    <div className="campo-perfil">
                                        <label htmlFor="telefono" className="form-label">
                                            <strong>Teléfono:</strong>
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="tel"
                                                className="form-control"
                                                id="telefono"
                                                value={userData.telefono}
                                                onChange={handleInputChange('telefono')}
                                                placeholder="912345678"
                                            />
                                        ) : (
                                            <p className="valor">{userData.telefono || "No especificado"}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Botones de acción */}
                                <div className="botones-perfil text-center mt-4">
                                    {!isEditing ? (
                                        <button 
                                            onClick={handleEdit}
                                            className="btn btn-editar-perfil me-2"
                                        >
                                            Editar Perfil
                                        </button>
                                    ) : (
                                        <>
                                            <button 
                                                onClick={handleSave}
                                                className="btn btn-guardar-perfil me-2"
                                            >
                                                Guardar Cambios
                                            </button>
                                            <button 
                                                onClick={handleCancel}
                                                className="btn btn-cancelar-perfil"
                                            >
                                                Cancelar
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Perfil;