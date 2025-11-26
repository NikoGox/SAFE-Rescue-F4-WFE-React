import axios, { type AxiosInstance, AxiosError } from 'axios';

/**
 * 1. OBTENER LA URL BASE DE LAS VARIABLES DE ENTORNO
 */
const BASE_URL_REGISTROS: string = 'http://localhost:8080/api-registros/v1';

/**
 * 2. RECURSOS (ENDPOINTS)
 */
export const RegistroEndpoints = {
    ESTADOS: '/estados', 
    FOTOS: '/fotos'      
} as const;

export type RegistroEndpointsType = typeof RegistroEndpoints[keyof typeof RegistroEndpoints];

/**
 * 3. CONFIGURACIÓN DE LA INSTANCIA DE AXIOS
 */
export const registroClient: AxiosInstance = axios.create({
    baseURL: BASE_URL_REGISTROS,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, 
});

/**
 * 4. FUNCIÓN DE CONSTRUCCIÓN DE PATH
 */
export const buildApiUrlPath = (resource: RegistroEndpointsType, pathAdicional: string = ''): string => {
    // Asegura el formato correcto: /fotos/upload o /fotos/10
    const separator = resource.endsWith('/') || pathAdicional.startsWith('/') || pathAdicional === '' ? '' : '/';
    return `${resource}${separator}${pathAdicional}`;
};