import React, { useState, useEffect } from 'react';
import './ImageUploadModal.css'; 
import PerfilDefault from "../assets/perfil-default.png"; 
import { FotoService } from '../service/services/registros/FotoService'; // Nuevo servicio
import { useAuthContext } from '../hooks/AuthContext'; // Para obtener el usuario actual

interface ImageUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentImage?: string; 
    onImageSave: (newImage: string | undefined, fotoId?: number) => void; // Actualizado para incluir fotoId
    entityType?: 'USUARIO' | 'INCIDENTE' | 'COMPANIA'; // Tipo de entidad para la foto
    entityId?: number; // ID de la entidad asociada
}

const ImageUploadModal: React.FC<ImageUploadModalProps> = ({ 
    isOpen, 
    onClose, 
    onImageSave, 
    currentImage,
    entityType = 'USUARIO',
    entityId 
}) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentImage);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const { authData } = useAuthContext();

    useEffect(() => {
        if (isOpen) {
            setPreviewUrl(currentImage);
            setSelectedFile(null); 
            setError(null); 
            setIsLoading(false);
        }
    }, [isOpen, currentImage]);

    if (!isOpen) {
        return null;
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setError(null);

        if (file) {
            // Validaciones de tipo de archivo
            if (!file.type.startsWith('image/')) {
                setError('⚠️ El archivo debe ser una imagen (JPG, PNG, GIF).');
                setSelectedFile(null);
                setPreviewUrl(currentImage);
                return;
            }

            // Validaciones de tamaño
            const MAX_SIZE = 5 * 1024 * 1024; // 5MB
            if (file.size > MAX_SIZE) {
                setError(`⚠️ La imagen es demasiado grande (Máx. ${MAX_SIZE / 1024 / 1024} MB).`);
                setSelectedFile(null);
                setPreviewUrl(currentImage);
                return;
            }

            // Validaciones de dimensiones (opcional)
            const img = new Image();
            img.onload = () => {
                if (img.width > 4000 || img.height > 4000) {
                    setError('⚠️ La imagen es demasiado grande (Máx. 4000x4000 píxeles).');
                    setSelectedFile(null);
                    setPreviewUrl(currentImage);
                    return;
                }
                setSelectedFile(file);
                setPreviewUrl(URL.createObjectURL(file));
            };
            img.src = URL.createObjectURL(file);
        }
    };

    const handleSave = async () => {
        if (error) return;
        setIsLoading(true);

        try {
            if (selectedFile) {
                // Subir archivo al backend usando el servicio
                const fotoCreada = await FotoService.subirFoto(selectedFile, `Foto de ${entityType.toLowerCase()}`);
                
                // Llamar callback con la nueva imagen y el ID de la foto
                onImageSave(fotoCreada.url, fotoCreada.idFoto);
                handleClose();
            } else if (previewUrl === undefined && currentImage !== undefined) {
                // Eliminar imagen
                onImageSave(undefined);
                handleClose();
            } else {
                // Sin cambios
                handleClose();
            }
        } catch (error) {
            console.error('Error al guardar imagen:', error);
            setError('Error al guardar la imagen. Intente nuevamente.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = () => {
        setPreviewUrl(undefined); 
        setSelectedFile(null); 
        setError(null);
    };

    const handleClose = () => {
        // Limpiar URLs de objeto para evitar memory leaks
        if (previewUrl && previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl);
        }
        onClose();
    };

    const hasError = !!error;
    const hasSelectedFile = !!selectedFile;
    const isReadyToDelete = previewUrl === undefined && currentImage !== undefined;
    const hasNoChanges = !hasSelectedFile && previewUrl === currentImage;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h5 className="modal-title">Cambiar imagen de perfil</h5>
                    <button 
                        type="button" 
                        className="btn-close" 
                        onClick={handleClose}
                        aria-label="Cerrar"
                    ></button>
                </div>
                
                <div className="modal-body">
                    <div className="image-preview-container mb-4 text-center">
                        <img 
                            src={previewUrl || PerfilDefault} 
                            alt="Previsualización" 
                            className="img-fluid image-preview rounded-circle border" 
                            style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                            data-testid="image-preview"
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="imageUpload" className="form-label">
                            Seleccionar nueva imagen
                        </label>
                        <input
                            id="imageUpload"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            onClick={(e) => (e.currentTarget.value = '')} 
                            className="form-control"
                            data-testid="image-input"
                            disabled={isLoading}
                        />
                        <div className="form-text">
                            Formatos: JPG, PNG, GIF. Tamaño máximo: 5MB
                        </div>
                    </div>

                    {error && (
                        <div className="alert alert-danger small" data-testid="image-error">
                            {error}
                        </div>
                    )}
                    
                    {currentImage && previewUrl !== undefined && (
                        <button
                            type="button"
                            className="btn btn-outline-danger btn-sm w-100 mb-3"
                            onClick={handleDelete}
                            data-testid="image-delete-button"
                            disabled={isLoading}
                        >
                            <i className="bi bi-trash me-2"></i>
                            Eliminar Imagen Actual
                        </button>
                    )}
                </div>

                <div className="modal-footer">
                    <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={handleClose}
                        disabled={isLoading}
                    >
                        Cancelar
                    </button>
                    <button 
                        type="button" 
                        className="btn btn-primary" 
                        onClick={handleSave}
                        disabled={hasError || hasNoChanges || isLoading}
                        data-testid="image-save-button"
                    >
                        {isLoading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                Procesando...
                            </>
                        ) : hasSelectedFile ? (
                            'Guardar Imagen'
                        ) : isReadyToDelete ? (
                            'Confirmar Eliminación'
                        ) : (
                            'Cerrar'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImageUploadModal;