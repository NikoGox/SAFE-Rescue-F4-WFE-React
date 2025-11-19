// src/services/ComunaService.ts
import axios, { AxiosError } from 'axios';
import { geolocalizacionClient, GeolocalizacionEndpoints, type GeolocalizacionEndpointsType } from '../../clients/GeolocalizacionClient.tsx';
import { type Comuna } from '../../../types/GeolocalizacionType.ts';

/**
 * Función de utilidad para construir el path completo del recurso.
 * @param resource El recurso principal (ej: GeolocalizacionEndpoints.COMUNAS).
 * @param pathAdicional Un path opcional que se añade al final (ej: '/123').
 * @returns El path relativo completo (ej: '/comunas/123').
 */
const buildApiUrlPathComuna = (resource: GeolocalizacionEndpointsType, pathAdicional: string = ''): string => {
    // Aseguramos que el path adicional se una correctamente.
    const cleanPathAdicional = pathAdicional.startsWith('/') || pathAdicional === '' ? pathAdicional : `/${pathAdicional}`;
    return `${resource}${cleanPathAdicional}`;
}

// --------------------------------------------------------------------------------
// FUNCIONES DEL SERVICIO DE COMUNAS
// --------------------------------------------------------------------------------

/**
 * Obtiene la lista completa de todas las comunas (Nivel 1).
 * @returns Una promesa que resuelve con la lista de objetos Comuna
 */
export const getAllComunas = async (): Promise<Comuna[]> => {
    const path = buildApiUrlPathComuna(GeolocalizacionEndpoints.COMUNAS);
    try {
        const response = await geolocalizacionClient.get<Comuna[]>(path);
        console.log("Comunas obtenidas con éxito:", response.data);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            // Ajustado el mensaje de error de 'Comunaes' a 'comunas'
            console.error(`[ComunaService] Error al obtener comunas: ${error.message}`, error.response?.data);
        } else {
            console.error("[ComunaService] Error inesperado al obtener Comunas:", error);
        }
        // Propagamos el error para que el componente de la UI lo maneje.
        throw error; 
    }
};

/**
 * Obtiene una comuna específica por su ID.
 * @param idComuna El ID de la comuna a buscar. <--- CORREGIDO
 * @returns Una promesa que resuelve con el objeto Comuna.
 */
export const getComunaById = async (idComuna: number): Promise<Comuna> => {
    const path = buildApiUrlPathComuna(GeolocalizacionEndpoints.COMUNAS, `${idComuna}`);
    try {
        const response = await geolocalizacionClient.get<Comuna>(path);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            // CORREGIDO: De Región a Comuna
            console.warn(`[ComunaService] Comuna con ID ${idComuna} no encontrada.`);
        } else if (axios.isAxiosError(error)) {
            // CORREGIDO: De Región a Comuna
            console.error(`[ComunaService] Error al obtener comuna ID ${idComuna}: ${error.message}`, error.response?.data);
        }
        throw error;
    }
}