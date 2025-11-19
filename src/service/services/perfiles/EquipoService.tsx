// src/services/EquipoService.ts
import axios from 'axios';
import { perfilesClient, PerfilesEndpoints, type PerfilesEndpointsType } from '../../clients/PerfilesClient.tsx'; 
import { type Equipo, type EquipoRequest } from '../../../types/PerfilesType.ts'; 

/**
 * Función de utilidad para construir el path completo del recurso.
 * @param resource El recurso principal (ej: PerfilEndpoints.EQUIPOS).
 * @param pathAdicional Un path opcional que se añade al final (ej: '/123').
 * @returns El path relativo completo (ej: '/equipos/123').
 */
const buildApiUrlPathEquipo = (resource: PerfilesEndpointsType, pathAdicional: string = ''): string => {
    // Lógica para asegurar la unión correcta del path
    const cleanPathAdicional = pathAdicional.startsWith('/') || pathAdicional === '' ? pathAdicional : `/${pathAdicional}`;
    return `${resource}${cleanPathAdicional}`;
}

// --------------------------------------------------------------------------------
// FUNCIONES DEL SERVICIO DE EQUIPOS
// --------------------------------------------------------------------------------

/**
 * Obtiene la lista completa de todos los equipos.
 * @returns Una promesa que resuelve con la lista de objetos Equipo.
 */
export const getAllEquipos = async (): Promise<Equipo[]> => {
    const path = buildApiUrlPathEquipo(PerfilesEndpoints.EQUIPOS); 
    try {
        const response = await perfilesClient.get<Equipo[]>(path);
        console.log("Equipos obtenidos con éxito.");
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(`[EquipoService] Error al obtener equipos: ${error.message}`, error.response?.data);
        } else {
            console.error("[EquipoService] Error inesperado al obtener equipos:", error);
        }
        throw error;
    }
};

/**
 * Obtiene un equipo específico por su ID.
 * @param idEquipo El ID del equipo a buscar.
 * @returns Una promesa que resuelve con el objeto Equipo.
 */
export const getEquipoById = async (idEquipo: number): Promise<Equipo> => {
    const path = buildApiUrlPathEquipo(PerfilesEndpoints.EQUIPOS, `${idEquipo}`);
    try {
        const response = await perfilesClient.get<Equipo>(path);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            console.warn(`[EquipoService] Equipo con ID ${idEquipo} no encontrado.`);
        } else if (axios.isAxiosError(error)) {
            console.error(`[EquipoService] Error al obtener equipo ID ${idEquipo}: ${error.message}`, error.response?.data);
        }
        throw error;
    }
};

/**
 * Crea un nuevo equipo.
 * @param newEquipo Los datos del nuevo equipo.
 * @returns Una promesa que resuelve con el objeto Equipo creado.
 */
export const createEquipo = async (newEquipo: EquipoRequest): Promise<Equipo> => {
    const path = buildApiUrlPathEquipo(PerfilesEndpoints.EQUIPOS);
    try {
        const response = await perfilesClient.post<Equipo>(path, newEquipo);
        console.log("Equipo creado con éxito:", response.data);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(`[EquipoService] Error al crear equipo: ${error.message}`, error.response?.data);
        } else {
            console.error("[EquipoService] Error inesperado al crear equipo:", error);
        }
        throw error;
    }
};

/**
 * Actualiza un equipo existente.
 * @param idEquipo El ID del equipo a actualizar.
 * @param updatedEquipo Los datos del equipo con las modificaciones.
 * @returns Una promesa que resuelve con el objeto Equipo actualizado.
 */
export const updateEquipo = async (idEquipo: number, updatedEquipo: EquipoRequest): Promise<Equipo> => {
    const path = buildApiUrlPathEquipo(PerfilesEndpoints.EQUIPOS, `${idEquipo}`);
    try {
        const response = await perfilesClient.put<Equipo>(path, updatedEquipo);
        console.log(`Equipo ID ${idEquipo} actualizado con éxito.`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(`[EquipoService] Error al actualizar equipo ID ${idEquipo}: ${error.message}`, error.response?.data);
        }
        throw error;
    }
};