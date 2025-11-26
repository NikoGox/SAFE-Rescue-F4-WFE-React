
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
    idEstadoIncidente: number;
    idUsuarioAsignado?: number | null;
    direccion: string;
    imagenUrl: string;
}

/**
 * DTO para la CREACIÓN de un nuevo Incidente
 */
export interface IncidenteCreationDTO {
    titulo: string;
    detalle: string;
    fechaRegistro: string;
    region?: string;
    comuna?: string;
    direccion?: string;
    tipoIncidenteId: number;  
    idDireccion: number;
    idCiudadano: number;
    idEstadoIncidente: number;
    idUsuarioAsignado?: number | null;
    idFoto?: number | null;
}

/**
 * DTO para la ACTUALIZACIÓN de un Incidente
 */
export interface IncidenteUpdateDTO {
    titulo?: string;
    detalle?: string;
    tipoIncidenteId?: number;
    idDireccion?: number;
    idEstadoIncidente?: number;
    idUsuarioAsignado?: number | null;
}

/**
 * Interfaz para el historial de cambios de estado de incidentes
 */
export interface HistorialIncidenteResponse {
    idHistorial: number;
    incidente: IncidenteResponse;
    idEstadoAnterior: number;
    idEstadoNuevo: number;
    fechaHistorial: string;
    detalle: string;
}

/**
 * DTO para crear un nuevo registro de historial
 */
export interface HistorialIncidenteCreationDTO {
    idIncidente: number;
    idEstadoAnterior: number;
    idEstadoNuevo: number;
    detalle: string;
}

// ===========================================================
// TIPOS PARA EL FRONTEND
// ===========================================================


export interface IncidentForm {
    title: string,
    type: string;
    description: string;
    location: string;
    imageUrl: string;
}

export interface EditForm {
    title: string,
    description: string;
    location: string;
    type: string;
    status: string;
    imageUrl: string;
}

// Tipos para mapeo con el backend
export interface IncidenteFrontend {
    idIncidente: number;
    titulo: string;
    detalle: string;
    fechaRegistro: string;
    tipoIncidente: {
        idTipoIncidente: number;
        nombre: string;
    };
    ubicacion?: string;
    estadoIncidente?: string;
    imagenUrl?: string;
}

export interface IncidenteCreationFrontend {
    titulo: string;
    detalle: string;
    tipoIncidenteId: number;
    ubicacion: string;
    imagenUrl?: string;
}

export interface IncidenteUpdateFrontend {
    titulo?: string;
    detalle?: string;
    tipoIncidenteId?: number;
    ubicacion?: string;
    estadoIncidente?: string;
    imagenUrl?: string;
    idEstadoIncidente?: number;
}


// Tipos extendidos para geolocalización
export interface IncidenteFrontendConGeolocalizacion {
    idIncidente: number;
    titulo: string;
    detalle: string;
    fechaRegistro: string;
    tipoIncidente: {
        idTipoIncidente: number;
        nombre: string;
    };
    estadoIncidente?: string;
    imagenUrl?: string;
    idEstadoIncidente: number;
    direccionTexto: string;
    idRegion?: number;

    // Información de geolocalización
    direccionCompletaIncidente: DireccionCompletaIncidente | null;
}

export interface IncidenteCreationFrontendConGeolocalizacion {
    titulo: string;
    detalle: string;
    tipoIncidenteId: number;
    direccion: {
        calle: string;
        numero: string;
        villa?: string;
        complemento?: string;
        idComuna: number;
        coordenadas?: {
            latitud: number;
            longitud: number;
        };
    };
    imagenUrl?: string;
}

export interface DireccionCompletaIncidente {
    idDireccion: number;
    calle: string;
    numero: string;
    villa?: string;
    complemento?: string;
    comuna: {
        idComuna: number;
        nombre: string;
        codigoPostal?: string;
    };
    region: {
        idRegion: number;
        nombre: string;
        identificacion: string;
    };
    coordenadas?: {
        latitud: number;
        longitud: number;
    };
}


export interface IncidenteCreationFrontendConGeolocalizacion {
    titulo: string;
    detalle: string;
    tipoIncidenteId: number;
    direccion: {
        calle: string;
        numero: string;
        villa?: string;
        complemento?: string;
        idComuna: number;
        coordenadas?: {
            latitud: number;
            longitud: number;
        };
    };
    imagenUrl?: string;
}