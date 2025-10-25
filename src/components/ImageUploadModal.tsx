import React, { useState, useEffect } from 'react';
import './ImageUploadModal.css'; // Asegúrate de crear este archivo CSS para el estilo
import PerfilDefault from "../assets/perfil-default.png"; // Importa la imagen por defecto

interface ImageUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    // La imagen puede ser un string (Data URL) o undefined
    currentImage?: string; 
    // La función onImageSave recibe la nueva imagen (Data URL) o undefined para indicar eliminación
    onImageSave: (newImage: string | undefined) => void;
}

const ImageUploadModal: React.FC<ImageUploadModalProps> = ({ isOpen, onClose, onImageSave, currentImage }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentImage);
    const [error, setError] = useState<string | null>(null);

    /**
     * Sincroniza previewUrl con currentImage cuando el modal se abre.
     * 💡 MEJORA: Resetea 'selectedFile' y 'error' al abrir para evitar estados residuales.
     */
    useEffect(() => {
        if (isOpen) {
            // Usa la imagen actual como previsualización
            setPreviewUrl(currentImage);
            setSelectedFile(null); // Limpiar archivo seleccionado
            setError(null); // Limpiar errores
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
                setPreviewUrl(currentImage); // Vuelve a la imagen actual
                return;
            }

            // Validación de tamaño (ej: máximo 5MB)
            const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
            if (file.size > MAX_SIZE) {
                setError(`⚠️ La imagen es demasiado grande (Máx. ${MAX_SIZE / 1024 / 1024} MB).`);
                setSelectedFile(null);
                setPreviewUrl(currentImage); // Vuelve a la imagen actual
                return;
            }

            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    /**
     * Centraliza la lógica de guardar la nueva imagen o confirmar la eliminación.
     */
    const handleSave = () => {
        if (error) return; // No guardar si hay errores

        if (selectedFile) {
            // Caso 1: Se ha seleccionado un nuevo archivo. Convertir a Data URL y guardar.
            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                    onImageSave(reader.result); // Guarda el Data URL
                    handleClose();
                }
            };
            reader.readAsDataURL(selectedFile);
            return;
        } 
        
        // Caso 2: Se presionó 'Eliminar Imagen' (previewUrl es undefined, pero currentImage existía).
        if (previewUrl === undefined && currentImage !== undefined) {
             onImageSave(undefined); // Guarda undefined (eliminar)
             handleClose();
             return;
        }

        // Caso 3: No hay cambios o no hay imagen que guardar/eliminar (solo cerramos)
        handleClose();
    };

    /**
     * Limpia la previsualización para indicar una intención de eliminación.
     */
    const handleDelete = () => {
        setPreviewUrl(undefined); 
        setSelectedFile(null); 
        setError(null);
    };

    /**
     * Cierra el modal y limpia el estado.
     */
    const handleClose = () => {
        // Al cerrar, el useEffect se encargará de limpiar el estado 'selectedFile' y 'error'
        onClose();
    };

    // 💡 MEJORA: Definimos el estado del botón
    const hasError = !!error;
    const hasSelectedFile = !!selectedFile;
    const isReadyToDelete = previewUrl === undefined && currentImage !== undefined;
    const hasNoChanges = !hasSelectedFile && previewUrl === currentImage;


    return (
        // Usamos un div para el overlay que permite cerrar al hacer clic afuera
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h3 className="mb-3">Cambiar Imagen de Perfil</h3>
                
                {/* Visualización de la Imagen Actual/Previa */}
                <div className="image-preview-container mb-3 text-center">
                    <p className="small text-muted">Imagen Actual/Previa:</p>
                    <img 
                        // Muestra la previsualización o la imagen por defecto
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
                    // Limpia el input si se selecciona el mismo archivo
                    onClick={(e) => (e.currentTarget.value = '')} 
                    className="form-control mb-3"
                    data-testid="image-input"
                />

                {error && <div className="alert alert-danger small" data-testid="image-error">{error}</div>}
                
                {/* Botón de eliminar (solo si existe una imagen actual y no se ha eliminado en la previsualización) */}
                {currentImage && previewUrl !== undefined && (
                    <button
                        type="button"
                        className="btn btn-outline-danger btn-sm mb-3"
                        onClick={handleDelete}
                        data-testid="image-delete-button"
                    >
                        🗑️ Eliminar Imagen Actual
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