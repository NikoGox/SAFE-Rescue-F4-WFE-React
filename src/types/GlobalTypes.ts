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
