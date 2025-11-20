// src/types/DonacionTypes.ts

/**
 * Tipos de método de pago (para uso en frontend, mapeados a strings del backend)
 */
export type MetodoPago = 'TARJETA_CREDITO' | 'PAYPAL' | 'TRANSFERENCIA';

/**
 * Mapeo de métodos de pago del frontend al backend
 */
export const METODOS_PAGO_BACKEND: Record<MetodoPago, string> = {
    TARJETA_CREDITO: 'Tarjeta de Crédito',
    PAYPAL: 'PayPal',
    TRANSFERENCIA: 'Transferencia Bancaria'
} as const;

/**
 * Interfaz principal para la respuesta del backend al consultar una Donación.
 * Ajustado según la entidad real del backend.
 */
export interface DonacionResponse {
    idDonacion: number;
    idDonante: number;                    // ← Obligatorio (no anónimo)
    monto: number;                        // ← Entero (CLP sin decimales)
    fechaDonacion: string;                // ← Formato: "2025-11-17T15:00:00"
    metodoPago: string;                   // ← Valores: "Tarjeta de Crédito", "PayPal", etc.
    tipoHomenaje?: string | null;         // ← Opcional
    detalleHomenaje?: string | null;      // ← Opcional
}

/**
 * DTO para la CREACIÓN de una nueva donación.
 * Basado en la entidad Donacion del backend.
 */
export interface DonacionCreationDTO {
    idDonante: number;                    // ← Obligatorio (persona registrada o con datos)
    monto: number;                        // ← Entero (CLP sin decimales)
    metodoPago: string;                   // ← String del backend
    tipoHomenaje?: string | null;         // ← Opcional
    detalleHomenaje?: string | null;      // ← Opcional
}

/**
 * DTO para creación de donación usando enums del frontend
 */
export interface DonacionCreationFrontendDTO {
    idDonante: number;
    monto: number;
    metodoPago: MetodoPago;               // ← Enum del frontend
    tipoHomenaje?: string | null;
    detalleHomenaje?: string | null;
}

/**
 * Response simplificado para listados de donaciones
 */
export interface DonacionSimplificada {
    idDonacion: number;
    monto: number;
    fechaDonacion: string;
    metodoPago: string;
    nombreDonante?: string;               // ← Enriquecido con datos del donante
}

// ===========================================================
// UTILIDADES
// ===========================================================

/**
 * Convierte DTO del frontend (con enum) a DTO del backend (con string)
 */
export const convertirDonacionABackend = (
    donacion: DonacionCreationFrontendDTO
): DonacionCreationDTO => {
    return {
        ...donacion,
        metodoPago: METODOS_PAGO_BACKEND[donacion.metodoPago]
    };
};

/**
 * Formatea el monto para mostrar en UI (agrega separadores de miles)
 */
export const formatearMonto = (monto: number): string => {
    return `$${monto.toLocaleString('es-CL')}`;
};

/**
 * Obtiene el label legible del método de pago
 */
export const obtenerLabelMetodoPago = (metodoPago: string): string => {
    const entries = Object.entries(METODOS_PAGO_BACKEND);
    const found = entries.find(([_, value]) => value === metodoPago);
    return found ? found[1] : metodoPago;
};

/**
 * Valida que el monto sea válido para Chile (entero positivo)
 */
export const validarMontoChile = (monto: number): boolean => {
    return Number.isInteger(monto) && monto > 0;
};

/**
 * Crea un DTO de donación con validaciones básicas
 */
export const crearDonacionDTO = (
    idDonante: number,
    monto: number,
    metodoPago: MetodoPago,
    tipoHomenaje?: string,
    detalleHomenaje?: string
): DonacionCreationFrontendDTO => {
    if (!validarMontoChile(monto)) {
        throw new Error('El monto debe ser un número entero positivo');
    }

    return {
        idDonante,
        monto,
        metodoPago,
        tipoHomenaje: tipoHomenaje || null,
        detalleHomenaje: detalleHomenaje || null
    };
};