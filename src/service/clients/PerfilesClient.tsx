// src/api/perfilesClient.ts
import axios, { type AxiosInstance, AxiosError } from 'axios';

/**
 * 1. URL BASE DE LA API
 * Se utiliza una URL base fija para el entorno de desarrollo local.
 * Esta URL se utiliza para configurar la instancia de Axios.
 * IMPORTANTE: Para producción, esta URL debe ser gestionada por el entorno de despliegue.
 */
const BASE_URL_PERFILES: string = 'http://localhost:8082/api-perfiles/v1';

/**
 * 2. RECURSOS (ENDPOINTS) - Uso de objeto 'as const'
 * Centraliza los paths de los recursos para el microservicio de perfiles.
 */
export const PerfilesEndpoints = {
    USUARIOS: '/usuarios',
    TIPOSUSUARIO: '/tipos-usuario',
    BOMBEROS: '/bomberos',
    CIUDADANOS: '/ciudadanos', 
    COMPANIAS: '/companias',
    EQUIPOS: '/equipos',
    TIPOSEQUIPO: '/tipos-equipo',
    HISTORIALUSUARIOS: '/historial',
    AUTH: '/auth',
} as const;

// Tipo que extrae los valores de cadena del objeto para su uso en funciones
export type PerfilesEndpointsType = typeof PerfilesEndpoints[keyof typeof PerfilesEndpoints];

/**
 * 3. CONFIGURACIÓN DE LA INSTANCIA DE AXIOS (CLIENTE)
 * Instancia preconfigurada que utiliza la URL base definida.
 */
export const perfilesClient: AxiosInstance = axios.create({
    baseURL: BASE_URL_PERFILES,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // Timeout de 10 segundos
});

/**
 * 4. FUNCIÓN DE CONSTRUCCIÓN DE PATH RELATIVO
 * Construye el path relativo que será anexado a la 'baseURL' por la instancia de Axios.
 * @param resource El recurso principal (ej: PerfilesEndpoints.USUARIOS).
 * @param pathAdicional Un path opcional que se añade al final (ej: '/123' para un GET por ID).
 * @returns El path relativo completo (ej: '/usuarios/123').
 */
export const buildApiUrlPathPerfiles = (resource: PerfilesEndpointsType, pathAdicional: string = ''): string => {
    const resourcePath = resource; 
    return `${resourcePath}${pathAdicional}`;
}