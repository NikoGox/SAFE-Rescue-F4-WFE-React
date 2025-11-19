// src/services/ConversacionService.ts

import axios, { type AxiosResponse } from 'axios';
import { type ConversacionResponse, type ConversacionCreationDTO } from '../../../types/ComunicacionType'; 
// Usamos el cliente configurado para el microservicio de Comunicación
import { comunicacionesClient } from '../../clients/ComunicacionClient'; 

const API_BASE = '/api/v1'; 
const ENDPOINT_CONVERSACIONES = `${API_BASE}/conversaciones`; 

/**
 * Gestiona las operaciones de CRUD para las Conversaciones (hilos de chat/comunicación).
 */
export const ConversacionService = {

    /**
     * Obtiene todas las conversaciones en las que participa un usuario.
     * Endpoint asumido: GET /api/v1/conversaciones/usuario/{idUsuario}
     *
     * @param idUsuario El ID del usuario.
     * @returns Promesa que resuelve con una lista de ConversacionResponse.
     */
    getAllConversacionesByUserId: async (idUsuario: number): Promise<ConversacionResponse[]> => {
        const path = `${ENDPOINT_CONVERSACIONES}/usuario/${idUsuario}`;
        
        try {
            const response: AxiosResponse<ConversacionResponse[]> = await comunicacionesClient.get(path);
            
            console.log(`Conversaciones cargadas para el usuario ID ${idUsuario}.`);
            return response.data;
            
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error(`[ConversacionService] Error al obtener conversaciones del usuario ${idUsuario}: ${error.message}`, error.response?.data);
            }
            throw error; // Propagar el error
        }
    },
    
    /**
     * Obtiene los detalles de una conversación específica por su ID.
     * Endpoint asumido: GET /api/v1/conversaciones/{idConversacion}
     *
     * @param idConversacion El ID de la conversación.
     * @returns Promesa que resuelve con la ConversacionResponse.
     */
    getConversacionById: async (idConversacion: number): Promise<ConversacionResponse> => {
        const path = `${ENDPOINT_CONVERSACIONES}/${idConversacion}`;
        
        try {
            const response: AxiosResponse<ConversacionResponse> = await comunicacionesClient.get(path);
            
            console.log(`Detalles de la conversación ID ${idConversacion} cargados.`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                throw new Error(`Conversación con ID ${idConversacion} no encontrada.`);
            }
            throw error;
        }
    },
    
    /**
     * Crea una nueva conversación (por ejemplo, un nuevo chat entre dos o más usuarios).
     * Endpoint asumido: POST /api/v1/conversaciones
     *
     * @param data El DTO con los datos para crear la conversación.
     * @returns Promesa que resuelve con la ConversacionResponse del hilo recién creado.
     */
    createConversacion: async (data: ConversacionCreationDTO): Promise<ConversacionResponse> => {
        try {
            const response: AxiosResponse<ConversacionResponse> = await comunicacionesClient.post(
                ENDPOINT_CONVERSACIONES, 
                data
            );
            console.log("Conversación creada con éxito.");
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error(`[ConversacionService] Error al crear conversación: ${error.message}`, error.response?.data);
            }
            throw error;
        }
    }

    // Nota: El servicio de ParticipanteConvService ya maneja la adición/eliminación de participantes.
    // La eliminación de la conversación completa puede ser un endpoint futuro si es necesario.
};