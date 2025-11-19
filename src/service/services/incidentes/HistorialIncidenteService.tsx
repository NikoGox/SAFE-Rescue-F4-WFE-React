// src/services/HistorialIncidenteService.ts

import axios, { type AxiosResponse } from 'axios';
import { type HistorialIncidenteResponse } from '../../../types/IncidenteType';  
// Reutilizamos el cliente de Axios configurado para el microservicio de Incidentes
import { incidentesClient } from '../../clients/IncidentesClient'; 

const API_BASE = '/api/v1'; 
// Asumo un endpoint para obtener el historial de un incidente específico
const ENDPOINT_HISTORIAL = `${API_BASE}/incidentes`; 

/**
 * Gestiona la consulta de Historiales de Incidentes. 
 * La creación de historial es generalmente gestionada por el backend al actualizar un incidente.
 */
export const HistorialIncidenteService = {

    /**
     * Obtiene todos los registros de historial para un incidente específico.
     * Endpoint asumido: GET /api/v1/incidentes/{idIncidente}/historial
     *
     * @param idIncidente El ID del incidente del cual se quiere obtener el historial.
     * @returns Promesa que resuelve con una lista de HistorialIncidenteResponse.
     */
    getHistoryByIncidenteId: async (idIncidente: number): Promise<HistorialIncidenteResponse[]> => {
        // Construye la ruta específica para el historial de un incidente
        const path = `${ENDPOINT_HISTORIAL}/${idIncidente}/historial`; 
        
        try {
            const response: AxiosResponse<HistorialIncidenteResponse[]> = await incidentesClient.get(path);
            
            console.log(`Historial cargado para el incidente ID ${idIncidente}.`);
            return response.data;
            
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error(`[HistorialIncidenteService] Error al obtener historial para ID ${idIncidente}: ${error.message}`, error.response?.data);
            }
            throw error; // Propagar el error
        }
    },
    
    // Si se necesitara un endpoint para registrar comentarios específicos desde el frontend:
    
    /**
     * Registra un comentario o nota en el historial de un incidente.
     * Endpoint asumido: POST /api/v1/incidentes/{idIncidente}/historial/comentario
     *
     * @param idIncidente El ID del incidente.
     * @param comentario El texto del comentario a registrar.
     * @param idUsuario El ID del usuario que registra el comentario.
     * @returns Promesa que resuelve con el nuevo registro de historial creado.
     */
    addComentarioToHistory: async (idIncidente: number, comentario: string, idUsuario: number): Promise<HistorialIncidenteResponse> => {
        const path = `${ENDPOINT_HISTORIAL}/${idIncidente}/historial/comentario`;
        
        const payload = {
            detalle: comentario,
            idUsuario: idUsuario,
            accion: 'COMENTARIO' // Para diferenciarlo de otros registros automáticos
        };
        
        try {
            // El backend recibe el payload y crea el registro de historial
            const response: AxiosResponse<HistorialIncidenteResponse> = await incidentesClient.post(path, payload);
            console.log(`Comentario añadido al incidente ID ${idIncidente}.`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error(`[HistorialIncidenteService] Error al añadir comentario al incidente ${idIncidente}: ${error.message}`, error.response?.data);
            }
            throw error;
        }
    }
};