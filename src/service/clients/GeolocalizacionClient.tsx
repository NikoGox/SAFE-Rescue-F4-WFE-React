// src/api/geolocalizacionClient.ts
import axios, { type AxiosInstance } from 'axios';

/**
 * 1. OBTENER LA URL BASE
 * Se usa la URL de desarrollo fija. La instancia de Axios utilizará esta base.
 */
const BASE_URL_GEOLOCALIZACION: string = 'http://localhost:8081/api-geolocalizacion/v1';

/**
 * 2. RECURSOS (ENDPOINTS) - Uso de objeto 'as const' para centralizar y tipar
 */
export const GeolocalizacionEndpoints = {
    DIRECCIONES: '/direcciones',
    COMUNAS: '/comunas',
    REGIONES: '/regiones',
    COORDENADAS: '/coordenadas' // Corregí el nombre a 'COORDENADAS' por consistencia
} as const;

// Tipo que extrae los valores de cadena del objeto para su uso en funciones
export type GeolocalizacionEndpointsType = typeof GeolocalizacionEndpoints[keyof typeof GeolocalizacionEndpoints];

/**
 * 3. CONFIGURACIÓN DE LA INSTANCIA DE AXIOS (CLIENTE)
 * Esta instancia ya tiene configurada la URL base.
 */
export const geolocalizacionClient: AxiosInstance = axios.create({
    baseURL: BASE_URL_GEOLOCALIZACION,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 15000, // Timeout de 15 segundos
});

/**
 * 4. FUNCIÓN DE CONSTRUCCIÓN DE PATH RELATIVO
 * Esta función construye el path relativo, que será combinado con el 'baseURL'
 * por la instancia de Axios.
 * * @param resource El recurso principal (ej: GeolocalizacionEndpoints.DIRECCIONES).
 * @param pathAdicional Un path opcional que se añade al final (ej: '/123' para un GET por ID).
 * @returns El path relativo completo (ej: '/direcciones/123').
 */
export const buildApiUrlPathGeolocalizacion = (resource: GeolocalizacionEndpointsType, pathAdicional: string = ''): string => {
    // El path del recurso (direcciones, comunas, etc.)
    const resourcePath = resource; 

    // Concatenamos Recurso + Path Adicional
    return `${resourcePath}${pathAdicional}`;
}