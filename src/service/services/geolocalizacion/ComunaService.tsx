// src/services/geolocalizacion/ComunaService.ts

import type { Comuna } from '../../../types/GeolocalizacionType.ts';
import { 
    geolocalizacionClient, 
    buildApiUrlPathGeolocalizacion, 
    GeolocalizacionEndpoints,
    type GeolocalizacionEndpointsType
} from '../../clients/GeolocalizacionClient.ts';
import { AxiosError } from 'axios';

const COMUNAS_RESOURCE: GeolocalizacionEndpointsType = GeolocalizacionEndpoints.COMUNAS;

export const ComunaService = {
    /**
     * Obtiene todas las comunas registradas en el sistema.
     * Endpoint: GET /api-geolocalizacion/v1/comunas
     * @returns Promesa que resuelve con array de comunas o array vacío si no hay contenido
     */
    getAll: async (): Promise<Comuna[]> => {
        try {
            const urlPath = buildApiUrlPathGeolocalizacion(COMUNAS_RESOURCE);
            const response = await geolocalizacionClient.get<Comuna[]>(urlPath);
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError;
            console.error("[ComunaService] Error en getAll:", axiosError.message);
            
            if (axiosError.response?.status === 204) {
                // El backend devuelve 204 NO_CONTENT cuando no hay comunas
                return [];
            }
            
            if (axiosError.response) {
                throw new Error(`Error al obtener comunas: ${axiosError.response.status}`);
            }
            throw error;
        }
    },

    /**
     * Busca una comuna por su ID.
     * Endpoint: GET /api-geolocalizacion/v1/comunas/{id}
     * @param idComuna ID de la comuna a buscar
     * @returns Promesa que resuelve con la Comuna encontrada
     */
    getById: async (idComuna: number): Promise<Comuna> => {
        try {
            const urlPath = buildApiUrlPathGeolocalizacion(COMUNAS_RESOURCE, `/${idComuna}`);
            const response = await geolocalizacionClient.get<Comuna>(urlPath);
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError;
            console.error(`[ComunaService] Error en getById(${idComuna}):`, axiosError.message);
            
            if (axiosError.response?.status === 404) {
                throw new Error(`Comuna con ID ${idComuna} no encontrada.`);
            }
            
            if (axiosError.response) {
                throw new Error(`Error al obtener comuna: ${axiosError.response.status}`);
            }
            throw error;
        }
    },

    /**
     * Crea una nueva comuna.
     * Endpoint: POST /api-geolocalizacion/v1/comunas
     * CORRECCIÓN: El backend devuelve String, no la Comuna creada
     * @param comuna Datos de la comuna a crear (sin idComuna)
     * @returns Promesa que resuelve con mensaje de confirmación
     */
    create: async (comuna: Omit<Comuna, 'idComuna'>): Promise<string> => {
        try {
            const urlPath = buildApiUrlPathGeolocalizacion(COMUNAS_RESOURCE);
            const response = await geolocalizacionClient.post<string>(urlPath, comuna);
            return response.data; // "Comuna creada con éxito."
        } catch (error) {
            const axiosError = error as AxiosError;
            console.error("[ComunaService] Error en create:", axiosError.message, axiosError.response?.data);

            if (axiosError.response) {
                // El backend devuelve mensaje de error en el body
                if (axiosError.response.data) {
                    throw new Error(axiosError.response.data as string);
                }
                throw new Error(`Error al crear la comuna: ${axiosError.response.status}`);
            }
            throw error;
        }
    },

    /**
     * Actualiza una comuna existente.
     * Endpoint: PUT /api-geolocalizacion/v1/comunas/{id}
     * CORRECCIÓN: El backend devuelve String, no la Comuna actualizada
     * @param idComuna ID de la comuna a actualizar
     * @param comuna Datos actualizados de la comuna (debe incluir todos los campos)
     * @returns Promesa que resuelve con mensaje de confirmación
     */
    update: async (idComuna: number, comuna: Comuna): Promise<string> => {
        try {
            const urlPath = buildApiUrlPathGeolocalizacion(COMUNAS_RESOURCE, `/${idComuna}`);
            const response = await geolocalizacionClient.put<string>(urlPath, comuna);
            return response.data; // "Comuna actualizada con éxito"
        } catch (error) {
            const axiosError = error as AxiosError;
            console.error(`[ComunaService] Error en update(${idComuna}):`, axiosError.message);

            if (axiosError.response?.status === 404) {
                throw new Error(`Comuna con ID ${idComuna} no encontrada.`);
            }
            
            if (axiosError.response) {
                // El backend devuelve mensaje de error en el body
                if (axiosError.response.data) {
                    throw new Error(axiosError.response.data as string);
                }
                throw new Error(`Error al actualizar la comuna: ${axiosError.response.status}`);
            }
            throw error;
        }
    },

    /**
     * Elimina una comuna del sistema.
     * Endpoint: DELETE /api-geolocalizacion/v1/comunas/{id}
     * CORRECCIÓN: El backend devuelve String, no void
     * @param idComuna ID de la comuna a eliminar
     * @returns Promesa que resuelve con mensaje de confirmación
     */
    delete: async (idComuna: number): Promise<string> => {
        try {
            const urlPath = buildApiUrlPathGeolocalizacion(COMUNAS_RESOURCE, `/${idComuna}`);
            const response = await geolocalizacionClient.delete<string>(urlPath);
            return response.data; // "Comuna eliminada con éxito."
        } catch (error) {
            const axiosError = error as AxiosError;
            console.error(`[ComunaService] Error en delete(${idComuna}):`, axiosError.message);
            
            if (axiosError.response?.status === 404) {
                throw new Error(`Comuna con ID ${idComuna} no encontrada.`);
            }
            
            if (axiosError.response) {
                // El backend devuelve mensaje de error en el body
                if (axiosError.response.data) {
                    throw new Error(axiosError.response.data as string);
                }
                throw new Error(`Error al eliminar la comuna: ${axiosError.response.status}`);
            }
            throw error;
        }
    }
};