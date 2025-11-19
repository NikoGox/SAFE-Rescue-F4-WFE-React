import React from "react";
// Importamos los tipos de Geolocalización que ahora usamos
// NOTA: Asumo que este archivo es PerfilesType.tsx y que GeolocalizacionType.tsx existe.
import { type Direccion, type Region, type Comuna } from "./GeolocalizacionType"; 

// ===========================================================
// 1. ESTRUCTURAS DE DATOS DE ENTIDADES DE PERFIL (Microservicio)
// ===========================================================

/**
 * Define la estructura de una Compañía (Usada en Bombero o simplemente una entidad).
 */
export interface Compania {
    idCompania: number;
    nombre: string;
    rut: string;
    emailContacto: string;
    telefonoContacto: string;
    // ... otros campos
}
export type CompaniaRequest = Omit<Compania, 'idCompania'>;

/**
 * Define la estructura de un Tipo de Equipo.
 */
export interface TipoEquipo {
    idTipoEquipo: number;
    nombre: string;
    descripcion?: string; 
}
export type TipoEquipoRequest = Omit<TipoEquipo, 'idTipoEquipo'>;

/**
 * Define la estructura de un Equipo.
 */
export interface Equipo {
    idEquipo: number;
    nombre: string;
    descripcion?: string;
    idTipoEquipo: number;
    idLider: number;
    miembros: number[];
}
export type EquipoRequest = Omit<Equipo, 'idEquipo'>;

/**
 * Define la estructura de un Tipo de Usuario (Rol).
 */
export interface TipoUsuario {
    idTipoUsuario: number;
    nombre: string;
    descripcion?: string; 
    permisos: string[];
}
export type TipoUsuarioRequest = Omit<TipoUsuario, 'idTipoUsuario'>;


// ===========================================================
// 2. ESTRUCTURAS DE USUARIO Y PERFIL
// ===========================================================

/**
 * Campos base (comunes) para la identidad de un usuario.
 */
interface BaseFields {
    nombre: string;
    email: string;
    telefono: string;
}

/**
 * Interfaz para la Dirección compleja que el microservicio de Perfiles devuelve.
 * Esto anida los tipos de Geolocalización.
 */
export interface PerfilDireccion {
    idDireccion: number;
    calle: string;
    numero: string;
    referencia?: string; 
    comuna: Comuna; // Entidad completa de Comuna
    region: Region; // Entidad completa de Región
}


/**
 * Campos comunes para todos los tipos de perfil (Bombero, Ciudadano).
 */
export interface BaseUsuario extends BaseFields {
    id: number;
    rut: string;
    nombreUsuario: string;
    profileImage?: string;
    // Agrega aquí otros campos que *todos* los usuarios tengan (ej: fechaCreacion)
}

// ------------------------------------------
// TIPOS DE PERFIL ESPECÍFICOS (Uniones Disjuntas)
// ------------------------------------------

// 1. Tipo Ciudadano
export interface CiudadanoData extends BaseUsuario {
    tipoPerfil: 'CIUDADANO'; // Discriminador
    direccion: Direccion; // Usamos el tipo Direccion del archivo GeolocalizacionType
    // NOTA: Si tu API devuelve PerfilDireccion aquí, reemplaza el tipo:
    // direccion: PerfilDireccion; 
}

// 2. Tipo Bombero
export interface BomberoData extends BaseUsuario {
    tipoPerfil: 'BOMBERO'; // Discriminador
    equipo: Equipo; // Entidad completa de Equipo
}

/**
 * ERROR CORREGIDO: Define la estructura de los datos del usuario logueado o de perfil.
 * Usa la unión de los tipos específicos (Ciudadano o Bombero).
 */
export type UserData = CiudadanoData | BomberoData;


/**
 * Define la estructura completa de un usuario que se registrará.
 * Incluye los campos base más los necesarios para la autenticación y dirección simple.
 */
export interface UserRegistroType extends BaseFields {
    rut: string;
    nombreUsuario: string;
    contrasena: string;
    profileImage?: string;
    
    // Campos requeridos en el formulario de registro para procesar la dirección
    calle: string;
    numeroDireccion: string; 
    referenciaDireccion?: string;
    idComuna: number;
}


// ------------------------------------------
// TIPOS DE FORMULARIO Y CONTEXTO
// ------------------------------------------

/**
 * Estructura para el formulario de contacto.
 */
export interface ContactData extends BaseFields {
    mensaje: string;
}

/**
 * Define la estructura del contexto de autenticación.
 */
export type AuthContextType = {
    isLoggedIn: boolean;
    userName: string;
    profileImage: string | undefined;
    authData: UserData | null; // Usa el tipo de unión UserData
    login: (userData: UserData) => void;
    logout: () => void;
    loading: boolean;
    checkAuthStatus: () => void;
};

/**
 * Propiedades (Props) para el componente Dropdown/Auth.
 */
export interface AuthProps {
    isLoggedIn: boolean;
    userName: string;
    profileImage?: string;
    onLogin: (userData: UserData) => void; 
    onLogout: () => void;
}


/**
 * Extiende la estructura de UserRegistroType con campos temporales 
 * para la validación y el estado del formulario de registro.
 */
export interface FormDataType extends UserRegistroType {
    confirmarContrasena: string;
    terminos: boolean;
}

/**
 * Define la estructura para almacenar los mensajes de error del formulario.
 */
export type Errors = Partial<FormDataType & ContactData> & {
    general?: string;
    detalleHomenaje?: string; 
};

/**
 * Propiedades (Props) base para un componente de campo de formulario genérico (FormField).
 */
export interface InputFieldProps {
    id: keyof FormDataType | keyof ContactData | 'detalleHomenaje' | keyof PerfilDireccion; 
    label: string;
    placeholder: string;
    type?: 'text' | 'email' | 'tel' | 'password' | 'rut' | 'checkbox' | 'number';
    value: string | boolean | number;
    
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    
    error?: string | null;
    required?: boolean;
    dataTestId?: string;
    disabled?: boolean;
    isTextArea?: boolean; 
}

/**
 * Propiedades (Props) para campos de formulario que tienen lógica de formato especializada.
 */
export interface SpecializedFieldProps {
    value: string;
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

/**
 * Define el DTO (Data Transfer Object) para actualizar un usuario.
 * * Se basa en la interfaz BaseUsuario, pero omite campos de identidad y 
 * hace opcionales los campos que se pueden modificar (parcial update).
 */
export type UserUpdateRequest = Partial<Omit<BaseUsuario, 
    'id' | 'rut' | 'nombreUsuario' 
>> & {
    contrasenaActual?: string;
    nuevaContrasena?: string;
    direccion?: Partial<PerfilDireccion> | Partial<Direccion>;
    idEstado?: number;
    idCompania?: number; 
};

export interface LoginRequest {
    /**
     * Nombre de usuario (ej: RUN sin guion, o el campo que uses para identificar al usuario).
     */
    nombreUsuario: string; 

    /**
     * Contraseña del usuario.
     */
    contrasena: string;
}