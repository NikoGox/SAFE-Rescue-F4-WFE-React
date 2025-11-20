// src/services/geolocalizacion/RegionService.ts

import type { Region } from '../../../types/GeolocalizacionType.ts';
import { 
    geolocalizacionClient, 
    buildApiUrlPathGeolocalizacion, 
    GeolocalizacionEndpoints,
    type GeolocalizacionEndpointsType
} from '../../clients/GeolocalizacionClient.tsx';

import { AxiosError } from 'axios';

const REGIONES_RESOURCE: GeolocalizacionEndpointsType = GeolocalizacionEndpoints.REGIONES;

export const RegionService = {
    /**
     * Obtiene todas las regiones registradas en el sistema.
     * Endpoint: GET /api-geolocalizacion/v1/regiones
     * @returns Promesa que resuelve con array de regiones o array vacío si no hay contenido
     */
    getAll: async (): Promise<Region[]> => {
        try {
            const urlPath = buildApiUrlPathGeolocalizacion(REGIONES_RESOURCE);
            const response = await geolocalizacionClient.get<Region[]>(urlPath);
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError;
            console.error("[RegionService] Error en getAll:", axiosError.message);
            
            if (axiosError.response?.status === 204) {
                // El backend devuelve 204 NO_CONTENT cuando no hay regiones
                return [];
            }
            
            if (axiosError.response) {
                throw new Error(`Error al obtener regiones: ${axiosError.response.status}`);
            }
            throw error;
        }
    },

    /**
     * Busca una región por su ID.
     * Endpoint: GET /api-geolocalizacion/v1/regiones/{id}
     * @param idRegion ID de la región a buscar
     * @returns Promesa que resuelve con la Región encontrada
     */
    getById: async (idRegion: number): Promise<Region> => {
        try {
            const urlPath = buildApiUrlPathGeolocalizacion(REGIONES_RESOURCE, `/${idRegion}`);
            const response = await geolocalizacionClient.get<Region>(urlPath);
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError;
            console.error(`[RegionService] Error en getById(${idRegion}):`, axiosError.message);
            
            if (axiosError.response?.status === 404) {
                throw new Error(`Región con ID ${idRegion} no encontrada.`);
            }
            
            if (axiosError.response) {
                throw new Error(`Error al obtener región: ${axiosError.response.status}`);
            }
            throw error;
        }
    },

    /**
     * Crea una nueva región.
     * Endpoint: POST /api-geolocalizacion/v1/regiones
     * CORRECCIÓN: El backend devuelve String, no la Región creada
     * @param region Datos de la región a crear (sin idRegion)
     * @returns Promesa que resuelve con mensaje de confirmación
     */
    create: async (region: Omit<Region, 'idRegion'>): Promise<string> => {
        try {
            const urlPath = buildApiUrlPathGeolocalizacion(REGIONES_RESOURCE);
            const response = await geolocalizacionClient.post<string>(urlPath, region);
            return response.data; // "Región creada con éxito."
        } catch (error) {
            const axiosError = error as AxiosError;
            console.error("[RegionService] Error en create:", axiosError.message, axiosError.response?.data);

            if (axiosError.response) {
                // El backend devuelve mensaje de error en el body
                if (axiosError.response.data) {
                    throw new Error(axiosError.response.data as string);
                }
                throw new Error(`Error al crear la región: ${axiosError.response.status}`);
            }
            throw error;
        }
    },

    /**
     * Actualiza una región existente.
     * Endpoint: PUT /api-geolocalizacion/v1/regiones/{id}
     * CORRECCIÓN: El backend devuelve String, no la Región actualizada
     * @param idRegion ID de la región a actualizar
     * @param region Datos actualizados de la región (debe incluir todos los campos)
     * @returns Promesa que resuelve con mensaje de confirmación
     */
    update: async (idRegion: number, region: Region): Promise<string> => {
        try {
            const urlPath = buildApiUrlPathGeolocalizacion(REGIONES_RESOURCE, `/${idRegion}`);
            const response = await geolocalizacionClient.put<string>(urlPath, region);
            return response.data; // "Región actualizada con éxito"
        } catch (error) {
            const axiosError = error as AxiosError;
            console.error(`[RegionService] Error en update(${idRegion}):`, axiosError.message);

            if (axiosError.response?.status === 404) {
                throw new Error(`Región con ID ${idRegion} no encontrada.`);
            }
            
            if (axiosError.response) {
                // El backend devuelve mensaje de error en el body
                if (axiosError.response.data) {
                    throw new Error(axiosError.response.data as string);
                }
                throw new Error(`Error al actualizar la región: ${axiosError.response.status}`);
            }
            throw error;
        }
    },

    /**
     * Elimina una región del sistema.
     * Endpoint: DELETE /api-geolocalizacion/v1/regiones/{id}
     * CORRECCIÓN: El backend devuelve String, no void
     * @param idRegion ID de la región a eliminar
     * @returns Promesa que resuelve con mensaje de confirmación
     */
    delete: async (idRegion: number): Promise<string> => {
        try {
            const urlPath = buildApiUrlPathGeolocalizacion(REGIONES_RESOURCE, `/${idRegion}`);
            const response = await geolocalizacionClient.delete<string>(urlPath);
            return response.data; // "Región eliminada con éxito."
        } catch (error) {
            const axiosError = error as AxiosError;
            console.error(`[RegionService] Error en delete(${idRegion}):`, axiosError.message);
            
            if (axiosError.response?.status === 404) {
                throw new Error(`Región con ID ${idRegion} no encontrada.`);
            }
            
            if (axiosError.response) {
                // El backend devuelve mensaje de error en el body
                if (axiosError.response.data) {
                    throw new Error(axiosError.response.data as string);
                }
                throw new Error(`Error al eliminar la región: ${axiosError.response.status}`);
            }
            throw error;
        }
    }
};