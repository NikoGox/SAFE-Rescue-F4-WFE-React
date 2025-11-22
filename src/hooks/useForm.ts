import { useState, useCallback } from 'react';
import { Validaciones } from '../utils/Validaciones';

interface UseFormProps<T> {
  initialValues: T;
  onSubmit: (values: T) => void | Promise<void>;
  validate?: (values: T) => Record<string, string>;
}

export const useForm = <T extends Record<string, any>>({
  initialValues,
  onSubmit,
  validate
}: UseFormProps<T>) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const target = e.target;
    const { id, type } = target;
    
    let newValue: any;

    if (type === 'checkbox') {
      // Para checkboxes, necesitamos hacer un type assertion
      const inputTarget = target as HTMLInputElement;
      newValue = inputTarget.checked;
    } else if (type === 'number') {
      newValue = target.value === '' ? '' : Number(target.value);
    } else {
      newValue = target.value;
    }
    
    setValues(prev => ({
      ...prev,
      [id]: newValue
    }));

    // Limpiar error cuando el usuario escribe
    if (errors[id]) {
      setErrors(prev => ({
        ...prev,
        [id]: ''
      }));
    }
  }, [errors]);

  const handleBlur = useCallback((
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const target = e.target;
    const { id, type } = target;
    
    let value: string;

    if (type === 'checkbox') {
      // Para checkboxes, el valor es booleano pero la validación espera string
      const inputTarget = target as HTMLInputElement;
      value = inputTarget.checked ? 'true' : 'false';
    } else {
      value = target.value;
    }

    // Validación específica por campo
    let error = '';
    
    switch (id) {
      case 'rut':
      case 'rutCompleto':
        error = Validaciones.validateChileanRUT(value) || '';
        break;
      case 'telefono':
        error = Validaciones.validatePhoneNumber(value) || '';
        break;
      case 'correo':
        error = Validaciones.validateEmail(value) || '';
        break;
      case 'contrasena':
        error = Validaciones.validateStrongPassword(value) || '';
        break;
      case 'nombre':
      case 'aPaterno':
      case 'aMaterno':
        error = Validaciones.validateNameLettersOnly(value) || '';
        break;
      case 'mensaje':
      case 'detalle':
        error = Validaciones.validateMessage(value) || '';
        break;
      default:
        if (validate) {
          const validationErrors = validate(values);
          error = validationErrors[id] || '';
        }
    }

    if (error) {
      setErrors(prev => ({
        ...prev,
        [id]: error
      }));
    }
  }, [values, validate]);

  const validateForm = useCallback((): boolean => {
    let newErrors: Record<string, string> = {};

    // Validación personalizada si se proporciona
    if (validate) {
      newErrors = validate(values);
    }

    // Validaciones específicas para formularios comunes
    if ('rutCompleto' in values && typeof values.rutCompleto === 'string') {
      const rutError = Validaciones.validateChileanRUT(values.rutCompleto);
      if (rutError) newErrors.rutCompleto = rutError;
    }

    if ('correo' in values && typeof values.correo === 'string') {
      const emailError = Validaciones.validateEmail(values.correo);
      if (emailError) newErrors.correo = emailError;
    }

    if ('telefono' in values && typeof values.telefono === 'string') {
      const phoneError = Validaciones.validatePhoneNumber(values.telefono);
      if (phoneError) newErrors.telefono = phoneError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values, validate]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Error en el formulario:', error);
      // Puedes manejar errores del servidor aquí
      if (error instanceof Error) {
        setErrors(prev => ({
          ...prev,
          _form: error.message
        }));
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [values, onSubmit, validateForm]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const setFieldError = useCallback((field: string, error: string) => {
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  }, []);

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
    setFieldError,
    validateForm
  };
};