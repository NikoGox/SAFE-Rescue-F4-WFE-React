import React, { useMemo, useRef, useState, useEffect, useCallback, type ChangeEvent } from "react"; 
import "./Donar.css";

import FormField from '../components/Formulario'; 
import { useAuth } from "../hook/UseAuth";
import type { Errors } from "../types/PerfilesType";

import { FaDollarSign, FaMoneyBillWave, FaCoins, FaHandHoldingUsd, FaPlus } from 'react-icons/fa';
import Logo from "../assets/sr_logo.png";

type Pantalla = "monto" | "formulario" | "confirmacion" | "redirigiendo";

const formatCurrency = (value: number) => `$${new Intl.NumberFormat("es-CL").format(value)}`;

interface MontoButtonProps {
    value: number;
    onClick: (value: number) => void;
    active: boolean;
}

const MontoIcon = ({ value }: { value: number }) => {
    if (value <= 5000) return <FaDollarSign />;
    if (value <= 20000) return <FaCoins />;
    if (value <= 50000) return <FaMoneyBillWave />;
    return <FaHandHoldingUsd />;
};

const MontoButton: React.FC<MontoButtonProps> = ({ value, onClick, active }) => (
    <button
        key={value}
        className={`monto-btn ${active ? 'active' : ''}`}
        onClick={() => onClick(value)}
        data-testid={`monto-btn-${value}`}
    >
        <div className="monto-btn-icon-container">
            <MontoIcon value={value} />
        </div>
        <div className="monto-btn-text-container">
            {formatCurrency(value)}
        </div>
    </button>
);

const Donar: React.FC = () => {
    const { isLoggedIn, authData } = useAuth();
    const perfil = authData;

    const [pantalla, setPantalla] = useState<Pantalla>("monto");

    const [usarPerfil, setUsarPerfil] = useState(isLoggedIn);

    const [montoSeleccionado, setMontoSeleccionado] = useState<number>(0);
    const [nombre, setNombre] = useState("");
    const [email, setEmail] = useState("");
    const [telefono, setTelefono] = useState("");
    const [homenaje, setHomenaje] = useState(false);
    const [tipoHomenaje, setTipoHomenaje] = useState("En honor a...");
    const [detalleHomenaje, setDetalleHomenaje] = useState("");

    const [errores, setErrores] = useState<Errors>({});
    const [formValidated, setFormValidated] = useState(false);

    const confirmarNombre = useMemo(() => nombre.trim(), [nombre]);

    function limpiarFormulario() {
        setUsarPerfil(isLoggedIn);
        setNombre("");
        setEmail("");
        setTelefono("");
        setHomenaje(false);
        setTipoHomenaje("En honor a...");
        setDetalleHomenaje("");
        setErrores({});
        setFormValidated(false);
    }

    function seleccionarMonto(monto: number) {
        setMontoSeleccionado(monto);
        setFormValidated(false);
        setErrores({});
        setPantalla("formulario");
    }

    function handleOtroMonto() {
        const valor = prompt("Por favor, ingresa el monto que deseas donar:", "25000");
        if (!valor) return;
        const n = parseInt(valor.replace(/\s/g, "").replace(/\./g, "").replace(/,/g, "").trim(), 10);
        if (!isNaN(n) && n > 0) {
            seleccionarMonto(n);
        } else {
            alert("Por favor, ingresa un número válido y mayor a cero.");
        }
    }

    function formatearTelefono(input: string) {
        let valor = input.replace(/\s/g, "").replace(/[^0-9]/g, "");
        if (valor.length > 9) valor = valor.slice(0, 9);
        let formateado = "";
        if (valor.length > 0) formateado += valor.substring(0, 1);
        if (valor.length > 1) formateado += ' ' + valor.substring(1, 5);
        if (valor.length > 5) formateado += ' ' + valor.substring(5, 9);
        return formateado;
    }

    useEffect(() => {
        if (usarPerfil && perfil) {
            setNombre(perfil.nombre || ''); 
            setEmail(perfil.email);
            setTelefono(formatearTelefono(perfil.telefono.replace(/\s/g, "")));
        } else if (!usarPerfil) {
            setErrores({});
        }
    }, [usarPerfil, perfil]);

    const inputRefs = {
        nombre: useRef<HTMLInputElement>(null), 
        email: useRef<HTMLInputElement>(null),
        telefono: useRef<HTMLInputElement>(null),
        detalleHomenaje: useRef<HTMLTextAreaElement>(null),
    };
    
    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, setter: React.Dispatch<React.SetStateAction<string>>, formatter?: (value: string) => string) => {
        const value = e.target.value;
        setter(formatter ? formatter(value) : value);
    };


    const validarFormulario = useCallback(() => {
        let nuevosErrores: Errors = {};
        let esValido = true;

        if (!nombre.trim()) { 
             nuevosErrores.nombre = "El nombre completo es obligatorio."; 
             esValido = false; 
        } else {
             delete nuevosErrores.nombre;
        }

        if (!email.trim()) {
            nuevosErrores.email = "El correo electrónico es obligatorio."; esValido = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            nuevosErrores.email = "Formato de correo inválido."; esValido = false;
        }

        const telefonoCrudo = telefono.replace(/\s/g, "");
        if (telefonoCrudo.length > 0 && telefonoCrudo.length < 9) {
            nuevosErrores.telefono = "El teléfono debe tener 9 dígitos."; esValido = false;
        }

        if (homenaje && !detalleHomenaje.trim()) {
            nuevosErrores.detalleHomenaje = "El detalle del homenaje es obligatorio.";
            esValido = false;
        } else if (!homenaje) {
             delete nuevosErrores.detalleHomenaje;
        }

        setErrores(nuevosErrores);
        return esValido;
    }, [nombre, email, telefono, homenaje, detalleHomenaje]);

    function onSubmitFormulario(e?: React.FormEvent) {
        e?.preventDefault();
        setFormValidated(true);

        if (validarFormulario()) {
            setPantalla("confirmacion");
        } else {
            const camposConError = ['nombre', 'email', 'telefono', 'detalleHomenaje'];
            
            for (const campo of camposConError) {
                const errorKey = campo as keyof Errors;
                const refKey = campo as keyof typeof inputRefs;
                const ref = inputRefs[refKey];

                if (errores[errorKey] && ref.current) {
                    ref.current.focus();
                    break;
                }
            }
        }
    }

    function confirmarPago() {
        setPantalla("redirigiendo");
        setTimeout(() => {
            alert("¡Donación procesada con éxito! (Simulación). Muchas gracias por tu apoyo.");
            setPantalla("monto");
            limpiarFormulario();
        }, 4000);
    }

    return (
        <div className="donation-page-wrapper">
            <div className="donation-content-container">

                {pantalla === "monto" && (
                    <section id="card-monto-donacion" className="card-base card-contenido" data-testid="pantalla-monto">
                        <div className="card-donacion">
                            <div className="logoFormulario">
                                <img src={Logo} alt="SAFE Rescue Logo" width="70" height="70" className="d-inline-block align-text-top"/>
                            </div>
                            <h2 className="card-title-custom">Aporta ahora</h2>
                            <p className="card-subtitle-custom">Cada donación nos ayuda a seguir salvando vidas. <br />¡Gracias por tu apoyo a nuestros bomberos!</p>
                            <div className="monto-grid monto-grid-expanded">
                                {[5000, 10000, 20000, 50000, 100000].map(v => (
                                    <MontoButton key={v} value={v} onClick={seleccionarMonto} active={montoSeleccionado === v} />
                                ))}
                                <button className="monto-btn otro-monto-btn" onClick={handleOtroMonto} data-testid="monto-btn-otro">
                                    <div className="monto-btn-icon-container"><FaPlus /></div>
                                    <div className="monto-btn-text-container">Otro monto</div>
                                </button>
                            </div>
                        </div>
                    </section>
                )}

                {pantalla === "formulario" && (
                    <section id="card-monto-formulario" className="card-base card-contenido" data-testid="pantalla-formulario">
                        <div className="card-donacion">
                            <div className="logoFormulario">
                                <img src={Logo} alt="SAFE Rescue Logo" width="70" height="70" className="d-inline-block align-text-top"/>
                            </div>
                            <h2 className="card-title-custom">Completa con tus datos</h2>
                            <p className="card-subtitle-custom">Estás donando <strong id="monto-mostrado" data-testid="monto-seleccionado">{formatCurrency(montoSeleccionado)}</strong>. ¡Muchas gracias!</p>

                            <form id="formulario-donacion" noValidate onSubmit={onSubmitFormulario} className={formValidated ? 'was-validated' : ''} data-testid="form-donacion">
                                <div className="row g-3">

                                    <div className="col-12">
                                        <FormField
                                            id="nombre"
                                            label="Nombre completo (*)" 
                                            placeholder="Juan Pérez"
                                            value={nombre}
                                            onChange={(e) => handleInputChange(e, setNombre)} 
                                            onBlur={() => validarFormulario()} 
                                            error={errores.nombre}
                                            required={true}
                                            dataTestId="input-nombre"
                                            disabled={usarPerfil && isLoggedIn}
                                        />
                                    </div>
                                    
                                    <div className="col-12">
                                        <FormField
                                            id="email"
                                            label="Correo electrónico (*)"
                                            placeholder="tu.correo@ejemplo.com"
                                            value={email}
                                            onChange={(e) => handleInputChange(e, setEmail)}
                                            onBlur={() => validarFormulario()}
                                            error={errores.email}
                                            type="email"
                                            required={true}
                                            dataTestId="input-email"
                                            disabled={usarPerfil && isLoggedIn}
                                        />
                                    </div>
                                    <div className="col-12">
                                        <FormField
                                            id="telefono"
                                            label="Número de teléfono"
                                            placeholder="9 1234 5678"
                                            value={telefono}
                                            onChange={(e) => handleInputChange(e, setTelefono, formatearTelefono)} 
                                            onBlur={() => validarFormulario()}
                                            error={errores.telefono}
                                            type="tel"
                                            required={false}
                                            dataTestId="input-telefono"
                                            disabled={usarPerfil && isLoggedIn}
                                        />
                                    </div>

                                    {isLoggedIn && (
                                        <div className="col-12 mb-2">
                                            <div className="form-check d-flex align-items-center gap-2">
                                                <input
                                                    checked={usarPerfil}
                                                    onChange={e => setUsarPerfil(e.target.checked)}
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id="checkbox-usar-perfil"
                                                    data-testid="checkbox-usar-perfil"
                                                />
                                                <label className="form-check-label mb-0" htmlFor="checkbox-usar-perfil">Usar datos de mi perfil (como {authData?.nombre})</label>
                                            </div>
                                        </div>
                                    )}
                                    <div className="col-12">
                                        <div className="form-check d-flex align-items-center gap-2">
                                            <input checked={homenaje} onChange={e => setHomenaje(e.target.checked)} className="form-check-input" type="checkbox" id="checkbox-homenaje" data-testid="checkbox-homenaje" />
                                            <label className="form-check-label mb-0" htmlFor="checkbox-homenaje">Quiero hacer un homenaje especial con mi donación</label>
                                        </div>
                                    </div>


                                    <div className="col-12">
                                        <small className="d-block text-start mb-3 text-muted">Los campos con (*) son obligatorios.</small>
                                    </div>
                                    <div className={`col-12 ${homenaje ? 'show' : 'collapsed'}`} id="detalles-homenaje" data-testid="contenedor-homenaje">
                                        <div className="row g-2">
                                            <div className="col-md-5">
                                                <label htmlFor="tipo-homenaje" className="form-label-custom">&nbsp;Tipo de homenaje</label>
                                                <select value={tipoHomenaje} onChange={e => setTipoHomenaje(e.target.value)} id="tipo-homenaje" className="form-select form-control-custom" disabled={!homenaje} data-testid="select-tipo-homenaje">
                                                    <option>En honor a...</option>
                                                    <option>Una mención por...</option>
                                                    <option>Muchas gracias a...</option>
                                                    <option>Recordando a...</option>
                                                </select>
                                            </div>
                                            <div className="col-md-7 " >
                                                <FormField
                                                    id="detalleHomenaje"
                                                    label="Detalle del homenaje"
                                                    placeholder="Ej: En memoria de mi perro Fido, el más valiente..."
                                                    value={detalleHomenaje}
                                                    onChange={(e) => handleInputChange(e, setDetalleHomenaje)}
                                                    onBlur={() => validarFormulario()}
                                                    error={errores.detalleHomenaje}
                                                    required={homenaje} 
                                                    disabled={!homenaje} 
                                                    isTextArea={true} 
                                                    dataTestId="input-detalle-homenaje"
                                                    />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-7 mt-3">
                                        <label className="form-label-custom">Método de pago</label>
                                        <div className="payment-method" id="metodo-pago-fijo" data-testid="metodo-pago">Tarjeta de Crédito / Débito</div>
                                    </div>
                                    <div className="col-md-5 mt-3">
                                        <label className="form-label-custom">Monto Donación</label>
                                        <div id="monto-formulario" className="payment-method" onClick={() => setPantalla('monto')} data-testid="monto-formulario">{formatCurrency(montoSeleccionado)}</div>
                                    </div>
                                    <div className="col-12">
                                        <small className="d-block text-center mt-4 text-muted">Serás redirigido a una plataforma de pago segura.</small>
                                    </div>
                                </div>
                                <button type="submit" id="btn-continuar-donacion" className="btn btn-custom-primary mt-4" data-testid="btn-continuar">Continuar</button>
                            </form>
                        </div>
                    </section>
                )}

                {pantalla === "confirmacion" && (
                    <section id="card-confirmar-donacion" className="card-base card-contenido" data-testid="pantalla-confirmacion">
                        <div className="card-donacion">
                            <div className="logoFormulario">
                                <img src={Logo} alt="SAFE Rescue Logo" width="70" height="70" className="d-inline-block align-text-top"/>
                            </div>
                            <h2 className="card-title-custom">Confirma tu donación</h2>
                            <p className="card-subtitle-custom">Por favor, revisa que tus datos sean correctos antes de continuar.</p>

                            <div className="confirm-details" data-testid="resumen-datos">
                                <p><strong>Nombre:</strong> <span id="confirmar-nombre" data-testid="confirmar-nombre">{confirmarNombre}</span></p>
                                <p><strong>Correo:</strong> <span id="confirmar-email" data-testid="confirmar-email">{email}</span></p>
                                {telefono && (
                                    <div id="confirmar-telefono-contenedor"><p><strong>Teléfono:</strong> <span id="confirmar-telefono" data-testid="confirmar-telefono">{telefono}</span></p></div>
                                )}
                                {homenaje && (
                                    <div id="confirmar-homenaje-contenedor">
                                        <p id="confirmar-homenaje"><strong>Homenaje:</strong> <span className="fw-semibold" data-testid="confirmar-tipo-homenaje">{tipoHomenaje}</span>{detalleHomenaje ? <span>{` - ${detalleHomenaje}`}</span> : <span className="text-muted"> (sin mensaje)</span>}</p>
                                    </div>
                                )}
                            </div>
                            <div className="row g-3 mt-3">
                                <div className="col-md-7">
                                    <label className="form-label-custom">Método de pago</label>
                                    <div className="payment-method" id="metodo-pago-fijo">Tarjeta de Crédito / Débito</div>
                                </div>
                                <div className="col-md-5">
                                    <label className="form-label-custom">Monto Donación</label>
                                    <div id="confirmar-monto" className="payment-method" data-testid="confirmar-monto">{formatCurrency(montoSeleccionado)}</div>
                                </div>
                            </div>
                            <div>
                                <p></p>
                                <button id="boton-confirmar-pago" onClick={confirmarPago} className="btn btn-custom-primary mt-4" data-testid="btn-confirmar-pago">Confirmar y Pagar</button>
                                <button id="boton-volver" onClick={() => setPantalla("formulario")} className="btn btn-secondary mt-2 w-100" data-testid="btn-volver-formulario">Volver y corregir</button>
                            </div>
                        </div>
                    </section>
                )}

                {pantalla === "redirigiendo" && (
                    <section id="card-redirigiendo-donacion" className="card-base card-contenido text-center" data-testid="pantalla-redirigiendo">
                        <div className="card-donacion">
                            <div className="logoFormulario">
                                <img src={Logo} alt="SAFE Rescue Logo" width="70" height="70" className="d-inline-block align-text-top"/>
                            </div>
                            <h2 className="card-title-custom">¡Gracias <span id="nombre-agradecimiento" data-testid="nombre-agradecimiento">{confirmarNombre}</span> por apoyar a nuestros bomberos!</h2>
                            <br />
                            <div className="loading-spinner"></div>
                            <br />
                            <p className="card-subtitle-custom">Tu generosidad marca la diferencia. Estamos procesando tu donación de forma segura.</p>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default Donar;