// src/api/geolocalizacionClient.ts
import axios, { type AxiosInstance, AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { getToken } from './PerfilesClient';

/**
 * 1. OBTENER LA URL BASE
 * Se usa la URL de desarrollo fija. La instancia de Axios utilizará esta base.
 */
const BASE_URL_GEOLOCALIZACION: string = 'http://localhost:8081/api-geolocalizacion/v1';

/**
 * 2. RECURSOS (ENDPOINTS) - Uso de objeto 'as const' para centralizar y tipar
 */
export const GeolocalizacionEndpoints = {
    DIRECCIONES: '/direcciones',
    COMUNAS: '/comunas',
    REGIONES: '/regiones',
    COORDENADAS: '/coordenadas',
    BUSCAR_POR_COORDENADAS: '/direcciones/buscar-por-coordenadas',
    BUSCAR_POR_DIRECCION: '/direcciones/buscar-por-direccion'
} as const;

// Tipo que extrae los valores de cadena del objeto para su uso en funciones
export type GeolocalizacionEndpointsType = typeof GeolocalizacionEndpoints[keyof typeof GeolocalizacionEndpoints];

// Interfaces para TypeScript
export interface Direccion {
    id?: number;
    calle: string;
    numero: string;
    complemento?: string;
    villa?: string;
    comuna: Comuna;
    coordenadas: Coordenadas;
}

export interface Coordenadas {
    id?: number;
    latitud: number;
    longitud: number;
}

export interface Comuna {
    id?: number;
    nombre: string;
    codigoPostal: string;
    region: Region;
}

export interface Region {
    id?: number;
    nombre: string;
    identificacion: string;
}

export interface BuscarPorCoordenadasRequest {
    latitud: number;
    longitud: number;
    radioKm?: number;
}

export interface CrearDireccionRequest {
    calle: string;
    numero: string;
    complemento?: string;
    villa?: string;
    comunaId: number;
    coordenadas: {
        latitud: number;
        longitud: number;
    };
}

/**
 * 3. CONFIGURACIÓN DE LA INSTANCIA DE AXIOS (CLIENTE)
 * Esta instancia ya tiene configurada la URL base.
 */
export const geolocalizacionClient: AxiosInstance = axios.create({
    baseURL: BASE_URL_GEOLOCALIZACION,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 15000, // Timeout de 15 segundos
});

// Tipo para requests con retry
interface RetryableConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

/**
 * Interceptor para agregar el token JWT automáticamente a las requests
 */
geolocalizacionClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Agregar timestamp para evitar cache en GET requests
        if (config.method?.toLowerCase() === 'get') {
            config.params = {
                ...config.params,
                _t: Date.now()
            };
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Interceptor para manejar respuestas de error
 */
geolocalizacionClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Token expirado o inválido - usar la función clearToken del cliente de perfiles
            if (typeof window !== 'undefined') {
                window.location.href = '/login?sessionExpired=true';
            }
        }
        
        // Manejo de errores específicos
        if (error.response) {
            const status = error.response.status;
            const message = getGeolocalizacionErrorMessage(error);
            
            console.error(`Geolocalización API Error [${status}]:`, message);
        }
        
        return Promise.reject(error);
    }
);

/**
 * 4. FUNCIÓN DE CONSTRUCCIÓN DE PATH RELATIVO
 * Esta función construye el path relativo, que será combinado con el 'baseURL'
 * por la instancia de Axios.
 * @param resource El recurso principal (ej: GeolocalizacionEndpoints.DIRECCIONES).
 * @param pathAdicional Un path opcional que se añade al final (ej: '/123' para un GET por ID).
 * @returns El path relativo completo (ej: '/direcciones/123').
 */
export const buildApiUrlPathGeolocalizacion = (resource: GeolocalizacionEndpointsType, pathAdicional: string = ''): string => {
    // El path del recurso (direcciones, comunas, etc.)
    const resourcePath = resource; 

    // Concatenamos Recurso + Path Adicional
    return `${resourcePath}${pathAdicional}`;
}

/**
 * Funciones de API específicas para geolocalización
 * Mantienen la compatibilidad con tu código existente pero con mejor tipado
 */
export const geolocalizacionAPI = {
    // Direcciones
    crearDireccion: async (direccionData: CrearDireccionRequest): Promise<Direccion> => {
        const response = await geolocalizacionClient.post(
            buildApiUrlPathGeolocalizacion(GeolocalizacionEndpoints.DIRECCIONES), 
            direccionData
        );
        return response.data;
    },

    obtenerDireccion: async (id: number): Promise<Direccion> => {
        const response = await geolocalizacionClient.get(
            buildApiUrlPathGeolocalizacion(GeolocalizacionEndpoints.DIRECCIONES, `/${id}`)
        );
        return response.data;
    },

    obtenerTodasDirecciones: async (): Promise<Direccion[]> => {
        const response = await geolocalizacionClient.get(
            buildApiUrlPathGeolocalizacion(GeolocalizacionEndpoints.DIRECCIONES)
        );
        return response.data;
    },

    actualizarDireccion: async (id: number, direccionData: Partial<CrearDireccionRequest>): Promise<Direccion> => {
        const response = await geolocalizacionClient.put(
            buildApiUrlPathGeolocalizacion(GeolocalizacionEndpoints.DIRECCIONES, `/${id}`),
            direccionData
        );
        return response.data;
    },

    eliminarDireccion: async (id: number): Promise<void> => {
        await geolocalizacionClient.delete(
            buildApiUrlPathGeolocalizacion(GeolocalizacionEndpoints.DIRECCIONES, `/${id}`)
        );
    },

    // Búsquedas avanzadas
    buscarPorCoordenadas: async (request: BuscarPorCoordenadasRequest): Promise<Direccion[]> => {
        const response = await geolocalizacionClient.post(
            buildApiUrlPathGeolocalizacion(GeolocalizacionEndpoints.BUSCAR_POR_COORDENADAS),
            request
        );
        return response.data;
    },

    buscarPorDireccion: async (direccion: string, comuna?: string): Promise<Direccion[]> => {
        const params: any = { direccion };
        if (comuna) params.comuna = comuna;
        
        const response = await geolocalizacionClient.get(
            buildApiUrlPathGeolocalizacion(GeolocalizacionEndpoints.BUSCAR_POR_DIRECCION),
            { params }
        );
        return response.data;
    },

    // Comunas
    obtenerComunas: async (): Promise<Comuna[]> => {
        const response = await geolocalizacionClient.get(
            buildApiUrlPathGeolocalizacion(GeolocalizacionEndpoints.COMUNAS)
        );
        return response.data;
    },

    obtenerComunaPorId: async (id: number): Promise<Comuna> => {
        const response = await geolocalizacionClient.get(
            buildApiUrlPathGeolocalizacion(GeolocalizacionEndpoints.COMUNAS, `/${id}`)
        );
        return response.data;
    },

    // Regiones
    obtenerRegiones: async (): Promise<Region[]> => {
        const response = await geolocalizacionClient.get(
            buildApiUrlPathGeolocalizacion(GeolocalizacionEndpoints.REGIONES)
        );
        return response.data;
    },

    obtenerRegionPorId: async (id: number): Promise<Region> => {
        const response = await geolocalizacionClient.get(
            buildApiUrlPathGeolocalizacion(GeolocalizacionEndpoints.REGIONES, `/${id}`)
        );
        return response.data;
    },

    // Coordenadas
    obtenerCoordenadas: async (id: number): Promise<Coordenadas> => {
        const response = await geolocalizacionClient.get(
            buildApiUrlPathGeolocalizacion(GeolocalizacionEndpoints.COORDENADAS, `/${id}`)
        );
        return response.data;
    }
};

/**
 * Funciones de utilidad
 */
export const getGeolocalizacionErrorMessage = (error: AxiosError): string => {
    if (error.response?.data && typeof error.response.data === 'object') {
        const data = error.response.data as any;
        return data.message || data.error || 'Error desconocido en geolocalización';
    }
    return error.message || 'Error de conexión con el servicio de geolocalización';
};

/**
 * Hook personalizado para geolocalización (para usar en componentes React)
 */
export const useGeolocalizacion = () => {
    const obtenerComunasYRegiones = async (): Promise<{ comunas: Comuna[], regiones: Region[] }> => {
        try {
            const [comunas, regiones] = await Promise.all([
                geolocalizacionAPI.obtenerComunas(),
                geolocalizacionAPI.obtenerRegiones()
            ]);
            return { comunas, regiones };
        } catch (error) {
            console.error('Error obteniendo datos geográficos:', error);
            throw error;
        }
    };

    const buscarDireccionCompleta = async (calle: string, numero: string, comunaId?: number): Promise<Direccion[]> => {
        const direccionCompleta = `${calle} ${numero}`;
        return await geolocalizacionAPI.buscarPorDireccion(direccionCompleta);
    };

    return {
        ...geolocalizacionAPI,
        obtenerComunasYRegiones,
        buscarDireccionCompleta
    };
};

export default geolocalizacionClient;