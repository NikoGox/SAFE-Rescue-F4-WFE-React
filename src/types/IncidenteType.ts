// src/types/IncidenteTypes.ts

/**
 * Enumeración de estados de un incidente (coincide con el backend).
 */
export type IncidentStatus = 'EN_PROCESO' | 'LOCALIZADO' | 'CERRADO' | 'PENDIENTE_ASIGNACION';

/**
 * Interfaz principal para la respuesta del backend al consultar un incidente.
 * Nota: Los nombres de campos se asumen en camelCase, pero deben coincidir con la entidad Java final.
 */
export interface IncidenteResponse {
    id: number;
    
    // Referencia al ID del tipo de incidente (ej: Incendio, Robo)
    idTipoIncidente: number; 

    // Datos del incidente
    description: string;
    location: string;
    dateTime: string; // Fecha y hora de creación (ISO string)
    status: IncidentStatus; 
    imageUrl: string | null; // URL de la imagen si existe
    
    // Referencias a claves foráneas de otros microservicios (Opcional, pero común)
    idUsuarioReporta: number;

}

/**
 * DTO para la CREACIÓN de un nuevo Incidente (POST).
 * Excluye campos gestionados por el backend (id, dateTime, status inicial).
 */
export interface IncidenteCreationDTO {
    // Clave foránea al TipoIncidente
    idTipoIncidente: number;
    
    description: string;
    location: string;
    imageUrl: string | null;
    
    // ID del usuario que reporta (si no se obtiene del token JWT)
    idUsuarioReporta?: number; 
}

/**
 * DTO para la EDICIÓN o ACTUALIZACIÓN parcial de un Incidente (PUT/PATCH).
 * Permite cambiar el estado y otros datos.
 */
export interface IncidenteUpdateDTO {
    idTipoIncidente?: number;
    description?: string;
    location?: string;
    imageUrl?: string | null;
    status?: IncidentStatus; // El estado puede cambiar durante la edición
}

/**
 * Tipos de acciones comunes que se registran en el historial.
 */
export type AccionHistorial = 'CREADO' | 'ACTUALIZADO' | 'ESTADO_CAMBIADO' | 'ASIGNADO' | 'COMENTARIO';

/**
 * Interfaz principal para la respuesta del backend al consultar un registro de historial.
 * Representa una acción específica realizada sobre un incidente en un momento dado.
 */
export interface HistorialIncidenteResponse {
    /** Identificador único del registro de historial. */
    idHistorial: number;
    
    /** Clave foránea al incidente al que pertenece este registro. */
    idIncidente: number; 

    /** ID del usuario que realizó la acción (o ID del servicio interno). */
    idUsuario: number; 

    /** Fecha y hora exacta en que ocurrió la acción (ISO string). */
    fechaHora: string; 
    
    /** Tipo de acción realizada (ej: 'ESTADO_CAMBIADO'). */
    accion: AccionHistorial | string; 
    
    /** Detalles específicos de la acción (ej: "Estado cambiado de 'EN_PROCESO' a 'CERRADO'"). */
    detalle: string; 
}

/**
 * Define la estructura de un Tipo de Incidente devuelto por el backend.
 * Ajusta los nombres de las propiedades (ej: camelCase) para que coincidan con tu backend si es necesario.
 */
export interface TipoIncidente {
    idTipoIncidente: number;
    nombre: string;
    descripcion: string;
    prioridad: 'ALTA' | 'MEDIA' | 'BAJA'; // O un número si usas IDs de prioridad
    activo: boolean; // Indica si el tipo de incidente está habilitado
}