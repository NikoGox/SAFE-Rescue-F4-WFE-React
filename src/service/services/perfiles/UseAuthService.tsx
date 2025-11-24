import type {
    LoginRequest,
    AuthResponseDTO,
    UserRegistroBackendType,
    UserData
} from '../../../types/PerfilesType';
import {
    perfilesClient,
    buildApiUrlPathPerfiles,
    PerfilesEndpoints,
    tokenManager,
    setToken,
    clearToken,
    authAPI,
    serviceAPI
} from '../../../service/clients/PerfilesClient';

class UseAuthService {

    /**
     * Iniciar sesión
     */
    async login(credentials: LoginRequest): Promise<AuthResponseDTO> {
        try {
            console.log('🔍 Intentando login en:', `${PerfilesEndpoints.AUTH}/login`);
            console.log('📤 Credenciales:', {
                correo: credentials.correo,
                // No loguear la contraseña por seguridad
            });

            // 🔥 USAR SERVICE TOKEN PARA LOGIN (si es requerido por tu backend)
            const response = await serviceAPI.postWithServiceToken<AuthResponseDTO>(
                `${PerfilesEndpoints.AUTH}/login`,
                credentials
            );

            // Guardar el token automáticamente después del login exitoso
            if (response.data.token) {
                setToken(response.data.token);
                console.log('✅ Login exitoso, token guardado');
            }

            return response.data;
        } catch (error: any) {
            console.error('💥 Error en login:', error);

            // Si falla con service token, intentar con JWT normal
            if (error.response?.status === 403 || error.response?.status === 401) {
                console.log('🔄 Intentando con autenticación normal...');
                try {
                    const response = await perfilesClient.post<AuthResponseDTO>(
                        `${PerfilesEndpoints.AUTH}/login`,
                        credentials
                    );

                    if (response.data.token) {
                        setToken(response.data.token);
                        console.log('✅ Login exitoso (modo normal), token guardado');
                    }

                    return response.data;
                } catch (secondError) {
                    // Continuar con el manejo de errores original
                    return this.handleLoginError(error);
                }
            }

            return this.handleLoginError(error);
        }
    }

    /**
     * Registrar nuevo usuario
     */
    async register(usuario: UserRegistroBackendType): Promise<any> {
        try {
            console.log('🔍 Intentando registro en:', `${PerfilesEndpoints.AUTH}/register-ciudadano`);
            console.log('📤 Datos enviados:', JSON.stringify({
                ...usuario,
                contrasenia: '***', // Ocultar contraseña en logs
                direccion: usuario.direccion
            }, null, 2));

            // 🔥 USAR SERVICE TOKEN PARA REGISTRO (requerido para S2S)
            const response = await serviceAPI.postWithServiceToken<any>(
                `${PerfilesEndpoints.AUTH}/register-ciudadano`,
                usuario
            );

            console.log('✅ Registro exitoso:', response.data);

            // Si el registro incluye login automático, guardar el token
            if (response.data.token) {
                setToken(response.data.token);
            }

            return response.data;

        } catch (error: any) {
            console.error('💥 Error completo en registro:', error);

            // Manejo específico de errores de validación
            if (error.response?.status === 400) {
                console.error('🔍 Detalles del error 400:', error.response.data);
                const errorMessage = this.getDetailedValidationErrorMessage(error.response.data);
                throw new Error(errorMessage);
            }
            if (error.response?.status === 409) {
                const conflictMessage = this.getConflictErrorMessage(error.response.data);
                throw new Error(conflictMessage);
            }
            if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
                throw new Error('No se pudo conectar al servidor. Verifique que el backend esté ejecutándose en puerto 8082');
            }

            return this.handleError(error);
        }
    }

    /**
     * Obtener información del perfil del usuario
     */
    async getProfile(): Promise<UserData | null> {
        try {
            if (!this.isAuthenticated()) {
                return null;
            }

            const userId = this.getUserIdFromToken();
            if (!userId) {
                return null;
            }

            // 🔥 DECIDIR QUÉ TOKEN USAR SEGÚN EL CONTEXTO
            let response;

            // Si es una operación que requiere privilegios de servicio, usar service token
            if (this.requiresServiceToken()) {
                response = await serviceAPI.getWithServiceToken(
                    buildApiUrlPathPerfiles(PerfilesEndpoints.USUARIOS, `/${userId}`)
                );
            } else {
                // Para operaciones normales de usuario, usar JWT
                response = await perfilesClient.get(
                    buildApiUrlPathPerfiles(PerfilesEndpoints.USUARIOS, `/${userId}`)
                );
            }

            return response.data;
        } catch (error) {
            console.error('Error obteniendo perfil:', error);
            return null;
        }
    }

    /**
     * Extrae mensajes DETALLADOS de error de validación del backend
     */
    private getDetailedValidationErrorMessage(errorData: any): string {
        console.log('🔍 Respuesta completa del error 400:', errorData);

        if (typeof errorData === 'string') {
            return `Error del servidor: ${errorData}`;
        }
        if (errorData?.message) {
            return `Error de validación: ${errorData.message}`;
        }
        if (errorData?.errors) {
            const errores = Object.entries(errorData.errors)
                .map(([campo, mensaje]) => {
                    // Mapear campos a nombres más amigables
                    const campoAmigable = this.mapearCampoAmigable(campo);
                    return `${campoAmigable}: ${mensaje}`;
                })
                .join(', ');
            return `Errores de validación: ${errores}`;
        }
        if (Array.isArray(errorData)) {
            return `Errores: ${errorData.join(', ')}`;
        }

        return `Error de validación: ${JSON.stringify(errorData)}`;
    }

    /**
     * Maneja errores de conflicto (409) - duplicados
     */
    private getConflictErrorMessage(errorData: any): string {
        if (typeof errorData === 'string') {
            return errorData;
        }
        if (errorData?.message) {
            return errorData.message;
        }
        if (errorData?.error) {
            const errorMsg = errorData.error.toLowerCase();
            if (errorMsg.includes('correo') || errorMsg.includes('email')) {
                return 'El correo electrónico ya está registrado';
            }
            if (errorMsg.includes('rut') || errorMsg.includes('run')) {
                return 'El RUT ya está registrado';
            }
            return errorData.error;
        }
        return 'El usuario ya existe (correo o RUT duplicado)';
    }

    /**
     * Mapea nombres de campos técnicos a nombres amigables
     */
    private mapearCampoAmigable(campo: string): string {
        const mapeo: { [key: string]: string } = {
            'run': 'RUT',
            'dv': 'Dígito verificador',
            'correo': 'Correo electrónico',
            'contrasenia': 'Contraseña',
            'apaterno': 'Apellido paterno',
            'amaterno': 'Apellido materno',
            'telefono': 'Teléfono',
            'idTipoUsuario': 'Tipo de usuario',
            'direccion.calle': 'Calle',
            'direccion.numero': 'Número',
            'direccion.villa': 'Villa',
            'direccion.complemento': 'Complemento',
            'direccion.idComuna': 'Comuna'
        };

        return mapeo[campo] || campo;
    }

    static async obtenerPerfilActual(): Promise<UserData> {
        try {
            const response = await perfilesClient.get<UserData>('/usuario/perfil-actual');
            return response.data;
        } catch (error) {
            console.error('Error obteniendo perfil actual:', error);
            throw error;
        }
    }

    /**
     * Determina si una operación requiere token de servicio
     */
    private requiresServiceToken(): boolean {
        // Lógica para determinar cuándo usar service token
        // Por ejemplo, para operaciones de administración o S2S
        const userRole = this.getTipoPerfilFromToken();

        // Si el usuario es administrador o requiere operaciones de servicio
        return userRole === 'ADMIN' || userRole === 'SERVICE';
    }

    /**
     * Operaciones que SIEMPRE usan service token
     */
    async getUsersWithServiceToken(): Promise<any> {
        try {
            // 🔥 OPERACIÓN QUE REQUIERE SERVICE TOKEN
            const response = await serviceAPI.getWithServiceToken(
                buildApiUrlPathPerfiles(PerfilesEndpoints.USUARIOS)
            );
            return response.data;
        } catch (error) {
            console.error('Error obteniendo usuarios con service token:', error);
            throw error;
        }
    }

    async createUserWithServiceToken(userData: any): Promise<any> {
        try {
            // 🔥 OPERACIÓN QUE REQUIERE SERVICE TOKEN
            const response = await serviceAPI.postWithServiceToken(
                buildApiUrlPathPerfiles(PerfilesEndpoints.USUARIOS),
                userData
            );
            return response.data;
        } catch (error) {
            console.error('Error creando usuario con service token:', error);
            throw error;
        }
    }

    /**
     * Manejo específico de errores de login
     */
    private handleLoginError(error: any): never {
        console.error('💥 Error en login:', error);

        if (error.response?.status === 401) {
            throw new Error('Credenciales inválidas. Verifique su correo y contraseña.');
        }
        if (error.response?.status === 403) {
            throw new Error('Cuenta desactivada o sin permisos. Contacte al administrador.');
        }
        if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
            throw new Error('No se pudo conectar al servidor. Verifique que el backend esté ejecutándose en puerto 8082');
        }

        // Usar el manejo general de errores
        return this.handleError(error);
    }

    /**
     * Cerrar sesión
     */
    async logout(): Promise<void> {
        try {
            console.log('🔍 Cerrando sesión...');

            // Limpiar token localmente primero
            clearToken();

            // Intentar hacer logout en el servidor (opcional)
            await perfilesClient.post(
                buildApiUrlPathPerfiles(PerfilesEndpoints.AUTH, '/logout')
            );

            console.log('✅ Sesión cerrada exitosamente');
        } catch (error: any) {
            // El logout puede fallar silenciosamente (ej: token expirado)
            console.warn('⚠️ Error durante logout:', error.message);
        } finally {
            // Siempre limpiar el token localmente
            clearToken();
        }
    }

    /**
     * Verificar si el usuario está autenticado
     */
    isAuthenticated(): boolean {
        const token = tokenManager.getToken();
        if (!token) {
            console.log('🔐 No hay token almacenado');
            return false;
        }

        // Usar la función del tokenManager para verificar expiración
        if (tokenManager.isTokenExpired()) {
            console.log('🔐 Token expirado');
            clearToken(); // Limpiar token expirado
            return false;
        }

        console.log('🔐 Usuario autenticado');
        return true;
    }

    /**
     * Obtener el ID del usuario desde el token
     */
    getUserIdFromToken(): number | null {
        return tokenManager.getUserId();
    }

    /**
     * Obtener el tipo de perfil desde el token
     */
    getTipoPerfilFromToken(): string | null {
        return tokenManager.getUserRole();
    }

    /**
     * Obtener datos del usuario desde el token
     */
    getUserDataFromToken(): any {
        return tokenManager.getTokenPayload();
    }

    /**
     * Validar token con el servidor
     */
    async validateToken(): Promise<boolean> {
        try {
            const isValid = await authAPI.validateToken();
            if (!isValid) {
                clearToken();
            }
            return isValid;
        } catch (error) {
            console.error('Error validando token:', error);
            clearToken();
            return false;
        }
    }

    /**
     * Refrescar token (si tu backend soporta refresh tokens)
     */
    async refreshToken(): Promise<string | null> {
        try {
            // Esto depende de si tu backend implementa refresh tokens
            const response = await perfilesClient.post(
                buildApiUrlPathPerfiles(PerfilesEndpoints.AUTH, '/refresh')
            );

            if (response.data.token) {
                setToken(response.data.token);
                return response.data.token;
            }
            return null;
        } catch (error) {
            console.error('Error refrescando token:', error);
            clearToken();
            return null;
        }
    }

    /**
     * Manejo centralizado de errores
     */
    private handleError(error: any): never {
        console.error('💥 Error manejado:', error);

        if (error.response) {
            const status = error.response.status;
            const message = error.response.data?.message || error.response.data || error.message;

            switch (status) {
                case 400:
                    throw new Error(`Datos inválidos: ${message}`);
                case 401:
                    throw new Error('No autorizado');
                case 403:
                    throw new Error('Acceso denegado');
                case 404:
                    throw new Error('Recurso no encontrado');
                case 409:
                    throw new Error(`Conflicto: ${message}`);
                case 422:
                    throw new Error(`Error de validación: ${message}`);
                case 500:
                    throw new Error('Error interno del servidor. Por favor, intente más tarde.');
                case 502:
                    throw new Error('Servicio no disponible temporalmente');
                case 503:
                    throw new Error('Servicio en mantenimiento');
                default:
                    throw new Error(`Error ${status}: ${message}`);
            }
        } else if (error.request) {
            throw new Error('Error de conexión: No se pudo contactar al servidor. Verifique su conexión a internet.');
        } else if (error.message) {
            throw new Error(`Error: ${error.message}`);
        } else {
            throw new Error('Error desconocido');
        }
    }

    /**
     * Verificar estado del servicio
     */
    async healthCheck(): Promise<boolean> {
        try {
            const response = await perfilesClient.get('/health');
            return response.status === 200;
        } catch (error) {
            console.error('Health check failed:', error);
            return false;
        }
    }
}

export default new UseAuthService();