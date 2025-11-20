// src/types/IncidenteTypes.ts

/**
 * Define la estructura de un Tipo de Incidente
 */
export interface TipoIncidente {
    idTipoIncidente: number;
    nombre: string;
}

/**
 * Interfaz principal para la respuesta del backend al consultar un incidente
 */
export interface IncidenteResponse {
    idIncidente: number;
    titulo: string;
    detalle: string;
    fechaRegistro: string;
    tipoIncidente: TipoIncidente;
    idDireccion: number;
    idCiudadano: number;
    idEstadoIncidente: number;  // ← Este ID referencia la interfaz Estado que ya tienes
    idUsuarioAsignado?: number | null;
}

/**
 * DTO para la CREACIÓN de un nuevo Incidente
 */
export interface IncidenteCreationDTO {
    titulo: string;
    detalle: string;
    tipoIncidenteId: number;
    idDireccion: number;
    idCiudadano: number;
}

/**
 * DTO para la ACTUALIZACIÓN de un Incidente
 */
export interface IncidenteUpdateDTO {
    titulo?: string;
    detalle?: string;
    tipoIncidenteId?: number;
    idDireccion?: number;
    idEstadoIncidente?: number;  // ← Referencia al ID del Estado
    idUsuarioAsignado?: number | null;
}

/**
 * Interfaz para el historial de cambios de estado de incidentes
 */
export interface HistorialIncidenteResponse {
    idHistorial: number;
    incidente: IncidenteResponse;
    idEstadoAnterior: number;  // ← Referencia al ID del Estado anterior
    idEstadoNuevo: number;     // ← Referencia al ID del Estado nuevo
    fechaHistorial: string;
    detalle: string;
}

/**
 * DTO para crear un nuevo registro de historial
 */
export interface HistorialIncidenteCreationDTO {
    idIncidente: number;
    idEstadoAnterior: number;  // ← Referencia al ID del Estado
    idEstadoNuevo: number;     // ← Referencia al ID del Estado  
    detalle: string;
}