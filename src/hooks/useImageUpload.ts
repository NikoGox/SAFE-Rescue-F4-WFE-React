// src/hooks/useImageUpload.ts
import { useState, useCallback, useRef } from 'react';
import { FotoService } from '../service/services/registros/FotoService';
import IncidenteService from '../service/services/incidentes/IncidenteService';

interface UseImageUploadProps {
    incidentId?: number;
    onImageUpdated?: (newUrl: string | null) => void;
}

interface UseImageUploadResult {
    isModalOpen: boolean;
    currentImageUrl: string | null;
    temporaryImageUrl: string | null;
    temporaryFile: File | null;
    isLoading: boolean;
    isUploading: boolean;
    uploadError: string | null;
    openModal: () => void;
    closeModal: () => void;
    handleImageSelect: (file: File) => Promise<string>;
    handleImageSave: (file: File) => Promise<string>;
    handleImageDelete: () => Promise<void>;
    clearTemporaryImage: () => void;
}

export const useImageUpload = ({
    incidentId,
    onImageUpdated
}: UseImageUploadProps = {}): UseImageUploadResult => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
    const [temporaryImageUrl, setTemporaryImageUrl] = useState<string | null>(null);
    const [temporaryFile, setTemporaryFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    
    // Referencia para limpiar URLs temporales
    const previousTemporaryUrl = useRef<string | null>(null);

    const openModal = useCallback(() => {
        setIsModalOpen(true);
        setUploadError(null);
        // Cargar imagen actual al abrir el modal
        if (currentImageUrl) {
            setTemporaryImageUrl(currentImageUrl);
        }
    }, [currentImageUrl]);

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
        // Limpiar URL temporal si existe
        if (previousTemporaryUrl.current) {
            URL.revokeObjectURL(previousTemporaryUrl.current);
            previousTemporaryUrl.current = null;
        }
        setTemporaryImageUrl(null);
        setTemporaryFile(null);
        setUploadError(null);
    }, []);

    // Solo prepara la imagen (no la sube) - para preview
    const handleImageSelect = useCallback(async (file: File): Promise<string> => {
        try {
            console.log('🖼️ Preparando imagen para incidente...', file.name);
            setUploadError(null);

            // Validar tipo de archivo
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            const maxSize = 5 * 1024 * 1024; // 5MB

            if (!validTypes.includes(file.type)) {
                throw new Error('Solo se permiten imágenes JPEG, PNG, GIF o WebP');
            }

            if (file.size > maxSize) {
                throw new Error('La imagen no debe superar los 5MB');
            }

            // Limpiar URL temporal anterior si existe
            if (previousTemporaryUrl.current) {
                URL.revokeObjectURL(previousTemporaryUrl.current);
            }

            // Crear URL temporal para preview
            const objectUrl = URL.createObjectURL(file);
            previousTemporaryUrl.current = objectUrl;
            setTemporaryImageUrl(objectUrl);
            setTemporaryFile(file);

            console.log('✅ Imagen preparada para upload:', file.name);
            return objectUrl;

        } catch (error: any) {
            console.error("❌ Error al preparar imagen:", error);
            const errorMessage = error.message || "Error al preparar la imagen.";
            setUploadError(errorMessage);
            throw new Error(errorMessage);
        }
    }, []);

    // Sube la imagen y la asocia al incidente
    const handleImageSave = useCallback(async (file: File): Promise<string> => {
        setIsUploading(true);
        setUploadError(null);
        try {
            console.log('📤 Subiendo imagen de incidente definitiva...', file.name);

            // 1. Subir foto al servicio de registros
            const fotoCreada = await FotoService.subirFoto(file);
            console.log(' Foto subida con ID:', fotoCreada.idFoto);

            // 2. Obtener URL pública
            const imageUrl = FotoService.obtenerUrlPublica(fotoCreada.url);
            console.log(' URL pública generada:', imageUrl);

            // 3. Si hay un incidentId, asociar la foto al incidente usando idFoto
            if (incidentId) {
                console.log(` Asociando foto al incidente ${incidentId} con idFoto: ${fotoCreada.idFoto}`);
                await IncidenteService.actualizarFotoIncidente(incidentId, fotoCreada.idFoto);
                console.log('✅ Foto asociada al incidente mediante PATCH');
            }

            // 4. Limpiar URL temporal
            if (previousTemporaryUrl.current) {
                URL.revokeObjectURL(previousTemporaryUrl.current);
                previousTemporaryUrl.current = null;
            }

            // 5. Actualizar estado local
            setCurrentImageUrl(imageUrl);
            setTemporaryImageUrl(null);
            setTemporaryFile(null);

            // 6. Notificar al componente padre
            if (onImageUpdated) {
                onImageUpdated(imageUrl);
            }

            console.log('🎉 Imagen de incidente guardada exitosamente');
            return imageUrl;

        } catch (error: any) {
            console.error("❌ Error al guardar imagen de incidente:", error);

            let errorMessage = error.message || "Fallo al guardar la imagen.";

            if (error.message?.includes('403')) {
                errorMessage = "No tienes permisos para actualizar el incidente.";
            } else if (error.message?.includes('404')) {
                errorMessage = "Incidente no encontrado.";
            } else if (error.message?.includes('400')) {
                errorMessage = "Error en el formato de la imagen.";
            }

            setUploadError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsUploading(false);
        }
    }, [incidentId, onImageUpdated]);

    // Elimina la imagen del incidente
    const handleImageDelete = useCallback(async (): Promise<void> => {
        setIsLoading(true);
        setUploadError(null);
        try {
            console.log('🗑️ Eliminando imagen de incidente');

            // 1. Si hay un incidentId, eliminar la imagen del incidente
            if (incidentId) {
                console.log(`Desasociando imagen del incidente ${incidentId}`);
                // CORRECCIÓN: Usar un valor que indique "sin foto" (depende de tu API)
                // Opción A: Si tu API acepta null/0 para eliminar
                await IncidenteService.actualizarFotoIncidente(incidentId, 0);
                // Opción B: Si tienes un método específico para eliminar
                // await IncidenteService.eliminarFotoIncidente(incidentId);
            }

            // 2. Limpiar URL temporal si existe
            if (previousTemporaryUrl.current) {
                URL.revokeObjectURL(previousTemporaryUrl.current);
                previousTemporaryUrl.current = null;
            }

            // 3. Actualizar estado local
            setCurrentImageUrl(null);
            setTemporaryImageUrl(null);
            setTemporaryFile(null);

            // 4. Notificar al componente padre
            if (onImageUpdated) {
                onImageUpdated(null);
            }

            console.log('✅ Imagen de incidente eliminada');

        } catch (error: any) {
            console.error("❌ Error al borrar imagen de incidente:", error);
            const errorMessage = error.message || "Fallo al borrar la imagen.";
            setUploadError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [incidentId, onImageUpdated]);

    const clearTemporaryImage = useCallback(() => {
        // Limpiar URL temporal
        if (previousTemporaryUrl.current) {
            URL.revokeObjectURL(previousTemporaryUrl.current);
            previousTemporaryUrl.current = null;
        }
        setTemporaryImageUrl(null);
        setTemporaryFile(null);
        setUploadError(null);
    }, []);

    return {
        isModalOpen,
        currentImageUrl,
        temporaryImageUrl,
        temporaryFile, // ✅ CORREGIDO: Ahora sí está incluido
        isLoading,
        isUploading,
        uploadError,
        openModal,
        closeModal,
        handleImageSelect,
        handleImageSave,
        handleImageDelete,
        clearTemporaryImage
    };
};