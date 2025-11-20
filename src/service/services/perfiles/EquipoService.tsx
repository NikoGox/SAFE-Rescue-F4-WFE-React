import type { Equipo, EquipoRequest } from '../../../types/PerfilesType';
import { perfilesClient, buildApiUrlPathPerfiles, PerfilesEndpoints } from '../../../service/clients/PerfilesClient';

class EquipoService {
  /**
   * Obtener todos los equipos
   */
  async listarEquipos(): Promise<Equipo[]> {
    try {
      const response = await perfilesClient.get<Equipo[]>(
        buildApiUrlPathPerfiles(PerfilesEndpoints.EQUIPOS)
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
   * Buscar equipo por ID
   */
  async buscarEquipoPorId(id: number): Promise<Equipo> {
    try {
      const response = await perfilesClient.get<Equipo>(
        buildApiUrlPathPerfiles(PerfilesEndpoints.EQUIPOS, `/${id}`)
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Equipo no encontrado');
      }
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Crear un nuevo equipo
   */
  async crearEquipo(equipo: EquipoRequest): Promise<string> {
    try {
      const response = await perfilesClient.post(
        buildApiUrlPathPerfiles(PerfilesEndpoints.EQUIPOS),
        equipo
      );
      
      if (response.status === 201) {
        return 'Equipo creado con éxito.';
      }
      return 'Equipo creado.';
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw new Error(error.response.data || 'Error en la solicitud');
      }
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Actualizar equipo existente
   */
  async actualizarEquipo(id: number, equipo: EquipoRequest): Promise<string> {
    try {
      const response = await perfilesClient.put(
        buildApiUrlPathPerfiles(PerfilesEndpoints.EQUIPOS, `/${id}`),
        equipo
      );
      
      if (response.status === 200) {
        return 'Actualizado con éxito';
      }
      return 'Equipo actualizado.';
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Equipo no encontrado');
      }
      if (error.response?.status === 400) {
        throw new Error(error.response.data || 'Error en la solicitud');
      }
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Eliminar equipo
   */
  async eliminarEquipo(id: number): Promise<string> {
    try {
      await perfilesClient.delete(
        buildApiUrlPathPerfiles(PerfilesEndpoints.EQUIPOS, `/${id}`)
      );
      return 'Equipo eliminado con éxito.';
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Equipo no encontrado');
      }
      if (error.response?.status === 400) {
        throw new Error(error.response.data || 'Error al eliminar equipo');
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

export default new EquipoService();