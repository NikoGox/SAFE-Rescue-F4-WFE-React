// src/services/DireccionService.ts
import axios, { AxiosError } from 'axios';
import { geolocalizacionClient, GeolocalizacionEndpoints, type GeolocalizacionEndpointsType } from '../../clients/GeolocalizacionClient.tsx';
import { type Direccion, type DireccionRequest } from '../../../types/GeolocalizacionType.ts';
// Asumiendo que existe un tipo Direccion y DireccionRequest

/**
 * Función de utilidad para construir el path completo del recurso.
 * @param resource El recurso principal (ej: GeolocalizacionEndpoints.DIRECCIONES).
 * @param pathAdicional Un path opcional que se añade al final (ej: '/123').
 * @returns El path relativo completo (ej: '/direcciones/123').
 */
const buildApiUrlPathDireccion = (resource: GeolocalizacionEndpointsType, pathAdicional: string = ''): string => {
    // Lógica para asegurar la unión correcta del path
    const cleanPathAdicional = pathAdicional.startsWith('/') || pathAdicional === '' ? pathAdicional : `/${pathAdicional}`;
    return `${resource}${cleanPathAdicional}`;
}

// --------------------------------------------------------------------------------
// FUNCIONES DEL SERVICIO DE DIRECCIONES
// --------------------------------------------------------------------------------

/**
 * Obtiene la información de una dirección específica por su ID.
 * @param idDireccion El ID de la dirección a buscar.
 * @returns Una promesa que resuelve con el objeto Direccion.
 */
export const getDireccionById = async (idDireccion: number): Promise<Direccion> => {
    const path = buildApiUrlPathDireccion(GeolocalizacionEndpoints.DIRECCIONES, `${idDireccion}`);
    try {
        const response = await geolocalizacionClient.get<Direccion>(path);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            console.warn(`[DireccionService] Dirección con ID ${idDireccion} no encontrada.`);
        } else if (axios.isAxiosError(error)) {
            console.error(`[DireccionService] Error al obtener dirección ID ${idDireccion}: ${error.message}`, error.response?.data);
        }
        throw error;
    }
}

/**
 * Crea una nueva dirección.
 * @param newDireccion Los datos de la nueva dirección (ej: calle, número, comuna_id).
 * @returns Una promesa que resuelve con el objeto Direccion creado.
 */
export const createDireccion = async (newDireccion: DireccionRequest): Promise<Direccion> => {
    const path = buildApiUrlPathDireccion(GeolocalizacionEndpoints.DIRECCIONES);
    try {
        // Usamos POST para crear un nuevo recurso
        const response = await geolocalizacionClient.post<Direccion>(path, newDireccion);
        console.log("Dirección creada con éxito:", response.data);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            // Manejo de errores 400 (Bad Request) o 422 (Unprocessable Entity) comunes en POST/PUT
            console.error(`[DireccionService] Error al crear dirección: ${error.message}`, error.response?.data);
        } else {
            console.error("[DireccionService] Error inesperado al crear dirección:", error);
        }
        throw error;
    }
}

/**
 * Actualiza una dirección existente.
 * @param idDireccion El ID de la dirección a actualizar.
 * @param updatedDireccion Los datos de la dirección con las modificaciones.
 * @returns Una promesa que resuelve con el objeto Direccion actualizado.
 */
export const updateDireccion = async (idDireccion: number, updatedDireccion: DireccionRequest): Promise<Direccion> => {
    const path = buildApiUrlPathDireccion(GeolocalizacionEndpoints.DIRECCIONES, `${idDireccion}`);
    try {
        // Usamos PUT o PATCH para actualizar un recurso
        const response = await geolocalizacionClient.put<Direccion>(path, updatedDireccion);
        console.log(`Dirección ID ${idDireccion} actualizada con éxito:`, response.data);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(`[DireccionService] Error al actualizar dirección ID ${idDireccion}: ${error.message}`, error.response?.data);
        }
        throw error;
    }
}