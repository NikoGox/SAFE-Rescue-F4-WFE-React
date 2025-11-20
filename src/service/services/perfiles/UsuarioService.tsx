import type { BaseUsuario, UserUpdateRequest, UserRegistroBackendType } from '../../../types/PerfilesType';
import { perfilesClient, buildApiUrlPathPerfiles, PerfilesEndpoints } from '../../../service/clients/PerfilesClient';

class UsuarioService {
  /**
   * Obtener todos los usuarios
   */
  async listarUsuarios(): Promise<BaseUsuario[]> {
    try {
      const response = await perfilesClient.get<BaseUsuario[]>(
        buildApiUrlPathPerfiles(PerfilesEndpoints.USUARIOS)
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
   * Buscar usuario por ID
   */
  async buscarUsuarioPorId(id: number): Promise<BaseUsuario> {
    try {
      const response = await perfilesClient.get<BaseUsuario>(
        buildApiUrlPathPerfiles(PerfilesEndpoints.USUARIOS, `/${id}`)
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Usuario no encontrado');
      }
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Crear un nuevo usuario
   */
  async registrarUsuario(usuario: UserRegistroBackendType): Promise<BaseUsuario> {
    try {
      const response = await perfilesClient.post<BaseUsuario>(
        buildApiUrlPathPerfiles(PerfilesEndpoints.USUARIOS),
        usuario
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
   * Actualizar usuario existente
   */
  async actualizarUsuario(id: number, usuario: UserUpdateRequest): Promise<BaseUsuario> {
    try {
      const response = await perfilesClient.put<BaseUsuario>(
        buildApiUrlPathPerfiles(PerfilesEndpoints.USUARIOS, `/${id}`),
        usuario
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Usuario no encontrado');
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
   * Eliminar usuario
   */
  async eliminarUsuario(id: number): Promise<string> {
    try {
      await perfilesClient.delete(
        buildApiUrlPathPerfiles(PerfilesEndpoints.USUARIOS, `/${id}`)
      );
      return 'Usuario eliminado con éxito.';
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Usuario no encontrado');
      }
      if (error.response?.status === 400) {
        throw new Error('No se puede eliminar el usuario: existen referencias activas');
      }
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Subir foto de perfil
   */
  async subirFotoUsuario(id: number, archivo: File): Promise<BaseUsuario> {
    try {
      const formData = new FormData();
      formData.append('foto', archivo);

      const response = await perfilesClient.post<BaseUsuario>(
        buildApiUrlPathPerfiles(PerfilesEndpoints.USUARIOS, `/${id}/subir-foto`),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Usuario no encontrado');
      }
      if (error.response?.status === 500) {
        throw new Error('Error al comunicarse con el servicio de fotos');
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
    return 'Error de validación en los datos del usuario';
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

export default new UsuarioService();