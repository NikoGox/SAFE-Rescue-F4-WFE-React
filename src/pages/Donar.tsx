import React, { useMemo, useRef, useState } from "react";
import "./Donar.css";

type Pantalla = "monto" | "formulario" | "confirmacion" | "redirigiendo";

const formatCurrency = (value: number) => `$${new Intl.NumberFormat("es-CL").format(value)}`;

const Donar: React.FC = () => {
    const [pantalla, setPantalla] = useState<Pantalla>("monto");

    // Estado del formulario
    const [montoSeleccionado, setMontoSeleccionado] = useState<number>(0);
    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [email, setEmail] = useState("");
    const [telefono, setTelefono] = useState("");
    const [homenaje, setHomenaje] = useState(false);
    const [tipoHomenaje, setTipoHomenaje] = useState("En honor a...");
    const [detalleHomenaje, setDetalleHomenaje] = useState("");
    const [detalleHomenajeError, setDetalleHomenajeError] = useState("");

    // Validaciones
        const [telefonoError, setTelefonoError] = useState("");
        const [emailError, setEmailError] = useState("");
    const [formValidated, setFormValidated] = useState(false);

    // Datos para confirmar
    const confirmarNombre = useMemo(() => `${nombre} ${apellido}`.trim(), [nombre, apellido]);

        /* El timeout de redirección se maneja en confirmarPago() para evitar duplicados */

    function limpiarFormulario() {
        setNombre("");
        setApellido("");
        setEmail("");
        setTelefono("");
        setHomenaje(false);
        setTipoHomenaje("En honor a...");
        setDetalleHomenaje("");
        setTelefonoError("");
        setDetalleHomenajeError("");
        if (emailRef.current) emailRef.current.setCustomValidity("");
        if (detalleRef.current) detalleRef.current.setCustomValidity("");
        setFormValidated(false);
    }

    function seleccionarMonto(monto: number) {
        setMontoSeleccionado(monto);
            setFormValidated(false);
            setEmailError("");
            setTelefonoError("");
            if (emailRef.current) emailRef.current.setCustomValidity("");
            setPantalla("formulario");
    }

    function handleOtroMonto() {
        const valor = prompt("Por favor, ingresa el monto que deseas donar:", "25000");
        if (!valor) return;
        const n = parseInt(valor.replace(/\./g, "").trim(), 10);
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

        const formRef = useRef<HTMLFormElement | null>(null);
        const telefonoRef = useRef<HTMLInputElement | null>(null);
        const emailRef = useRef<HTMLInputElement | null>(null);
        const detalleRef = useRef<HTMLInputElement | null>(null);

        function onSubmitFormulario(e?: React.FormEvent) {
            e?.preventDefault();
            setTelefonoError("");
            setEmailError("");

            const telefonoCrudo = telefono.replace(/\s/g, "");

            // Reset native validity
            if (telefonoRef.current) telefonoRef.current.setCustomValidity("");

            if (telefonoCrudo.length > 0 && telefonoCrudo.length !== 9) {
                setTelefonoError("El número de teléfono debe tener 9 dígitos.");
                if (telefonoRef.current) telefonoRef.current.setCustomValidity("El número de teléfono debe tener 9 dígitos.");
            }

            // Email validation: set custom validity to force native check to fail when invalid
            const emailPattern = /^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$/i;
            if (!emailPattern.test(email)) {
                setEmailError('Correo electrónico inválido.');
                if (emailRef.current) emailRef.current.setCustomValidity('Correo electrónico inválido.');
            } else {
                if (emailRef.current) emailRef.current.setCustomValidity('');
            }

            // Validación del detalle del homenaje: obligatorio entre 10 y 200 caracteres cuando homenaje está activo
            if (homenaje) {
                const len = detalleHomenaje.trim().length;
                if (len < 10 || len > 200) {
                    const msg = 'El detalle del homenaje debe tener entre 10 y 200 caracteres.';
                    setDetalleHomenajeError(msg);
                    if (detalleRef.current) detalleRef.current.setCustomValidity(msg);
                } else {
                    setDetalleHomenajeError("");
                    if (detalleRef.current) detalleRef.current.setCustomValidity("");
                }
            } else {
                setDetalleHomenajeError("");
                if (detalleRef.current) detalleRef.current.setCustomValidity("");
            }

            // Use native constraint validation to determine overall form validity
            const formularioEsValido = formRef.current ? formRef.current.checkValidity() : false;
            setFormValidated(true);
            if (!formularioEsValido) return;

            // All good
            setPantalla("confirmacion");
        }

    function confirmarPago() {
        setPantalla("redirigiendo");
        // Simular procesamiento y luego volver a inicio
        setTimeout(() => {
            alert("¡Donación procesada con éxito! (Simulación). Muchas gracias por tu apoyo.");
            // Reiniciar a pantalla inicial
            setPantalla("monto");
            limpiarFormulario();
        }, 4000);
    }

    return (
        <div className="donar-page container py-4">
            {pantalla === "monto" && (
                <section id="card-monto-donacion" className="card-base card-contenido">
                    <div className="card-donacion">
                        <h2 className="card-title-custom">APORTA AHORA</h2>
                        <p className="card-subtitle-custom">Cada donación nos ayuda a seguir salvando vidas. <br />¡Gracias por tu apoyo a nuestros bomberos!</p>
                        <div className="monto-grid">
                                            {[5000,10000,20000,50000,100000].map(v => (
                                                <button key={v} className={`monto-btn ${montoSeleccionado===v? 'active':''}`} onClick={() => seleccionarMonto(v)}>{formatCurrency(v)}</button>
                                            ))}
                            <button className="monto-btn" onClick={handleOtroMonto}>Otro monto</button>
                        </div>
                    </div>
                </section>
            )}

            {pantalla === "formulario" && (
                <section id="card-monto-formulario" className="card-base card-contenido">
                    <div className="card-donacion">
                        <h2 className="card-title-custom">Completa tus datos</h2>
                        <p className="card-subtitle-custom">Estás donando <strong id="monto-mostrado">{formatCurrency(montoSeleccionado)}</strong>. ¡Muchas gracias!</p>
                        <form ref={formRef} id="formulario-donacion" noValidate onSubmit={onSubmitFormulario} className={formValidated? 'was-validated': ''}>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label htmlFor="nombre" className="form-label-custom">Nombre <span className="text-danger">*</span></label>
                                    <input value={nombre} onChange={e => setNombre(e.target.value)} type="text" className={`form-control form-control-custom ${formValidated && !nombre? 'is-invalid':''}`} id="nombre" placeholder="Ej: Juan" required />
                                </div>
                                <div className="col-md-6">
                                    <label htmlFor="apellido" className="form-label-custom">Apellido <span className="text-danger">*</span></label>
                                    <input value={apellido} onChange={e => setApellido(e.target.value)} type="text" className={`form-control form-control-custom ${formValidated && !apellido? 'is-invalid':''}`} id="apellido" placeholder="Ej: López" required />
                                </div>
                                                <div className="col-12">
                                    <label htmlFor="email" className="form-label-custom">Correo electrónico <span className="text-danger">*</span></label>
                                                    <input ref={emailRef} value={email} onChange={e => setEmail(e.target.value)} type="email" className={`form-control form-control-custom ${((formValidated && !email) || emailError)? 'is-invalid':''}`} id="email" placeholder="ejemplo@dominio.cl" required />
                                                    {emailError && <div className="invalid-feedback">{emailError}</div>}
                                </div>
                                <div className="col-12">
                                    <label htmlFor="telefono" className="form-label-custom">Número de teléfono</label>
                                    <input ref={telefonoRef} value={telefono} onChange={e => setTelefono(formatearTelefono(e.target.value))} type="tel" className={`form-control form-control-custom ${telefonoError? 'is-invalid': (telefono && telefono.length>0? 'is-valid':'')}`} id="telefono" placeholder="Ej: 9 1234 5678" />
                                    {telefonoError && <div className="invalid-feedback" id="telefono-error">{telefonoError}</div>}
                                </div>
                                <div className="col-12">
                                    <small className="d-block text-start mt-2 mb-3 text-muted">Los campos con (*) son obligatorios.</small>
                                </div>
                                <div className="col-12">
                                    <div className="form-check d-flex align-items-center gap-2">
                                        <input checked={homenaje} onChange={e => setHomenaje(e.target.checked)} className="form-check-input" type="checkbox" id="checkbox-homenaje" />
                                        <label className="form-check-label mb-0" htmlFor="checkbox-homenaje">Quiero hacer un homenaje especial con mi donación</label>
                                    </div>
                                </div>

                                {/* Detalles del homenaje: solo visibles cuando el checkbox está marcado */}
                                <div className={`col-12 ${homenaje ? 'show' : 'collapsed'}`} id="detalles-homenaje">
                                    <div className="mb-2"><strong>Tipo de homenaje</strong></div>
                                    <div className="row g-2 align-items-center">
                                        <div className="col-md-5">
                                            <label htmlFor="tipo-homenaje" className="form-label-custom">&nbsp;</label>
                                            <select value={tipoHomenaje} onChange={e => setTipoHomenaje(e.target.value)} id="tipo-homenaje" className="form-select form-control-custom" disabled={!homenaje}>
                                                <option>En honor a...</option>
                                                <option>Una mención por...</option>
                                                <option>Muchas gracias a...</option>
                                                <option>Recordando a...</option>
                                            </select>
                                        </div>
                                        <div className="col-md-7">
                                            <label htmlFor="detalle-homenaje" className="form-label-custom">Detalle del homenaje</label>
                                            <input ref={detalleRef} value={detalleHomenaje} onChange={e => { setDetalleHomenaje(e.target.value); if (detalleHomenajeError) setDetalleHomenajeError(''); if (detalleRef.current) detalleRef.current.setCustomValidity(''); }} type="text" id="detalle-homenaje" className={`form-control form-control-custom ${detalleHomenajeError ? 'is-invalid' : ''}`} placeholder="Ej: En memoria de..." disabled={!homenaje} required={homenaje} />
                                            {detalleHomenajeError && <div className="invalid-feedback">{detalleHomenajeError}</div>}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-7 mt-3">
                                    <label className="form-label-custom">Método de pago</label>
                                    <div className="payment-method" id="metodo-pago-fijo">Tarjeta de Crédito / Débito</div>
                                </div>
                                                <div className="col-md-5 mt-3">
                                    <label className="form-label-custom">Monto Donación</label>
                                                    <div id="monto-formulario" className="payment-method" onClick={() => setPantalla('monto')}>{formatCurrency(montoSeleccionado)}</div>
                                </div>
                                <div className="col-12">
                                    <small className="d-block text-center mt-2 text-muted">Serás redirigido a una plataforma de pago segura.</small>
                                </div>
                            </div>
                            <button type="submit" id="btn-continuar-donacion" className="btn btn-custom-primary mt-4">Continuar</button>
                        </form>
                    </div>
                </section>
            )}

            {pantalla === "confirmacion" && (
                <section id="card-confirmar-donacion" className="card-base card-contenido">
                    <div className="card-donacion">
                        <h2 className="card-title-custom">Confirma tu donación</h2>
                        <p className="card-subtitle-custom">Por favor, revisa que tus datos sean correctos antes de continuar.</p>
                        <div className="confirm-details">
                            <p><strong>Nombre:</strong> <span id="confirmar-nombre">{confirmarNombre}</span></p>
                            <p><strong>Correo:</strong> <span id="confirmar-email">{email}</span></p>
                            {telefono && (
                                <div id="confirmar-telefono-contenedor"><p><strong>Teléfono:</strong> <span id="confirmar-telefono">{telefono}</span></p></div>
                            )}
                            {homenaje && (
                                <div id="confirmar-homenaje-contenedor">
                                    <p id="confirmar-homenaje"><strong>Homenaje:</strong> <span className="fw-semibold">{tipoHomenaje}</span>{detalleHomenaje ? <span>{` ${detalleHomenaje}`}</span> : <span className="text-muted"> (sin mensaje)</span>}</p>
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
                                <div id="confirmar-monto" className="payment-method">{formatCurrency(montoSeleccionado)}</div>
                            </div>
                        </div>
                        <div>
                            <p></p>
                            <button id="boton-confirmar-pago" onClick={confirmarPago} className="btn btn-custom-primary mt-4">Confirmar y Pagar</button>
                            <button id="boton-volver" onClick={() => setPantalla("formulario")} className="btn btn-secondary mt-2 w-100">Volver y corregir</button>
                        </div>
                    </div>
                </section>
            )}

            {pantalla === "redirigiendo" && (
                <section id="card-redirigiendo-donacion" className="card-base card-contenido text-center">
                    <div className="card-donacion">
                        <h2 className="card-title-custom">¡Gracias <span id="nombre-agradecimiento">{nombre}</span> por apoyar a nuestros bomberos!</h2>
                        <p className="card-subtitle-custom">Tu generosidad marca la diferencia. Estamos procesando tu donación de forma segura.</p>
                        <div className="loading-spinner"></div>
                    </div>
                </section>
            )}
        </div>
    );
};

export default Donar;

