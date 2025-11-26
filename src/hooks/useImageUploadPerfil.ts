// src/hooks/useImageUploadPerfil.ts
import { useState, useCallback } from 'react';
import { FotoService } from '../service/services/registros/FotoService';
import UsuarioService from '../service/services/perfiles/UsuarioService';

interface UseImageUploadPerfilProps {
  entityType: 'USUARIO';
  entityId?: number;
  onImageUpdated?: (newUrl: string | null, newPhotoId?: number | null) => void;
}

interface UseImageUploadPerfilResult {
  isModalOpen: boolean;
  currentImageUrl: string | null;
  currentPhotoId: number | null;
  isLoading: boolean;
  isUploading: boolean;
  openModal: () => void;
  closeModal: () => void;
  handleImageSelect: (file: File) => Promise<string>;
  handleImageSave: (file: File) => Promise<number>;
  handleImageDelete: () => Promise<void>;
  clearTemporaryImage: () => void;
}

export const useImageUploadPerfil = ({
  entityType,
  entityId,
  onImageUpdated
}: UseImageUploadPerfilProps): UseImageUploadPerfilResult => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [currentPhotoId, setCurrentPhotoId] = useState<number | null>(null);
  const [temporaryImageUrl, setTemporaryImageUrl] = useState<string | null>(null);
  const [temporaryFile, setTemporaryFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const openModal = useCallback(() => {
    setIsModalOpen(true);
    // Cargar imagen actual al abrir el modal
    if (currentImageUrl) {
      setTemporaryImageUrl(currentImageUrl);
    }
  }, [currentImageUrl]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setTemporaryImageUrl(null);
    setTemporaryFile(null);
  }, []);

  // Solo prepara la imagen (no la sube)
  const handleImageSelect = useCallback(async (file: File): Promise<string> => {
    try {
      console.log('Preparando imagen de perfil...', file.name);

      // Crear URL temporal para preview
      const objectUrl = URL.createObjectURL(file);

      console.log('Imagen preparada para upload:', file.name);
      return objectUrl;

    } catch (error: any) {
      console.error("Error al preparar imagen:", error);
      throw new Error(error.message || "Error al preparar la imagen.");
    }
  }, []);

  const handleImageSave = useCallback(async (file: File): Promise<number> => {
    setIsUploading(true);
    try {
      console.log('📤 Subiendo imagen de perfil definitiva...', file.name);

      if (!entityId) {
        throw new Error("No se pudo identificar al usuario para asociar la foto.");
      }

      // 1. Subir foto al servicio de registros (esto SÍ funciona)
      const fotoCreada = await FotoService.subirFoto(file);
      console.log('✅ Foto subida con ID:', fotoCreada.idFoto);

      // 2. SOLUCIÓN DEFINITIVA: Usar PATCH específico para foto
      if (entityType === 'USUARIO') {
        console.log(`🔗 Asociando foto ${fotoCreada.idFoto} al usuario ${entityId}`);

        await UsuarioService.actualizarSoloFoto(entityId, fotoCreada.idFoto);
        console.log('✅ Foto asociada al usuario mediante PATCH');
      }

      // 3. Actualizar estado local
      const imageUrl = FotoService.obtenerUrlPublicaPorId(fotoCreada.idFoto);
      setCurrentImageUrl(imageUrl);
      setCurrentPhotoId(fotoCreada.idFoto);

      // 4. Notificar al componente padre
      if (onImageUpdated) {
        onImageUpdated(imageUrl, fotoCreada.idFoto);
      }

      console.log('🎉 Imagen de perfil guardada exitosamente. ID:', fotoCreada.idFoto);
      return fotoCreada.idFoto;

    } catch (error: any) {
      console.error("❌ Error al guardar imagen de perfil:", error);

      let errorMessage = error.message || "Fallo al guardar la imagen.";

      if (error.message.includes('403')) {
        errorMessage = "No tienes permisos para actualizar el perfil. Contacta al administrador.";
      } else if (error.message.includes('404')) {
        errorMessage = "Usuario no encontrado.";
      }

      throw new Error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  }, [entityId, entityType, onImageUpdated]);

  const handleImageDelete = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      console.log('Eliminando imagen de perfil actual');

      // 1. Desasociar la foto del usuario
      if (entityId && entityType === 'USUARIO' && currentPhotoId) {
        console.log(`Desasociando foto ${currentPhotoId} del usuario ${entityId}`);
        await UsuarioService.actualizarIdFoto(entityId, null);
      }

      // 2. Actualizar estado local
      setCurrentImageUrl(null);
      setCurrentPhotoId(null);
      setTemporaryImageUrl(null);
      setTemporaryFile(null);

      // 3. Notificar al componente padre
      if (onImageUpdated) {
        onImageUpdated(null, null);
      }

      console.log('Imagen de perfil eliminada');

    } catch (error: any) {
      console.error("Error al borrar imagen de perfil:", error);
      throw new Error(error.message || "Fallo al borrar la imagen.");
    } finally {
      setIsLoading(false);
    }
  }, [entityId, entityType, currentPhotoId, onImageUpdated]);

  const clearTemporaryImage = useCallback(() => {
    setTemporaryImageUrl(null);
    setTemporaryFile(null);
  }, []);

  return {
    isModalOpen,
    currentImageUrl,
    currentPhotoId,
    isLoading,
    isUploading,
    openModal,
    closeModal,
    handleImageSelect,
    handleImageSave,
    handleImageDelete,
    clearTemporaryImage,
  };
};