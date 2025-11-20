import type { 
  MensajeResponse,
  MensajeCreationDTO,
  MensajeConUsuario
} from '../../../types/ComunicacionType'; 
import { comunicacionesClient, buildApiUrlPathComunicaciones, ComunicacionesEndpoints } from '../../clients/ComunicacionClient';

class MensajeService {
  /**
   * Crear mensaje en conversación
   */
  async crearMensaje(conversacionId: number, mensaje: MensajeCreationDTO): Promise<MensajeResponse> {
    try {
      const response = await comunicacionesClient.post<MensajeResponse>(
        buildApiUrlPathComunicaciones(ComunicacionesEndpoints.CONVERSACIONES, `/${conversacionId}/mensajes`),
        mensaje
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
   * Obtener todos los mensajes
   */
  async listarMensajes(): Promise<MensajeResponse[]> {
    try {
      const response = await comunicacionesClient.get<MensajeResponse[]>(
        buildApiUrlPathComunicaciones(ComunicacionesEndpoints.MENSAJES)
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 204) {
        return []; // Retorna array vacío si no hay mensajes
      }
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Buscar mensaje por ID
   */
  async buscarMensajePorId(idMensaje: number): Promise<MensajeResponse> {
    try {
      const response = await comunicacionesClient.get<MensajeResponse>(
        buildApiUrlPathComunicaciones(ComunicacionesEndpoints.MENSAJES, `/${idMensaje}`)
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Mensaje no encontrado');
      }
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Eliminar mensaje
   */
  async eliminarMensaje(idMensaje: number): Promise<void> {
    try {
      await comunicacionesClient.delete(
        buildApiUrlPathComunicaciones(ComunicacionesEndpoints.MENSAJES, `/${idMensaje}`)
      );
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Mensaje no encontrado');
      }
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Obtener mensajes por conversación (método alternativo)
   */
  async obtenerMensajesPorConversacion(conversacionId: number): Promise<MensajeResponse[]> {
    try {
      const response = await comunicacionesClient.get<MensajeResponse[]>(
        buildApiUrlPathComunicaciones(ComunicacionesEndpoints.CONVERSACIONES, `/${conversacionId}/mensajes`)
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
   * Obtener mensajes por usuario emisor
   */
  async obtenerMensajesPorUsuario(idUsuario: number): Promise<MensajeResponse[]> {
    try {
      const response = await comunicacionesClient.get<MensajeResponse[]>(
        buildApiUrlPathComunicaciones(ComunicacionesEndpoints.MENSAJES, `/usuario/${idUsuario}`)
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
   * Marcar mensaje como leído
   */
  async marcarComoLeido(idMensaje: number): Promise<MensajeResponse> {
    try {
      const response = await comunicacionesClient.patch<MensajeResponse>(
        buildApiUrlPathComunicaciones(ComunicacionesEndpoints.MENSAJES, `/${idMensaje}/leido`)
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Mensaje no encontrado');
      }
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Obtener mensajes con información del usuario emisor
   */
  async obtenerMensajesConUsuario(conversacionId: number): Promise<MensajeConUsuario[]> {
    try {
      const mensajes = await this.obtenerMensajesPorConversacion(conversacionId);
      
      // Aquí podrías enriquecer con información del usuario
      // Por ahora retornamos los mensajes básicos
      return mensajes.map(mensaje => ({
        ...mensaje,
        nombreEmisor: `Usuario ${mensaje.idUsuarioEmisor}`,
        avatarEmisor: `/avatars/${mensaje.idUsuarioEmisor}.jpg`
      }));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Enviar mensaje rápido (utilidad para uso común)
   */
  async enviarMensajeRapido(conversacionId: number, idUsuarioEmisor: number, detalle: string): Promise<MensajeResponse> {
    try {
      const mensajeDTO: MensajeCreationDTO = {
        idConversacion: conversacionId,
        idUsuarioEmisor: idUsuarioEmisor,
        detalle: detalle,
        idEstado: 1 // Estado por defecto: ENVIADO
      };
      
      return await this.crearMensaje(conversacionId, mensajeDTO);
    } catch (error) {
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
    
    // Mensajes específicos para mensajes
    if (errorData?.includes?.('ID de usuario no válido')) {
      return 'El ID del usuario emisor no es válido';
    }
    if (errorData?.includes?.('Estado externo no válido')) {
      return 'El estado del mensaje no es válido';
    }
    
    return 'Error de validación en los datos del mensaje';
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

export default new MensajeService();