// Importamos la interfaz Estado para tipar los datos
import type { Estado } from '../../../types/RegistrosType.ts';
// Importamos las utilidades de Axios y el cliente configurado
import { 
    registroClient, 
    buildApiUrlPath, 
    RegistroEndpoints,
    type RegistroEndpointsType
} from '../../clients/RegistrosClient.tsx';

import { AxiosError } from 'axios';

// Definimos la ruta base utilizando el objeto de Endpoints
const ESTADOS_RESOURCE: RegistroEndpointsType = RegistroEndpoints.ESTADOS;

/**
 * Función asíncrona para obtener todos los estados (método GET).
 * @returns Una promesa que resuelve con un array de objetos Estado.
 */
export const getEstados = async (): Promise<Estado[]> => {
    try {
        const urlPath = buildApiUrlPath(ESTADOS_RESOURCE);
        const response = await registroClient.get<Estado[]>(urlPath);
        return response.data;
        
    } catch (error) {
        const axiosError = error as AxiosError;
        console.error("Fallo en getEstados:", axiosError.message, axiosError.response?.data);
        
        if (axiosError.response) {
             throw new Error(`Error al obtener los estados: ${axiosError.response.status} - ${JSON.stringify(axiosError.response.data)}`);
        }
        
        throw error;
    }
};

/**
 * Función asíncrona para crear un nuevo estado (método POST).
 * * Utilizamos Omit<Estado, 'idEstado'> porque el ID lo genera el backend.
 * @param estado Objeto con los datos del nuevo estado.
 * @returns Una promesa que resuelve con el objeto Estado creado por la API.
 */
export const createEstado = async (estado: Omit<Estado, 'idEstado'>): Promise<Estado> => {
    try {
        const urlPath = buildApiUrlPath(ESTADOS_RESOURCE);
        const response = await registroClient.post<Estado>(urlPath, estado);

        return response.data;
        
    } catch (error) {
        const axiosError = error as AxiosError;
        console.error("Fallo en createEstado:", axiosError.message, axiosError.response?.data);

        if (axiosError.response) {
            throw new Error(`Error al crear el estado: ${axiosError.response.status} - ${JSON.stringify(axiosError.response.data)}`);
        }
        
        throw error;
    }
};

/**
 * Función asíncrona para actualizar un estado existente (método PUT).
 * @param estado Objeto Estado completo a actualizar (incluye 'idEstado').
 * @returns Una promesa que resuelve con el objeto Estado actualizado.
 */
export const updateEstado = async (estado: Estado): Promise<Estado> => {
    try {
        // Utilizamos idEstado para construir el path
        const urlPath = buildApiUrlPath(ESTADOS_RESOURCE, `/${estado.idEstado}`);
        
        const response = await registroClient.put<Estado>(urlPath, estado);

        return response.data;
        
    } catch (error) {
        const axiosError = error as AxiosError;
        console.error("Fallo en updateEstado:", axiosError.message, axiosError.response?.data);

        if (axiosError.response) {
            throw new Error(`Error al actualizar el estado: ${axiosError.response.status} - ${JSON.stringify(axiosError.response.data)}`);
        }
        
        throw error;
    }
};

/**
 * Función asíncrona para eliminar un estado (método DELETE).
 * @param idEstado El ID del estado a eliminar.
 * @returns Una promesa vacía (<void>) al completar la eliminación.
 */
export const deleteEstado = async (idEstado: number): Promise<void> => {
    try {
        // Utilizamos idEstado para construir el path
        const urlPath = buildApiUrlPath(ESTADOS_RESOURCE, `/${idEstado}`);
        
        await registroClient.delete(urlPath);

    } catch (error) {
        const axiosError = error as AxiosError;
        console.error("Fallo en deleteEstado:", axiosError.message, axiosError.response?.data);
        
        if (axiosError.response) {
             throw new Error(`Error al eliminar el estado: ${axiosError.response.status} - ${JSON.stringify(axiosError.response.data)}`);
        }
        
        throw error;
    }
};