// src/services/ParticipanteConvService.ts

import axios, { type AxiosResponse } from 'axios';
import { type ParticipanteConvResponse, type ParticipanteConvCreationDTO } from '../../../types/ComunicacionType'; 
// Usamos el cliente configurado para el microservicio de Comunicación
import { comunicacionesClient } from '../../clients/ComunicacionClient'; 

const API_BASE = '/api/v1'; 
// El endpoint base apunta a las conversaciones, y luego a sus participantes
const ENDPOINT_CONVERSACIONES = `${API_BASE}/conversaciones`; 

/**
 * Gestiona la lista de participantes dentro de una conversación específica.
 */
export const ParticipanteConvService = {

    /**
     * Obtiene todos los participantes activos de una conversación.
     * Endpoint asumido: GET /api/v1/conversaciones/{idConversacion}/participantes
     *
     * @param idConversacion El ID de la conversación/hilo.
     * @returns Promesa que resuelve con una lista de ParticipanteConvResponse.
     */
    getParticipantesByConvId: async (idConversacion: number): Promise<ParticipanteConvResponse[]> => {
        const path = `${ENDPOINT_CONVERSACIONES}/${idConversacion}/participantes`;
        
        try {
            const response: AxiosResponse<ParticipanteConvResponse[]> = await comunicacionesClient.get(path);
            
            console.log(`Participantes cargados para la conversación ID ${idConversacion}.`);
            return response.data;
            
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error(`[ParticipanteConvService] Error al obtener participantes para conv ID ${idConversacion}: ${error.message}`, error.response?.data);
            }
            throw error; // Propagar el error
        }
    },
    
    /**
     * Agrega un nuevo usuario a la conversación como participante.
     * Endpoint asumido: POST /api/v1/conversaciones/{idConversacion}/participantes
     *
     * @param idConversacion El ID de la conversación.
     * @param participanteData El DTO con el ID del usuario a agregar.
     * @returns Promesa que resuelve con el registro de ParticipanteConvResponse creado.
     */
    addParticipante: async (idConversacion: number, participanteData: ParticipanteConvCreationDTO): Promise<ParticipanteConvResponse> => {
        const path = `${ENDPOINT_CONVERSACIONES}/${idConversacion}/participantes`;
        
        try {
            const response: AxiosResponse<ParticipanteConvResponse> = await comunicacionesClient.post(path, participanteData);
            
            console.log(`Usuario ${participanteData.idUsuario} añadido a la conversación ${idConversacion}.`);
            return response.data;
            
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error(`[ParticipanteConvService] Error al añadir participante: ${error.message}`, error.response?.data);
            }
            throw error;
        }
    },
    
    /**
     * Elimina (o marca como inactivo) un participante de la conversación.
     * Endpoint asumido: DELETE /api/v1/conversaciones/{idConversacion}/participantes/{idUsuario}
     *
     * @param idConversacion El ID de la conversación.
     * @param idUsuario El ID del usuario a eliminar.
     * @returns Promesa que se resuelve al completar la acción.
     */
    removeParticipante: async (idConversacion: number, idUsuario: number): Promise<void> => {
        // Nota: Depende de la implementación del backend si esto hace un DELETE o un PATCH (marcar estaActivo=false)
        const path = `${ENDPOINT_CONVERSACIONES}/${idConversacion}/participantes/${idUsuario}`;
        
        try {
            await comunicacionesClient.delete(path);
            console.log(`Usuario ${idUsuario} eliminado de la conversación ${idConversacion}.`);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error(`[ParticipanteConvService] Error al eliminar participante: ${error.message}`, error.response?.data);
            }
            throw error;
        }
    }
};