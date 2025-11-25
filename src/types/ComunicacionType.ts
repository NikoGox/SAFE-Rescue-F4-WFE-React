// src/types/ComunicacionTypes.ts

// ===========================================================
// 1. TIPOS DE NOTIFICACIÓN
// ===========================================================

export interface NotificacionResponse {
    idNotificacion: number;
    idUsuarioReceptor: string;
    detalle: string;
    fechaCreacion: string;
    idEstado: number;
    idConversacion?: number | null;
}

export interface NotificacionCreationDTO {
    idUsuarioReceptor: number;
    detalle: string;
    idConversacion?: number | null;
    idEstado: number;
}

export interface NotificacionUpdateDTO {
    idEstado?: number;
    detalle?: string;
}

// ===========================================================
// 2. TIPOS DE CONVERSACIÓN
// ===========================================================

export interface ConversacionResponse {
    idConversacion: number;
    tipo: string; // Valores: 'Privada', 'Grupo', 'Emergencia'
    nombre?: string | null;
    fechaCreacion: string;
}

export interface ConversacionConParticipantes extends ConversacionResponse {
    participantes: ParticipanteConvResponse[];
    ultimoMensaje?: MensajeResponse;
}

export interface ConversacionCreationDTO {
    tipo: string;
    nombre?: string | null;
    participantesInicialesIds: number[];
}

// ===========================================================
// 3. TIPOS DE PARTICIPANTES
// ===========================================================

export interface ParticipanteConvResponse {
    idParticipanteConv: number;
    idUsuario: number;
    conversacion: ConversacionResponse;
    fechaUnion: string;
}

export interface ParticipanteConvCreationDTO {
    idUsuario: number;
    idConversacion: number;
}

export interface ParticipanteConvSimplificado {
    idParticipanteConv: number;
    idUsuario: number;
    idConversacion: number;
    fechaUnion: string;
    nombreUsuario?: string;
}

// ===========================================================
// 4. TIPOS DE MENSAJES
// ===========================================================

export interface MensajeResponse {
    idMensaje: number;
    idUsuarioEmisor: number;
    detalle: string;
    fechaCreacion: string;
    conversacion: ConversacionResponse;
    idEstado: number;
}

export interface MensajeCreationDTO {
    idConversacion: number;     // ← Para asociar el mensaje
    idUsuarioEmisor: number;    // ✅
    detalle: string;            // ✅
    idEstado: number;           // ← Obligatorio según DTO
}

export interface MensajeConUsuario extends MensajeResponse {
    nombreEmisor?: string;
    avatarEmisor?: string;
}

// ===========================================================
// 5. CONSTANTES Y UTILIDADES
// ===========================================================

export const TIPOS_CONVERSACION = {
    PRIVADA: 'Privada',
    GRUPO: 'Grupo',
    EMERGENCIA: 'Emergencia'
} as const;

export const ESTADO_MENSAJE = {
    ENVIADO: 1,
    ENTREGADO: 2,
    LEIDO: 3
} as const;

export const ESTADO_NOTIFICACION = {
    PENDIENTE: 1,
    LEIDA: 2,
    ARCHIVADA: 3
} as const;

// Utilidades
export const esConversacionPrivada = (conversacion: ConversacionResponse): boolean => {
    return conversacion.tipo === TIPOS_CONVERSACION.PRIVADA;
};

export const crearParticipanteDTO = (
    idUsuario: number,
    idConversacion: number
): ParticipanteConvCreationDTO => {
    return { idUsuario, idConversacion };
};

export const crearMensajeDTO = (
    idConversacion: number,
    idUsuarioEmisor: number,
    detalle: string,
    idEstado: number = ESTADO_MENSAJE.ENVIADO // Valor por defecto
): MensajeCreationDTO => {
    return { idConversacion, idUsuarioEmisor, detalle, idEstado };
};

export const crearNotificacionSistema = (
    idUsuarioReceptor: string,
    detalle: string
): NotificacionCreationDTO => {
    return {
        idUsuarioReceptor,
        detalle,
        idEstado: ESTADO_NOTIFICACION.PENDIENTE
    };
};

// Función para determinar si un mensaje fue editado (basado en lógica de negocio)
export const fueMensajeEditado = (mensaje: MensajeResponse): boolean => {
    return false;
};

export interface ContactData {
    nombre: string;
    email: string;
    telefono: string;
    direccion: string;
    mensaje: string;
    idUsuarioReceptor?: number; 
}