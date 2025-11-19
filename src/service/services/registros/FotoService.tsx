// src/services/FotoService.ts

import axios, { type AxiosResponse } from 'axios';
// Importamos la interfaz Foto ajustada
import { type Foto } from '../../../types/RegistrosType.ts';
import { registroClient } from '../../clients/RegistrosClient.tsx';

const API_BASE = '/api-registros/v1'; 
const ENDPOINT_FOTOS = `${API_BASE}/fotos`; 

/**
 * Gestiona las operaciones CRUD para la entidad Foto.
 */
export const FotoService = {

    /**
     * Sube y registra una nueva foto.
     * Endpoint asumido: POST /api-registros/v1/fotos
     *
     * @param fotoData Los metadatos de la foto (URL, descripción, etc.).
     * @returns Promesa que resuelve con el objeto Foto recién creado (incluyendo el idFoto).
     */
    uploadFoto: async (fotoData: Omit<Foto, 'idFoto' | 'fechaSubida'>): Promise<Foto> => {
        try {
            // Nota: Aquí estamos asumiendo que el campo 'fechaSubida' lo genera el backend.
            // La petición POST recibe los datos necesarios (url, descripcion)
            const response: AxiosResponse<Foto> = await registroClient.post(
                ENDPOINT_FOTOS, 
                fotoData // { url: '...', descripcion: '...' }
            );
            
            console.log("Foto subida y registrada con éxito. ID:", response.data.idFoto);
            // El backend devuelve directamente el objeto Foto
            return response.data;
            
        } catch (error) {
            if (axios.isAxiosError(error)) {
                // En caso de error (ej: 400 Bad Request, 500 Internal Error)
                console.error(`[FotoService] Error al subir foto: ${error.message}`, error.response?.data);
            }
            throw error;
        }
    },
    
    /**
     * Busca una foto por su ID.
     * Endpoint asumido: GET /api-registros/v1/fotos/{id}
     *
     * @param id El ID de la foto.
     * @returns Promesa que resuelve con la Foto encontrada.
     */
    getFotoById: async (id: number): Promise<Foto> => {
        const path = `${ENDPOINT_FOTOS}/${id}`;
        
        try {
            const response: AxiosResponse<Foto> = await registroClient.get(path);
            
            console.log(`Foto ID ${id} cargada.`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                throw new Error(`Foto con ID ${id} no encontrada.`);
            }
            throw error;
        }
    }
};