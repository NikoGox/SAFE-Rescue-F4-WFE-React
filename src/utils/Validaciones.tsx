export const validateChileanRUT = (rut: string): string | null => {
  const cleanedRut = rut.replace(/[^0-9kK]/g, "").toUpperCase(); // Si está vacío, no lo consideramos un error de formato/matemática. // El campo de registro se encarga de que sea obligatorio.
  if (cleanedRut.length === 0) {
    return null;
  } // Regla 2: Largo mínimo (para que tenga cuerpo y DV) // Si tiene valor, debe tener al menos 8 caracteres para intentar la validación completa.

  if (cleanedRut.length < 8) {
    return "El RUT debe tener al menos 7 u 8 dígitos (cuerpo + DV)";
  }

  const body = cleanedRut.slice(0, -1);
  const digit = cleanedRut.slice(-1); // Regla 3: El cuerpo debe ser solo números

  if (!/^\d+$/.test(body)) {
    return "El cuerpo del RUT solo debe contener números";
  } // Regla 4: Validación matemática (Módulo 11)

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

  return null; // OK
};

/**
 * Formatea un RUT, añadiendo puntos y guión.
 */
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
// II. Validadores de Teléfono
// -----------------------------------------------------------------

/**
 * Limpia una cadena de teléfono, dejando solo dígitos.
 */
export const cleanPhoneNumber = (phone: string): string => {
  return phone.replace(/[^\d]/g, "");
};

/**
 * Valida que el teléfono tenga solo dígitos y una longitud razonable (8-15 dígitos).
 */
export const validatePhoneNumber = (phone: string): string | null => {
  const cleanedPhone = cleanPhoneNumber(phone); // Regla 1: Obligatorio

  if (cleanedPhone.length === 0) {
    return "El teléfono es obligatorio";
  } // Regla 2: Longitud razonable
  if (cleanedPhone.length < 8 || cleanedPhone.length > 15) {
    return "Debe tener entre 8 y 15 dígitos";
  }
  return null; // OK
};

/**
 * Formatea un número de teléfono (ej: 9 8765 4321).
 */
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
// III. Validador de Email
// -----------------------------------------------------------------

/**
 * Valida el formato y obligatoriedad del email. Retorna mensaje de error o null.
 */
export const validateEmail = (email: string): string | null => {
  // Regla 1: Obligatorio
  if (email.trim().length === 0) {
    return "El email es obligatorio";
  } // Regla 2: Formato de email
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return "Formato de email inválido";
  }
  return null; // OK
};

// -----------------------------------------------------------------
// IV. Validadores de Texto/Contraseña/Otros
// -----------------------------------------------------------------

/**
 * Valida que un campo no esté vacío o sea solo espacios.
 */
export const validateIsRequired = (
  value: string,
  fieldName: string = "Campo"
): string | null => {
  if (value.trim().length === 0) {
    return `${fieldName} es obligatorio`;
  }
  return null;
};

/**
 * Valida que el nombre contenga solo letras, espacios y tildes/ñ.
 */
export const validateNameLettersOnly = (name: string): string | null => {
  if (name.trim().length === 0) {
    return "El nombre es obligatorio";
  } // Permite letras (mayúsculas/minúsculas), espacios, y tildes/ñ
  const regex = /^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]+$/;
  if (!regex.test(name)) {
    return "Solo letras y espacios (se permiten tildes)";
  }
  return null;
};

/**
 * Valida el campo de mensaje: Obligatorio y con una longitud mínima de 20 caracteres.
 */
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

/**
 * Valida la seguridad de la contraseña: Mín. 8 caracteres, mayúscula, minúscula, número y símbolo, sin espacios.
 */
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
  } // Busca cualquier cosa que NO sea letra o número
  if (!/[^A-Za-z0-9]/.test(pass)) {
    return "Debe incluir al menos un símbolo";
  }
  if (pass.includes(" ")) {
    return "No debe contener espacios";
  }
  return null;
};

/**
 * Valida que el campo de confirmación coincida con la contraseña original.
 */
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

/**
 * Valida que la URL no esté vacía y tenga un formato válido (simple).
 */
export const validateUrl = (url: string): string | null => {
  if (url.length === 0) {
    return "La URL es obligatoria";
  } // RegEx simple que requiere http(s)://
  const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
  if (!urlRegex.test(url)) {
    return "Formato de URL inválido (ej: https://dominio.cl)";
  }
  return null;
};

/**
 * Valida que la fecha tenga el formato YYYY-MM-DD.
 */
export const validateDate = (date: string): string | null => {
  if (date.length === 0) {
    return "La fecha es obligatoria";
  } // Regex para validar formato YYYY-MM-DD
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(date)) {
    return "Formato de fecha inválido (debe ser YYYY-MM-DD)";
  } // Nota: Para una validación estricta de fechas (ej: evitar 2025-13-40), // se recomienda usar la librería Date o una librería como date-fns/moment.
  return null;
};
