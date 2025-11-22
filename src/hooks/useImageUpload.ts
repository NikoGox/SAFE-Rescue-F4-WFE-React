import { useState, useCallback } from 'react';
import { FotoService } from '../service/services/registros/FotoService';
import { useAuthContext } from '../hooks/AuthContext';

interface UseImageUploadProps {
    entityType: 'USUARIO' | 'INCIDENTE' | 'COMPANIA';
    entityId?: number;
    onImageUpdate?: (fotoId?: number) => void;
}

export const useImageUpload = ({ entityType, entityId, onImageUpdate }: UseImageUploadProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentImage, setCurrentImage] = useState<string | undefined>();
    const [isLoading, setIsLoading] = useState(false);
    const { authData } = useAuthContext();

    const openModal = useCallback(() => {
        setIsModalOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
    }, []);

    const handleImageSave = useCallback(async (newImage: string | undefined, fotoId?: number) => {
        setIsLoading(true);
        try {
            if (entityType === 'USUARIO' && authData) {
                // Actualizar foto de perfil del usuario
                // Aquí llamarías a tu servicio de usuarios para actualizar la foto
                // await UsuarioService.actualizarFoto(authData.idUsuario, fotoId);
            }
            
            setCurrentImage(newImage);
            onImageUpdate?.(fotoId);
        } catch (error) {
            console.error('Error al actualizar imagen:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [entityType, authData, onImageUpdate]);

    const loadCurrentImage = useCallback(async () => {
        if (!entityId) return;
        
        try {
            // Cargar imagen actual desde el backend si existe
            // Esto dependerá de tu implementación específica
        } catch (error) {
            console.error('Error al cargar imagen:', error);
        }
    }, [entityId]);

    return {
        isModalOpen,
        currentImage,
        isLoading,
        openModal,
        closeModal,
        handleImageSave,
        loadCurrentImage
    };
};