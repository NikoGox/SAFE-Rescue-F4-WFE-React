// src/services/TipoEquipoService.ts
import axios from 'axios';
import { perfilesClient, PerfilesEndpoints, type PerfilesEndpointsType } from '../../clients/PerfilesClient.tsx'; 
import { type TipoEquipo, type TipoEquipoRequest } from '../../../types/PerfilesType.ts'; 
// Asumo que PagedResponse también está en PerfilTypes.ts si aplica a esta API

/**
 * Función de utilidad para construir el path completo del recurso.
 * @param resource El recurso principal (ej: PerfilEndpoints.TIPO_EQUIPO).
 * @param pathAdicional Un path opcional que se añade al final (ej: '/123').
 * @returns El path relativo completo (ej: '/tipos-equipo/123').
 */
const buildApiUrlPathTipoEquipo = (resource: PerfilesEndpointsType, pathAdicional: string = ''): string => {
    // Lógica para asegurar la unión correcta del path
    const cleanPathAdicional = pathAdicional.startsWith('/') || pathAdicional === '' ? pathAdicional : `/${pathAdicional}`;
    return `${resource}${cleanPathAdicional}`;
}

// --------------------------------------------------------------------------------
// FUNCIONES DEL SERVICIO DE TIPOS DE EQUIPO
// --------------------------------------------------------------------------------

/**
 * Obtiene una lista paginada o completa de todos los tipos de equipo.
 * @returns Una promesa que resuelve con la lista (o respuesta paginada) de objetos TipoEquipo.
 */
export const getAllTiposEquipo = async (): Promise<TipoEquipo[]> => {
    // Asumiendo que el endpoint devuelve la lista completa o requiere paginación por defecto
    const path = buildApiUrlPathTipoEquipo(PerfilesEndpoints.TIPOSEQUIPO); 
    try {
        const response = await perfilesClient.get<TipoEquipo[]>(path);
        console.log("Tipos de equipo obtenidos con éxito.");
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(`[TipoEquipoService] Error al obtener tipos de equipo: ${error.message}`, error.response?.data);
        } else {
            console.error("[TipoEquipoService] Error inesperado al obtener tipos de equipo:", error);
        }
        throw error;
    }
};

/**
 * Obtiene un tipo de equipo específico por su ID.
 * @param idTipoEquipo El ID del tipo de equipo a buscar.
 * @returns Una promesa que resuelve con el objeto TipoEquipo.
 */
export const getTipoEquipoById = async (idTipoEquipo: number): Promise<TipoEquipo> => {
    const path = buildApiUrlPathTipoEquipo(PerfilesEndpoints.TIPOSEQUIPO, `${idTipoEquipo}`);
    try {
        const response = await perfilesClient.get<TipoEquipo>(path);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            console.warn(`[TipoEquipoService] Tipo de equipo con ID ${idTipoEquipo} no encontrado.`);
        } else if (axios.isAxiosError(error)) {
            console.error(`[TipoEquipoService] Error al obtener tipo de equipo ID ${idTipoEquipo}: ${error.message}`, error.response?.data);
        }
        throw error;
    }
};

/**
 * Crea un nuevo tipo de equipo.
 * @param newTipoEquipo Los datos del nuevo tipo de equipo.
 * @returns Una promesa que resuelve con el objeto TipoEquipo creado.
 */
export const createTipoEquipo = async (newTipoEquipo: TipoEquipoRequest): Promise<TipoEquipo> => {
    const path = buildApiUrlPathTipoEquipo(PerfilesEndpoints.TIPOSEQUIPO);
    try {
        const response = await perfilesClient.post<TipoEquipo>(path, newTipoEquipo);
        console.log("Tipo de equipo creado con éxito:", response.data);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(`[TipoEquipoService] Error al crear tipo de equipo: ${error.message}`, error.response?.data);
        } else {
            console.error("[TipoEquipoService] Error inesperado al crear tipo de equipo:", error);
        }
        throw error;
    }
};

/**
 * Actualiza un tipo de equipo existente.
 * @param idTipoEquipo El ID del tipo de equipo a actualizar.
 * @param updatedTipoEquipo Los datos del tipo de equipo con las modificaciones.
 * @returns Una promesa que resuelve con el objeto TipoEquipo actualizado.
 */
export const updateTipoEquipo = async (idTipoEquipo: number, updatedTipoEquipo: TipoEquipoRequest): Promise<TipoEquipo> => {
    const path = buildApiUrlPathTipoEquipo(PerfilesEndpoints.TIPOSEQUIPO, `${idTipoEquipo}`);
    try {
        const response = await perfilesClient.put<TipoEquipo>(path, updatedTipoEquipo);
        console.log(`Tipo de equipo ID ${idTipoEquipo} actualizado con éxito.`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(`[TipoEquipoService] Error al actualizar tipo de equipo ID ${idTipoEquipo}: ${error.message}`, error.response?.data);
        }
        throw error;
    }
};