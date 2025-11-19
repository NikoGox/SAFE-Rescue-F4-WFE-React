// src/types/DonacionTypes.ts

/**
 * Tipos de estado de una transacción de donación.
 */
export type EstadoDonacion = 'PENDIENTE_PAGO' | 'COMPLETADA' | 'FALLIDA' | 'REEMBOLSADA';

/**
 * Tipos de método de pago.
 */
export type MetodoPago = 'TARJETA_CREDITO' | 'PAYPAL' | 'TRANSFERENCIA';

/**
 * Interfaz principal para la respuesta del backend al consultar una Donación.
 */
export interface DonacionResponse {
    /** ID único de la donación. */
    id: number;
    
    /** Clave foránea al usuario que realiza la donación. */
    idUsuarioDonante: number | null; // Puede ser anónimo

    /** Monto donado. */
    monto: number; 
    
    /** Moneda de la donación (ej: USD, CLP, EUR). */
    moneda: string; 
    
    /** Fecha y hora de creación de la solicitud de donación (ISO string). */
    fechaCreacion: string; 
    
    /** Estado actual de la transacción. */
    estado: EstadoDonacion; 
    
    /** Método de pago utilizado. */
    metodoPago: MetodoPago;
    
    /** ID de la transacción en el sistema de pagos externo (ej: Stripe, PayPal). */
    transaccionIdExterno: string;
}

/**
 * DTO para la CREACIÓN/INICIO de una nueva donación.
 * Esto inicia el proceso de pago.
 */
export interface DonacionCreationDTO {
    /** Monto a donar. */
    monto: number; 
    
    /** Moneda de la donación. */
    moneda: string; 

    /** ID del usuario donante (opcional si la donación es anónima). */
    idUsuarioDonante?: number; 
    
    /** Método de pago seleccionado por el usuario. */
    metodoPago: MetodoPago;
    
    /** URL de retorno tras el éxito del pago. */
    urlSuccess: string;
    
    /** URL de retorno tras la cancelación o fallo del pago. */
    urlCancel: string;
}

/**
 * DTO para la respuesta de inicio de pago (contiene el enlace de redirección).
 */
export interface DonacionInitResponse {
    /** ID de la donación creada en el backend. */
    idDonacion: number;
    /** URL a la que el frontend debe redirigir al usuario para completar el pago. */
    paymentUrl: string;
    /** Puede incluir detalles como el token de sesión o similar. */
    sessionId?: string; 
}