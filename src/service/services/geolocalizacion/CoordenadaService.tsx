// src/services/geolocalizacion/CoordenadasService.ts

import type { Coordenadas } from '../../../types/GeolocalizacionType.ts';
import { 
    geolocalizacionClient, 
    buildApiUrlPathGeolocalizacion, 
    GeolocalizacionEndpoints,
    type GeolocalizacionEndpointsType
} from '../../clients/GeolocalizacionClient.tsx';
import { AxiosError } from 'axios';

// ❗ IMPORTANTE: El controller usa "/coordenadas" pero el cliente tiene "/localizaciones"
// Necesitamos verificar cuál es el endpoint correcto
const COORDENADAS_RESOURCE: GeolocalizacionEndpointsType = GeolocalizacionEndpoints.COORDENADAS;

export const CoordenadasService = {
    /**
     * Obtiene todas las coordenadas registradas en el sistema.
     * Endpoint: GET /api-geolocalizacion/v1/coordenadas
     * @returns Promesa que resuelve con array de coordenadas o array vacío si no hay contenido
     */
    getAll: async (): Promise<Coordenadas[]> => {
        try {
            const urlPath = buildApiUrlPathGeolocalizacion(COORDENADAS_RESOURCE);
            const response = await geolocalizacionClient.get<Coordenadas[]>(urlPath);
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError;
            console.error("[CoordenadasService] Error en getAll:", axiosError.message);
            
            if (axiosError.response?.status === 204) {
                // El backend devuelve 204 NO_CONTENT cuando no hay coordenadas
                return [];
            }
            
            if (axiosError.response) {
                throw new Error(`Error al obtener coordenadas: ${axiosError.response.status}`);
            }
            throw error;
        }
    },

    /**
     * Busca coordenadas por su ID.
     * Endpoint: GET /api-geolocalizacion/v1/coordenadas/{id}
     * @param idCoordenadas ID de las coordenadas a buscar
     * @returns Promesa que resuelve con las Coordenadas encontradas
     */
    getById: async (idCoordenadas: number): Promise<Coordenadas> => {
        try {
            const urlPath = buildApiUrlPathGeolocalizacion(COORDENADAS_RESOURCE, `/${idCoordenadas}`);
            const response = await geolocalizacionClient.get<Coordenadas>(urlPath);
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError;
            console.error(`[CoordenadasService] Error en getById(${idCoordenadas}):`, axiosError.message);
            
            if (axiosError.response?.status === 404) {
                throw new Error(`Coordenadas con ID ${idCoordenadas} no encontradas.`);
            }
            
            if (axiosError.response) {
                throw new Error(`Error al obtener coordenadas: ${axiosError.response.status}`);
            }
            throw error;
        }
    },

    /**
     * Crea nuevas coordenadas.
     * Endpoint: POST /api-geolocalizacion/v1/coordenadas
     * CORRECCIÓN: El backend devuelve String, no las Coordenadas creadas
     * @param coordenadas Datos de las coordenadas a crear (sin idCoordenadas)
     * @returns Promesa que resuelve con mensaje de confirmación
     */
    create: async (coordenadas: Omit<Coordenadas, 'idCoordenadas'>): Promise<string> => {
        try {
            const urlPath = buildApiUrlPathGeolocalizacion(COORDENADAS_RESOURCE);
            const response = await geolocalizacionClient.post<string>(urlPath, coordenadas);
            return response.data; // "Coordenadas creadas con éxito."
        } catch (error) {
            const axiosError = error as AxiosError;
            console.error("[CoordenadasService] Error en create:", axiosError.message, axiosError.response?.data);

            if (axiosError.response) {
                // El backend devuelve mensaje de error en el body
                if (axiosError.response.data) {
                    throw new Error(axiosError.response.data as string);
                }
                throw new Error(`Error al crear las coordenadas: ${axiosError.response.status}`);
            }
            throw error;
        }
    },

    /**
     * Actualiza coordenadas existentes.
     * Endpoint: PUT /api-geolocalizacion/v1/coordenadas/{id}
     * CORRECCIÓN: El backend devuelve String, no las Coordenadas actualizadas
     * @param idCoordenadas ID de las coordenadas a actualizar
     * @param coordenadas Datos actualizados de las coordenadas (debe incluir todos los campos)
     * @returns Promesa que resuelve con mensaje de confirmación
     */
    update: async (idCoordenadas: number, coordenadas: Coordenadas): Promise<string> => {
        try {
            const urlPath = buildApiUrlPathGeolocalizacion(COORDENADAS_RESOURCE, `/${idCoordenadas}`);
            const response = await geolocalizacionClient.put<string>(urlPath, coordenadas);
            return response.data; // "Coordenadas actualizadas con éxito"
        } catch (error) {
            const axiosError = error as AxiosError;
            console.error(`[CoordenadasService] Error en update(${idCoordenadas}):`, axiosError.message);

            if (axiosError.response?.status === 404) {
                throw new Error(`Coordenadas con ID ${idCoordenadas} no encontradas.`);
            }
            
            if (axiosError.response) {
                // El backend devuelve mensaje de error en el body
                if (axiosError.response.data) {
                    throw new Error(axiosError.response.data as string);
                }
                throw new Error(`Error al actualizar las coordenadas: ${axiosError.response.status}`);
            }
            throw error;
        }
    },

    /**
     * Elimina coordenadas del sistema.
     * Endpoint: DELETE /api-geolocalizacion/v1/coordenadas/{id}
     * CORRECCIÓN: El backend devuelve String, no void
     * @param idCoordenadas ID de las coordenadas a eliminar
     * @returns Promesa que resuelve con mensaje de confirmación
     */
    delete: async (idCoordenadas: number): Promise<string> => {
        try {
            const urlPath = buildApiUrlPathGeolocalizacion(COORDENADAS_RESOURCE, `/${idCoordenadas}`);
            const response = await geolocalizacionClient.delete<string>(urlPath);
            return response.data; // "Coordenadas eliminadas con éxito."
        } catch (error) {
            const axiosError = error as AxiosError;
            console.error(`[CoordenadasService] Error en delete(${idCoordenadas}):`, axiosError.message);
            
            if (axiosError.response?.status === 404) {
                throw new Error(`Coordenadas con ID ${idCoordenadas} no encontradas.`);
            }
            
            if (axiosError.response) {
                // El backend devuelve mensaje de error en el body
                if (axiosError.response.data) {
                    throw new Error(axiosError.response.data as string);
                }
                throw new Error(`Error al eliminar las coordenadas: ${axiosError.response.status}`);
            }
            throw error;
        }
    }
};