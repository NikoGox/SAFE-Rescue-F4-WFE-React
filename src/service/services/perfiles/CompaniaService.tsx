// src/services/CompaniaService.ts
import axios from 'axios';
// Asume que tienes un cliente para el microservicio de Perfiles
import { perfilesClient, PerfilesEndpoints, type PerfilesEndpointsType } from '../../clients/PerfilesClient.tsx'; 
import { type Compania, type CompaniaRequest } from '../../../types/PerfilesType.ts'; 

/**
 * Función de utilidad para construir el path completo del recurso.
 * @param resource El recurso principal (ej: PerfilEndpoints.COMPANIA).
 * @param pathAdicional Un path opcional que se añade al final (ej: '/123').
 * @returns El path relativo completo (ej: '/companias/123').
 */
const buildApiUrlPathCompania = (resource: PerfilesEndpointsType, pathAdicional: string = ''): string => {
    // Lógica para asegurar la unión correcta del path
    const cleanPathAdicional = pathAdicional.startsWith('/') || pathAdicional === '' ? pathAdicional : `/${pathAdicional}`;
    return `${resource}${cleanPathAdicional}`;
}

// --------------------------------------------------------------------------------
// FUNCIONES DEL SERVICIO DE COMPAÑÍAS
// --------------------------------------------------------------------------------

/**
 * Obtiene una compañía específica por su ID.
 * @param idCompania El ID de la compañía a buscar.
 * @returns Una promesa que resuelve con el objeto Compania.
 */
export const getCompaniaById = async (idCompania: number): Promise<Compania> => {
    const path = buildApiUrlPathCompania(PerfilesEndpoints.COMPANIAS, `${idCompania}`);
    try {
        const response = await perfilesClient.get<Compania>(path);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            console.warn(`[CompaniaService] Compañía con ID ${idCompania} no encontrada.`);
        } else if (axios.isAxiosError(error)) {
            console.error(`[CompaniaService] Error al obtener compañía ID ${idCompania}: ${error.message}`, error.response?.data);
        }
        throw error;
    }
};

/**
 * Crea una nueva compañía.
 * @param newCompania Los datos de la nueva compañía.
 * @returns Una promesa que resuelve con el objeto Compania creado.
 */
export const createCompania = async (newCompania: CompaniaRequest): Promise<Compania> => {
    const path = buildApiUrlPathCompania(PerfilesEndpoints.COMPANIAS);
    try {
        const response = await perfilesClient.post<Compania>(path, newCompania);
        console.log("Compañía creada con éxito:", response.data);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(`[CompaniaService] Error al crear compañía: ${error.message}`, error.response?.data);
        } else {
            console.error("[CompaniaService] Error inesperado al crear compañía:", error);
        }
        throw error;
    }
};

/**
 * Actualiza una compañía existente.
 * @param idCompania El ID de la compañía a actualizar.
 * @param updatedCompania Los datos de la compañía con las modificaciones.
 * @returns Una promesa que resuelve con el objeto Compania actualizado.
 */
export const updateCompania = async (idCompania: number, updatedCompania: CompaniaRequest): Promise<Compania> => {
    const path = buildApiUrlPathCompania(PerfilesEndpoints.COMPANIAS, `${idCompania}`);
    try {
        const response = await perfilesClient.put<Compania>(path, updatedCompania); // O PATCH, dependiendo de tu API
        console.log(`Compañía ID ${idCompania} actualizada con éxito.`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(`[CompaniaService] Error al actualizar compañía ID ${idCompania}: ${error.message}`, error.response?.data);
        }
        throw error;
    }
};

/**
 * Elimina una compañía por su ID.
 * @param idCompania El ID de la compañía a eliminar.
 * @returns Una promesa que resuelve cuando la eliminación es exitosa (void).
 */
export const deleteCompania = async (idCompania: number): Promise<void> => {
    const path = buildApiUrlPathCompania(PerfilesEndpoints.COMPANIAS, `${idCompania}`);
    try {
        await perfilesClient.delete(path);
        console.log(`Compañía ID ${idCompania} eliminada con éxito.`);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(`[CompaniaService] Error al eliminar compañía ID ${idCompania}: ${error.message}`, error.response?.data);
        }
        throw error;
    }
};