import React, { useState, useEffect } from 'react';
import './ImageUploadModal.css'; 
import PerfilDefault from "../assets/perfil-default.png"; 

interface ImageUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentImage?: string; 
    onImageSave: (newImage: string | undefined) => void;
}

const ImageUploadModal: React.FC<ImageUploadModalProps> = ({ isOpen, onClose, onImageSave, currentImage }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentImage);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        if (isOpen) {
            setPreviewUrl(currentImage);
            setSelectedFile(null); 
            setError(null); 
        }
    }, [isOpen, currentImage]);

    if (!isOpen) {
        return null;
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setError(null);

        if (file) {
            if (!file.type.startsWith('image/')) {
                setError('⚠️ El archivo debe ser una imagen (JPG, PNG, GIF).');
                setSelectedFile(null);
                setPreviewUrl(currentImage);
                return;
            }

            const MAX_SIZE = 5 * 1024 * 1024; 
            if (file.size > MAX_SIZE) {
                setError(`⚠️ La imagen es demasiado grande (Máx. ${MAX_SIZE / 1024 / 1024} MB).`);
                setSelectedFile(null);
                setPreviewUrl(currentImage); 
                return;
            }

            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSave = () => {
        if (error) return;

        if (selectedFile) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                    onImageSave(reader.result); 
                    handleClose();
                }
            };
            reader.readAsDataURL(selectedFile);
            return;
        } 
        
        if (previewUrl === undefined && currentImage !== undefined) {
             onImageSave(undefined); 
             handleClose();
             return;
        }

        handleClose();
    };

    const handleDelete = () => {
        setPreviewUrl(undefined); 
        setSelectedFile(null); 
        setError(null);
    };

    const handleClose = () => {
        onClose();
    };

    const hasError = !!error;
    const hasSelectedFile = !!selectedFile;
    const isReadyToDelete = previewUrl === undefined && currentImage !== undefined;
    const hasNoChanges = !hasSelectedFile && previewUrl === currentImage;


    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h3 className="mb-3">Cambiar imagen</h3>
                
                <div className="image-preview-container mb-3 text-center">
                    <img 
                        src={previewUrl || PerfilDefault} 
                        alt="Previsualización" 
                        className="img-fluid image-preview rounded-circle" 
                        data-testid="image-preview"
                    />
                </div>

                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    onClick={(e) => (e.currentTarget.value = '')} 
                    className="form-control mb-3"
                    data-testid="image-input"
                />

                {error && <div className="alert alert-danger small" data-testid="image-error">{error}</div>}
                
                {currentImage && previewUrl !== undefined && (
                    <button
                        type="button"
                        className="btn btn-outline-danger btn-sm mb-3"
                        onClick={handleDelete}
                        data-testid="image-delete-button"
                    >
                        Eliminar Imagen Actual
                    </button>
                )}

                <div className="modal-actions d-flex justify-content-end mt-4">
                    <button 
                        type="button" 
                        className="btn btn-secondary me-2" 
                        onClick={handleClose}
                    >
                        Cancelar
                    </button>
                    <button 
                        type="button" 
                        className="btn btn-primary" 
                        onClick={handleSave}
                        // 💡 MEJORA: Deshabilitado si hay un error O si no hay cambios
                        disabled={hasError || hasNoChanges}
                        data-testid="image-save-button"
                    >
                        {
                            hasSelectedFile ? 
                                'Guardar Imagen' : 
                                (isReadyToDelete ? 'Confirmar Eliminación' : 'Cerrar')
                        }
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImageUploadModal;