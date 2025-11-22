// src/api/perfilesClient.ts
import axios, { type AxiosInstance, AxiosError, type InternalAxiosRequestConfig } from 'axios';

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
    LOGIN: '/auth/login',
    REGISTER: '/auth/register-ciudadano', // ✅ Corregido
    VALIDATE: '/auth/validate'
} as const;

export type PerfilesEndpointsType = typeof PerfilesEndpoints[keyof typeof PerfilesEndpoints];

// Interfaces para las respuestas de autenticación
export interface LoginResponse {
    token: string;
    usuario: {
        id: number;
        email: string;
        tipoUsuario: string;
        activo: boolean;
    };
}

export interface RegisterRequest {
    email: string;
    password: string;
    tipoUsuario: string;
    // Datos específicos según el tipo de usuario
    datosBombero?: {
        rut: string;
        nombre: string;
        apellido: string;
        companiaId: number;
    };
    datosCiudadano?: {
        rut: string;
        nombre: string;
        apellido: string;
        telefono: string;
    };
}

export interface RegisterResponse {
    id: number;
    email: string;
    tipoUsuario: string;
    activo: boolean;
}

// 🔥 TOKEN DE SERVICIO INTERNO (S2S)
const SERVICE_TOKEN = '8f4f22d4-1a98-4b7e-90f7-3c5e00b8c6e2'; // Reemplaza con tu token real

/**
 * Cliente de Axios preconfigurado para el microservicio de perfiles
 * Incluye manejo automático de tokens JWT y S2S
 */
export const perfilesClient: AxiosInstance = axios.create({
    baseURL: BASE_URL_PERFILES,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
    withCredentials: false,
});

// Tipo para requests con retry
interface RetryableConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
    _useServiceToken?: boolean;
}

/**
 * Interceptor para agregar el token apropiado automáticamente
 */
perfilesClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const requestConfig = config as RetryableConfig;

        //  DECIDIR QUÉ TOKEN USAR
        if (requestConfig._useServiceToken) {
            // Usar token de servicio interno para S2S
            config.headers['X-Service-Token'] = SERVICE_TOKEN;
            console.log('🔧 Usando token de servicio para request:', config.url);
        } else {
            // Usar token JWT para autenticación de usuario normal
            const token = getToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
                console.log('👤 Usando token JWT para request:', config.url);
            }
        }

        // Agregar timestamp para evitar cache
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
perfilesClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as RetryableConfig;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // Token expirado o inválido
            clearToken();

            // Redirigir al login solo si estamos en el cliente
            if (typeof window !== 'undefined') {
                window.location.href = '/login?sessionExpired=true';
            }
        }

        // Manejo de errores específicos
        if (error.response) {
            const status = error.response.status;
            const message = getErrorMessage(error);

            console.error(`API Error [${status}]:`, message);

            switch (status) {
                case 403:
                    console.error('Acceso denegado - Verifica los permisos del token');
                    break;
                case 404:
                    console.error('Recurso no encontrado');
                    break;
                case 500:
                    console.error('Error interno del servidor');
                    break;
                default:
                    console.error('Error desconocido');
            }
        } else if (error.request) {
            console.error('Error de conexión: No se pudo contactar al servidor');
        } else {
            console.error('Error de configuración:', error.message);
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
        const token = tokenManager.getToken();
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
    },

    getUserId: (): number | null => {
        const payload = tokenManager.getTokenPayload();
        return payload?.sub || payload?.id || null;
    },

    getUserRole: (): string | null => {
        const payload = tokenManager.getTokenPayload();
        return payload?.role || payload?.tipoUsuario || null;
    }
};

// Alias para las funciones del token manager
export const setToken = tokenManager.setToken;
export const getToken = tokenManager.getToken;
export const clearToken = tokenManager.clearToken;

/**
 *  FUNCIONES ESPECÍFICAS PARA SERVICIO INTERNO (S2S)
 */
// En PerfilesClient.ts - CORREGIDO
export const serviceAPI = {
    // Para requests que requieren el token de servicio interno
    getWithServiceToken: async <T = any>(url: string, config?: any) => {
        return perfilesClient.get<T>(url, {
            ...config,
            _useServiceToken: true
        });
    },

    postWithServiceToken: async <T = any>(url: string, data?: any, config?: any) => {
        return perfilesClient.post<T>(url, data, {
            ...config,
            _useServiceToken: true
        });
    },

    putWithServiceToken: async <T = any>(url: string, data?: any, config?: any) => {
        return perfilesClient.put<T>(url, data, {
            ...config,
            _useServiceToken: true
        });
    },

    deleteWithServiceToken: async <T = any>(url: string, config?: any) => {
        return perfilesClient.delete<T>(url, {
            ...config,
            _useServiceToken: true
        });
    }
};

/**
 * Funciones de API específicas para autenticación
 */
export const authAPI = {
    login: async (email: string, password: string): Promise<LoginResponse> => {
        const response = await perfilesClient.post(PerfilesEndpoints.LOGIN, {
            email,
            password
        });
        return response.data;
    },

    register: async (userData: any): Promise<RegisterResponse> => {
        const response = await perfilesClient.post(PerfilesEndpoints.REGISTER, userData);
        return response.data;
    },

    validateToken: async (): Promise<boolean> => {
        try {
            const token = getToken();
            if (!token) return false;

            const response = await perfilesClient.get(PerfilesEndpoints.VALIDATE, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.status === 200;
        } catch (error) {
            return false;
        }
    },

    logout: (): void => {
        clearToken();
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
    }
};

/**
 * Funciones de utilidad generales
 */
export const getErrorMessage = (error: AxiosError): string => {
    if (error.response?.data && typeof error.response.data === 'object') {
        const data = error.response.data as any;
        return data.message || data.error || 'Error desconocido';
    }
    return error.message || 'Error de conexión';
};

export const buildApiUrlPathPerfiles = (resource: PerfilesEndpointsType, pathAdicional: string = ''): string => {
    const resourcePath = resource;
    return `${BASE_URL_PERFILES}${resourcePath}${pathAdicional}`;
}

/**
 * Hook personalizado para verificar autenticación
 */
export const useAuth = () => {
    const isAuthenticated = (): boolean => {
        const token = getToken();
        return !!(token && !tokenManager.isTokenExpired());
    };

    const getUserInfo = () => {
        return tokenManager.getTokenPayload();
    };

    return {
        isAuthenticated,
        getUserInfo,
        login: authAPI.login,
        logout: authAPI.logout,
        register: authAPI.register,
        validateToken: authAPI.validateToken,
        // 🔥 Agregar funciones de servicio
        serviceAPI
    };
};

export default perfilesClient;