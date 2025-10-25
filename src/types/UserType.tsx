import React from "react";

// ===========================================================
// 1. ESTRUCTURAS DE DATOS BASE
// ===========================================================

/**
 * Campos base (comunes) para la identidad de un usuario o contacto.
 */
interface BaseFields {
    nombre: string;
    email: string;
    telefono: string;
    direccion: string;
}

/**
 * Define la estructura completa de un usuario que se registrará.
 * Incluye campos necesarios para el almacenamiento y autenticación.
 */
export interface UserType extends BaseFields {
    rut: string;
    nombreUsuario: string;
    contrasena: string;
    profileImage?: string; // Atributo opcional para la imagen de perfil
}

/**
 * Define la estructura de los datos del usuario logueado o de perfil (sin contraseña).
 * Es la estructura "segura" que se pasa en la aplicación.
 */
export type UserData = Omit<UserType, 'contrasena'>;

/**
 * Estructura para el formulario de contacto.
 * Incluye los campos base más el mensaje.
 */
export interface ContactData extends BaseFields {
    mensaje: string;
}

// ===========================================================
// 2. ESTRUCTURA DE AUTENTICACIÓN Y CONTEXTO
// ===========================================================

/**
 * Define la estructura del contexto de autenticación.
 * 💡 Optimizado: Utiliza 'UserData' para la data del usuario logueado.
 */
export type AuthContextType = {
    isLoggedIn: boolean;
    userName: string;
    profileImage: string | undefined;
    authData: UserData | null; // El objeto UserData completo
    login: (userData: UserData) => void;
    logout: () => void;
    loading: boolean;
    checkAuthStatus: () => void;
};

/**
 * Propiedades (Props) para el componente Dropdown/Auth (componente visual).
 * 💡 Optimizado: Simplificado el tipo de 'profileImage' ya que está en 'UserData'.
 */
export interface AuthProps {
    isLoggedIn: boolean;
    userName: string;
    profileImage?: string;
    onLogin: (userData: UserData) => void; 
    onLogout: () => void;
}

// ===========================================================
// 3. ESTRUCTURAS DE FORMULARIO Y ERRORES
// ===========================================================

/**
 * Extiende la estructura de UserType con campos temporales 
 * necesarios solo para la validación y el estado del formulario de registro.
 */
export interface FormDataType extends UserType {
    confirmarContrasena: string;
    terminos: boolean;
}

/**
 * Define la estructura para almacenar los mensajes de error del formulario.
 * 💡 Optimizado: Usamos Partial<FormDataType & ContactData> para cubrir todos los campos
 * que podrían tener errores en ambos formularios, más los campos extra.
 * ⭐ AJUSTE CLAVE: Se añade 'detalleHomenaje' para el formulario de donación.
 */
export type Errors = Partial<FormDataType & ContactData> & {
    general?: string;
    // ⭐ CAMPO AÑADIDO: Para manejar el error en el campo de texto del homenaje.
    detalleHomenaje?: string; 
};

/**
 * Propiedades (Props) base para un componente de campo de formulario genérico (FormField).
 */
export interface InputFieldProps {
    // ID puede ser cualquier clave de los dos formularios que maneja el campo genérico
    // ⭐ AJUSTE: Se incluye 'detalleHomenaje' como posible ID.
    id: keyof FormDataType | keyof ContactData | 'detalleHomenaje'; 
    label: string;
    placeholder: string;
    type?: 'text' | 'email' | 'tel' | 'password' | 'rut' | 'checkbox';
    value: string | boolean; 
    
    // ⭐ AJUSTE CLAVE: Permite manejar eventos de HTMLInputElement y HTMLTextAreaElement
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    
    error?: string | null;
    required?: boolean;
    dataTestId?: string;
    disabled?: boolean;
    
    // ⭐ NUEVA PROPIEDAD: Permite al FormField saber si debe renderizar un <textarea>
    isTextArea?: boolean; 
}

/**
 * Propiedades (Props) para campos de formulario que tienen lógica de formato especializada.
 */
export interface SpecializedFieldProps {
    value: string;
    // ⭐ AJUSTE CLAVE: Permite manejar eventos de HTMLInputElement y HTMLTextAreaElement
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    error: string | null | undefined;
    disabled?: boolean;
    dataTestId?: string;
}

export interface MontoButtonProps {
    value: number;
    onClick: (value: number) => void;
    active: boolean;
}