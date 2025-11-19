// src/types/NotificacionTypes.ts

/**
 * Tipos de eventos que disparan una notificación.
 * Ajustar según los eventos definidos en el backend (ej: nuevo comentario, cambio de estado, asignación).
 */
export type NotificacionEvent = 'NUEVO_COMENTARIO' | 'CAMBIO_ESTADO' | 'NUEVA_ASIGNACION' | 'ALERTA_CRITICA';

/**
 * Interfaz para la respuesta de una Notificación.
 */
export interface NotificacionResponse {
    /** ID único de la notificación. */
    id: number;
    
    /** Clave foránea al usuario receptor de la notificación. */
    idUsuarioReceptor: number;
    
    /** Título o encabezado de la notificación. */
    titulo: string;
    
    /** Cuerpo del mensaje o descripción. */
    mensaje: string;
    
    /** Fecha y hora de creación (ISO string). */
    fechaCreacion: string; 
    
    /** Si la notificación ha sido vista por el usuario. */
    leida: boolean;
    
    /** Tipo de evento que originó la notificación. */
    tipoEvento: NotificacionEvent | string;
    
    /** URL relativa o ID para navegar al recurso relacionado (ej: /incidentes/5). */
    enlace: string; 
}

/**
 * Interfaz para la respuesta de un registro de Participante de Conversación.
 * Representa la relación entre un usuario y una conversación específica.
 */
export interface ParticipanteConvResponse {
    /** ID único del registro de participación. */
    id: number;
    
    /** Clave foránea a la Conversación (Chat, Hilo de Incidente). */
    idConversacion: number; 

    /** Clave foránea al Usuario que está participando. */
    idUsuario: number; 

    /** Fecha y hora en que el usuario se unió a la conversación (ISO string). */
    fechaUnion: string; 
    
    /** Indica si el usuario aún es un participante activo (true/false). */
    estaActivo: boolean; 
}

/**
 * DTO para la CREACIÓN/ADICIÓN de un nuevo participante a una conversación.
 * Solo necesita el ID del usuario a añadir.
 */
export interface ParticipanteConvCreationDTO {
    idUsuario: number;
}

/**
 * Tipos de conversación que soporta el sistema (ej: CHAT_DIRECTO, HILO_INCIDENTE).
 */
export type TipoConversacion = 'CHAT_DIRECTO' | 'HILO_INCIDENTE' | 'GRUPO';

/**
 * Interfaz principal para la respuesta del backend al consultar una Conversación.
 */
export interface ConversacionResponse {
    /** ID único de la conversación. */
    id: number;
    
    /** Título de la conversación (ej: "Soporte Incidente #123" o nombres de usuarios). */
    nombre: string;
    
    /** Tipo de la conversación (para definir el comportamiento en el frontend). */
    tipo: TipoConversacion;
    
    /** Fecha y hora de la última actividad (último mensaje, ISO string). */
    ultimaActividad: string; 

    /** Clave foránea al recurso principal asociado (ej: id del Incidente). Puede ser null. */
    idRecursoAsociado: number | null;
    
    /** IDs de los usuarios participantes, puede ser útil para la vista previa rápida. */
    participantesIds: number[]; 
}

/**
 * DTO para la CREACIÓN de una nueva Conversación (POST).
 * Usado para iniciar un nuevo chat o hilo.
 */
export interface ConversacionCreationDTO {
    /** El tipo de conversación a iniciar. */
    tipo: TipoConversacion; 
    
    /** Opcional: Nombre inicial para la conversación (ej: para chats de grupo). */
    nombre?: string;
    
    /** Opcional: El ID del recurso al que se asocia (ej: Incidente ID). */
    idRecursoAsociado?: number;

    /** IDs de los usuarios que serán participantes iniciales (mínimo 1 o 2). */
    participantesInicialesIds: number[];
}

// src/types/MensajeTypes.ts

/**
 * Interfaz principal para la respuesta del backend al consultar un Mensaje.
 */
export interface MensajeResponse {
    /** ID único del mensaje. */
    id: number;
    
    /** Clave foránea a la conversación a la que pertenece. */
    idConversacion: number; 

    /** ID del usuario que envió el mensaje. */
    idUsuarioEmisor: number; 
    
    /** Contenido del mensaje (texto). */
    contenido: string;
    
    /** Fecha y hora de envío (ISO string). */
    fechaEnvio: string; 
    
    /** Indica si el mensaje ha sido editado. */
    editado: boolean; 
}

/**
 * DTO para la CREACIÓN/ENVÍO de un nuevo mensaje.
 * Usado para la solicitud POST al backend.
 */
export interface MensajeCreationDTO {
    /** ID de la conversación a la que se envía el mensaje. */
    idConversacion: number; 
    
    /** ID del usuario que está enviando el mensaje (puede ser inferido del JWT). */
    idUsuarioEmisor: number; 
    
    /** Contenido del mensaje (texto). */
    contenido: string;
}