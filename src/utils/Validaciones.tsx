import type { 
  UserRegistroFormType,
  TipoUsuario,
  Compania,
  EquipoRequest,
  UserUpdateRequest
} from '../types/PerfilesType';

import type { 
  IncidenteCreationDTO,
} from '../types/IncidenteType';

import type { 
  DonacionCreationFrontendDTO
} from '../types/DonacionesType';

// -----------------------------------------------------------------
// I. Validadores de RUT (MANTENIDOS - ya están excelentes)
// -----------------------------------------------------------------

export const validateChileanRUT = (rut: string): string | null => {
  const cleanedRut = rut.replace(/[^0-9kK]/g, "").toUpperCase();
  if (cleanedRut.length === 0) {
    return null;
  }

  if (cleanedRut.length < 8) {
    return "El RUT debe tener al menos 7 u 8 dígitos (cuerpo + DV)";
  }

  const body = cleanedRut.slice(0, -1);
  const digit = cleanedRut.slice(-1);

  if (!/^\d+$/.test(body)) {
    return "El cuerpo del RUT solo debe contener números";
  }

  let sum = 0;
  let multiplier = 2;

  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body.charAt(i), 10) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const calculatedDigit = 11 - (sum % 11);
  let expectedDigit;

  if (calculatedDigit === 11) {
    expectedDigit = "0";
  } else if (calculatedDigit === 10) {
    expectedDigit = "K";
  } else {
    expectedDigit = calculatedDigit.toString();
  }

  if (expectedDigit !== digit) {
    return "El RUT o dígito verificador es incorrecto";
  }

  return null;
};

export const formatRut = (rut: string): string => {
  const cleanRut = rut.replace(/[^0-9kK]/g, "").toUpperCase();
  if (cleanRut.length <= 1) return cleanRut;
  const body = cleanRut.slice(0, -1);
  const digit = cleanRut.slice(-1);
  let bodyFormatted = "";
  for (let j = body.length - 1, counter = 0; j >= 0; j--, counter++) {
    bodyFormatted = body.charAt(j) + bodyFormatted;
    if (counter % 3 === 2 && j > 0) {
      bodyFormatted = "." + bodyFormatted;
    }
  }
  return bodyFormatted + (digit ? "-" + digit : "");
};

// -----------------------------------------------------------------
// II. Validadores de Teléfono (MANTENIDOS)
// -----------------------------------------------------------------

export const cleanPhoneNumber = (phone: string): string => {
  return phone.replace(/[^\d]/g, "");
};

export const validatePhoneNumber = (phone: string): string | null => {
  const cleanedPhone = cleanPhoneNumber(phone);
  if (cleanedPhone.length === 0) {
    return "El teléfono es obligatorio";
  }
  if (cleanedPhone.length < 8 || cleanedPhone.length > 15) {
    return "Debe tener entre 8 y 15 dígitos";
  }
  return null;
};

export const formatPhoneNumber = (value: string): string => {
  const cleanValue = cleanPhoneNumber(value);
  const limit = 9;
  let formattedValue = cleanValue.substring(0, limit);

  if (formattedValue.length > 5) {
    formattedValue = formattedValue.replace(
      /^(\d)(\d{4})(\d{0,4})$/,
      "$1 $2 $3"
    );
  } else if (formattedValue.length > 1) {
    formattedValue = formattedValue.replace(/^(\d)(\d{0,4})$/, "$1 $2");
  }

  return formattedValue.trim();
};

// -----------------------------------------------------------------
// III. Validador de Email (MANTENIDO)
// -----------------------------------------------------------------

export const validateEmail = (email: string): string | null => {
  if (email.trim().length === 0) {
    return "El email es obligatorio";
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return "Formato de email inválido";
  }
  return null;
};

// -----------------------------------------------------------------
// IV. Validadores de Texto/Contraseña/Otros (MANTENIDOS)
// -----------------------------------------------------------------

export const validateIsRequired = (
  value: string,
  fieldName: string = "Campo"
): string | null => {
  if (value.trim().length === 0) {
    return `${fieldName} es obligatorio`;
  }
  return null;
};

export const validateNameLettersOnly = (name: string): string | null => {
  if (name.trim().length === 0) {
    return "El nombre es obligatorio";
  }
  const regex = /^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]+$/;
  if (!regex.test(name)) {
    return "Solo letras y espacios (se permiten tildes)";
  }
  return null;
};

export const validateMessage = (message: string): string | null => {
  const minLength = 20;
  const cleanedMessage = message.trim();

  if (cleanedMessage.length === 0) {
    return "El mensaje es obligatorio";
  }

  if (cleanedMessage.length < minLength) {
    return `El mensaje debe tener al menos ${minLength} caracteres`;
  }

  return null;
};

export const validateStrongPassword = (pass: string): string | null => {
  if (pass.length === 0) {
    return "La contraseña es obligatoria";
  }
  if (pass.length < 8) {
    return "Mínimo 8 caracteres";
  }
  if (!/[A-Z]/.test(pass)) {
    return "Debe incluir al menos una mayúscula";
  }
  if (!/[a-z]/.test(pass)) {
    return "Debe incluir al menos una minúscula";
  }
  if (!/\d/.test(pass)) {
    return "Debe incluir al menos un número";
  }
  if (!/[^A-Za-z0-9]/.test(pass)) {
    return "Debe incluir al menos un símbolo";
  }
  if (pass.includes(" ")) {
    return "No debe contener espacios";
  }
  return null;
};

export const validateConfirmPassword = (
  pass: string,
  confirm: string
): string | null => {
  if (confirm.length === 0) {
    return "Confirma tu contraseña";
  }
  if (pass !== confirm) {
    return "Las contraseñas no coinciden";
  }
  return null;
};

export const validateUrl = (url: string): string | null => {
  if (url.length === 0) {
    return "La URL es obligatoria";
  }
  const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
  if (!urlRegex.test(url)) {
    return "Formato de URL inválido (ej: https://dominio.cl)";
  }
  return null;
};

export const validateDate = (date: string): string | null => {
  if (date.length === 0) {
    return "La fecha es obligatoria";
  }
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(date)) {
    return "Formato de fecha inválido (debe ser YYYY-MM-DD)";
  }
  return null;
};

// =================================================================
// V. VALIDACIONES ESPECÍFICAS DEL BACKEND (NUEVAS)
// =================================================================

// -----------------------------------------------------------------
// Validaciones de Usuario/Registro
// -----------------------------------------------------------------

/**
 * Valida todos los campos del formulario de registro
 */
export const validarRegistroCompleto = (datos: UserRegistroFormType): string[] => {
  const errores: string[] = [];

  // RUT
  const errorRUT = validateChileanRUT(datos.rutCompleto);
  if (errorRUT) errores.push(`RUT: ${errorRUT}`);

  // Nombres
  const errorNombre = validateNameLettersOnly(datos.nombre);
  if (errorNombre) errores.push(`Nombre: ${errorNombre}`);

  const errorAPaterno = validateNameLettersOnly(datos.aPaterno);
  if (errorAPaterno) errores.push(`Apellido paterno: ${errorAPaterno}`);

  const errorAMaterno = validateNameLettersOnly(datos.aMaterno);
  if (errorAMaterno) errores.push(`Apellido materno: ${errorAMaterno}`);

  // Email
  const errorEmail = validateEmail(datos.correo);
  if (errorEmail) errores.push(`Email: ${errorEmail}`);

  // Teléfono
  const errorTelefono = validatePhoneNumber(datos.telefono);
  if (errorTelefono) errores.push(`Teléfono: ${errorTelefono}`);

  // Contraseñas
  const errorPassword = validateStrongPassword(datos.contrasena);
  if (errorPassword) errores.push(`Contraseña: ${errorPassword}`);

  const errorConfirm = validateConfirmPassword(datos.contrasena, datos.confirmarContrasena);
  if (errorConfirm) errores.push(`Confirmación: ${errorConfirm}`);

  // Dirección
  if (!datos.idDireccion || datos.idDireccion <= 0) {
    errores.push('Debe seleccionar una dirección válida');
  }

  // Términos
  if (!datos.terminos) {
    errores.push('Debe aceptar los términos y condiciones');
  }

  return errores;
};

// -----------------------------------------------------------------
// Validaciones de Incidentes
// -----------------------------------------------------------------

/**
 * Valida los datos para crear un incidente
 */
export const validarIncidente = (datos: IncidenteCreationDTO): string[] => {
  const errores: string[] = [];

  if (!datos.titulo || datos.titulo.trim().length < 5) {
    errores.push('El título debe tener al menos 5 caracteres');
  }

  if (!datos.detalle || datos.detalle.trim().length < 10) {
    errores.push('El detalle debe tener al menos 10 caracteres');
  }

  if (!datos.tipoIncidenteId || datos.tipoIncidenteId <= 0) {
    errores.push('Debe seleccionar un tipo de incidente válido');
  }

  if (!datos.idDireccion || datos.idDireccion <= 0) {
    errores.push('Debe seleccionar una dirección válida');
  }

  if (!datos.idCiudadano || datos.idCiudadano <= 0) {
    errores.push('ID de ciudadano no válido');
  }

  return errores;
};

// -----------------------------------------------------------------
// Validaciones de Donaciones
// -----------------------------------------------------------------

/**
 * Valida los datos para crear una donación
 */
export const validarDonacion = (datos: DonacionCreationFrontendDTO): string[] => {
  const errores: string[] = [];

  if (!datos.idDonante || datos.idDonante <= 0) {
    errores.push('ID de donante no válido');
  }

  if (!Number.isInteger(datos.monto) || datos.monto <= 0) {
    errores.push('El monto debe ser un número entero positivo');
  }

  if (datos.monto < 1000) {
    errores.push('El monto mínimo de donación es $1.000');
  }

  if (datos.monto > 1000000) {
    errores.push('El monto máximo de donación es $1.000.000');
  }

  const metodosValidos = ['TARJETA_CREDITO', 'PAYPAL', 'TRANSFERENCIA'];
  if (!metodosValidos.includes(datos.metodoPago)) {
    errores.push('Método de pago no válido');
  }

  return errores;
};

// -----------------------------------------------------------------
// Validaciones de Entidades del Sistema
// -----------------------------------------------------------------

/**
 * Valida un TipoUsuario
 */
export const validarTipoUsuario = (tipoUsuario: TipoUsuario): string[] => {
  const errores: string[] = [];

  if (!tipoUsuario.nombre || tipoUsuario.nombre.trim().length === 0) {
    errores.push('El nombre del tipo de usuario es requerido');
  }

  if (tipoUsuario.nombre && tipoUsuario.nombre.length > 50) {
    errores.push('El nombre no puede exceder los 50 caracteres');
  }

  return errores;
};

/**
 * Valida una Compañía
 */
export const validarCompania = (compania: Compania): string[] => {
  const errores: string[] = [];

  if (!compania.nombre || compania.nombre.trim().length === 0) {
    errores.push('El nombre de la compañía es requerido');
  }

  if (!compania.idDireccion || compania.idDireccion <= 0) {
    errores.push('Debe asignar una dirección válida a la compañía');
  }

  return errores;
};

/**
 * Valida un Equipo
 */
export const validarEquipo = (equipo: EquipoRequest): string[] => {
  const errores: string[] = [];

  if (!equipo.nombre || equipo.nombre.trim().length === 0) {
    errores.push('El nombre del equipo es requerido');
  }

  if (!equipo.compania || !equipo.compania.idCompania) {
    errores.push('Debe seleccionar una compañía válida');
  }

  if (!equipo.tipoEquipo || !equipo.tipoEquipo.idTipoEquipo) {
    errores.push('Debe seleccionar un tipo de equipo válido');
  }

  if (!equipo.idEstado || equipo.idEstado <= 0) {
    errores.push('Debe asignar un estado válido al equipo');
  }

  return errores;
};

// -----------------------------------------------------------------
// Validaciones de Actualización de Usuario
// -----------------------------------------------------------------

/**
 * Valida datos para actualizar usuario
 */
export const validarActualizacionUsuario = (datos: UserUpdateRequest): string[] => {
  const errores: string[] = [];

  if (datos.nombre && !validateNameLettersOnly(datos.nombre)) {
    errores.push('Nombre: Solo letras y espacios (se permiten tildes)');
  }

  if (datos.aPaterno && !validateNameLettersOnly(datos.aPaterno)) {
    errores.push('Apellido paterno: Solo letras y espacios');
  }

  if (datos.aMaterno && !validateNameLettersOnly(datos.aMaterno)) {
    errores.push('Apellido materno: Solo letras y espacios');
  }

  if (datos.correo && validateEmail(datos.correo)) {
    errores.push('Email: Formato inválido');
  }

  if (datos.telefono && validatePhoneNumber(datos.telefono)) {
    errores.push('Teléfono: Formato inválido');
  }

  if (datos.nuevaContrasena && validateStrongPassword(datos.nuevaContrasena)) {
    errores.push('Nueva contraseña: No cumple con los requisitos de seguridad');
  }

  return errores;
};

// -----------------------------------------------------------------
// Utilidades de Validación
// -----------------------------------------------------------------

/**
 * Convierte un array de errores en un mensaje legible
 */
export const formatearErrores = (errores: string[]): string => {
  if (errores.length === 0) return '';
  if (errores.length === 1) return errores[0];
  return `Se encontraron ${errores.length} errores:\n• ${errores.join('\n• ')}`;
};

/**
 * Valida si un ID es válido (positivo y entero)
 */
export const validarId = (id: number): boolean => {
  return Number.isInteger(id) && id > 0;
};

/**
 * Valida un monto chileno (entero positivo)
 */
export const validarMontoChileno = (monto: number): boolean => {
  return Number.isInteger(monto) && monto > 0;
};

// Exportar todo como objeto para fácil importación
export const Validaciones = {
  // Mantenidas
  validateChileanRUT,
  formatRut,
  cleanPhoneNumber,
  validatePhoneNumber,
  formatPhoneNumber,
  validateEmail,
  validateIsRequired,
  validateNameLettersOnly,
  validateMessage,
  validateStrongPassword,
  validateConfirmPassword,
  validateUrl,
  validateDate,
  
  // Nuevas específicas del backend
  validarRegistroCompleto,
  validarIncidente,
  validarDonacion,
  validarTipoUsuario,
  validarCompania,
  validarEquipo,
  validarActualizacionUsuario,
  formatearErrores,
  validarId,
  validarMontoChileno
};

export default Validaciones;