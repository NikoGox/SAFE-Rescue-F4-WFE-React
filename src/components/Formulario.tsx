import React from "react";
import styles from "./formulario.module.css";
import type { InputFieldProps as CustomInputFieldProps } from "../types/PerfilesType";

interface FormFieldProps extends CustomInputFieldProps {
  isTextArea?: boolean;
  disabled?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  onBlur,
  error,
  required = true,
  dataTestId,
  disabled = false,
  isTextArea = false,
}) => {
  const isCheckbox = type === "checkbox"; 

  const controlClasses = `${styles.formControlRegistro} ${
    error ? styles.inputError : ""
  }`;

  return (
    <div className={styles.formGroupRegistro}>
      <label htmlFor={id} className={isCheckbox ? styles.checkboxLabel : ""}>
        {label}{" "}
      </label>
      {isTextArea ? (
        <textarea
          id={id}
          className={controlClasses}
          placeholder={placeholder}
          required={required}
          value={value as string}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          rows={5}
          data-testid={dataTestId || `register-${id}`}
        />
      ) : (
        <input
          type={type}
          className={
            isCheckbox ? styles.formControlCheckbox : controlClasses 
          }
          id={id}
          data-testid={dataTestId || `register-${id}`}
          placeholder={isCheckbox ? undefined : placeholder}
          required={required}
          disabled={disabled}
          {...(isCheckbox
            ? { checked: value as boolean }
            : { value: value as string })}
          onChange={onChange}
          onBlur={onBlur}
          autoComplete={id.includes("contrasena") ? "new-password" : "on"}
        />
      )}
      {error && !isCheckbox && (
        <p className={`${styles.mensajeError} ${styles.errorText}`}>{error}</p>
      )}
      {error && isCheckbox && (
        <p
          className={`${styles.mensajeError} ${styles.errorText} ${styles.checkboxErrorPosition}`}
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;