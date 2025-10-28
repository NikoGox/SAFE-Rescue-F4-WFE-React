import React from 'react';
import styles from './formulario.module.css';
import { formatRut, formatPhoneNumber } from '../utils/Validaciones';
import type { SpecializedFieldProps as BaseSpecializedFieldProps } from '../types/UserType';

interface SpecializedFieldProps extends BaseSpecializedFieldProps {
    disabled?: boolean;
    dataTestId?: string; 
}

export const RutInputField: React.FC<SpecializedFieldProps> = ({ 
    value, 
    onChange, 
    onBlur, 
    error,
    disabled = false,
    dataTestId
}) => {
    
    const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formattedValue = formatRut(e.target.value);
        
        onChange({
            ...e,
            target: { 
                ...e.target, 
                value: formattedValue, 
                id: 'rut'
            }
        });
    };

    return (
        <div className={styles.formGroupRegistro}>
            <label htmlFor="rut">RUT</label>
            <input
                type="text"
                className={`${styles.formControlRegistro} ${error ? styles.inputError : ''}`}
                id="rut"
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

export const PhoneInputField: React.FC<SpecializedFieldProps> = ({ 
    value, 
    onChange, 
    onBlur, 
    error,
    disabled = false, 
    dataTestId
}) => {
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formattedValue = formatPhoneNumber(e.target.value);
        
        onChange({
            ...e,
            target: { 
                ...e.target, 
                value: formattedValue, 
                id: 'telefono' 
            }
        });
    };

    return (
        <div className={styles.formGroupRegistro}>
            <label htmlFor="telefono">Número Teléfono</label>
            <input
                id="telefono"
                data-testid={dataTestId || "register-telefono"} 
                value={value}
                onChange={handlePhoneChange}
                onBlur={onBlur} 
                type="tel"
                className={`${styles.formControlRegistro} ${error ? styles.inputError : ''}`}
                placeholder="9 1234 5678"
                required
                maxLength={11}
                autoComplete="tel"
                disabled={disabled} 
            />
            {error && (
                <p className={`${styles.mensajeError} ${styles.errorText}`}>{error}</p>
            )}
        </div>
    );
};