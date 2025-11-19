import axios, { type AxiosResponse } from 'axios';
import { type TipoIncidente } from '../../../types/IncidenteType'; 
import { incidentesClient } from '../../clients/IncidentesClient'; 

// URL base de tu API de Incidentes (asumimos que el endpoint es '/tipos')
const API_BASE = '/api/v1'; 
const ENDPOINT_TIPOS = `${API_BASE}/tipos`; 

/**
 * Gestiona las operaciones de consulta y gestión de Tipos de Incidente.
 */
export const TipoIncidenteService = {

    /**
     * Obtiene una lista completa de todos los tipos de incidentes registrados en el sistema.
     * Ideal para llenar selects/dropdowns en formularios.
     * * Endpoint asumido: GET /api/v1/tipos
     *
     * @param token Opcional: El token JWT, si tu cliente no lo inyecta globalmente.
     * @returns Una promesa que resuelve con la lista de TipoIncidente.
     */
    getAllTiposIncidentes: async (token?: string): Promise<TipoIncidente[]> => {
        const path = ENDPOINT_TIPOS;
        
        try {
            const response: AxiosResponse<TipoIncidente[]> = await incidentesClient.get(path, {
                // headers: token ? { 'Authorization': `Bearer ${token}` } : {}, // Solo si es necesario
            });
            
            console.log("Tipos de incidentes cargados con éxito.");
            return response.data;
            
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error(`[TipoIncidenteService] Error al obtener tipos de incidentes: ${error.message}`, error.response?.data);
            }
            throw error; // Propagar el error para que la UI lo maneje
        }
    },
    
    /**
     * Obtiene solo los tipos de incidentes que están marcados como ACTIVO.
     * * Endpoint asumido: GET /api/v1/tipos/activos
     *
     * @param token Opcional: El token JWT.
     * @returns Una promesa que resuelve con la lista de TipoIncidente activos.
     */
    getTiposIncidentesActivos: async (token?: string): Promise<TipoIncidente[]> => {
        const path = `${ENDPOINT_TIPOS}/activos`;
        
        try {
            const response: AxiosResponse<TipoIncidente[]> = await incidentesClient.get(path, {
                // headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            });
            
            console.log("Tipos de incidentes activos cargados.");
            return response.data;
            
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error(`[TipoIncidenteService] Error al obtener tipos activos: ${error.message}`, error.response?.data);
            }
            throw error;
        }
    },
    
    // --- Opcional: Método para administradores ---
    
    /**
     * Obtiene un Tipo de Incidente por su ID.
     * Endpoint asumido: GET /api/v1/tipos/{id}
     */
    getTipoIncidenteById: async (id: number, token?: string): Promise<TipoIncidente> => {
        const path = `${ENDPOINT_TIPOS}/${id}`;
        
        try {
            const response: AxiosResponse<TipoIncidente> = await incidentesClient.get(path);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
    
    // Aquí se añadirían métodos POST/PUT/DELETE si el frontend gestiona la creación o edición.
};