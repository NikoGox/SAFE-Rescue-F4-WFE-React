import React, { useState } from "react";

import PerfilDefault from "../assets/perfil-default.png";

// Declara un componente funcional llamado Perfil, significa React Functional Component, y le dice a TypeScript que Nosotros es un componente de React.
const Perfil: React.FC = () => {
    const [nombre, setNombre] = useState("");
    const [email, setEmail] = useState("");
    const [telefono, setTelefono] = useState("");
    const [direccion, setDireccion] = useState("");
    const [rut, setRut] = useState("");

    return (

        <div className="contenedor-principal">
            <h2 className="text-center mb-4">Mi Perfil</h2>
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card p-4">
                        <div className="text-center mb-3">
                            <img
                                src={PerfilDefault}
                                alt="Perfil de usuario"
                                id="imgPerfil"
                                className="rounded-circle"
                                width="150px"
                                height="150px"
                            />
                            <h4 id="lblNombre_usu" className="mt-2"></h4>
                        </div>
                        <div className="list-group list-group-flush">
                            <div className="list-group-item">
                                <strong>Nombre Completo:</strong>
                                <span id="lblNombre"></span>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="nombre"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    required
                                    placeholder="Juan Pérez González"
                                />
                                <p className="mensajeError"></p>
                            </div>
                            <div className="list-group-item">
                                <strong>RUT:</strong> <span id="lblRut"></span>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="rut"
                                    value={rut}
                                    onChange={(e) => setRut(e.target.value)}
                                    required
                                    placeholder="20.000.000-k"
                                />
                                <p className="mensajeError"></p>
                            </div>
                            <div className="list-group-item">
                                <strong>Correo:</strong> <span id="lblCorreo"></span>
                                <input
                                    type="email"
                                    className="form-control"
                                    id="correo"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="tu.correo@ejemplo.com"
                                />
                                <p className="mensajeError"></p>
                            </div>

                            <div className="list-group-item">
                                <strong>Dirección:</strong> <span id="lblDireccion"></span>
                                <div className="form-group-registro">
                                    <label htmlFor="direccion">Dirección</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="direccion"
                                        value={direccion}
                                        onChange={(e) => setDireccion(e.target.value)}
                                        required
                                        placeholder="Calle 123, Comuna"
                                    />
                                    <p className="mensajeError"></p>
                                </div>

                                <div className="list-group-item">
                                    <strong>Numero Teléfono:</strong> <span id="lblTelefono"></span>
                                    <input
                                        type="tel"
                                        className="form-control"
                                        id="telefono"
                                        value={telefono}
                                        onChange={(e) => setTelefono(e.target.value)}
                                        required
                                        placeholder="912345678"
                                    />

                                    <p className="mensajeError"></p>
                                </div>
                                <div className="text-center mt-4">
                                    <button id="btnEditar" className="btn btn-primary me-2">Editar Perfil</button>
                                    <button id="btnGuardar" className="btn btn-success">Guardar
                                        Cambios</button>
                                    <button id="btnCancelar" className="btn btn-secondary">Cancelar</button>
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