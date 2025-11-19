// src/services/UserService.ts
import axios from 'axios';
// Usamos los nombres corregidos: perfilesClient, PerfilesEndpoints, PerfilesEndpointsType
import { perfilesClient, PerfilesEndpoints, type PerfilesEndpointsType } from '../../clients/PerfilesClient.tsx'; 
import { 
    type UserData, 
    type UserUpdateRequest, // Asumimos esta interfaz para el body de PUT/PATCH
    type UserRegistroType // Para operaciones de alta o registro si la API lo permite
} from '../../../types/PerfilesType.ts'; 

/**
 * Función de utilidad para construir el path completo del recurso.
 * @param resource El recurso principal (ej: PerfilesEndpoints.USUARIOS).
 * @param pathAdicional Un path opcional que se añade al final (ej: '/123' o '/me').
 * @returns El path relativo completo (ej: '/usuarios/123').
 */
const buildApiUrlPathUsuario = (resource: PerfilesEndpointsType, pathAdicional: string = ''): string => {
    // Lógica para asegurar la unión correcta del path
    const cleanPathAdicional = pathAdicional.startsWith('/') || pathAdicional === '' ? pathAdicional : `/${pathAdicional}`;
    return `${resource}${cleanPathAdicional}`;
}

// --------------------------------------------------------------------------------
// FUNCIONES DEL SERVICIO DE USUARIOS
// --------------------------------------------------------------------------------

/**
 * Obtiene el perfil completo del usuario actualmente autenticado (endpoint /me).
 * @returns Una promesa que resuelve con el objeto UserData del usuario logueado.
 */
export const getLoggedInUserPerfil = async (): Promise<UserData> => {
    // Asumimos que el endpoint para el usuario actual es 'USUARIOS/me' o similar
    const path = buildApiUrlPathUsuario(PerfilesEndpoints.USUARIOS, '/me'); 
    try {
        const response = await perfilesClient.get<UserData>(path);
        console.log("Perfil del usuario autenticado obtenido con éxito.");
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
             console.warn(`[UserService] El usuario no está autenticado o la sesión ha expirado.`);
        } else if (axios.isAxiosError(error)) {
            console.error(`[UserService] Error al obtener perfil de usuario: ${error.message}`, error.response?.data);
        } else {
            console.error("[UserService] Error inesperado al obtener perfil de usuario:", error);
        }
        throw error;
    }
};

/**
 * Obtiene el perfil de un usuario específico por su ID.
 * Útil para paneles de administración o vistas de equipo.
 * @param userId El ID del usuario a buscar.
 * @returns Una promesa que resuelve con el objeto UserData.
 */
export const getUserById = async (userId: number): Promise<UserData> => {
    const path = buildApiUrlPathUsuario(PerfilesEndpoints.USUARIOS, `${userId}`);
    try {
        const response = await perfilesClient.get<UserData>(path);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            console.warn(`[UserService] Usuario con ID ${userId} no encontrado.`);
        } else if (axios.isAxiosError(error)) {
            console.error(`[UserService] Error al obtener usuario ID ${userId}: ${error.message}`, error.response?.data);
        }
        throw error;
    }
};


/**
 * Actualiza el perfil del usuario actualmente autenticado.
 * @param updatedData Los datos a actualizar (ej: nombre, email, teléfono, detalles de dirección).
 * @returns Una promesa que resuelve con el objeto UserData actualizado.
 */
export const updateUserPerfil = async (updatedData: UserUpdateRequest): Promise<UserData> => {
    // Asumimos que la actualización se hace sobre el endpoint /me
    const path = buildApiUrlPathUsuario(PerfilesEndpoints.USUARIOS, '/me');
    try {
        const response = await perfilesClient.put<UserData>(path, updatedData);
        console.log("Perfil del usuario actualizado con éxito.", response.data.nombreUsuario);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(`[UserService] Error al actualizar el perfil: ${error.message}`, error.response?.data);
        }
        throw error;
    }
};

/**
 * Elimina un usuario por su ID (función de administración).
 * @param userId El ID del usuario a eliminar.
 * @returns Una promesa que resuelve cuando la eliminación es exitosa (void).
 */
export const deleteUser = async (userId: number): Promise<void> => {
    const path = buildApiUrlPathUsuario(PerfilesEndpoints.USUARIOS, `${userId}`);
    try {
        await perfilesClient.delete(path);
        console.log(`Usuario ID ${userId} eliminado con éxito.`);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(`[UserService] Error al eliminar usuario ID ${userId}: ${error.message}`, error.response?.data);
        }
        throw error;
    }
};