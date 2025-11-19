// src/api/incidentesClient.ts
import axios, { type AxiosInstance, AxiosError } from 'axios';

/**
 * 1. URL BASE DE LA API
 * Se utiliza una URL base fija para el entorno de desarrollo local.
 * Esta URL se utiliza para configurar la instancia de Axios.
 * IMPORTANTE: Para producción, esta URL debe ser gestionada por el entorno de despliegue.
 */
const BASE_URL_INCIDENTES: string = 'http://localhost:8083/api-incidentes/v1';

/**
 * 2. RECURSOS (ENDPOINTS) - Uso de objeto 'as const'
 * Centraliza los paths de los recursos para el microservicio de Incidentes.
 */
export const IncidentesEndpoints = {
    INCIDENTES: '/incidentes',            // Para reportes y gestión de incidentes
    HISTORIALINCIDENTES: '/historial',    // Historial de cambios, estados o acciones de un incidente
    TIPOINCIDENTES: '/tipos-incidentes',  // Para clasificar los tipos de incidentes
} as const;

// Tipo que extrae los valores de cadena del objeto para su uso en funciones
export type IncidentesEndpointsType = typeof IncidentesEndpoints[keyof typeof IncidentesEndpoints];

/**
 * 3. CONFIGURACIÓN DE LA INSTANCIA DE AXIOS (CLIENTE)
 * Instancia preconfigurada que utiliza la URL base definida.
 */
export const incidentesClient: AxiosInstance = axios.create({
    baseURL: BASE_URL_INCIDENTES,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // Timeout de 10 segundos
});

/**
 * 4. FUNCIÓN DE CONSTRUCCIÓN DE PATH RELATIVO
 * Construye el path relativo que será anexado a la 'baseURL' por la instancia de Axios.
 * * @param resource El recurso principal (ej: IncidentesEndpoints.INCIDENTES).
 * @param pathAdicional Un path opcional que se añade al final (ej: '/abiertos' o '/123').
 * @returns El path relativo completo (ej: '/incidentes/abiertos').
 */
export const buildApiUrlPathIncidentes = (resource: IncidentesEndpointsType, pathAdicional: string = ''): string => {
    const resourcePath = resource; 
    return `${resourcePath}${pathAdicional}`;
}