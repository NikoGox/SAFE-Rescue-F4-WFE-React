import type { FormDataType,ContactData,Errors, UserRegistroFormType } from "./PerfilesType";

/**
 * Interfaz genérica para manejar respuestas paginadas (común en APIs REST de Spring Data JPA).
 * @template T El tipo de dato que contiene la lista.
 */
export interface PagedResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number; // Número de página actual (base 0)
    numberOfElements: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}


// ===========================================================
// 8. PROPS DE COMPONENTES
// ===========================================================

/**
 * Propiedades (Props) base para un componente de campo de formulario genérico.
 */
export interface InputFieldProps {
    id: keyof FormDataType | keyof ContactData | keyof Errors |
    'calle' | 'numero' | 'villa' | 'complemento' | 'idComuna' | 'titulo' | 'detalle' | 'edit-detalle' | 'edit-titulo' |
    `direccion.${keyof UserRegistroFormType['direccion']}`;
    label: string;
    placeholder: string;
    type?: 'text' | 'email' | 'tel' | 'password' | 'rut' | 'checkbox' | 'number';
    value: string | boolean | number;

    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;

    error?: string | null;
    required?: boolean;
    dataTestId?: string;
    disabled?: boolean;
    isTextArea?: boolean;
}

/**
 * Propiedades (Props) para campos de formulario especializados.
 */
export interface SpecializedFieldProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    error: string | null | undefined;
    disabled?: boolean;
    dataTestId?: string;
}

/**
 * Propiedades para botones de monto.
 */
export interface MontoButtonProps {
    value: number;
    onClick: (value: number) => void;
    active: boolean;
}