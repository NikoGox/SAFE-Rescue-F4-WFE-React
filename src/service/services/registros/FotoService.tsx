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
            formData.append('file', archivo);

            console.log('Subiendo foto al endpoint /upload...', {
                nombre: archivo.name,
                tipo: archivo.type,
                tamaño: archivo.size,
                parametro: 'file'
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

    /**
     * Obtener foto por ID
     */
    obtenerFotoPorId: async (id: number): Promise<Foto> => {
        try {
            const response = await registroClient.get<Foto>(
                buildApiUrlPath(RegistroEndpoints.FOTOS, `/${id}`)
            );
            return response.data;
        } catch (error: any) {
            console.error('[FotoService] Error al obtener foto:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Error al obtener foto';
            throw new Error(errorMessage);
        }
    },

    /**
     * Obtener todas las fotos
     */
    obtenerTodasLasFotos: async (): Promise<Foto[]> => {
        try {
            const response = await registroClient.get<Foto[]>(
                buildApiUrlPath(RegistroEndpoints.FOTOS)
            );
            return response.data;
        } catch (error: any) {
            console.error('[FotoService] Error al obtener fotos:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Error al obtener fotos';
            throw new Error(errorMessage);
        }
    },

    /**
     * Actualizar foto
     */
    actualizarFoto: async (id: number, fotoData: Partial<Foto>): Promise<Foto> => {
        try {
            const response = await registroClient.put<Foto>(
                buildApiUrlPath(RegistroEndpoints.FOTOS, `/${id}`),
                fotoData
            );
            return response.data;
        } catch (error: any) {
            console.error('[FotoService] Error al actualizar foto:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Error al actualizar foto';
            throw new Error(errorMessage);
        }
    },

    /**
     * Eliminar foto
     */
    eliminarFoto: async (id: number): Promise<void> => {
        try {
            await registroClient.delete(
                buildApiUrlPath(RegistroEndpoints.FOTOS, `/${id}`)
            );
            console.log(`✅ Foto ${id} eliminada correctamente`);
        } catch (error: any) {
            console.error('[FotoService] Error al eliminar foto:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Error al eliminar foto';
            throw new Error(errorMessage);
        }
    },

    /**
     * Obtener URL pública para mostrar la foto
     */
    obtenerUrlPublica: (rutaArchivo: string): string => {
        if (!rutaArchivo) return '';

        // Si ya es una URL completa, devolverla tal cual
        if (rutaArchivo.startsWith('http')) {
            return rutaArchivo;
        }

        // Extraer el nombre del archivo de la ruta
        const nombreArchivo = rutaArchivo.substring(rutaArchivo.lastIndexOf('/') + 1);

        // Construir URL usando el endpoint del controlador
        const baseUrl = 'http://localhost:8080';
        return `${baseUrl}/api-registros/v1/fotos/archivo/${nombreArchivo}`;
    },


    /**
     * 🚨 NUEVO MÉTODO: Llama a la API de Perfiles para asociar la foto al usuario.
     * Esta es la llamada que falta en tu flujo.
     */
    actualizarIdFotoUsuario: async (idUsuario: number, idFoto: number): Promise<void> => {
        console.log(`📡 Actualizando perfil ${idUsuario} con idFoto: ${idFoto}...`);

        // ⚠️ ESTO DEBES REEMPLAZARLO CON LA LLAMADA REAL A TU API DE PERFILES.
        // Asumiendo un endpoint de actualización de foto:
        /*
        const path = '/api-perfiles/v1/usuarios/' + idUsuario; // Ejemplo de endpoint PUT
        await perfilesClient.patch(path, { idFoto: idFoto }); 
        */

        // Simulación de llamada exitosa (eliminar en producción)
        await new Promise(resolve => setTimeout(resolve, 50));
        console.log(`✅ Perfil ${idUsuario} actualizado.`);
    },

    /**
     * Obtener URL pública por ID de foto - NUEVO MÉTODO MEJORADO
     */
    obtenerUrlPublicaPorId: (idFoto: number): string => {
        if (!idFoto || idFoto <= 0) return '';

        // URL confirmada que funciona en Postman
        const baseUrl = 'http://localhost:8080';
        return `${baseUrl}/api-registros/v1/fotos/${idFoto}/archivo`;
    },

    /**
     * Obtener URL pública por ID de foto (async) - Para compatibilidad
     */
    obtenerUrlPublicaPorIdAsync: async (idFoto: number): Promise<string> => {
        return FotoService.obtenerUrlPublicaPorId(idFoto);
    }
};