// src/service/services/incidentes/FotoService.tsx
import { type Foto } from '../../../types/RegistrosType';
import { registroClient, buildApiUrlPath, RegistroEndpoints } from '../../clients/RegistrosClient';

export const FotoService = {
    /**
     * Subir archivo de imagen y crear registro de foto
     * @param archivo Archivo de imagen a subir
     * @param descripcion Descripción opcional de la foto
     * @returns Promesa que resuelve con la Foto creada
     */
    subirFoto: async (archivo: File, descripcion?: string): Promise<Foto> => {
        try {
            const formData = new FormData();
            // CORRECCIÓN: Usar 'file' en lugar de 'archivo' para que coincida con el backend
            formData.append('file', archivo);
            
            // El backend no espera el parámetro 'descripcion' en el FormData para el upload
            // Si necesitas enviar descripción, deberías agregarlo como otro campo
            // formData.append('descripcion', descripcion || 'Imagen de incidente');

            console.log('Subiendo foto al endpoint /upload...', {
                nombre: archivo.name,
                tipo: archivo.type,
                tamaño: archivo.size,
                parametro: 'file' // ← Este es el cambio importante
            });

            const response = await registroClient.post<Foto>(
                buildApiUrlPath(RegistroEndpoints.FOTOS, '/upload'),
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            
            console.log("✅ Foto subida con éxito. ID:", response.data.idFoto);
            console.log("📁 URL de la foto:", response.data.url);
            return response.data;
            
        } catch (error: any) {
            console.error('[FotoService] Error al subir foto:', error);
            
            // Log más detallado del error
            if (error.response) {
                console.error('📡 Respuesta del servidor:', {
                    status: error.response.status,
                    data: error.response.data,
                    headers: error.response.headers
                });
            }
            
            const errorMessage = error.response?.data?.message || 
                               error.response?.data || 
                               error.message || 
                               'Error desconocido al subir foto';
            throw new Error(errorMessage);
        }
    },

    /**
     * Crear foto con metadatos (sin subir archivo)
     */
    crearFoto: async (fotoData: Omit<Foto, 'idFoto'>): Promise<Foto> => {
        try {
            const response = await registroClient.post<Foto>(
                buildApiUrlPath(RegistroEndpoints.FOTOS),
                fotoData
            );
            
            console.log("Foto creada con metadatos. ID:", response.data.idFoto);
            return response.data;
            
        } catch (error: any) {
            console.error('[FotoService] Error al crear foto:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Error al crear foto';
            throw new Error(errorMessage);
        }
    },

    // ... otros métodos (getAllFotos, getFotoById, etc.)
};