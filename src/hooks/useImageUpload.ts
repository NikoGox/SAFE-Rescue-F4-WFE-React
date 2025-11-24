// src/hooks/useImageUpload.ts
import { useState, useCallback } from 'react';
import { FotoService } from '../service/services/registros/FotoService';

interface UseImageUploadResult {
    uploadedImageUrl: string | null;
    isUploading: boolean;
    uploadError: string | null;
    handleFileUpload: (file: File) => Promise<string>;
    clearUploadedImage: () => void;
    handleFileDelete: (imageUrl: string) => Promise<void>;
}

export const useImageUpload = (): UseImageUploadResult => {
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const handleFileUpload = useCallback(async (file: File): Promise<string> => {
        setIsUploading(true);
        setUploadError(null);
        try {
            console.log(' Iniciando subida de imagen...', file.name);
            
            // Usar el servicio real para subir la imagen
            const fotoCreada = await FotoService.subirFoto(file);
            
            // IMPORTANTE: La URL que devuelve el backend es una ruta de archivo local
            // Necesitamos construir la URL completa para acceder a la imagen
            const imageUrl = construirUrlCompleta(fotoCreada.url);
            
            console.log(' Imagen subida exitosamente:', {
                id: fotoCreada.idFoto,
                url: fotoCreada.url,
                urlCompleta: imageUrl
            });
            
            setUploadedImageUrl(imageUrl);
            return imageUrl;
            
        } catch (error: any) {
            console.error(" Error al subir imagen:", error);
            const errorMessage = error.message || "Fallo la subida de imagen.";
            setUploadError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsUploading(false);
        }
    }, []);

    const handleFileDelete = useCallback(async (imageUrlToDelete: string): Promise<void> => {
        setIsUploading(true);
        setUploadError(null);
        try {
            // TODO: Implementar eliminación en el backend cuando esté disponible
            console.log('Eliminando imagen (pendiente implementar backend):', imageUrlToDelete);
            
            // Por ahora, solo limpiamos el estado local
            if (uploadedImageUrl === imageUrlToDelete) {
                setUploadedImageUrl(null);
            }
        } catch (error: any) {
            console.error("Error al borrar imagen:", error);
            const errorMessage = error.message || "Fallo al borrar la imagen.";
            setUploadError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsUploading(false);
        }
    }, [uploadedImageUrl]);

    const clearUploadedImage = useCallback(() => {
        setUploadedImageUrl(null);
        setUploadError(null);
    }, []);

    return {
        uploadedImageUrl,
        isUploading,
        uploadError,
        handleFileUpload,
        clearUploadedImage,
        handleFileDelete,
    };
};

// Función auxiliar para construir la URL completa de la imagen
const construirUrlCompleta = (rutaArchivo: string): string => {
    // Si la ruta ya es una URL completa, devolverla tal cual
    if (rutaArchivo.startsWith('http')) {
        return rutaArchivo;
    }
    
    // Si es una ruta de archivo local, construir la URL completa
    // Ajusta esta base URL según tu configuración del backend
    const baseUrl = 'http://localhost:8080'; // o la URL de tu API
    return `${baseUrl}${rutaArchivo.startsWith('/') ? '' : '/'}${rutaArchivo}`;
};