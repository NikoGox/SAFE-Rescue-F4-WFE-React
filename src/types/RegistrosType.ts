/**
 * Interfaz que define la estructura de metadatos de una Foto de Incidente.
 * No representa el binario de la imagen, sino sus propiedades en la base de datos.
 */
export interface Foto {
    /** Identificador único de la foto. */
    idFoto: number;

    /** URL o path donde se almacena la imagen (para acceder a ella). */
    url: string;

    /** Descripción de la foto (anteriormente nombreArchivo). */
    descripcion: string;

    /** Fecha y hora en que la foto fue subida. */
    fechaSubida: string;

}


/**
 * Interfaz que define la estructura de un Estado de Incidente.
 * * Un estado se refiere a la fase en la que se encuentra un incidente (ej: "Reportado", "En Proceso", "Resuelto").
 */
export interface Estado {
    /** Identificador único del estado. */
    idEstado: number;

    /** Nombre del estado (ej: "Reportado"). */
    nombre: string;

    /** Descripción detallada del estado. */
    descripcion: string;
}