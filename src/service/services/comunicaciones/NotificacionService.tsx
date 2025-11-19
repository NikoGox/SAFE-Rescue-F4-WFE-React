// src/services/NotificacionService.ts

import axios, { type AxiosResponse } from 'axios';
import { type NotificacionResponse } from '../../../types/ComunicacionType'; 
// Usamos el cliente configurado para el microservicio de Comunicación, que incluye Notificaciones. 
import { comunicacionesClient } from '../../clients/ComunicacionClient'; 

const API_BASE = '/api/v1'; 
const ENDPOINT_NOTIFICACIONES = `${API_BASE}/notificaciones`; 

/**
 * Gestiona la consulta y gestión de Notificaciones del usuario.
 */
export const NotificacionService = {

    /**
     * Obtiene todas las notificaciones (leídas y no leídas) para el usuario actual.
     * Endpoint asumido: GET /api/v1/notificaciones/usuario/{idUsuario}
     *
     * @param idUsuario El ID del usuario cuyas notificaciones se desean obtener.
     * @returns Promesa que resuelve con una lista de NotificacionResponse.
     */
    getNotificationsByUserId: async (idUsuario: number): Promise<NotificacionResponse[]> => {
        const path = `${ENDPOINT_NOTIFICACIONES}/usuario/${idUsuario}`;
        
        try {
            const response: AxiosResponse<NotificacionResponse[]> = await comunicacionesClient.get(path);
            
            console.log(`Notificaciones cargadas para el usuario ID ${idUsuario}.`);
            return response.data;
            
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error(`[NotificacionService] Error al obtener notificaciones: ${error.message}`, error.response?.data);
            }
            throw error; // Propagar el error
        }
    },
    
    /**
     * Marca una notificación específica como leída.
     * Endpoint asumido: PATCH /api/v1/notificaciones/{idNotificacion}/leer
     *
     * @param idNotificacion El ID de la notificación a marcar como leída.
     * @returns Promesa que resuelve con la NotificacionResponse actualizada.
     */
    markAsRead: async (idNotificacion: number): Promise<NotificacionResponse> => {
        const path = `${ENDPOINT_NOTIFICACIONES}/${idNotificacion}/leer`;
        
        try {
            // Usamos PATCH para actualizar el estado 'leida' en el backend
            const response: AxiosResponse<NotificacionResponse> = await comunicacionesClient.patch(path, {});
            
            console.log(`Notificación ID ${idNotificacion} marcada como leída.`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error(`[NotificacionService] Error al marcar como leída la notificación ${idNotificacion}: ${error.message}`, error.response?.data);
            }
            throw error;
        }
    },
    
    /**
     * Marca todas las notificaciones pendientes del usuario como leídas.
     * Endpoint asumido: PATCH /api/v1/notificaciones/usuario/{idUsuario}/leer-todo
     *
     * @param idUsuario El ID del usuario.
     * @returns Promesa que se resuelve al completar la acción.
     */
    markAllAsRead: async (idUsuario: number): Promise<void> => {
        const path = `${ENDPOINT_NOTIFICACIONES}/usuario/${idUsuario}/leer-todo`;
        
        try {
            await comunicacionesClient.patch(path, {});
            console.log(`Todas las notificaciones del usuario ${idUsuario} marcadas como leídas.`);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error(`[NotificacionService] Error al marcar todas como leídas: ${error.message}`, error.response?.data);
            }
            throw error;
        }
    },

    /**
     * Obtiene el conteo de notificaciones no leídas para el usuario actual.
     * Endpoint asumido: GET /api/v1/notificaciones/usuario/{idUsuario}/no-leidas/count
     *
     * @param idUsuario El ID del usuario.
     * @returns Promesa que resuelve con el conteo (número) de notificaciones no leídas.
     */
    getUnreadCount: async (idUsuario: number): Promise<number> => {
        const path = `${ENDPOINT_NOTIFICACIONES}/usuario/${idUsuario}/no-leidas/count`;
        
        try {
            // Se asume que el backend devuelve el conteo como un número plano
            const response: AxiosResponse<number> = await comunicacionesClient.get(path);
            
            console.log(`Conteo de no leídas para ID ${idUsuario}: ${response.data}`);
            return response.data;
            
        } catch (error) {
            if (axios.isAxiosError(error)) {
                // En caso de error de conexión, retornamos 0 para no bloquear la UI.
                console.error(`[NotificacionService] Error al obtener conteo de no leídas: ${error.message}`);
                return 0; 
            }
            throw error;
        }
    }
};