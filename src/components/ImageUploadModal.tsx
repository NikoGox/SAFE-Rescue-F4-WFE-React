// src/components/ImageUploadModal.tsx
import React, { useState, useRef, useEffect } from 'react';
import styles from './ImageUploadModal.module.css';
import { IoClose } from 'react-icons/io5';
import { FaCloudUploadAlt, FaTrashAlt, FaCheck } from 'react-icons/fa';

interface ImageUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentImage: string | null;
    isLoading: boolean;
    isUploading?: boolean;
    uploadError: string | null;
    onImageSelect: (file: File) => Promise<string>;
    onImageSave: (file: File) => Promise<number>;
    onImageDelete: () => Promise<void>;
    onSave?: (imageUrl: string | null, photoId?: number | null) => void;
    onError?: (error: Error) => void; // ✅ AGREGAR ESTA PROP
    hasTemporaryImage?: boolean;
    clearTemporaryImage?: () => void;
}

const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
    isOpen,
    onClose,
    currentImage,
    isLoading,
    isUploading = false,
    uploadError,
    onImageSelect,
    onImageSave,
    onImageDelete,
    onSave,
    onError, // ✅ RECIBIR LA PROP
    hasTemporaryImage = false,
    clearTemporaryImage
}) => {
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false); // ✅ AGREGAR ESTADO LOCAL
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setPreviewImage(currentImage);
            setSelectedFile(null);
            setError(null);
            setIsSaving(false);
        }
    }, [isOpen, currentImage]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setError(null);

            try {
                // Solo prepara la imagen, no la sube
                const previewUrl = await onImageSelect(file);
                setPreviewImage(previewUrl);

                // Limpiar el input file para permitir seleccionar el mismo archivo otra vez
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            } catch (error: any) {
                console.error("Error al preparar imagen:", error);
                setError(error.message || "Error al preparar la imagen");
                setSelectedFile(null);
                setPreviewImage(currentImage);
            }
        }
    };

    // ✅ MÉTODO handleSaveClick CORREGIDO
    const handleSaveClick = async () => {
        if (!selectedFile) return;

        try {
            setIsSaving(true);
            setError(null);
            
            console.log('📤 Guardando imagen seleccionada...', selectedFile.name);
            const photoId = await onImageSave(selectedFile);
            console.log('✅ Imagen guardada con ID:', photoId);

            // Obtener URL de preview para pasar al callback
            const finalPreviewUrl = previewImage; // Usar la preview actual

            // Éxito - notificar al componente padre
            if (onSave) {
                onSave(finalPreviewUrl, photoId);
            }

            // Cerrar modal después de guardar exitosamente
            setTimeout(() => {
                onClose();
            }, 1000);

        } catch (error: any) {
            console.error('❌ Error al guardar imagen:', error);
            setError(error.message || "Error al guardar la imagen");

            // Notificar error al componente padre si existe la prop
            if (onError) {
                onError(error);
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteClick = async () => {
        try {
            setError(null);
            await onImageDelete();

            if (onSave) {
                onSave(null, null);
            }
            onClose();
        } catch (error: any) {
            console.error("Error al borrar imagen:", error);
            setError(error.message || "Error al borrar la imagen");
        }
    };

    const handleCancelClick = () => {
        // Limpiar URLs temporales
        if (previewImage && previewImage !== currentImage && previewImage.startsWith('blob:')) {
            URL.revokeObjectURL(previewImage);
        }
        
        if (clearTemporaryImage) {
            clearTemporaryImage();
        }
        
        setError(null);
        setSelectedFile(null);
        setPreviewImage(currentImage);
        onClose();
    };

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            handleCancelClick();
        }
    };

    // Determinar si hay cambios para habilitar el botón Guardar
    const hasChanges = selectedFile !== null;

    // Determinar si hay una imagen actual (para mostrar botón Eliminar)
    const hasCurrentImage = currentImage !== null;

    // Estado combinado de carga
    const isProcessing = isLoading || isUploading || isSaving;

    if (!isOpen) return null;

    return (
        <div className={styles['modal-overlay']} onClick={handleOverlayClick}>
            <div className={styles['modal-container']}>
                <div className={styles['modal-content']}>
                    <div className={styles['modal-header']}>
                        <h3>Gestionar Imagen de Perfil</h3>
                        <button
                            onClick={handleCancelClick}
                            className={styles['close-button']}
                            aria-label="Cerrar"
                            disabled={isProcessing}
                        >
                            <IoClose />
                        </button>
                    </div>

                    <div className={styles['modal-body']}>
                        <div className={styles['preview-container']}>
                            {previewImage ? (
                                <img
                                    src={previewImage}
                                    alt="Vista previa"
                                    className={styles['preview-image']}
                                    onError={(e) => {
                                        // Fallback si la imagen de preview falla
                                        console.error("Error cargando preview:", previewImage);
                                        (e.target as HTMLImageElement).src = '/assets/perfil-default.png';
                                    }}
                                />
                            ) : (
                                <div className={styles['no-image']}>
                                    <FaCloudUploadAlt size={48} />
                                    <span>No hay imagen cargada</span>
                                </div>
                            )}
                        </div>

                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            id="image-upload-input"
                            disabled={isProcessing}
                        />

                        <div className={styles['button-group']}>
                            <label
                                htmlFor="image-upload-input"
                                className={`${styles['upload-button']} ${isProcessing ? styles['disabled'] : ''}`}
                            >
                                <FaCloudUploadAlt />
                                {previewImage && previewImage !== currentImage ? 'Cambiar Imagen' : 'Seleccionar Imagen'}
                            </label>

                            {hasCurrentImage && (
                                <button
                                    onClick={handleDeleteClick}
                                    className={`${styles['delete-button']} ${isProcessing ? styles['disabled'] : ''}`}
                                    disabled={isProcessing}
                                >
                                    <FaTrashAlt />
                                    Eliminar Actual
                                </button>
                            )}
                        </div>

                        {isProcessing && (
                            <div className={styles['loading-message']}>
                                <p>
                                    {isUploading || isSaving ? 'Guardando imagen...' : 
                                     isLoading ? 'Procesando imagen...' : 'Cargando...'}
                                </p>
                            </div>
                        )}

                        {(error || uploadError) && (
                            <div className={styles['error-message']}>
                                <p>Error: {error || uploadError}</p>
                            </div>
                        )}
                    </div>

                    <div className={styles['modal-footer']}>
                        <div className={styles['footer-buttons']}>
                            <button
                                onClick={handleCancelClick}
                                className={styles['cancel-button']}
                                disabled={isUploading || isSaving}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveClick}
                                className={styles['save-button']}
                                disabled={isProcessing || !hasChanges}
                            >
                                <FaCheck />
                                {isUploading || isSaving ? 'Guardando...' : 'Guardar Imagen'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageUploadModal;