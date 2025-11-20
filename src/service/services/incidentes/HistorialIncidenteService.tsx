// src/services/HistorialIncidenteService.ts
import type { 
  HistorialIncidenteResponse, 
  HistorialIncidenteCreationDTO 
} from '../../../types/IncidenteType'; 
import { incidentesClient, buildApiUrlPathIncidentes, IncidentesEndpoints } from '../../clients/IncidentesClient'; 

class HistorialIncidenteService {
  /**
   * Obtener todo el historial de incidentes
   */
  async listarHistorialIncidentes(): Promise<HistorialIncidenteResponse[]> {
    try {
      const response = await incidentesClient.get<HistorialIncidenteResponse[]>(
        '/historial/incidentes'
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
   * Obtener historial por incidente específico
   */
  async obtenerHistorialPorIncidente(incidenteId: number): Promise<HistorialIncidenteResponse[]> {
    try {
      const response = await incidentesClient.get<HistorialIncidenteResponse[]>(
        `/incidentes/${incidenteId}/historial`
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 204) {
        return [];
      }
      if (error.response?.status === 404) {
        throw new Error('Incidente no encontrado');
      }
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Crear nuevo registro de historial (si tu backend lo permite)
   * NOTA: Según tu comentario, esto probablemente se usa internamente
   */
  async crearHistorialIncidente(historial: HistorialIncidenteCreationDTO): Promise<HistorialIncidenteResponse> {
    try {
      const response = await incidentesClient.post<HistorialIncidenteResponse>(
        buildApiUrlPathIncidentes(IncidentesEndpoints.HISTORIALINCIDENTES),
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
  async buscarHistorialPorId(id: number): Promise<HistorialIncidenteResponse> {
    try {
      const response = await incidentesClient.get<HistorialIncidenteResponse>(
        buildApiUrlPathIncidentes(IncidentesEndpoints.HISTORIALINCIDENTES, `/${id}`)
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

export default new HistorialIncidenteService();