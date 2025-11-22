import React, { useState } from 'react';
import * as Validaciones from '../utils/Validaciones';
import styles from './SpecializedFields.module.css';
import { BsEye, BsEyeSlash } from "react-icons/bs";

interface BaseSpecializedFieldProps {
    value: string | number | boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
    error?: string;
}

interface SpecializedFieldProps extends BaseSpecializedFieldProps {
    disabled?: boolean;
    dataTestId?: string;
    fieldId?: string;
    label?: string;
}

// ===== RUT INPUT FIELD =====
export const RutInputField: React.FC<SpecializedFieldProps> = ({
    value,
    onChange,
    onBlur,
    error,
    disabled = false,
    dataTestId,
    fieldId = 'rutCompleto',
    label = 'RUT'
}) => {
    const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formattedValue = Validaciones.formatRut(e.target.value);

        onChange({
            ...e,
            target: {
                ...e.target,
                value: formattedValue,
                id: fieldId
            }
        } as React.ChangeEvent<HTMLInputElement>);
    };

    return (
        <div className={styles.formGroupRegistro}>
            <label htmlFor={fieldId}>{label}</label>
            <input
                type="text"
                className={`${styles.formControlRegistro} ${error ? styles.inputError : ''}`}
                id={fieldId}
                data-testid={dataTestId || "register-rut"}
                placeholder="12.345.678-9"
                required
                value={value}
                onChange={handleRutChange}
                onBlur={onBlur}
                autoComplete="off"
                maxLength={12}
                disabled={disabled}
            />
            {error && (
                <p className={`${styles.mensajeError} ${styles.errorText}`}>{error}</p>
            )}
        </div>
    );
};

// ===== PHONE INPUT FIELD =====
export const PhoneInputField: React.FC<SpecializedFieldProps> = ({
    value,
    onChange,
    onBlur,
    error,
    disabled = false,
    dataTestId,
    fieldId = 'telefono',
    label = 'Número de Teléfono'
}) => {
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formattedValue = Validaciones.formatPhoneNumber(e.target.value);

        onChange({
            ...e,
            target: {
                ...e.target,
                value: formattedValue,
                id: fieldId
            }
        } as React.ChangeEvent<HTMLInputElement>);
    };

    return (
        <div className={styles.formGroupRegistro}>
            <label htmlFor={fieldId}>{label}</label>
            <input
                type="tel"
                className={`${styles.formControlRegistro} ${error ? styles.inputError : ''}`}
                id={fieldId}
                data-testid={dataTestId || "register-phone"}
                placeholder="9 1234 5678"
                required
                value={value}
                onChange={handlePhoneChange}
                onBlur={onBlur}
                maxLength={12}
                disabled={disabled}
            />
            {error && (
                <p className={`${styles.mensajeError} ${styles.errorText}`}>{error}</p>
            )}
        </div>
    );
};

// ===== PASSWORD INPUT FIELD (con botón mostrar/ocultar) =====
export const PasswordInputField: React.FC<SpecializedFieldProps & { placeholder?: string }> = ({
    value,
    onChange,
    onBlur,
    error,
    disabled = false,
    dataTestId,
    fieldId = 'contrasena',
    label = 'Contraseña',
    placeholder = 'Ingresa tu contraseña'
}) => {
    const [mostrarContrasena, setMostrarContrasena] = useState(false);

    const toggleMostrar = () => {
        setMostrarContrasena(!mostrarContrasena);
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({
            ...e,
            target: {
                ...e.target,
                id: fieldId
            }
        } as React.ChangeEvent<HTMLInputElement>);
    };

    return (
        <div className={styles.formGroupRegistro}>
            <label htmlFor={fieldId}>{label}</label>
            <div className={styles.passwordInputWrapper}>
                <input
                    type={mostrarContrasena ? "text" : "password"}
                    className={`${styles.formControlRegistro} ${styles.passwordInput} ${error ? styles.inputError : ''}`}
                    id={fieldId}
                    data-testid={dataTestId || `register-${fieldId}`}
                    placeholder={placeholder}
                    required
                    value={value}
                    onChange={handlePasswordChange}
                    onBlur={onBlur}
                    autoComplete="new-password"
                    disabled={disabled}
                />
                <button
                    type="button"
                    className={styles.togglePasswordButton} 
                    onClick={toggleMostrar}
                    title={mostrarContrasena ? "Ocultar contraseña" : "Mostrar contraseña"}
                    aria-label={mostrarContrasena ? "Ocultar contraseña" : "Mostrar contraseña"}
                    disabled={disabled}
                >
                    {mostrarContrasena ? <BsEyeSlash size={20} /> : <BsEye size={20} />}
                </button>

            </div>
            {error && (
                <p className={`${styles.mensajeError} ${styles.errorText}`}>{error}</p>
            )}
        </div>
    );
};

export default {
    RutInputField,
    PhoneInputField,
    PasswordInputField
};