// src/api/perfilesClient.ts
import axios, { type AxiosInstance, AxiosError } from 'axios';

const BASE_URL_PERFILES: string = 'http://localhost:8082/api-perfiles/v1';

export const PerfilesEndpoints = {
    USUARIOS: '/usuarios',
    TIPOSUSUARIO: '/tipos-usuario',
    BOMBEROS: '/bomberos',
    CIUDADANOS: '/ciudadanos', 
    COMPANIAS: '/companias',
    EQUIPOS: '/equipos',
    TIPOSEQUIPO: '/tipos-equipo',
    HISTORIALUSUARIOS: '/historial',
    AUTH: '/auth',
} as const;

export type PerfilesEndpointsType = typeof PerfilesEndpoints[keyof typeof PerfilesEndpoints];

/**
 * Cliente de Axios preconfigurado para el microservicio de perfiles
 * Incluye manejo automático de tokens JWT
 */
export const perfilesClient: AxiosInstance = axios.create({
    baseURL: BASE_URL_PERFILES,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

/**
 * Interceptor para agregar el token JWT automáticamente a las requests
 */
perfilesClient.interceptors.request.use(
    (config: { headers: { Authorization: string; }; }) => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: any) => {
        return Promise.reject(error);
    }
);

/**
 * Interceptor para manejar respuestas de error (token expirado, etc.)
 */
perfilesClient.interceptors.response.use(
    (response: any) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Token expirado o inválido
            clearToken();
            // Opcional: redirigir al login
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

/**
 * Funciones de utilidad para manejar el token en el almacenamiento
 */
export const tokenManager = {
    setToken: (token: string): void => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('perfiles_token', token);
        }
    },

    getToken: (): string | null => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('perfiles_token');
        }
        return null;
    },

    clearToken: (): void => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('perfiles_token');
        }
    },

    getTokenPayload: (): any => {
        const token = getToken();
        if (!token) return null;
        
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload;
        } catch (error) {
            console.error('Error decoding token:', error);
            return null;
        }
    },

    isTokenExpired: (): boolean => {
        const payload = tokenManager.getTokenPayload();
        if (!payload || !payload.exp) return true;
        
        return Date.now() >= payload.exp * 1000;
    }
};

// Alias para las funciones del token manager
export const setToken = tokenManager.setToken;
export const getToken = tokenManager.getToken;
export const clearToken = tokenManager.clearToken;

export const buildApiUrlPathPerfiles = (resource: PerfilesEndpointsType, pathAdicional: string = ''): string => {
    const resourcePath = resource; 
    return `${resourcePath}${pathAdicional}`;
}