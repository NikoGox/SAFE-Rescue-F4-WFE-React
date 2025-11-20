// src/services/EstadoService.ts

import type { Estado } from '../../../types/RegistrosType.ts';
import { 
    registroClient, 
    buildApiUrlPath, 
    RegistroEndpoints,
    type RegistroEndpointsType
} from '../../clients/RegistrosClient.tsx';
import { AxiosError } from 'axios';

const ESTADOS_RESOURCE: RegistroEndpointsType = RegistroEndpoints.ESTADOS;

export const EstadoService = {
    /**
     * Obtiene todos los estados registrados en el sistema.
     * Endpoint: GET /api-registros/v1/estados
     * @returns Promesa que resuelve con array de estados o array vacío si no hay contenido
     */
    getAll: async (): Promise<Estado[]> => {
        try {
            const urlPath = buildApiUrlPath(ESTADOS_RESOURCE);
            const response = await registroClient.get<Estado[]>(urlPath);
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError;
            console.error("Fallo en getAll:", axiosError.message, axiosError.response?.data);
            
            if (axiosError.response?.status === 204) {
                // El backend devuelve 204 NO_CONTENT cuando no hay estados
                return [];
            }
            
            if (axiosError.response) {
                throw new Error(`Error al obtener los estados: ${axiosError.response.status} - ${JSON.stringify(axiosError.response.data)}`);
            }
            throw error;
        }
    },

    /**
     * Busca un estado por su ID.
     * Endpoint: GET /api-registros/v1/estados/{id}
     * @param idEstado ID del estado a buscar
     * @returns Promesa que resuelve con el Estado encontrado
     */
    getById: async (idEstado: number): Promise<Estado> => {
        try {
            const urlPath = buildApiUrlPath(ESTADOS_RESOURCE, `/${idEstado}`);
            const response = await registroClient.get<Estado>(urlPath);
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError;
            console.error("Fallo en getById:", axiosError.message, axiosError.response?.data);
            
            if (axiosError.response?.status === 404) {
                throw new Error(`Estado con ID ${idEstado} no encontrado.`);
            }
            
            if (axiosError.response) {
                throw new Error(`Error al obtener el estado: ${axiosError.response.status} - ${JSON.stringify(axiosError.response.data)}`);
            }
            throw error;
        }
    },

    /**
     * Busca estados por nombre (parcial o exacto).
     * Endpoint: GET /api-registros/v1/estados/buscar?nombre={nombre}
     * @param nombre Nombre o parte del nombre del estado a buscar
     * @returns Promesa que resuelve con array de estados coincidentes o array vacío
     */
    searchByNombre: async (nombre: string): Promise<Estado[]> => {
        try {
            const urlPath = buildApiUrlPath(ESTADOS_RESOURCE, '/buscar');
            const response = await registroClient.get<Estado[]>(urlPath, {
                params: { nombre }
            });
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError;
            console.error("Fallo en searchByNombre:", axiosError.message, axiosError.response?.data);
            
            if (axiosError.response?.status === 204) {
                // El backend devuelve 204 NO_CONTENT cuando no hay resultados
                return [];
            }
            
            if (axiosError.response) {
                throw new Error(`Error al buscar estados: ${axiosError.response.status} - ${JSON.stringify(axiosError.response.data)}`);
            }
            throw error;
        }
    },

    /**
     * Crea un nuevo estado.
     * Endpoint: POST /api-registros/v1/estados
     * CORRECCIÓN: El backend devuelve String, no el Estado creado
     * @param estado Datos del estado a crear (sin idEstado)
     * @returns Promesa que resuelve con mensaje de confirmación
     */
    create: async (estado: Omit<Estado, 'idEstado'>): Promise<string> => {
        try {
            const urlPath = buildApiUrlPath(ESTADOS_RESOURCE);
            const response = await registroClient.post<string>(urlPath, estado);
            return response.data; // "Estado creado con éxito."
        } catch (error) {
            const axiosError = error as AxiosError;
            console.error("Fallo en create:", axiosError.message, axiosError.response?.data);

            if (axiosError.response) {
                // El backend devuelve mensaje de error en el body
                if (axiosError.response.data) {
                    throw new Error(axiosError.response.data as string);
                }
                throw new Error(`Error al crear el estado: ${axiosError.response.status}`);
            }
            throw error;
        }
    },

    /**
     * Actualiza un estado existente.
     * Endpoint: PUT /api-registros/v1/estados/{id}
     * CORRECCIÓN: El backend devuelve String, no el Estado actualizado
     * @param idEstado ID del estado a actualizar
     * @param estado Datos actualizados del estado (debe incluir todos los campos)
     * @returns Promesa que resuelve con mensaje de confirmación
     */
    update: async (idEstado: number, estado: Estado): Promise<string> => {
        try {
            const urlPath = buildApiUrlPath(ESTADOS_RESOURCE, `/${idEstado}`);
            const response = await registroClient.put<string>(urlPath, estado);
            return response.data; // "Estado actualizado con éxito."
        } catch (error) {
            const axiosError = error as AxiosError;
            console.error("Fallo en update:", axiosError.message, axiosError.response?.data);

            if (axiosError.response?.status === 404) {
                throw new Error(`Estado con ID ${idEstado} no encontrado.`);
            }
            
            if (axiosError.response) {
                // El backend devuelve mensaje de error en el body
                if (axiosError.response.data) {
                    throw new Error(axiosError.response.data as string);
                }
                throw new Error(`Error al actualizar el estado: ${axiosError.response.status}`);
            }
            throw error;
        }
    },

    /**
     * Elimina un estado del sistema.
     * Endpoint: DELETE /api-registros/v1/estados/{id}
     * @param idEstado ID del estado a eliminar
     * @returns Promesa que resuelve con mensaje de confirmación
     */
    delete: async (idEstado: number): Promise<string> => {
        try {
            const urlPath = buildApiUrlPath(ESTADOS_RESOURCE, `/${idEstado}`);
            const response = await registroClient.delete<string>(urlPath);
            return response.data; // "Estado eliminado con éxito."
        } catch (error) {
            const axiosError = error as AxiosError;
            console.error("Fallo en delete:", axiosError.message, axiosError.response?.data);
            
            if (axiosError.response?.status === 404) {
                throw new Error(`Estado con ID ${idEstado} no encontrado.`);
            }
            
            if (axiosError.response) {
                // El backend devuelve mensaje de error en el body
                if (axiosError.response.data) {
                    throw new Error(axiosError.response.data as string);
                }
                throw new Error(`Error al eliminar el estado: ${axiosError.response.status}`);
            }
            throw error;
        }
    }
};