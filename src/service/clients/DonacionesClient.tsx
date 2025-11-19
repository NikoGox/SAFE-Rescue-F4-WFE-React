// src/api/donacionesClient.ts
import axios, { type AxiosInstance, AxiosError } from 'axios';

/**
 * 1. URL BASE DE LA API
 * Se utiliza una URL base fija para el entorno de desarrollo local.
 * Esta URL se utiliza para configurar la instancia de Axios.
 * IMPORTANTE: Para producción, esta URL debe ser gestionada por el entorno de despliegue.
 */
const BASE_URL_DONACIONES: string = 'http://localhost:8085/api-donaciones/v1';

/**
 * 2. RECURSOS (ENDPOINTS) - Uso de objeto 'as const'
 * Centraliza y tipa los paths de los recursos para el microservicio de Donaciones.
 */
export const DonacionesEndpoints = {
    DONACIONES: '/donaciones', // Para registrar y gestionar las donaciones
    // Puedes añadir más endpoints aquí si existen (ej: '/metas', '/reportes')
} as const; // Uso de 'as const' para mejor tipado

// Tipo que extrae los valores de cadena del objeto para su uso en funciones
export type DonacionesEndpointsType = typeof DonacionesEndpoints[keyof typeof DonacionesEndpoints];

/**
 * 3. CONFIGURACIÓN DE LA INSTANCIA DE AXIOS (CLIENTE)
 * Instancia preconfigurada que utiliza la URL base definida.
 */
export const donacionesClient: AxiosInstance = axios.create({
    baseURL: BASE_URL_DONACIONES,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // Timeout de 10 segundos
});

/**
 * 4. FUNCIÓN DE CONSTRUCCIÓN DE PATH RELATIVO
 * Construye el path relativo que será anexado a la 'baseURL' por la instancia de Axios.
 * @param resource El recurso principal (ej: DonacionesEndpoints.DONACIONES).
 * @param pathAdicional Un path opcional que se añade al final (ej: '/confirmar' o '/123').
 * @returns El path relativo completo (ej: '/donaciones/confirmar').
 */
export const buildApiUrlPathDonaciones = (resource: DonacionesEndpointsType, pathAdicional: string = ''): string => {
    const resourcePath = resource; 
    return `${resourcePath}${pathAdicional}`;
}