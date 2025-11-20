import type { 
  ConversacionResponse, 
  ConversacionConParticipantes,
  ConversacionCreationDTO,
  MensajeResponse
} from '../../../types/ComunicacionType'; 
import { comunicacionesClient, buildApiUrlPathComunicaciones, ComunicacionesEndpoints } from '../../clients/ComunicacionClient'; 

class ConversacionService {
  /**
   * Iniciar nueva conversación
   */
  async iniciarConversacion(conversacion: ConversacionCreationDTO): Promise<ConversacionResponse> {
    try {
      const response = await comunicacionesClient.post<ConversacionResponse>(
        buildApiUrlPathComunicaciones(ComunicacionesEndpoints.CONVERSACIONES),
        conversacion
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
   * Obtener todas las conversaciones
   */
  async listarConversaciones(): Promise<ConversacionResponse[]> {
    try {
      const response = await comunicacionesClient.get<ConversacionResponse[]>(
        buildApiUrlPathComunicaciones(ComunicacionesEndpoints.CONVERSACIONES)
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 204) {
        return []; // Retorna array vacío si no hay contenido
      }
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Buscar conversación por ID
   */
  async buscarConversacionPorId(idConversacion: number): Promise<ConversacionResponse> {
    try {
      const response = await comunicacionesClient.get<ConversacionResponse>(
        buildApiUrlPathComunicaciones(ComunicacionesEndpoints.CONVERSACIONES, `/${idConversacion}`)
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Conversación no encontrada');
      }
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Obtener mensajes de una conversación específica
   */
  async obtenerMensajesPorConversacion(idConversacion: number): Promise<MensajeResponse[]> {
    try {
      const response = await comunicacionesClient.get<MensajeResponse[]>(
        buildApiUrlPathComunicaciones(ComunicacionesEndpoints.CONVERSACIONES, `/${idConversacion}/mensajes`)
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 204) {
        return []; // Retorna array vacío si no hay mensajes
      }
      if (error.response?.status === 404) {
        throw new Error('Conversación no encontrada');
      }
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Eliminar conversación
   */
  async eliminarConversacion(idConversacion: number): Promise<void> {
    try {
      await comunicacionesClient.delete(
        buildApiUrlPathComunicaciones(ComunicacionesEndpoints.CONVERSACIONES, `/${idConversacion}`)
      );
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Conversación no encontrada');
      }
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Obtener conversaciones de un usuario específico
   */
  async obtenerConversacionesPorUsuario(idUsuario: number): Promise<ConversacionConParticipantes[]> {
    try {
      const response = await comunicacionesClient.get<ConversacionConParticipantes[]>(
        buildApiUrlPathComunicaciones(ComunicacionesEndpoints.CONVERSACIONES, `/usuario/${idUsuario}`)
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 204) {
        return [];
      }
      if (error.response?.status === 404) {
        throw new Error('Usuario no encontrado');
      }
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Agregar participante a conversación
   */
  async agregarParticipante(idConversacion: number, idUsuario: number): Promise<string> {
    try {
      const response = await comunicacionesClient.post(
        buildApiUrlPathComunicaciones(ComunicacionesEndpoints.CONVERSACIONES, `/${idConversacion}/participantes/${idUsuario}`)
      );
      return 'Participante agregado exitosamente';
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Conversación o usuario no encontrado');
      }
      if (error.response?.status === 409) {
        throw new Error('El usuario ya es participante de esta conversación');
      }
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Remover participante de conversación
   */
  async removerParticipante(idConversacion: number, idUsuario: number): Promise<string> {
    try {
      const response = await comunicacionesClient.delete(
        buildApiUrlPathComunicaciones(ComunicacionesEndpoints.CONVERSACIONES, `/${idConversacion}/participantes/${idUsuario}`)
      );
      return 'Participante removido exitosamente';
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Conversación o usuario no encontrado');
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
      return Object.values(errorData.errors).join(', ');
    }
    return 'Error de validación en los datos de la conversación';
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

export default new ConversacionService();