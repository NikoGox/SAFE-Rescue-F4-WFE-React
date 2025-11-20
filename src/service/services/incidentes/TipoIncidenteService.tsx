
import type { TipoIncidente } from '../../../types/IncidenteType'; 
import { incidentesClient, buildApiUrlPathIncidentes, IncidentesEndpoints } from '../../clients/IncidentesClient'; 

class TipoIncidenteService {
  /**
   * Obtener todos los tipos de incidente
   */
  async listarTiposIncidente(): Promise<TipoIncidente[]> {
    try {
      const response = await incidentesClient.get<TipoIncidente[]>(
        buildApiUrlPathIncidentes(IncidentesEndpoints.TIPOINCIDENTES)
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
   * Buscar tipo de incidente por ID
   */
  async buscarTipoIncidentePorId(id: number): Promise<TipoIncidente> {
    try {
      const response = await incidentesClient.get<TipoIncidente>(
        buildApiUrlPathIncidentes(IncidentesEndpoints.TIPOINCIDENTES, `/${id}`)
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Tipo Incidente no encontrado');
      }
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Crear un nuevo tipo de incidente
   */
  async crearTipoIncidente(tipoIncidente: Omit<TipoIncidente, 'idTipoIncidente'>): Promise<string> {
    try {
      const response = await incidentesClient.post(
        buildApiUrlPathIncidentes(IncidentesEndpoints.TIPOINCIDENTES),
        tipoIncidente
      );
      
      if (response.status === 201) {
        return 'Tipo Incidente creado con éxito.';
      }
      return 'Tipo Incidente creado.';
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw new Error(error.response.data || 'Error en la solicitud');
      }
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Actualizar tipo de incidente existente
   */
  async actualizarTipoIncidente(id: number, tipoIncidente: Omit<TipoIncidente, 'idTipoIncidente'>): Promise<string> {
    try {
      const response = await incidentesClient.put(
        buildApiUrlPathIncidentes(IncidentesEndpoints.TIPOINCIDENTES, `/${id}`),
        tipoIncidente
      );
      
      if (response.status === 200) {
        return 'Actualizado con éxito';
      }
      return 'Tipo Incidente actualizado.';
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Tipo Incidente no encontrado');
      }
      if (error.response?.status === 400) {
        throw new Error(error.response.data || 'Error en la solicitud');
      }
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Eliminar tipo de incidente
   */
  async eliminarTipoIncidente(id: number): Promise<string> {
    try {
      await incidentesClient.delete(
        buildApiUrlPathIncidentes(IncidentesEndpoints.TIPOINCIDENTES, `/${id}`)
      );
      return 'Tipo Incidente eliminado con éxito.';
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Tipo Incidente no encontrado');
      }
      if (error.response?.status === 400) {
        throw new Error(error.response.data || 'Error al eliminar tipo de incidente');
      }
      this.handleError(error);
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

export default new TipoIncidenteService();