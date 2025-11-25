/**
 * Interfaz que representa una entidad geográfica de Nivel 1 (Región/Estado).
 */
export interface Region {
    idRegion: number;
    nombre: string;
    identificacion: string;
}

/**
 * Interfaz que representa una entidad geográfica de Nivel 2 (Comuna/Distrito/Municipio).
 */
export interface Comuna {
    idComuna: number;
    nombre: string;
    codigoPostal?: string;
    region: Region;
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
    latitud: number;
    longitud: number;
}

/**
 * Interfaz para la respuesta (lectura) de la API de Direccion.
 * Utiliza IDs para las relaciones foráneas (Comuna, Coordenadas).
 */
export interface Direccion {
    idDireccion: number;
    calle: string;
    numero: string;
    villa?: string;
    complemento?: string;
    idComuna?: number;
    comuna?: Comuna;
    idCoordenadas?: number;
    coordenadas?: Coordenadas;
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
    coordenadas: CoordenadasSimple; 
    direccionCompleta: string; 
    precision: number;

    idCoordenada?: number;

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