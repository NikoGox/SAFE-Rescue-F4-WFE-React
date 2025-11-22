// src/services/geolocalizacion/DireccionService.ts

import type { Direccion } from '../../../types/GeolocalizacionType.ts';
import { 
    geolocalizacionClient, 
    buildApiUrlPathGeolocalizacion, 
    GeolocalizacionEndpoints,
    type GeolocalizacionEndpointsType
} from '../../clients/GeolocalizacionClient.tsx';
import { AxiosError } from 'axios';

const DIRECCIONES_RESOURCE: GeolocalizacionEndpointsType = GeolocalizacionEndpoints.DIRECCIONES;

export const DireccionService = {
    /**
     * Obtiene todas las direcciones registradas en el sistema.
     * Endpoint: GET /api-geolocalizacion/v1/direcciones
     * @returns Promesa que resuelve con array de direcciones o array vacío si no hay contenido
     */
    getAll: async (): Promise<Direccion[]> => {
        try {
            const urlPath = buildApiUrlPathGeolocalizacion(DIRECCIONES_RESOURCE);
            const response = await geolocalizacionClient.get<Direccion[]>(urlPath);
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError;
            console.error("[DireccionService] Error en getAll:", axiosError.message);
            
            if (axiosError.response?.status === 204) {
                // El backend devuelve 204 NO_CONTENT cuando no hay direcciones
                return [];
            }
            
            if (axiosError.response) {
                throw new Error(`Error al obtener direcciones: ${axiosError.response.status}`);
            }
            throw error;
        }
    },

    /**
     * Busca una dirección por su ID.
     * Endpoint: GET /api-geolocalizacion/v1/direcciones/{id}
     * @param idDireccion ID de la dirección a buscar
     * @returns Promesa que resuelve con la Dirección encontrada
     */
    getById: async (idDireccion: number): Promise<Direccion> => {
        try {
            const urlPath = buildApiUrlPathGeolocalizacion(DIRECCIONES_RESOURCE, `/${idDireccion}`);
            const response = await geolocalizacionClient.get<Direccion>(urlPath);
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError;
            console.error(`[DireccionService] Error en getById(${idDireccion}):`, axiosError.message);
            
            if (axiosError.response?.status === 404) {
                throw new Error(`Dirección con ID ${idDireccion} no encontrada.`);
            }
            
            if (axiosError.response) {
                throw new Error(`Error al obtener dirección: ${axiosError.response.status}`);
            }
            throw error;
        }
    },

    /**
     * Crea una nueva dirección.
     * Endpoint: POST /api-geolocalizacion/v1/direcciones
     * CORRECCIÓN: El backend devuelve String, no la Dirección creada
     * @param direccion Datos de la dirección a crear (sin idDireccion)
     * @returns Promesa que resuelve con mensaje de confirmación
     */
    create: async (direccion: Omit<Direccion, 'idDireccion'>): Promise<string> => {
        try {
            const urlPath = buildApiUrlPathGeolocalizacion(DIRECCIONES_RESOURCE);
            const response = await geolocalizacionClient.post<string>(urlPath, direccion);
            return response.data; // "Dirección creada con éxito."
        } catch (error) {
            const axiosError = error as AxiosError;
            console.error("[DireccionService] Error en create:", axiosError.message, axiosError.response?.data);

            if (axiosError.response) {
                // El backend devuelve mensaje de error en el body
                if (axiosError.response.data) {
                    throw new Error(axiosError.response.data as string);
                }
                throw new Error(`Error al crear la dirección: ${axiosError.response.status}`);
            }
            throw error;
        }
    },

    /**
     * Actualiza una dirección existente.
     * Endpoint: PUT /api-geolocalizacion/v1/direcciones/{id}
     * CORRECCIÓN: El backend devuelve String, no la Dirección actualizada
     * @param idDireccion ID de la dirección a actualizar
     * @param direccion Datos actualizados de la dirección (debe incluir todos los campos)
     * @returns Promesa que resuelve con mensaje de confirmación
     */
    update: async (idDireccion: number, direccion: Direccion): Promise<string> => {
        try {
            const urlPath = buildApiUrlPathGeolocalizacion(DIRECCIONES_RESOURCE, `/${idDireccion}`);
            const response = await geolocalizacionClient.put<string>(urlPath, direccion);
            return response.data; // "Dirección actualizada con éxito"
        } catch (error) {
            const axiosError = error as AxiosError;
            console.error(`[DireccionService] Error en update(${idDireccion}):`, axiosError.message);

            if (axiosError.response?.status === 404) {
                throw new Error(`Dirección con ID ${idDireccion} no encontrada.`);
            }
            
            if (axiosError.response) {
                // El backend devuelve mensaje de error en el body
                if (axiosError.response.data) {
                    throw new Error(axiosError.response.data as string);
                }
                throw new Error(`Error al actualizar la dirección: ${axiosError.response.status}`);
            }
            throw error;
        }
    },

    /**
     * Elimina una dirección del sistema.
     * Endpoint: DELETE /api-geolocalizacion/v1/direcciones/{id}
     * CORRECCIÓN: El backend devuelve String, no void
     * @param idDireccion ID de la dirección a eliminar
     * @returns Promesa que resuelve con mensaje de confirmación
     */
    delete: async (idDireccion: number): Promise<string> => {
        try {
            const urlPath = buildApiUrlPathGeolocalizacion(DIRECCIONES_RESOURCE, `/${idDireccion}`);
            const response = await geolocalizacionClient.delete<string>(urlPath);
            return response.data; // "Dirección eliminada con éxito."
        } catch (error) {
            const axiosError = error as AxiosError;
            console.error(`[DireccionService] Error en delete(${idDireccion}):`, axiosError.message);
            
            if (axiosError.response?.status === 404) {
                throw new Error(`Dirección con ID ${idDireccion} no encontrada.`);
            }
            
            if (axiosError.response) {
                // El backend devuelve mensaje de error en el body
                if (axiosError.response.data) {
                    throw new Error(axiosError.response.data as string);
                }
                throw new Error(`Error al eliminar la dirección: ${axiosError.response.status}`);
            }
            throw error;
        }
    }
};