// src/services/MensajeService.ts

import axios, { type AxiosResponse } from 'axios';
import { type MensajeResponse, type MensajeCreationDTO } from '../../../types/ComunicacionType'; 
// Usamos el cliente configurado para el microservicio de Comunicación
import { comunicacionesClient } from '../../clients/ComunicacionClient'; 

const API_BASE = '/api/v1'; 
// El endpoint apunta a los mensajes DENTRO de una conversación
const ENDPOINT_CONVERSACIONES = `${API_BASE}/conversaciones`; 

/**
 * Gestiona la consulta, envío y edición de Mensajes dentro de una Conversación.
 */
export const MensajeService = {

    /**
     * Obtiene el historial de mensajes de una conversación específica, usualmente ordenados por fecha.
     * Endpoint asumido: GET /api/v1/conversaciones/{idConversacion}/mensajes
     *
     * @param idConversacion El ID de la conversación.
     * @returns Promesa que resuelve con una lista de MensajeResponse (historial).
     */
    getMessagesByConvId: async (idConversacion: number): Promise<MensajeResponse[]> => {
        const path = `${ENDPOINT_CONVERSACIONES}/${idConversacion}/mensajes`;
        
        try {
            const response: AxiosResponse<MensajeResponse[]> = await comunicacionesClient.get(path);
            
            console.log(`Mensajes cargados para la conversación ID ${idConversacion}.`);
            return response.data;
            
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error(`[MensajeService] Error al obtener mensajes para conv ID ${idConversacion}: ${error.message}`, error.response?.data);
            }
            throw error; // Propagar el error
        }
    },
    
    /**
     * Envía un nuevo mensaje a la conversación.
     * Endpoint asumido: POST /api/v1/conversaciones/{idConversacion}/mensajes
     *
     * @param data El DTO con el contenido y el emisor.
     * @returns Promesa que resuelve con el MensajeResponse del mensaje enviado.
     */
    sendMessage: async (data: MensajeCreationDTO): Promise<MensajeResponse> => {
        // La ruta utiliza el ID de la conversación, aunque también esté en el payload
        const path = `${ENDPOINT_CONVERSACIONES}/${data.idConversacion}/mensajes`;
        
        try {
            const response: AxiosResponse<MensajeResponse> = await comunicacionesClient.post(path, data);
            
            console.log(`Mensaje enviado a la conversación ${data.idConversacion}.`);
            return response.data;
            
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error(`[MensajeService] Error al enviar mensaje: ${error.message}`, error.response?.data);
            }
            throw error;
        }
    },
    
    /**
     * Edita el contenido de un mensaje existente.
     * Endpoint asumido: PATCH /api/v1/conversaciones/mensajes/{idMensaje}
     *
     * @param idMensaje El ID del mensaje a editar.
     * @param nuevoContenido El nuevo texto del mensaje.
     * @returns Promesa que resuelve con el MensajeResponse actualizado.
     */
    editMessage: async (idMensaje: number, nuevoContenido: string): Promise<MensajeResponse> => {
        // Nota: Asumo que el endpoint de edición es a nivel de mensaje (no de conversación)
        const path = `${API_BASE}/conversaciones/mensajes/${idMensaje}`;
        
        try {
            // Se envía solo el campo a actualizar (contenido)
            const response: AxiosResponse<MensajeResponse> = await comunicacionesClient.patch(
                path, 
                { contenido: nuevoContenido }
            );
            
            console.log(`Mensaje ID ${idMensaje} editado.`);
            return response.data;
            
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error(`[MensajeService] Error al editar mensaje ${idMensaje}: ${error.message}`, error.response?.data);
            }
            throw error;
        }
    }
};