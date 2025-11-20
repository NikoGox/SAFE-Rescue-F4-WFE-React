import type { Bombero } from '../../../types/PerfilesType';
import { perfilesClient, buildApiUrlPathPerfiles, PerfilesEndpoints } from '../../../service/clients/PerfilesClient';

class BomberoService {
  /**
   * Obtener todos los bomberos
   */
  async listarBomberos(): Promise<Bombero[]> {
    try {
      const response = await perfilesClient.get<Bombero[]>(
        buildApiUrlPathPerfiles(PerfilesEndpoints.BOMBEROS)
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
   * Buscar bombero por ID
   */
  async buscarBomberoPorId(id: number): Promise<Bombero> {
    try {
      const response = await perfilesClient.get<Bombero>(
        buildApiUrlPathPerfiles(PerfilesEndpoints.BOMBEROS, `/${id}`)
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Bombero no encontrado');
      }
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Crear un nuevo bombero
   */
  async crearBombero(bombero: Omit<Bombero, 'idUsuario'>): Promise<Bombero> {
    try {
      const response = await perfilesClient.post<Bombero>(
        buildApiUrlPathPerfiles(PerfilesEndpoints.BOMBEROS),
        bombero
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
   * Actualizar bombero existente
   */
  async actualizarBombero(id: number, bombero: Partial<Bombero>): Promise<Bombero> {
    try {
      // Asegurar que el ID del path se asigna al objeto para actualización completa
      const bomberoActualizado = {
        ...bombero,
        idUsuario: id
      };

      const response = await perfilesClient.put<Bombero>(
        buildApiUrlPathPerfiles(PerfilesEndpoints.BOMBEROS, `/${id}`),
        bomberoActualizado
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Bombero no encontrado');
      }
      if (error.response?.status === 400) {
        const errorMessage = this.getValidationErrorMessage(error.response.data);
        throw new Error(errorMessage);
      }
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Eliminar bombero
   */
  async eliminarBombero(id: number): Promise<string> {
    try {
      await perfilesClient.delete(
        buildApiUrlPathPerfiles(PerfilesEndpoints.BOMBEROS, `/${id}`)
      );
      return 'Bombero eliminado con éxito.';
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Bombero no encontrado');
      }
      if (error.response?.status === 400) {
        throw new Error('No se puede eliminar el bombero: existen referencias activas (ej: es líder de un equipo)');
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
    
    // Mensajes específicos para bomberos
    if (errorData?.includes?.('RUN/Correo existente')) {
      return 'El RUN o correo electrónico ya existe en el sistema';
    }
    if (errorData?.includes?.('Equipo no existe')) {
      return 'El equipo especificado no existe';
    }
    if (errorData?.includes?.('TipoUsuario no existe')) {
      return 'El tipo de usuario especificado no existe';
    }
    
    return 'Error de validación en los datos del bombero';
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
          throw new Error('Conflicto de datos: ' + message);
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

export default new BomberoService();