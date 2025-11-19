// src/services/IncidenteService.ts

import axios, { type AxiosResponse } from 'axios';
import { 
    type IncidenteResponse,
    type IncidenteCreationDTO,
    type IncidenteUpdateDTO,
} from '../../../types/IncidenteType'; 

// ⭐ Asegúrate de que este cliente apunte al microservicio de INCIDENTES
import { incidentesClient } from '../../clients/IncidentesClient'; 

const API_BASE = '/api/v1'; 
const ENDPOINT_INCIDENTES = `${API_BASE}/incidentes`; 

/**
 * Gestiona las operaciones CRUD para los registros de Incidentes.
 */
export const IncidenteService = {

    /**
     * Obtiene una lista completa de todos los incidentes.
     * Endpoint asumido: GET /api/v1/incidentes
     *
     * @returns Promesa que resuelve con una lista de IncidenteResponse.
     */
    getAllIncidentes: async (): Promise<IncidenteResponse[]> => {
        try {
            const response: AxiosResponse<IncidenteResponse[]> = await incidentesClient.get(ENDPOINT_INCIDENTES);
            console.log("Todos los incidentes cargados.");
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error(`[IncidenteService] Error al obtener incidentes: ${error.message}`, error.response?.data);
            }
            throw error;
        }
    },
    
    /**
     * Obtiene los detalles de un incidente específico por su ID.
     * Endpoint asumido: GET /api/v1/incidentes/{id}
     *
     * @param id El ID del incidente.
     * @returns Promesa que resuelve con los detalles del IncidenteResponse.
     */
    getIncidenteById: async (id: number): Promise<IncidenteResponse> => {
        const path = `${ENDPOINT_INCIDENTES}/${id}`;
        
        try {
            const response: AxiosResponse<IncidenteResponse> = await incidentesClient.get(path);
            console.log(`Incidente ID ${id} cargado.`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                throw new Error(`Incidente con ID ${id} no encontrado.`);
            }
            throw error;
        }
    },

    /**
     * Crea un nuevo incidente.
     * Endpoint asumido: POST /api/v1/incidentes
     *
     * @param incidenteData El DTO con los datos para crear el incidente.
     * @returns Promesa que resuelve con el IncidenteResponse del incidente recién creado.
     */
    createIncidente: async (incidenteData: IncidenteCreationDTO): Promise<IncidenteResponse> => {
        try {
            const response: AxiosResponse<IncidenteResponse> = await incidentesClient.post(
                ENDPOINT_INCIDENTES, 
                incidenteData
            );
            console.log("Incidente creado con éxito.");
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error(`[IncidenteService] Error al crear incidente: ${error.message}`, error.response?.data);
            }
            throw error;
        }
    },

    /**
     * Actualiza un incidente existente.
     * Endpoint asumido: PUT /api/v1/incidentes/{id}
     *
     * @param id El ID del incidente a actualizar.
     * @param updateData El DTO con los datos a modificar.
     * @returns Promesa que resuelve con el IncidenteResponse actualizado.
     */
    updateIncidente: async (id: number, updateData: IncidenteUpdateDTO): Promise<IncidenteResponse> => {
        const path = `${ENDPOINT_INCIDENTES}/${id}`;

        try {
            const response: AxiosResponse<IncidenteResponse> = await incidentesClient.put(
                path, 
                updateData
            );
            console.log(`Incidente ID ${id} actualizado.`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error(`[IncidenteService] Error al actualizar incidente ${id}: ${error.message}`, error.response?.data);
            }
            throw error;
        }
    },

    /**
     * Elimina un incidente específico por su ID.
     * Endpoint asumido: DELETE /api/v1/incidentes/{id}
     *
     * @param id El ID del incidente a eliminar.
     * @returns Promesa que se resuelve al completar la eliminación.
     */
    deleteIncidente: async (id: number): Promise<void> => {
        const path = `${ENDPOINT_INCIDENTES}/${id}`;
        
        try {
            await incidentesClient.delete(path);
            console.log(`Incidente ID ${id} eliminado.`);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error(`[IncidenteService] Error al eliminar incidente ${id}: ${error.message}`, error.response?.data);
            }
            throw error;
        }
    }
};