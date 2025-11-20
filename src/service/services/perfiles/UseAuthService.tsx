import type { LoginRequest, AuthResponseDTO, UserRegistroBackendType } from '../../../types/PerfilesType';
import { perfilesClient, buildApiUrlPathPerfiles, PerfilesEndpoints,tokenManager, setToken, clearToken } from '../../../service/clients/PerfilesClient';

class UseAuthService {
  /**
   * Iniciar sesión
   */
  async login(credentials: LoginRequest): Promise<AuthResponseDTO> {
    try {
      const response = await perfilesClient.post<AuthResponseDTO>(
        buildApiUrlPathPerfiles(PerfilesEndpoints.AUTH, '/login'),
        credentials
      );
      
      // Guardar el token automáticamente después del login exitoso
      if (response.data.token) {
        setToken(response.data.token);
      }
      
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Credenciales inválidas');
      }
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Registrar nuevo usuario
   */
  async register(usuario: UserRegistroBackendType): Promise<any> {
    try {
      const response = await perfilesClient.post<any>(
        buildApiUrlPathPerfiles(PerfilesEndpoints.AUTH, '/register'),
        usuario
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 400) {
        const errorMessage = this.getValidationErrorMessage(error.response.data);
        throw new Error(errorMessage);
      }
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Cerrar sesión
   */
  async logout(): Promise<void> {
    try {
      // Limpiar token localmente primero
      clearToken();
      
      // Intentar hacer logout en el servidor (opcional)
      await perfilesClient.post(
        buildApiUrlPathPerfiles(PerfilesEndpoints.AUTH, '/logout')
      );
    } catch (error: any) {
      // El logout puede fallar silenciosamente
      console.warn('Error durante logout:', error.message);
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
    if (!token) return false;
    
    // Verificar si el token está expirado
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() < payload.exp * 1000;
    } catch {
      return false;
    }
  }

  /**
   * Obtener el ID del usuario desde el token
   */
  getUserIdFromToken(): number | null {
    const token = tokenManager.getToken();
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return parseInt(payload.sub, 10);
    } catch {
      return null;
    }
  }

  /**
   * Obtener el tipo de perfil desde el token
   */
  getTipoPerfilFromToken(): string | null {
    const token = tokenManager.getToken();
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.tipoPerfil || null;
    } catch {
      return null;
    }
  }

  /**
   * Extrae mensajes de error de validación del backend
   */
  private getValidationErrorMessage(errorData: any): string {
    if (typeof errorData === 'string') {
      return errorData;
    }
    if (errorData?.message) {
      return errorData.message;
    }
    if (errorData?.errors) {
      return Object.values(errorData.errors).join(', ');
    }
    
    return 'Error de validación en los datos de registro';
  }

  /**
   * Manejo centralizado de errores
   */
  private handleError(error: any): void {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.response.data || error.message;

      switch (status) {
        case 500:
          throw new Error('Error interno del servidor');
        case 403:
          throw new Error('Acceso denegado');
        default:
          throw new Error(`Error ${status}: ${message}`);
      }
    } else if (error.request) {
      throw new Error('Error de conexión: No se pudo contactar al servidor');
    } else {
      throw new Error('Error: ' + error.message);
    }
  }
}

export default new UseAuthService();