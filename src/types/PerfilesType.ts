import React from "react";
// Importamos los tipos de Geolocalización que ahora usamos
import { type Direccion, type Region, type Comuna } from "./GeolocalizacionType"; 

// ===========================================================
// 1. ESTRUCTURAS DE DATOS DE ENTIDADES DE PERFIL (Microservicio)
// ===========================================================

/**
 * Declaración forward para Bombero (para resolver dependencia circular)
 */
export interface Bombero {}

/**
 * Define la estructura de una Compañía (Usada en Bombero o simplemente una entidad).
 */
export interface Compania {
    idCompania: number;
    nombre: string;
    codigo?: string;                   
    fechaFundacion?: string;            
    idDireccion: number;                
}

export type CompaniaRequest = Omit<Compania, 'idCompania'>;

/**
 * Define la estructura de un Tipo de Equipo.
 */
export interface TipoEquipo {
    idTipoEquipo: number;
    nombre: string;
}

export type TipoEquipoRequest = Omit<TipoEquipo, 'idTipoEquipo'>;

/**
 * Define la estructura de un Equipo.
 */
export interface Equipo {
    idEquipo: number;
    nombre: string;
    compania: Compania;           
    tipoEquipo: TipoEquipo;         
    lider?: Bombero | null;       
    idEstado: number;            
}

export type EquipoRequest = Omit<Equipo, 'idEquipo'>;

/**
 * Define la estructura de un Tipo de Usuario (Rol).
 */
export interface TipoUsuario {
    idTipoUsuario: number;
    nombre: string;
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
    aPaterno: string;
    aMaterno: string;
    correo: string;           
    telefono: string;
}

/**
 * Campos comunes para todos los tipos de perfil (Bombero, Ciudadano).
 */
export interface BaseUsuario extends BaseFields {
    idUsuario: number;        
    run: string;              
    dv: string;               
    nombreUsuario?: string;   
    idFoto?: number;          
    fechaRegistro: string;    
    intentosFallidos: number; 
    idEstado: number;         
    tipoUsuario: TipoUsuario; 
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
    comuna: Comuna;
    region: Region;
}

// ------------------------------------------
// TIPOS DE PERFIL ESPECÍFICOS (Uniones Disjuntas)
// ------------------------------------------

// 1. Tipo Ciudadano
export interface CiudadanoData extends BaseUsuario {
    tipoPerfil: 'CIUDADANO';
    idDireccion: number;
}

// 2. Tipo Bombero
export interface Bombero extends BaseUsuario {
    tipoPerfil: 'BOMBERO';
    equipo: Equipo;
}

/**
 * Define la estructura de los datos del usuario logueado o de perfil.
 * Usa la unión de los tipos específicos (Ciudadano o Bombero).
 */
export type UserData = CiudadanoData | Bombero;

// ===========================================================
// 3. UTILIDADES Y TIPOS PARA RUT
// ===========================================================

/**
 * Tipo para el RUT completo (si lo necesitas en UI)
 */
export interface UsuarioConRutCompleto extends BaseUsuario {
    rutCompleto: string;
}

/**
 * Función utilitaria para formatear RUT
 */
export const formatearRUT = (run: string, dv: string): string => {
    return `${run}-${dv}`;
};

/**
 * Función para parsear RUT completo
 */
export const parsearRUT = (rutCompleto: string): { run: string, dv: string } => {
    const [run, dv] = rutCompleto.split('-');
    return { run, dv };
};

// ===========================================================
// 4. TIPOS DE REGISTRO Y AUTENTICACIÓN
// ===========================================================

/**
 * Define la estructura para el formulario de registro en el frontend.
 */
export interface UserRegistroFormType {
    rutCompleto: string;            
    nombre: string;
    aPaterno: string;
    aMaterno: string;
    correo: string;                 
    telefono: string;
    contrasena: string;
    confirmarContrasena: string;
    idDireccion: number;            
    terminos: boolean;
}

/**
 * DTO para enviar al backend durante el registro.
 */
export interface UserRegistroBackendType {
    run: string;
    dv: string;
    nombre: string;
    aPaterno: string;
    aMaterno: string;
    correo: string;
    telefono: string;
    contrasena: string;
    idDireccion: number;
}

/**
 * Define el DTO para solicitud de login.
 */
export interface LoginRequest {
    correo: string;    
    contrasena: string;
}

/**
 * Define la respuesta de autenticación del backend.
 */
export interface AuthResponseDTO {
    token: string;
    tipoPerfil: 'CIUDADANO' | 'BOMBERO';
    userData: any; // Temporalmente any, se convierte a UserData
}

/**
 * Función para convertir la respuesta de auth a UserData tipado.
 */
export const convertirAUserData = (authResponse: AuthResponseDTO): UserData => {
    if (authResponse.tipoPerfil === 'CIUDADANO') {
        return {
            ...authResponse.userData,
            tipoPerfil: 'CIUDADANO'
        } as CiudadanoData;
    } else {
        return {
            ...authResponse.userData,
            tipoPerfil: 'BOMBERO'
        } as Bombero;
    }
};

// ===========================================================
// 5. TIPOS PARA ACTUALIZACIÓN DE USUARIO
// ===========================================================

/**
 * Define el DTO para actualizar un usuario.
 * Omite campos de identidad y hace opcionales los campos modificables.
 */
export type UserUpdateRequest = Partial<Omit<BaseUsuario, 
    'idUsuario' | 'run' | 'dv' | 'nombreUsuario' | 'fechaRegistro'
>> & {
    contrasenaActual?: string;
    nuevaContrasena?: string;
    idDireccion?: number;
    idEquipo?: number;
};

// ===========================================================
// 6. TIPOS DE FORMULARIO Y CONTEXTO
// ===========================================================

/**
 * Estructura para el formulario de contacto.
 */
export interface ContactData extends BaseFields {
    mensaje: string;
}

/**
 * Extiende la estructura de UserRegistroFormType con campos temporales 
 * para la validación y el estado del formulario de registro.
 */
export interface FormDataType extends UserRegistroFormType {
    // Ya incluye todos los campos de UserRegistroFormType
}

/**
 * Define la estructura para almacenar los mensajes de error del formulario.
 */
export type Errors = Partial<FormDataType & ContactData> & {
    general?: string;
    detalleHomenaje?: string; 
};

// ===========================================================
// 7. TIPOS DE CONTEXTO Y PROPS
// ===========================================================


/**
 * Define la estructura del contexto de autenticación.
 */
export type AuthContextType = {
  isLoggedIn: boolean;
  userName: string;
  profileImage: string | undefined;
  authData: UserData | null;
  loading: boolean;
  error: string | null;
  login: (credentials: { correo: string; contrasena: string }) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => void;
  checkAuthStatus: () => void;
  clearError: () => void;
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

// ===========================================================
// 8. PROPS DE COMPONENTES
// ===========================================================

/**
 * Propiedades (Props) base para un componente de campo de formulario genérico.
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
 * Propiedades (Props) para campos de formulario especializados.
 */
export interface SpecializedFieldProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    error: string | null | undefined;
    disabled?: boolean;
    dataTestId?: string;
}

/**
 * Propiedades para botones de monto.
 */
export interface MontoButtonProps {
    value: number;
    onClick: (value: number) => void;
    active: boolean;
}

// ===========================================================
// 9. ESTRUCTURA DE HISTORIAL DE USUARIO/EQUIPO
// ===========================================================

/**
 * Tipo para discriminar si el historial es para usuario o equipo
 */
export type TipoEntidadHistorial = 'USUARIO' | 'EQUIPO';

/**
 * Interfaz para el historial de cambios de estado de usuarios o equipos
 */
export interface HistorialUsuario {
    idHistorial: number;
    
    // Relaciones con perfiles (solo una debe estar presente)
    usuario?: BaseUsuario | null;
    idUsuario?: number | null;
    equipo?: Equipo | null;
    idEquipo?: number | null;
    
    // Campos de estado
    idEstadoAnterior: number;
    idEstadoNuevo: number;
    
    // Metadatos
    fechaHistorial: string;
    detalle: string;
    
    // Campo discriminador calculado (opcional, para facilidad en frontend)
    tipoEntidad?: TipoEntidadHistorial;
}

/**
 * DTO para crear un nuevo registro de historial
 */
export interface HistorialUsuarioCreationDTO {
    idUsuario?: number | null;
    idEquipo?: number | null;
    idEstadoAnterior: number;
    idEstadoNuevo: number;
    detalle: string;
}

/**
 * Response simplificado para listados de historial
 */
export interface HistorialUsuarioResponse {
    idHistorial: number;
    tipoEntidad: TipoEntidadHistorial;
    nombreEntidad: string;              
    idEstadoAnterior: number;
    idEstadoNuevo: number;
    fechaHistorial: string;
    detalle: string;
}

/**
 * Utilidad para determinar el tipo de entidad del historial
 */
export const determinarTipoEntidad = (historial: HistorialUsuario): TipoEntidadHistorial => {
    if (historial.usuario || historial.idUsuario) {
        return 'USUARIO';
    } else if (historial.equipo || historial.idEquipo) {
        return 'EQUIPO';
    }
    throw new Error('No se puede determinar el tipo de entidad del historial');
};

/**
 * Utilidad para obtener el nombre de la entidad del historial
 */
export const obtenerNombreEntidad = (historial: HistorialUsuario): string => {
    if (historial.usuario) {
        return `${historial.usuario.nombre} ${historial.usuario.aPaterno}`;
    } else if (historial.equipo) {
        return historial.equipo.nombre;
    } else if (historial.idUsuario) {
        return `Usuario #${historial.idUsuario}`;
    } else if (historial.idEquipo) {
        return `Equipo #${historial.idEquipo}`;
    }
    return 'Entidad desconocida';
};

/**
 * Función para crear DTO de historial
 */
export const crearHistorialDTO = (
    tipo: TipoEntidadHistorial,
    idEntidad: number,
    idEstadoAnterior: number,
    idEstadoNuevo: number,
    detalle: string
): HistorialUsuarioCreationDTO => {
    const dto: HistorialUsuarioCreationDTO = {
        idEstadoAnterior,
        idEstadoNuevo,
        detalle
    };
    
    if (tipo === 'USUARIO') {
        dto.idUsuario = idEntidad;
    } else {
        dto.idEquipo = idEntidad;
    }
    
    return dto;
};