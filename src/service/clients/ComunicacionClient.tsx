// src/api/comunicacionesClient.ts
import axios, { type AxiosInstance, AxiosError } from 'axios';

/**
 * 1. URL BASE DE LA API
 * Se utiliza una URL base fija para el entorno de desarrollo local.
 * Esta URL se utiliza para configurar la instancia de Axios.
 * IMPORTANTE: Para producción, esta URL debe ser gestionada por el entorno de despliegue.
 */
const BASE_URL_COMUNICACIONES: string = 'http://localhost:8084/api-comunicaciones/v1';

/**
 * 2. RECURSOS (ENDPOINTS) - Uso de objeto 'as const'
 * Centraliza y tipa los paths de los recursos para el microservicio de Comunicaciones.
 */
export const ComunicacionesEndpoints = {
    NOTIFICACIONES: '/notificaciones', // Para enviar y gestionar notificaciones (email, push, SMS)
    MENSAJES: '/mensajes',             // Para gestionar mensajes directos (DMs)
    CONVERSACIONES: '/conversaciones', // Para gestionar salas de chat o hilos de conversación
    PARTICIPANTECONV: '/participantes',// Para gestionar participantes dentro de una conversación
} as const; // Uso de 'as const' para mejor tipado

// Tipo que extrae los valores de cadena del objeto para su uso en funciones
export type ComunicacionesEndpointsType = typeof ComunicacionesEndpoints[keyof typeof ComunicacionesEndpoints];

/**
 * 3. CONFIGURACIÓN DE LA INSTANCIA DE AXIOS (CLIENTE)
 * Instancia preconfigurada que utiliza la URL base definida.
 */
export const comunicacionesClient: AxiosInstance = axios.create({
    baseURL: BASE_URL_COMUNICACIONES,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // Timeout de 10 segundos
});

/**
 * 4. FUNCIÓN DE CONSTRUCCIÓN DE PATH RELATIVO
 * Construye el path relativo que será anexado a la 'baseURL' por la instancia de Axios.
 * @param resource El recurso principal (ej: ComunicacionesEndpoints.NOTIFICACIONES).
 * @param pathAdicional Un path opcional que se añade al final (ej: '/pendientes' o '/123').
 * @returns El path relativo completo (ej: '/notificaciones/pendientes').
 */
export const buildApiUrlPathComunicaciones = (resource: ComunicacionesEndpointsType, pathAdicional: string = ''): string => {
    const resourcePath = resource; 
    return `${resourcePath}${pathAdicional}`;
}