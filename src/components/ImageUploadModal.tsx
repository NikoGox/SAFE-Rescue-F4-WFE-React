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
    uploadError: string | null;
    onImageUpload: (file: File) => Promise<string>;
    onImageDelete: (imageUrl: string) => Promise<void>;
    onImageReplace?: (file: File) => Promise<string>;
    onSave?: (imageUrl: string | null) => void;
}

const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
    isOpen,
    onClose,
    currentImage,
    isLoading: externalIsLoading,
    uploadError,
    onImageUpload,
    onImageDelete,
    onImageReplace,
    onSave
}) => {
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [temporaryImage, setTemporaryImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setPreviewImage(currentImage);
            setTemporaryImage(null);
            setError(null);
            setIsLoading(false);
        }
    }, [isOpen, currentImage]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            
            // Mostrar preview inmediatamente
            const objectUrl = URL.createObjectURL(file);
            setPreviewImage(objectUrl);
            setTemporaryImage(objectUrl);
            setError(null);
            
            try {
                setIsLoading(true);
                
                // Subir la imagen al backend
                const uploadedUrl = onImageReplace 
                    ? await onImageReplace(file) 
                    : await onImageUpload(file);
                
                // Actualizar con la URL real del backend
                setPreviewImage(uploadedUrl);
                setTemporaryImage(uploadedUrl);
                
            } catch (error: any) {
                console.error("Error al subir imagen:", error);
                setError(error.message || "Error al subir la imagen");
                // Revertir a la imagen anterior si hay error
                setPreviewImage(currentImage);
                setTemporaryImage(null);
            } finally {
                setIsLoading(false);
                // Limpiar el input file
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            }
        }
    };

    const handleDeleteClick = async () => {
        if (previewImage) {
            try {
                setIsLoading(true);
                await onImageDelete(previewImage);
                setPreviewImage(null);
                setTemporaryImage(null);
                setError(null);
            } catch (error: any) {
                console.error("Error al borrar imagen:", error);
                setError(error.message || "Error al borrar la imagen");
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleSaveClick = () => {
        if (onSave) {
            onSave(previewImage);
        }
        onClose();
    };

    const handleCancelClick = () => {
        onClose();
    };

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            handleCancelClick();
        }
    };

    // Determinar si hay cambios para guardar
    const hasChanges = temporaryImage !== null || previewImage !== currentImage;

    if (!isOpen) return null;

    return (
        <div className={styles['modal-overlay']} onClick={handleOverlayClick}>
            <div className={styles['modal-container']}>
                <div className={styles['modal-content']}>
                    <div className={styles['modal-header']}>
                        <h3>Gestionar Imagen del Incidente</h3>
                        <button 
                            onClick={handleCancelClick} 
                            className={styles['close-button']}
                            aria-label="Cerrar"
                            disabled={isLoading}
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
                                    onLoad={() => {
                                        // Limpiar object URL temporal si existe
                                        if (temporaryImage && temporaryImage.startsWith('blob:')) {
                                            URL.revokeObjectURL(temporaryImage);
                                        }
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
                            style={{display: 'none'}}
                            id="image-upload-input"
                            disabled={isLoading}
                        />
                        
                        <div className={styles['button-group']}>
                            <label 
                                htmlFor="image-upload-input" 
                                className={`${styles['upload-button']} ${isLoading ? styles['disabled'] : ''}`}
                            >
                                <FaCloudUploadAlt />
                                {previewImage ? 'Cambiar Imagen' : 'Subir Imagen'}
                            </label>
                            
                            {previewImage && (
                                <button 
                                    onClick={handleDeleteClick} 
                                    className={`${styles['delete-button']} ${isLoading ? styles['disabled'] : ''}`}
                                    disabled={isLoading}
                                >
                                    <FaTrashAlt />
                                    Eliminar
                                </button>
                            )}
                        </div>

                        {(isLoading || externalIsLoading) && (
                            <div className={styles['loading-message']}>
                                <p>Procesando imagen...</p>
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
                                disabled={isLoading}
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleSaveClick} 
                                className={styles['save-button']}
                                disabled={isLoading || !hasChanges}
                            >
                                <FaCheck />
                                Guardar Imagen
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageUploadModal;