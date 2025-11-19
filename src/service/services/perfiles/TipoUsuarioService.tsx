// src/services/TipoUsuarioService.ts
import axios from 'axios';
// Usamos los nombres corregidos
import { perfilesClient, PerfilesEndpoints, type PerfilesEndpointsType } from '../../clients/PerfilesClient.tsx'; 
import { type TipoUsuario, type TipoUsuarioRequest } from '../../../types/PerfilesType.ts'; 

/**
 * Función de utilidad para construir el path completo del recurso.
 * @param resource El recurso principal (ej: PerfilesEndpoints.TIPOS_USUARIO).
 * @param pathAdicional Un path opcional que se añade al final (ej: '/123').
 * @returns El path relativo completo (ej: '/tipos-usuario/123').
 */
const buildApiUrlPathTipoUsuario = (resource: PerfilesEndpointsType, pathAdicional: string = ''): string => {
    // Lógica para asegurar la unión correcta del path
    const cleanPathAdicional = pathAdicional.startsWith('/') || pathAdicional === '' ? pathAdicional : `/${pathAdicional}`;
    return `${resource}${cleanPathAdicional}`;
}

// --------------------------------------------------------------------------------
// FUNCIONES DEL SERVICIO DE TIPOS DE USUARIO
// --------------------------------------------------------------------------------

/**
 * Obtiene la lista completa de todos los tipos de usuario.
 * @returns Una promesa que resuelve con la lista de objetos TipoUsuario.
 */
export const getAllTiposUsuario = async (): Promise<TipoUsuario[]> => {
    const path = buildApiUrlPathTipoUsuario(PerfilesEndpoints.TIPOSUSUARIO); 
    try {
        const response = await perfilesClient.get<TipoUsuario[]>(path);
        console.log("Tipos de usuario obtenidos con éxito.");
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(`[TipoUsuarioService] Error al obtener tipos de usuario: ${error.message}`, error.response?.data);
        } else {
            console.error("[TipoUsuarioService] Error inesperado al obtener tipos de usuario:", error);
        }
        throw error;
    }
};

/**
 * Obtiene un tipo de usuario específico por su ID.
 * @param idTipoUsuario El ID del tipo de usuario a buscar.
 * @returns Una promesa que resuelve con el objeto TipoUsuario.
 */
export const getTipoUsuarioById = async (idTipoUsuario: number): Promise<TipoUsuario> => {
    const path = buildApiUrlPathTipoUsuario(PerfilesEndpoints.TIPOSUSUARIO, `${idTipoUsuario}`);
    try {
        const response = await perfilesClient.get<TipoUsuario>(path);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            console.warn(`[TipoUsuarioService] Tipo de usuario con ID ${idTipoUsuario} no encontrado.`);
        } else if (axios.isAxiosError(error)) {
            console.error(`[TipoUsuarioService] Error al obtener tipo de usuario ID ${idTipoUsuario}: ${error.message}`, error.response?.data);
        }
        throw error;
    }
};

/**
 * Crea un nuevo tipo de usuario.
 * @param newTipoUsuario Los datos del nuevo tipo de usuario.
 * @returns Una promesa que resuelve con el objeto TipoUsuario creado.
 */
export const createTipoUsuario = async (newTipoUsuario: TipoUsuarioRequest): Promise<TipoUsuario> => {
    const path = buildApiUrlPathTipoUsuario(PerfilesEndpoints.TIPOSUSUARIO);
    try {
        const response = await perfilesClient.post<TipoUsuario>(path, newTipoUsuario);
        console.log("Tipo de usuario creado con éxito:", response.data);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(`[TipoUsuarioService] Error al crear tipo de usuario: ${error.message}`, error.response?.data);
        } else {
            console.error("[TipoUsuarioService] Error inesperado al crear tipo de usuario:", error);
        }
        throw error;
    }
};

/**
 * Actualiza un tipo de usuario existente.
 * @param idTipoUsuario El ID del tipo de usuario a actualizar.
 * @param updatedTipoUsuario Los datos del tipo de usuario con las modificaciones.
 * @returns Una promesa que resuelve con el objeto TipoUsuario actualizado.
 */
export const updateTipoUsuario = async (idTipoUsuario: number, updatedTipoUsuario: TipoUsuarioRequest): Promise<TipoUsuario> => {
    const path = buildApiUrlPathTipoUsuario(PerfilesEndpoints.TIPOSUSUARIO, `${idTipoUsuario}`);
    try {
        const response = await perfilesClient.put<TipoUsuario>(path, updatedTipoUsuario);
        console.log(`Tipo de usuario ID ${idTipoUsuario} actualizado con éxito.`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(`[TipoUsuarioService] Error al actualizar tipo de usuario ID ${idTipoUsuario}: ${error.message}`, error.response?.data);
        }
        throw error;
    }
};