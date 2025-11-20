import type { 
  NotificacionResponse, 
  NotificacionCreationDTO 
} from '../../../types/ComunicacionType'; 
import { comunicacionesClient, buildApiUrlPathComunicaciones, ComunicacionesEndpoints } from '../../clients/ComunicacionClient'; 

// Interface para la respuesta paginada
interface NotificacionPageResponse {
  content: NotificacionResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

class NotificacionService {
  /**
   * Crear una nueva notificación
   */
  async crearNotificacion(notificacion: NotificacionCreationDTO): Promise<NotificacionResponse> {
    try {
      const response = await comunicacionesClient.post<NotificacionResponse>(
        buildApiUrlPathComunicaciones(ComunicacionesEndpoints.NOTIFICACIONES),
        notificacion
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 400) {
        const errorMessage = this.getValidationErrorMessage(error.response.data);
        throw new Error(errorMessage);
      }
      if (error.response?.status === 404) {
        throw new Error('Conversación no encontrada');
      }
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Obtener notificaciones pendientes del usuario (paginadas)
   */
  async listarNotificacionesPendientes(
    idUsuarioReceptor: string, 
    page: number = 0, 
    size: number = 10
  ): Promise<NotificacionPageResponse> {
    try {
      const response = await comunicacionesClient.get<NotificacionPageResponse>(
        buildApiUrlPathComunicaciones(
          ComunicacionesEndpoints.NOTIFICACIONES, 
          `/usuario/${idUsuarioReceptor}/pendientes?page=${page}&size=${size}&sort=fechaCreacion,desc`
        )
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 204) {
        return {
          content: [],
          totalElements: 0,
          totalPages: 0,
          size: 0,
          number: 0
        };
      }
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Marcar notificación específica como leída
   */
  async marcarComoLeida(idNotificacion: number): Promise<NotificacionResponse> {
    try {
      const response = await comunicacionesClient.patch<NotificacionResponse>(
        buildApiUrlPathComunicaciones(ComunicacionesEndpoints.NOTIFICACIONES, `/${idNotificacion}/leida`)
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Notificación no encontrada');
      }
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Marcar todas las notificaciones de un usuario como leídas
   */
  async marcarTodasComoLeidas(idUsuarioReceptor: string): Promise<string> {
    try {
      const response = await comunicacionesClient.patch(
        buildApiUrlPathComunicaciones(ComunicacionesEndpoints.NOTIFICACIONES, `/usuario/${idUsuarioReceptor}/leidas`)
      );
      return response.data; // Retorna el mensaje del backend
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Usuario no encontrado');
      }
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Obtener todas las notificaciones del usuario (sin paginación - si existe este endpoint)
   */
  async listarNotificacionesPorUsuario(idUsuarioReceptor: string): Promise<NotificacionResponse[]> {
    try {
      const response = await comunicacionesClient.get<NotificacionResponse[]>(
        buildApiUrlPathComunicaciones(ComunicacionesEndpoints.NOTIFICACIONES, `/usuario/${idUsuarioReceptor}`)
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 204 || error.response?.status === 404) {
        return [];
      }
      this.handleError(error);
      throw error;
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
      // Para errores de validación de campos específicos
      return Object.values(errorData.errors).join(', ');
    }
    return 'Error de validación en los datos de la notificación';
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
          throw new Error('Error interno del servidor o fallo de comunicación con microservicios');
        case 409:
          throw new Error('Conflicto: ' + message);
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

export default new NotificacionService();