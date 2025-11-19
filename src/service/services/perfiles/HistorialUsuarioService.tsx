// src/services/HistorialUsuarioService.ts

import axios, { type AxiosResponse } from 'axios';
// Importamos solo las dependencias necesarias de nuestro sistema
import { perfilesClient } from '../../clients/PerfilesClient.tsx'; 
import { type UserData } from '../../../types/PerfilesType.ts'; 

// ==========================================================
// INTERFACES DE HISTORIAL
// ==========================================================

/**
 * Define la estructura de un registro de historial/auditoría devuelto por el backend.
 * Coincide con la entidad HistorialUsuario de Spring Boot.
 */
export interface HistorialRegistro {
    idRegistro: number;
    timestamp: string; // Fecha y hora del evento
    tipoEvento: string; // Ej: 'LOGIN', 'ACTUALIZACION_PERFIL', 'CAMBIO_ESTADO'
    descripcion: string;
    idUsuarioAfectado: number | null; // Puede ser null si el registro es de un equipo
    idEquipoAfectado: number | null; // Nuevo campo para equipos
    // Asegúrate de que los nombres de las propiedades coincidan con la entidad Java (modelo.HistorialUsuario)
}

// ==========================================================
// SERVICIO DE HISTORIAL
// ==========================================================

// Los endpoints base provienen del controlador: @RequestMapping("/api/v1")
const API_BASE = '/api/v1'; 

/**
 * Gestiona la consulta de registros de historial o actividad de los usuarios y equipos.
 */
export const HistorialUsuarioService = {

    /**
     * Obtiene el historial de actividad para un USUARIO específico.
     * Endpoint: GET /api/v1/usuarios/{idUsuario}/historial
     * @param idUsuario El ID del usuario cuyo historial se desea consultar.
     * @param token El token JWT para la autenticación (opcional si el cliente ya lo maneja).
     * @returns Promesa que resuelve con una lista de registros de historial.
     */
    getHistorialPorUsuario: async (idUsuario: number, token?: string): Promise<HistorialRegistro[]> => {
        const path = `${API_BASE}/usuarios/${idUsuario}/historial`;
        
        try {
            // Se usa perfilesClient que ya debe tener la URL base y manejar las cabeceras
            const response: AxiosResponse<HistorialRegistro[]> = await perfilesClient.get(path, {
                // Si el cliente no maneja el token globalmente, se añade aquí:
                // headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            });
            
            console.log(`Historial de usuario ${idUsuario} recuperado.`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error(`[HistorialService] Error al obtener historial de usuario ${idUsuario}: ${error.message}`, error.response?.data);
            }
            throw error;
        }
    },
    
    /**
     * Obtiene el historial de actividad para un EQUIPO específico.
     * Endpoint: GET /api/v1/equipos/{idEquipo}/historial
     * @param idEquipo El ID del equipo cuyo historial se desea consultar.
     * @param token El token JWT para la autenticación.
     * @returns Promesa que resuelve con una lista de registros de historial.
     */
    getHistorialPorEquipo: async (idEquipo: number, token?: string): Promise<HistorialRegistro[]> => {
        const path = `${API_BASE}/equipos/${idEquipo}/historial`;
        
        try {
            const response: AxiosResponse<HistorialRegistro[]> = await perfilesClient.get(path, {
                // headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            });
            
            console.log(`Historial de equipo ${idEquipo} recuperado.`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error(`[HistorialService] Error al obtener historial de equipo ${idEquipo}: ${error.message}`, error.response?.data);
            }
            throw error;
        }
    },

    /**
     * Obtiene el historial global (solo para usuarios con permisos de administrador/auditoría).
     * Endpoint: GET /api/v1/historial
     * @param token El token JWT para la autenticación.
     * @returns Promesa que resuelve con una lista de registros de historial global.
     */
    getHistorialGlobal: async (token?: string): Promise<HistorialRegistro[]> => {
        const path = `${API_BASE}/historial`;
        
        try {
            const response: AxiosResponse<HistorialRegistro[]> = await perfilesClient.get(path, {
                // headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            });
            
            console.log(`Historial global recuperado.`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error(`[HistorialService] Error al obtener historial global: ${error.message}`, error.response?.data);
            }
            throw error;
        }
    }
};