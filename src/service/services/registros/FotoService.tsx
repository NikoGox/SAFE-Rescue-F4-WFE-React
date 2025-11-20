// src/services/FotoService.ts

import { type Foto } from '../../../types/RegistrosType.ts';
import { registroClient, buildApiUrlPath, RegistroEndpoints } from '../../clients/RegistrosClient.tsx';

// Interface para errores de Axios
interface AxiosErrorWithResponse extends Error {
    response?: {
        status: number;
        data?: unknown;
    };
}

/**
 * Verifica si el error es un AxiosError con response
 */
const isAxiosErrorWithResponse = (error: unknown): error is AxiosErrorWithResponse => {
    return error instanceof Error && 'response' in error;
};

/**
 * Gestiona las operaciones CRUD para la entidad Foto.
 * Basado en el controlador Spring Boot del backend.
 */
export const FotoService = {

    /**
     * Obtiene todas las fotos registradas en el sistema.
     * Endpoint: GET /api-registros/v1/fotos
     * 
     * @returns Promesa que resuelve con la lista de fotos o array vacío si no hay contenido
     */
    getAllFotos: async (): Promise<Foto[]> => {
        try {
            const response = await registroClient.get<Foto[]>(
                buildApiUrlPath(RegistroEndpoints.FOTOS)
            );
            return response.data;
        } catch (error: unknown) {
            if (isAxiosErrorWithResponse(error) && error.response?.status === 204) {
                // El backend devuelve 204 NO_CONTENT cuando no hay fotos
                return [];
            }
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido al obtener fotos';
            console.error('[FotoService] Error al obtener todas las fotos:', errorMessage);
            throw new Error(errorMessage);
        }
    },

    /**
     * Busca una foto por su ID.
     * Endpoint: GET /api-registros/v1/fotos/{id}
     *
     * @param id El ID de la foto.
     * @returns Promesa que resuelve con la Foto encontrada.
     */
    getFotoById: async (id: number): Promise<Foto> => {
        try {
            const response = await registroClient.get<Foto>(
                buildApiUrlPath(RegistroEndpoints.FOTOS, `/${id}`)
            );
            console.log(`Foto ID ${id} cargada.`);
            return response.data;
        } catch (error: unknown) {
            if (isAxiosErrorWithResponse(error) && error.response?.status === 404) {
                throw new Error(`Foto con ID ${id} no encontrada.`);
            }
            const errorMessage = error instanceof Error ? error.message : `Error desconocido al obtener foto ${id}`;
            throw new Error(errorMessage);
        }
    },

    /**
     * Crea una nueva foto.
     * Endpoint: POST /api-registros/v1/fotos
     *
     * @param fotoData Los datos de la foto a crear (sin idFoto).
     * @returns Promesa que resuelve con el objeto Foto creado (incluyendo idFoto generado).
     */
    createFoto: async (fotoData: Omit<Foto, 'idFoto'>): Promise<Foto> => {
        try {
            const response = await registroClient.post<Foto>(
                buildApiUrlPath(RegistroEndpoints.FOTOS),
                fotoData
            );
            
            console.log("Foto creada con éxito. ID:", response.data.idFoto);
            return response.data;
            
        } catch (error: unknown) {
            if (isAxiosErrorWithResponse(error)) {
                console.error(`[FotoService] Error al crear foto: ${error.message}`, error.response?.data);
                
                if (error.response?.data) {
                    const errorMessage = typeof error.response.data === 'string' 
                        ? error.response.data 
                        : 'Error al crear la foto';
                    throw new Error(errorMessage);
                }
            }
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido al crear foto';
            throw new Error(errorMessage);
        }
    },

    /**
     * Actualiza una foto existente.
     * Endpoint: PUT /api-registros/v1/fotos/{id}
     *
     * @param id ID de la foto a actualizar.
     * @param fotoData Datos actualizados de la foto.
     * @returns Promesa que resuelve con mensaje de confirmación.
     */
    updateFoto: async (id: number, fotoData: Partial<Foto>): Promise<string> => {
        try {
            const response = await registroClient.put<string>(
                buildApiUrlPath(RegistroEndpoints.FOTOS, `/${id}`),
                fotoData
            );
            console.log(`Foto ID ${id} actualizada.`);
            return response.data; // "Foto actualizada con éxito."
        } catch (error: unknown) {
            if (isAxiosErrorWithResponse(error)) {
                if (error.response?.status === 404) {
                    throw new Error(`Foto con ID ${id} no encontrada.`);
                }
                if (error.response?.data) {
                    const errorMessage = typeof error.response.data === 'string'
                        ? error.response.data
                        : 'Error al actualizar la foto';
                    throw new Error(errorMessage);
                }
            }
            const errorMessage = error instanceof Error ? error.message : `Error desconocido al actualizar foto ${id}`;
            throw new Error(errorMessage);
        }
    },

    /**
     * Elimina una foto del sistema.
     * Endpoint: DELETE /api-registros/v1/fotos/{id}
     *
     * @param id ID de la foto a eliminar.
     * @returns Promesa que resuelve con mensaje de confirmación.
     */
    deleteFoto: async (id: number): Promise<string> => {
        try {
            const response = await registroClient.delete<string>(
                buildApiUrlPath(RegistroEndpoints.FOTOS, `/${id}`)
            );
            console.log(`Foto ID ${id} eliminada.`);
            return response.data; // "Foto eliminada con éxito."
        } catch (error: unknown) {
            if (isAxiosErrorWithResponse(error)) {
                if (error.response?.status === 404) {
                    throw new Error(`Foto con ID ${id} no encontrada.`);
                }
                if (error.response?.data) {
                    const errorMessage = typeof error.response.data === 'string'
                        ? error.response.data
                        : 'Error al eliminar la foto';
                    throw new Error(errorMessage);
                }
            }
            const errorMessage = error instanceof Error ? error.message : `Error desconocido al eliminar foto ${id}`;
            throw new Error(errorMessage);
        }
    },

    /**
     * Subir archivo de imagen y crear registro de foto
     * @param archivo Archivo de imagen a subir
     * @param descripcion Descripción opcional de la foto
     * @returns Promesa que resuelve con la Foto creada
     */
    subirFoto: async (archivo: File, descripcion?: string): Promise<Foto> => {
        try {
            const formData = new FormData();
            formData.append('archivo', archivo);
            if (descripcion) {
                formData.append('descripcion', descripcion);
            }

            const response = await registroClient.post<Foto>(
                buildApiUrlPath(RegistroEndpoints.FOTOS, '/subir'),
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            
            console.log("Foto subida con éxito. ID:", response.data.idFoto);
            return response.data;
            
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido al subir foto';
            console.error('[FotoService] Error al subir foto:', errorMessage);
            throw new Error(errorMessage);
        }
    }
};