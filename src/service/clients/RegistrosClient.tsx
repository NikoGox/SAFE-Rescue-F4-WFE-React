import axios, { type AxiosInstance, AxiosError } from 'axios';

/**
 * 1. OBTENER LA URL BASE DE LAS VARIABLES DE ENTORNO
 * Se ha simplificado para usar solo la URL de desarrollo local.
 * IMPORTANTE: Para producción, este valor debe ser reemplazado por la URL real de la API.
 */
const BASE_URL_REGISTROS: string = 'http://localhost:8080/api-registros/v1';

/**
 * 2. RECURSOS (ENDPOINTS) - Uso de objeto 'as const'
 */
export const RegistroEndpoints = {
    ESTADOS: '/estados', 
    FOTOS: '/fotos'      
} as const;

// Tipo que extrae los valores de cadena del objeto para su uso en funciones
export type RegistroEndpointsType = typeof RegistroEndpoints[keyof typeof RegistroEndpoints];

/**
 * 3. CONFIGURACIÓN DE LA INSTANCIA DE AXIOS
 */
export const registroClient: AxiosInstance = axios.create({
    baseURL: BASE_URL_REGISTROS,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // Timeout de 10 segundos
});

/**
 * 4. FUNCIÓN DE CONSTRUCCIÓN DE PATH
 * @param resource El recurso principal (ej: RegistroEndpoints.FOTOS).
 * @param pathAdicional Un path opcional que se añade al final (ej: '/123' para un GET por ID).
 * @returns El path relativo completo (ej: '/fotos/123').
 */
export const buildApiUrlPath = (resource: RegistroEndpointsType, pathAdicional: string = ''): string => {
    const resourcePath = resource; 
    return `${resourcePath}${pathAdicional}`;
}