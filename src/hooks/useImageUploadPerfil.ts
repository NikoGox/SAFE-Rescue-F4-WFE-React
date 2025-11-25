// src/hooks/useImageUploadPerfil.ts
import { useState, useCallback } from 'react';
import { FotoService } from '../service/services/registros/FotoService';

interface UseImageUploadPerfilProps {
  entityType: 'USUARIO';
  entityId?: number;
  onImageUpdated?: (newUrl: string | null) => void;
}

interface UseImageUploadPerfilResult {
  isModalOpen: boolean;
  currentImageUrl: string | null;
  isLoading: boolean;
  openModal: () => void;
  closeModal: () => void;
  handleImageUpload: (file: File) => Promise<string>;
  handleImageDelete: () => Promise<void>; // Cambiado: no recibe parámetro
}

export const useImageUploadPerfil = ({
  entityType,
  entityId,
  onImageUpdated
}: UseImageUploadPerfilProps): UseImageUploadPerfilResult => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleImageUpload = useCallback(async (file: File): Promise<string> => {
    setIsLoading(true);
    try {
      console.log('Subiendo imagen de perfil...', file.name);

      const fotoCreada = await FotoService.subirFoto(file);
      const imageUrl = construirUrlCompleta(fotoCreada.url);

      console.log('Imagen de perfil subida exitosamente:', imageUrl);

      setCurrentImageUrl(imageUrl);

      if (onImageUpdated) {
        onImageUpdated(imageUrl);
      }

      return imageUrl;
    } catch (error: any) {
      console.error("Error al subir imagen de perfil:", error);
      throw new Error(error.message || "Fallo la subida de imagen.");
    } finally {
      setIsLoading(false);
    }
  }, [onImageUpdated]);

  // handleImageDelete no recibe parámetros
  const handleImageDelete = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      console.log('Eliminando imagen de perfil actual');

      // TODO: Implementar eliminación en backend cuando esté disponible
      // Por ahora solo limpiamos el estado local
      setCurrentImageUrl(null);

      if (onImageUpdated) {
        onImageUpdated(null);
      }
    } catch (error: any) {
      console.error("Error al borrar imagen de perfil:", error);
      throw new Error(error.message || "Fallo al borrar la imagen.");
    } finally {
      setIsLoading(false);
    }
  }, [onImageUpdated]);

  return {
    isModalOpen,
    currentImageUrl,
    isLoading,
    openModal,
    closeModal,
    handleImageUpload,
    handleImageDelete,
  };
};

const construirUrlCompleta = (rutaArchivo: string): string => {
  if (rutaArchivo.startsWith('http')) {
    return rutaArchivo;
  }

  const baseUrl = 'http://localhost:8080';
  return `${baseUrl}${rutaArchivo.startsWith('/') ? '' : '/'}${rutaArchivo}`;
};