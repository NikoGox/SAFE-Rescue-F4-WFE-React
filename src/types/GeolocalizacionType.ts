/**
 * Interfaz que representa una entidad geográfica de Nivel 1 (Región/Estado).
 */
export interface Region {
    idRegion: number;
    nombre: string;
    identificacion: string; // Código de identificación de la región (ej: ISO)
}

/**
 * Interfaz que representa una entidad geográfica de Nivel 2 (Comuna/Distrito/Municipio).
 */
export interface Comuna {
    idComuna: number;
    nombre: string;
    // Opcional, ya que no es 'nullable=false' en el modelo Java.
    codigoPostal?: string;
    idRegion: number; // Clave foránea (debe ser expuesta por el DTO del backend)
}

/**
 * Interfaz simple para representar la Latitud y Longitud.
 */
export interface CoordenadasSimple {
    lat: number;
    lng: number;
}


/**
 * Interfaz que define la Latitud y Longitud, incluyendo su ID si se almacena en tabla separada.
 * Coincide con el modelo Coordenadas.java
 */
export interface Coordenadas {
    idCoordenadas: number;
    latitud: number;  // Corresponde a Float en Java
    longitud: number; // Corresponde a Float en Java
}

/**
 * Interfaz para la respuesta (lectura) de la API de Direccion.
 * Utiliza IDs para las relaciones foráneas (Comuna, Coordenadas).
 */
export interface Direccion {
    idDireccion: number;
    calle: string;
    numero: string;

    // Estos campos son opcionales en Java, por lo que se marcan como opcionales en TS.
    villa?: string;
    complemento?: string;

    // Relaciones (expuestas como IDs en el DTO de respuesta)
    idComuna: number;
    idCoordenadas?: number;
    
}

/**
 * Interfaz para el payload (escritura/creación) de una nueva Direccion.
 */
export interface DireccionRequest {
    calle: string;
    numero: string;

    // Campos opcionales
    villa?: string;
    complemento?: string;

    // Relación por ID
    idComuna: number;

    // Coordenadas aplanadas
    latitud: number;
    longitud: number;
}

/**
 * Interfaz que representa un resultado de Geocodificación (búsqueda de dirección/coordenadas).
 * Útil para integrar servicios de geocodificación externos.
 */
export interface GeocodingResult {
    coordenadas: CoordenadasSimple; // Latitud y longitud encontradas (formato simple)
    direccionCompleta: string; // Dirección formateada
    precision: number;

    idCoordenada?: number;

    // Información opcional de contexto
    idComuna?: number;
    idRegion?: number;
}

export interface DireccionCompleta {
    idDireccion: number;
    calle: string;
    numero: string;
    villa?: string;
    complemento?: string;
    comuna: ComunaCompleta;
    coordenadas?: Coordenadas;
}

export interface ComunaCompleta {
    idComuna: number;
    nombre: string;
    codigoPostal?: string;
    region: Region;
}

export interface Region {
    idRegion: number;
    nombre: string;
    identificacion: string;
}

export interface Coordenadas {
    idCoordenadas: number;
    latitud: number;
    longitud: number;
}