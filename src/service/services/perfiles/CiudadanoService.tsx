import type { CiudadanoData } from '../../../types/PerfilesType';
import { perfilesClient, buildApiUrlPathPerfiles, PerfilesEndpoints } from '../../clients/PerfilesClient';

class CiudadanoService {
  /**
   * Obtener ciudadano por ID
   */
  async buscarCiudadanoPorId(id: number): Promise<CiudadanoData> {
    try {
      console.log(` Llamando API: GET /ciudadanos/${id}`);
      const response = await perfilesClient.get<CiudadanoData>(
        buildApiUrlPathPerfiles(PerfilesEndpoints.CIUDADANOS, `/${id}`)
      );
      console.log(' Respuesta recibida:', response.data);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error(`Ciudadano con ID ${id} no encontrado`);
      }
      if (error.response?.status === 401) {
        throw new Error('No autorizado: Token inválido o expirado');
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
      console.log(` Llamando API: PUT /ciudadanos/${id}`, ciudadano);
      
      const response = await perfilesClient.put<CiudadanoData>(
        buildApiUrlPathPerfiles(PerfilesEndpoints.CIUDADANOS, `/${id}`),
        ciudadano
      );
      console.log(' Respuesta recibida:', response.data);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Ciudadano no encontrado');
      }
      if (error.response?.status === 400) {
        const errorMessage = this.getValidationErrorMessage(error.response.data);
        throw new Error(errorMessage);
      }
      if (error.response?.status === 401) {
        throw new Error('No autorizado: Token inválido o expirado');
      }
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Crear un nuevo ciudadano
   */
  async crearCiudadano(ciudadano: Omit<CiudadanoData, 'idUsuario'>): Promise<CiudadanoData> {
    try {
      console.log(` Llamando API: POST /ciudadanos`, ciudadano);
      const response = await perfilesClient.post<CiudadanoData>(
        buildApiUrlPathPerfiles(PerfilesEndpoints.CIUDADANOS),
        ciudadano
      );
      console.log(' Respuesta recibida:', response.data);
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
   * Eliminar ciudadano
   */
  async eliminarCiudadano(id: number): Promise<void> {
    try {
      console.log(` Llamando API: DELETE /ciudadanos/${id}`);
      await perfilesClient.delete(
        buildApiUrlPathPerfiles(PerfilesEndpoints.CIUDADANOS, `/${id}`)
      );
      console.log(' Ciudadano eliminado correctamente');
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

      console.error(` Error ${status}:`, message);

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