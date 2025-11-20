import type { 
  ParticipanteConvResponse,
  ParticipanteConvCreationDTO,
  ParticipanteConvSimplificado
} from '../../../types/ComunicacionType'; 
import { comunicacionesClient, buildApiUrlPathComunicaciones, ComunicacionesEndpoints } from '../../clients/ComunicacionClient';

class ParticipanteConvService {
  /**
   * Unir participante a conversación
   */
  async unirParticipante(idConversacion: number, idUsuario: number): Promise<ParticipanteConvResponse> {
    try {
      const response = await comunicacionesClient.post<ParticipanteConvResponse>(
        buildApiUrlPathComunicaciones(ComunicacionesEndpoints.PARTICIPANTECONV, `/${idConversacion}/usuario/${idUsuario}`)
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Conversación o usuario no encontrado');
      }
      if (error.response?.status === 409) {
        throw new Error('El usuario ya es participante de esta conversación');
      }
      if (error.response?.status === 400) {
        throw new Error('Solicitud inválida: ID de usuario no válido');
      }
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Obtener participantes por conversación
   */
  async obtenerParticipantesPorConversacion(idConversacion: number): Promise<ParticipanteConvResponse[]> {
    try {
      const response = await comunicacionesClient.get<ParticipanteConvResponse[]>(
        buildApiUrlPathComunicaciones(ComunicacionesEndpoints.PARTICIPANTECONV, `/conversacion/${idConversacion}`)
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 204) {
        return []; // Retorna array vacío si no hay participantes
      }
      if (error.response?.status === 404) {
        throw new Error('Conversación no encontrada');
      }
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Obtener conversaciones por usuario
   */
  async obtenerConversacionesPorUsuario(idUsuario: number): Promise<ParticipanteConvResponse[]> {
    try {
      const response = await comunicacionesClient.get<ParticipanteConvResponse[]>(
        buildApiUrlPathComunicaciones(ComunicacionesEndpoints.PARTICIPANTECONV, `/usuario/${idUsuario}`)
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 204) {
        return []; // Retorna array vacío si no hay conversaciones
      }
      if (error.response?.status === 404) {
        throw new Error('Usuario no encontrado');
      }
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Eliminar participante de conversación
   */
  async eliminarParticipante(idConversacion: number, idUsuario: number): Promise<void> {
    try {
      await comunicacionesClient.delete(
        buildApiUrlPathComunicaciones(ComunicacionesEndpoints.PARTICIPANTECONV, `/${idConversacion}/usuario/${idUsuario}`)
      );
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Conversación o usuario no encontrado');
      }
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Obtener participantes simplificados por conversación
   */
  async obtenerParticipantesSimplificados(idConversacion: number): Promise<ParticipanteConvSimplificado[]> {
    try {
      const participantes = await this.obtenerParticipantesPorConversacion(idConversacion);
      
      // Transformar a formato simplificado
      return participantes.map(participante => ({
        idParticipanteConv: participante.idParticipanteConv,
        idUsuario: participante.idUsuario,
        idConversacion: participante.conversacion.idConversacion,
        fechaUnion: participante.fechaUnion,
        nombreUsuario: `Usuario ${participante.idUsuario}` // Esto se puede mejorar con datos reales del usuario
      }));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verificar si usuario es participante de conversación
   */
  async esParticipante(idConversacion: number, idUsuario: number): Promise<boolean> {
    try {
      const participantes = await this.obtenerParticipantesPorConversacion(idConversacion);
      return participantes.some(participante => participante.idUsuario === idUsuario);
    } catch (error) {
      // Si hay error al obtener participantes, asumimos que no es participante
      return false;
    }
  }

  /**
 * Agregar múltiples participantes a conversación
 */
async agregarMultiplesParticipantes(idConversacion: number, idsUsuarios: number[]): Promise<ParticipanteConvResponse[]> {
  try {
    const resultados: ParticipanteConvResponse[] = [];
    
    for (const idUsuario of idsUsuarios) {
      try {
        const participante = await this.unirParticipante(idConversacion, idUsuario);
        resultados.push(participante);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        console.warn(`No se pudo agregar usuario ${idUsuario} a la conversación:`, errorMessage);
        // Continuar con los siguientes usuarios
      }
    }
    
    return resultados;
  } catch (error: any) {
    throw error;
  }
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

export default new ParticipanteConvService();