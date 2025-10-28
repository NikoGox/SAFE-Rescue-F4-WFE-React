import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from '../components/UseAuth';
import Logo from "../assets/sr_logo.png";

import type { Errors, UserData, UserType } from '../types/UserType';

import FormField from '../components/Formulario';
import { RutInputField, PhoneInputField } from '../components/SpecializedFields';
import ImageUploadModal from '../components/ImageUploadModal'; // Componente de Modal

import {
    validateChileanRUT,
    validateEmail,
    validatePhoneNumber,
    validateNameLettersOnly,
    validateIsRequired
} from '../utils/Validaciones';

import PerfilDefault from "../assets/perfil-default.png";

import styles from "../pages/Perfil.module.css";

const defaultUserData: UserData = {
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
    rut: "",
    nombreUsuario: "",
    profileImage: undefined
};

const Perfil: React.FC = () => {
    const { authData, login, loading, isLoggedIn } = useAuth();

    const [userData, setUserData] = useState<UserData>(defaultUserData);
    const [isEditing, setIsEditing] = useState(false);
    const [originalData, setOriginalData] = useState<UserData>(defaultUserData);
    const [errors, setErrors] = useState<Errors>({});
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false); 

    useEffect(() => {
        if (loading) return;

        if (isLoggedIn && authData) {
            if (!isEditing) {
                setUserData(authData);
                setOriginalData(authData);
            }
        } else if (!isLoggedIn && !loading) {
            setMessage({ type: 'error', text: 'No hay sesión activa. Por favor, inicia sesión.' });
        }
    }, [authData, isLoggedIn, loading, isEditing]);


 
    const validateForm = useCallback((): boolean => {
        const newErrors: Errors = {};
        newErrors.nombre = validateNameLettersOnly(userData.nombre);
        newErrors.rut = validateChileanRUT(userData.rut);
        newErrors.email = validateEmail(userData.email);
        newErrors.direccion = validateIsRequired(userData.direccion, "La dirección");
        newErrors.telefono = validatePhoneNumber(userData.telefono);
        newErrors.nombreUsuario = validateIsRequired(userData.nombreUsuario, "El nombre de usuario");

        const finalErrors: Errors = Object.fromEntries(
            Object.entries(newErrors).filter(([, value]) => value !== null && value !== undefined)
        );

        setErrors(finalErrors);
        return Object.keys(finalErrors).length === 0;
    }, [userData]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;

        if (!isEditing) {
            return;
        }

        const field = id as keyof UserData;
        setUserData(prev => ({ ...prev, [field]: value }));
        setMessage(null);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        if (!isEditing) return;

        const { id, value } = e.target;
        const field = id as keyof UserData;
        let error: string | null = null;

        switch (field) {
            case 'nombre':
                error = validateNameLettersOnly(value);
                break;
            case 'rut':
                error = validateChileanRUT(value);
                break;
            case 'email':
                error = validateEmail(value);
                break;
            case 'direccion':
                error = validateIsRequired(value, "La dirección");
                break;
            case 'telefono':
                error = validatePhoneNumber(value);
                break;
            case 'nombreUsuario':
                error = validateIsRequired(value, "El nombre de usuario");
                break;
        }

        setErrors(prev => ({ ...prev, [field]: error }));
    };


    /**
     * Habilita la edición de campos y guarda el estado actual como respaldo.
     */
    const handleEdit = () => {
        setOriginalData({ ...userData });
        setIsEditing(true);
        setErrors({});
        setMessage(null);
    };

    /**
     * Cancela la edición y revierte los datos del formulario al estado original.
     */
    const handleCancel = () => {
        setUserData({ ...originalData });
        setErrors({});
        setIsEditing(false);
        setMessage({ type: 'error', text: 'Edición cancelada. Los cambios fueron descartados.' });
    };

    /**
     * Determina si ha habido algún cambio (incluyendo la imagen).
     */
    const isDataChanged = useMemo(() => {
        if (!authData) return false;

        // Comparamos todos los campos de UserData (incluyendo profileImage) con originalData.
        return Object.keys(userData).some(key => {
            const field = key as keyof UserData;
            return userData[field] !== originalData[field];
        });

    }, [userData, originalData, authData]);


    /**
     * Guarda los cambios validados, actualiza localStorage y sincroniza el useAuth.
     */
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (!isLoggedIn || !authData) {
            setMessage({ type: 'error', text: 'No hay sesión activa para guardar.' });
            return;
        }
        
        if (!isDataChanged) {
            setMessage({ type: 'error', text: 'No se detectaron cambios para guardar.' });
            return;
        }

        if (validateForm()) {
            setIsSaving(true);
            try {
                // 1. Obtener la lista de usuarios del localStorage
                const usuariosRegistrados: UserType[] = JSON.parse(localStorage.getItem('usuariosRegistrados') || '[]');
                const oldUser: UserType | undefined = usuariosRegistrados.find(u => u.email === authData.email);

                if (!oldUser) {
                    throw new Error("Usuario no encontrado para actualización.");
                }

                // 2. Combinar los datos: mantener la contraseña antigua, actualizar el resto (incluyendo profileImage de userData).
                const updatedFullData: UserType = {
                    ...oldUser,             // Contiene la 'contrasena'
                    ...userData,            // Contiene todos los campos del formulario
                };

                // 3. Actualizar el array de usuarios en localStorage
                const updatedUsuarios = usuariosRegistrados.map(u =>
                    u.email === oldUser.email ? updatedFullData : u
                );
                localStorage.setItem('usuariosRegistrados', JSON.stringify(updatedUsuarios));

                // 4. Preparar datos seguros para el estado global (sin contraseña)
                const { contrasena, ...safeUserData }: UserType = updatedFullData;

                // 5. SINCRONIZAR ESTADO GLOBAL y estados locales
                login(safeUserData); // Actualiza authData
                setOriginalData(safeUserData); 
                setIsEditing(false);
                setMessage({ type: 'success', text: 'Cambios guardados exitosamente. Tu sesión se ha actualizado.' });

            } catch (error) {
                console.error("Error al guardar:", error);
                setMessage({ type: 'error', text: 'Error al guardar los cambios en el perfil.' });
            } finally {
                setIsSaving(false);
            }
        } else {
            setMessage({ type: 'error', text: 'Por favor, corrige los errores en el formulario para guardar.' });
        }
    };

    const handleImageSave = (newImage: string | undefined) => {
        setUserData(prev => ({ ...prev, profileImage: newImage }));
        setIsModalOpen(false);

        if (!isEditing && isLoggedIn && authData) {
            
            const usuariosRegistrados: UserType[] = JSON.parse(localStorage.getItem('usuariosRegistrados') || '[]');
            const oldUser = usuariosRegistrados.find(u => u.email === authData.email);

            if (oldUser) {
                const updatedFullData: UserType = { ...oldUser, profileImage: newImage };

                const updatedUsers = usuariosRegistrados.map(u =>
                    u.email === oldUser.email ? updatedFullData : u
                );
                localStorage.setItem('usuariosRegistrados', JSON.stringify(updatedUsers));

                const { contrasena, ...safeUserData }: UserType = updatedFullData;
                login(safeUserData); 
                setOriginalData(safeUserData);

                const messageText = newImage
                    ? 'Imagen de perfil actualizada con éxito.'
                    : 'Imagen de perfil eliminada con éxito.';
                setMessage({ type: 'success', text: messageText });
            }
        } else if (isEditing) {
            const action = newImage ? 'seleccionada' : 'eliminada (en previsualización)';
            setMessage({ type: 'success', text: `Imagen ${action}. Presiona "Guardar Cambios" para confirmar y finalizar la edición.` });
        }
    }

    const isFormActiveForEditing = isEditing;


    if (loading) {
        return (
            <div className="text-center p-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando perfil...</span>
                </div>
                <p className="mt-2">Cargando datos de sesión...</p>
            </div>
        );
    }

    if (!isLoggedIn) {
        return (
            <div className={styles['pagina-perfil']}>
                <div className="contenedor-perfil">
                    <div className="alert alert-danger text-center" role="alert">
                        {message ? message.text : 'Error: Acceso denegado. Debes iniciar sesión para ver tu perfil.'}
                    </div>
                </div>
            </div>
        );
    }


    return (
        <div className={styles['pagina-perfil']}>
            <div className="contenedor-perfil">
                <div className="row justify-content-center">
                    <div className="col-12 col-lg-8 col-xl-6">

                        <div className={`${styles['card-perfil']} card`}>

                            <div className={`${styles['card-header-perfil']} text-center`}>

                                <div className={styles.logoFormulario}>

                                </div>

                                <h2 className={styles.tituloFormulario}>Mi Perfil</h2>
                                <p className={styles.subtituloFormulario}>Cuéntanos sobre ti.</p>

                                <div className={styles['profile-image-container']}>
                                    <img
                                        src={userData.profileImage || PerfilDefault}
                                        alt="Foto de perfil"
                                        className={`${styles['foto-perfil']} rounded-circle`}
                                        data-testid="profile-image"
                                    />
                                    <button
                                        className={`${styles['btn-edit-image']} btn-sm btn-light`}
                                        onClick={() => setIsModalOpen(true)} 
                                        aria-label="Cambiar imagen de perfil"
                                        data-testid="edit-image-button"
                                    >
                                        <i className="bi bi-pencil-fill">+ </i>
                                    </button>
                                </div>

                                <h3>{userData.nombreUsuario || userData.nombre || "Usuario"}</h3>
                            </div>

                            <div className="card-body">
                                {message && (
                                    <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'}`} role="alert" data-testid="perfil-message">
                                        {message.text}
                                    </div>
                                )}

                                <form onSubmit={handleSave} noValidate>
                                    <div className={styles['lista-datos-perfil']}>
                                        <FormField
                                            id="nombreUsuario"
                                            label="Nombre de Usuario"
                                            placeholder="ej. Juanito_123"
                                            value={userData.nombreUsuario}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={errors.nombreUsuario}
                                            disabled={!isFormActiveForEditing}
                                            dataTestId='perfil-nombreUsuario'
                                        />
                                        <FormField
                                            id="nombre"
                                            label="Nombre Completo"
                                            placeholder="Juan Pérez González"
                                            value={userData.nombre}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={errors.nombre}
                                            disabled={!isFormActiveForEditing}
                                            dataTestId='perfil-nombre'
                                        />
                                        <RutInputField
                                            value={userData.rut}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={errors.rut}
                                            disabled={!isFormActiveForEditing}
                                            dataTestId='perfil-rut'
                                        />
                                        <FormField
                                            id="email"
                                            label="Correo Electrónico"
                                            placeholder="tu.correo@ejemplo.com"
                                            type="email"
                                            value={userData.email}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={errors.email}
                                            disabled={true}
                                            dataTestId='perfil-email'
                                        />
                                        <FormField
                                            id="direccion"
                                            label="Dirección"
                                            placeholder="Calle 123, Comuna"
                                            type="text"
                                            value={userData.direccion}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={errors.direccion}
                                            disabled={!isFormActiveForEditing}
                                            dataTestId='perfil-direccion'
                                        />
                                        <PhoneInputField
                                            value={userData.telefono}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={errors.telefono}
                                            disabled={!isFormActiveForEditing}
                                            dataTestId='perfil-telefono'
                                        />

                                    </div>

                                    <div className={`${styles['botones-perfil']} text-center mt-4`}>
                                        {!isFormActiveForEditing ? (
                                            <button
                                                type="button"
                                                onClick={handleEdit}
                                                className={`${styles['btn-editar-perfil']} btn btn-primary`}
                                                data-testid="perfil-edit-button"
                                            >
                                                Editar Perfil
                                            </button>
                                        ) : (
                                            <>
                                                <button
                                                    type="submit"
                                                    className={`${styles['btn-guardar-perfil']} btn btn-success me-2`}
                                                    disabled={isSaving || Object.values(errors).some(e => e) || !isDataChanged}
                                                    data-testid="perfil-save-button"
                                                >
                                                    {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleCancel}
                                                    className={`${styles['btn-cancelar-perfil']} btn btn-secondary`}
                                                    disabled={isSaving}
                                                    data-testid="perfil-cancel-button"
                                                >
                                                    Cancelar
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ImageUploadModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onImageSave={handleImageSave}
                currentImage={userData.profileImage}
            />
        </div>
    );
};

export default Perfil;