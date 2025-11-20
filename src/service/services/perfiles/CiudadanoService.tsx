import type { CiudadanoData } from '../../../types/PerfilesType';
import { perfilesClient, buildApiUrlPathPerfiles, PerfilesEndpoints } from '../../../service/clients/PerfilesClient';

class CiudadanoService {
  /**
   * Crear un nuevo ciudadano
   */
  async crearCiudadano(ciudadano: Omit<CiudadanoData, 'idUsuario'>): Promise<CiudadanoData> {
    try {
      const response = await perfilesClient.post<CiudadanoData>(
        buildApiUrlPathPerfiles(PerfilesEndpoints.CIUDADANOS),
        ciudadano
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
   * Obtener ciudadano por ID
   */
  async buscarCiudadanoPorId(id: number): Promise<CiudadanoData> {
    try {
      const response = await perfilesClient.get<CiudadanoData>(
        buildApiUrlPathPerfiles(PerfilesEndpoints.CIUDADANOS, `/${id}`)
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Ciudadano no encontrado');
      }
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Actualizar ciudadano existente
   */
  async actualizarCiudadano(id: number, ciudadano: Partial<CiudadanoData>): Promise<CiudadanoData> {
    try {
      // Asegurar que el ID del path se asigna al objeto
      const ciudadanoConId = {
        ...ciudadano,
        idUsuario: id
      };

      const response = await perfilesClient.put<CiudadanoData>(
        buildApiUrlPathPerfiles(PerfilesEndpoints.CIUDADANOS, `/${id}`),
        ciudadanoConId
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Ciudadano no encontrado');
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
   * Eliminar ciudadano
   */
  async eliminarCiudadano(id: number): Promise<void> {
    try {
      await perfilesClient.delete(
        buildApiUrlPathPerfiles(PerfilesEndpoints.CIUDADANOS, `/${id}`)
      );
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Ciudadano no encontrado');
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
    return 'Error de validación en los datos del ciudadano';
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

export default new CiudadanoService();