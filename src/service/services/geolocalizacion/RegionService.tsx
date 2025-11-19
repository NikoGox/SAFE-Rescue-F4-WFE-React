// src/services/regionService.ts
import axios, { AxiosError } from 'axios';
import { geolocalizacionClient, GeolocalizacionEndpoints, type GeolocalizacionEndpointsType } from '../../clients/GeolocalizacionClient.tsx';
import { type Region } from '../../../types/GeolocalizacionType.ts';

/**
 * Función de utilidad para construir el path completo del recurso.
 * @param resource El recurso principal (ej: RegionEndpoints.REGIONES).
 * @param pathAdicional Un path opcional que se añade al final (ej: '/123').
 * @returns El path relativo completo (ej: '/regiones/123').
 */
const buildApiUrlPathRegion = (resource: GeolocalizacionEndpointsType, pathAdicional: string = ''): string => {
    // Aseguramos que el path adicional se una correctamente.
    const cleanPathAdicional = pathAdicional.startsWith('/') || pathAdicional === '' ? pathAdicional : `/${pathAdicional}`;
    return `${resource}${cleanPathAdicional}`;
}

// --------------------------------------------------------------------------------
// FUNCIONES DEL SERVICIO DE REGIONES
// --------------------------------------------------------------------------------

/**
 * Obtiene la lista completa de todas las regiones (Nivel 1).
 * @returns Una promesa que resuelve con la lista de objetos Region.
 */
export const getAllRegions = async (): Promise<Region[]> => {
    const path = buildApiUrlPathRegion(GeolocalizacionEndpoints.REGIONES);
    try {
        const response = await geolocalizacionClient.get<Region[]>(path);
        console.log("Regiones obtenidas con éxito:", response.data);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(`[RegionService] Error al obtener regiones: ${error.message}`, error.response?.data);
        } else {
            console.error("[RegionService] Error inesperado al obtener regiones:", error);
        }
        // Propagamos el error para que el componente de la UI lo maneje.
        throw error; 
    }
};

/**
 * Obtiene una región específica por su ID.
 * @param idRegion El ID de la región a buscar.
 * @returns Una promesa que resuelve con el objeto Region.
 */
export const getRegionById = async (idRegion: number): Promise<Region> => {
    const path = buildApiUrlPathRegion(GeolocalizacionEndpoints.REGIONES, `${idRegion}`);
    try {
        const response = await geolocalizacionClient.get<Region>(path);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            console.warn(`[RegionService] Región con ID ${idRegion} no encontrada.`);
        } else if (axios.isAxiosError(error)) {
            console.error(`[RegionService] Error al obtener región ID ${idRegion}: ${error.message}`, error.response?.data);
        }
        throw error;
    }
}

