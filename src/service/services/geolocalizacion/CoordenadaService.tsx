// src/services/CoordenadasService.ts
import axios, { AxiosError } from 'axios';
import { geolocalizacionClient, GeolocalizacionEndpoints, type GeolocalizacionEndpointsType } from '../../clients/GeolocalizacionClient.tsx';
import { type Coordenadas, type GeocodingResult } from '../../../types/GeolocalizacionType.ts'; 
// Asumiendo que existe un tipo Coordenadas {lat: number, lng: number} 
// y un GeocodingResult para el resultado de la búsqueda

/**
 * Función de utilidad para construir el path completo del recurso.
 * @param resource El recurso principal (ej: GeolocalizacionEndpoints.GEOCODE).
 * @param pathAdicional Un path opcional que se añade al final (ej: '/search').
 * @returns El path relativo completo (ej: '/geocode/search').
 */
const buildApiUrlPathCoordenadas = (resource: GeolocalizacionEndpointsType, pathAdicional: string = ''): string => {
    // Lógica para asegurar la unión correcta del path
    const cleanPathAdicional = pathAdicional.startsWith('/') || pathAdicional === '' ? pathAdicional : `/${pathAdicional}`;
    return `${resource}${cleanPathAdicional}`;
}

// --------------------------------------------------------------------------------
// FUNCIONES DEL SERVICIO DE COORDENADAS (GEOCODIFICACIÓN)
// --------------------------------------------------------------------------------

/**
 * Realiza una geocodificación (busca coordenadas a partir de una dirección de texto).
 * @param query La dirección de texto a buscar (ej: "Av. Siempre Viva 742, Springfield").
 * @returns Una promesa que resuelve con una lista de resultados de geocodificación.
 */
export const geocodeAddress = async (query: string): Promise<GeocodingResult[]> => {
    // Asumiendo que tu API tiene un endpoint para buscar direcciones: /geocode/search?address=...
    const path = buildApiUrlPathCoordenadas(GeolocalizacionEndpoints.COORDENADAS, `/search`); 
    
    try {
        // Usamos params para enviar la dirección como parámetro de consulta
        const response = await geolocalizacionClient.get<GeocodingResult[]>(path, { params: { address: query } });
        console.log(`Geocodificación para "${query}" exitosa.`, response.data);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(`[CoordenadasService] Error en geocodificación para "${query}": ${error.message}`, error.response?.data);
        } else {
            console.error("[CoordenadasService] Error inesperado en geocodificación:", error);
        }
        throw error;
    }
}

/**
 * Realiza una geocodificación inversa (busca la dirección a partir de coordenadas).
 * @param lat La latitud.
 * @param lng La longitud.
 * @returns Una promesa que resuelve con el resultado de la dirección encontrada.
 */
export const reverseGeocode = async (lat: number, lng: number): Promise<GeocodingResult> => {
    // Asumiendo que tu API tiene un endpoint para geocodificación inversa: /geocode/reverse?lat=...&lng=...
    const path = buildApiUrlPathCoordenadas(GeolocalizacionEndpoints.COORDENADAS, `/reverse`); 

    try {
        const response = await geolocalizacionClient.get<GeocodingResult>(path, { params: { lat, lng } });
        console.log(`Geocodificación inversa para (${lat}, ${lng}) exitosa.`, response.data);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(`[CoordenadasService] Error en geocodificación inversa para (${lat}, ${lng}): ${error.message}`, error.response?.data);
        }
        throw error;
    }
}