import type { HistorialUsuario, HistorialUsuarioCreationDTO, HistorialUsuarioResponse } from '../../../types/PerfilesType';
import { perfilesClient, buildApiUrlPathPerfiles, PerfilesEndpoints } from '../../../service/clients/PerfilesClient';


class HistorialUsuarioService {
  /**
   * Obtener todos los registros de historial
   */
  async listarHistorial(): Promise<HistorialUsuario[]> {
    try {
      const response = await perfilesClient.get<HistorialUsuario[]>(
        buildApiUrlPathPerfiles(PerfilesEndpoints.HISTORIALUSUARIOS)
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
   * Obtener historial por usuario específico
   */
  async obtenerHistorialPorUsuario(idUsuario: number): Promise<HistorialUsuario[]> {
    try {
      const response = await perfilesClient.get<HistorialUsuario[]>(
        `/usuarios/${idUsuario}/historial`
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 204) {
        return []; // Retorna array vacío si no hay contenido
      }
      if (error.response?.status === 404) {
        throw new Error('Usuario no encontrado');
      }
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Obtener historial por equipo específico
   */
  async obtenerHistorialPorEquipo(idEquipo: number): Promise<HistorialUsuario[]> {
    try {
      const response = await perfilesClient.get<HistorialUsuario[]>(
        `/equipos/${idEquipo}/historial`
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 204) {
        return []; // Retorna array vacío si no hay contenido
      }
      if (error.response?.status === 404) {
        throw new Error('Equipo no encontrado');
      }
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Crear un nuevo registro de historial
   * NOTA: Según tu controlador, esto probablemente se usa internamente
   * pero lo mantenemos por si necesitas crear registros manualmente
   */
  async crearHistorial(historial: HistorialUsuarioCreationDTO): Promise<HistorialUsuario> {
    try {
      const response = await perfilesClient.post<HistorialUsuario>(
        buildApiUrlPathPerfiles(PerfilesEndpoints.HISTORIALUSUARIOS),
        historial
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
   * Buscar historial por ID (si tu backend lo soporta)
   */
  async buscarHistorialPorId(id: number): Promise<HistorialUsuario> {
    try {
      const response = await perfilesClient.get<HistorialUsuario>(
        buildApiUrlPathPerfiles(PerfilesEndpoints.HISTORIALUSUARIOS, `/${id}`)
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Registro de historial no encontrado');
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
    return 'Error de validación en los datos del historial';
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

export default new HistorialUsuarioService();