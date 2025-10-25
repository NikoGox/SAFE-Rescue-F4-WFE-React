import React from 'react';
import styles from './formulario.module.css';
import type { InputFieldProps as CustomInputFieldProps } from '../types/UserType';

// =================================================================
// 1. Definición de la interfaz: Extensión para añadir isTextArea y disabled
// =================================================================

interface FormFieldProps extends CustomInputFieldProps {
    // Heredamos todas las props de tu tipo 'InputFieldProps'
    
    // 🛑 AÑADIDO: Permite el control de renderizar un <textarea>
    isTextArea?: boolean; 
    
    // 🛑 VERIFICADO: Permite deshabilitar el campo
    disabled?: boolean; 
}

const FormField: React.FC<FormFieldProps> = ({
    id,
    label,
    placeholder,
    type = 'text',
    value,
    onChange,
    onBlur, 
    error,
    required = true,
    dataTestId,
    disabled = false, 
    isTextArea = false, // 🛑 ACEPTA LA NUEVA PROP
}) => {
    const isCheckbox = type === 'checkbox';

    // La clase de error para textareas e inputs normales
    const controlClasses = `${styles.formControlRegistro} ${error ? styles.inputError : ''}`;

    return (
        <div className={styles.formGroupRegistro}>
            <label 
                htmlFor={id} 
                className={isCheckbox ? styles.checkboxLabel : ''}
            >
                {label}
            </label>
            
            {/* ⭐ LÓGICA DE RENDERIZADO: TEXTAREA vs INPUT */}
            {isTextArea ? (
                <textarea
                    id={id}
                    className={controlClasses} // Usa las mismas clases de estilo para coherencia
                    placeholder={placeholder}
                    required={required}
                    value={value as string} // value en textarea siempre es string
                    onChange={onChange}
                    onBlur={onBlur}
                    disabled={disabled}
                    rows={5} // Establece un número de filas por defecto
                    data-testid={dataTestId || `register-${id}`}
                />
            ) : (
                <input
                    type={type}
                    className={
                        isCheckbox ? styles.formControlCheckbox : 
                        controlClasses // Usa la clase de control normal
                    }
                    id={id}
                    data-testid={dataTestId || `register-${id}`}
                    placeholder={isCheckbox ? undefined : placeholder}
                    required={required}
                    disabled={disabled} 
                    {...(isCheckbox
                        ? { checked: value as boolean } 
                        : { value: value as string } 
                    )}
                    onChange={onChange}
                    onBlur={onBlur} 
                    autoComplete={id.includes('contrasena') ? 'new-password' : 'on'}
                />
            )}
            
            {/* Manejo de errores */}
            {error && !isCheckbox && (
                <p className={`${styles.mensajeError} ${styles.errorText}`}>{error}</p>
            )}
            {error && isCheckbox && (
                 <p className={`${styles.mensajeError} ${styles.errorText} ${styles.checkboxErrorPosition}`}>{error}</p>
            )}
        </div>
    );
};

export default FormField;