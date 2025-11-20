import type { TipoUsuario, TipoUsuarioRequest } from '../../../types/PerfilesType.ts'; 
import { perfilesClient, buildApiUrlPathPerfiles, PerfilesEndpoints } from '../../clients/PerfilesClient.tsx'; 

class TipoUsuarioService {
  /**
   * Obtener todos los tipos de usuario
   */
  async listarTiposUsuario(): Promise<TipoUsuario[]> {
    try {
      const response = await perfilesClient.get<TipoUsuario[]>(
        buildApiUrlPathPerfiles(PerfilesEndpoints.TIPOSUSUARIO)
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Obtener un tipo de usuario por ID
   */
  async buscarTipoUsuarioPorId(id: number): Promise<TipoUsuario> {
    try {
      const response = await perfilesClient.get<TipoUsuario>(
        buildApiUrlPathPerfiles(PerfilesEndpoints.TIPOSUSUARIO, `/${id}`)
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Crear un nuevo tipo de usuario
   */
  async crearTipoUsuario(tipoUsuario: TipoUsuarioRequest): Promise<TipoUsuario> {
    try {
      const response = await perfilesClient.post<TipoUsuario>(
        buildApiUrlPathPerfiles(PerfilesEndpoints.TIPOSUSUARIO),
        tipoUsuario
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Actualizar un tipo de usuario existente
   */
  async actualizarTipoUsuario(id: number, tipoUsuario: TipoUsuarioRequest): Promise<TipoUsuario> {
    try {
      const response = await perfilesClient.put<TipoUsuario>(
        buildApiUrlPathPerfiles(PerfilesEndpoints.TIPOSUSUARIO, `/${id}`),
        tipoUsuario
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Eliminar un tipo de usuario
   */
  async eliminarTipoUsuario(id: number): Promise<void> {
    try {
      await perfilesClient.delete(
        buildApiUrlPathPerfiles(PerfilesEndpoints.TIPOSUSUARIO, `/${id}`)
      );
    } catch (error) {
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
      const message = error.response.data?.message || error.message;

      switch (status) {
        case 400:
          throw new Error(`Error de validación: ${message}`);
        case 404:
          throw new Error('Tipo de usuario no encontrado');
        case 409:
          throw new Error('Conflicto de datos: ' + message);
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

export default new TipoUsuarioService();