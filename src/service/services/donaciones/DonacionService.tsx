import type { 
  DonacionResponse, 
  DonacionCreationDTO,
  DonacionCreationFrontendDTO,
  DonacionSimplificada,
  MetodoPago
} from '../../../types/DonacionesType';

// Importar las funciones como valores, no como tipos
import { 
  convertirDonacionABackend,
  formatearMonto,
  obtenerLabelMetodoPago,
  validarMontoChile,
  crearDonacionDTO,
  METODOS_PAGO_BACKEND
} from '../../../types/DonacionesType';

import { donacionesClient, buildApiUrlPathDonaciones, DonacionesEndpoints } from '../../clients/DonacionesClient';

// Interface para errores de Axios
interface AxiosErrorWithResponse extends Error {
    response?: {
        status: number;
        data?: unknown;
    };
}

/**
 * Verifica si el error es un AxiosError con response
 */
const isAxiosErrorWithResponse = (error: unknown): error is AxiosErrorWithResponse => {
    return error instanceof Error && 'response' in error;
};

class DonacionService {
  /**
   * Obtener todas las donaciones
   */
  async listarDonaciones(): Promise<DonacionResponse[]> {
    try {
      const response = await donacionesClient.get<DonacionResponse[]>(
        buildApiUrlPathDonaciones(DonacionesEndpoints.DONACIONES)
      );
      return response.data;
    } catch (error: unknown) {
      if (isAxiosErrorWithResponse(error) && error.response?.status === 204) {
        return []; // Retorna array vacío si no hay contenido
      }
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al obtener donaciones';
      throw new Error(errorMessage);
    }
  }

  /**
   * Buscar donación por ID
   */
  async buscarDonacionPorId(id: number): Promise<DonacionResponse> {
    try {
      const response = await donacionesClient.get<DonacionResponse>(
        buildApiUrlPathDonaciones(DonacionesEndpoints.DONACIONES, `/${id}`)
      );
      return response.data;
    } catch (error: unknown) {
      if (isAxiosErrorWithResponse(error) && error.response?.status === 404) {
        throw new Error('Donación no encontrada');
      }
      const errorMessage = error instanceof Error ? error.message : `Error desconocido al obtener donación ${id}`;
      throw new Error(errorMessage);
    }
  }

  /**
   * Crear una nueva donación
   */
  async crearDonacion(donacion: DonacionCreationDTO): Promise<string> {
    try {
      // Validar monto antes de enviar
      if (!validarMontoChile(donacion.monto)) {
        throw new Error('El monto debe ser un número entero positivo');
      }

      const response = await donacionesClient.post(
        buildApiUrlPathDonaciones(DonacionesEndpoints.DONACIONES),
        donacion
      );
      
      if (response.status === 201) {
        return 'Donación creada con éxito.';
      }
      return 'Donación creada.';
    } catch (error: unknown) {
      if (isAxiosErrorWithResponse(error)) {
        if (error.response?.status === 400) {
          const errorMessage = this.getValidationErrorMessage(error.response.data);
          throw new Error(errorMessage);
        }
      }
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al crear donación';
      throw new Error(errorMessage);
    }
  }

  /**
   * Crear donación desde frontend (convierte automáticamente)
   */
  async crearDonacionDesdeFrontend(donacion: DonacionCreationFrontendDTO): Promise<string> {
    try {
      const donacionBackend = convertirDonacionABackend(donacion);
      return await this.crearDonacion(donacionBackend);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al crear donación desde frontend';
      throw new Error(errorMessage);
    }
  }

  /**
   * Actualizar donación existente
   */
  async actualizarDonacion(id: number, donacion: Partial<DonacionCreationDTO>): Promise<string> {
    try {
      const response = await donacionesClient.put(
        buildApiUrlPathDonaciones(DonacionesEndpoints.DONACIONES, `/${id}`),
        donacion
      );
      
      if (response.status === 200) {
        return 'Donación actualizada con éxito';
      }
      return 'Donación actualizada.';
    } catch (error: unknown) {
      if (isAxiosErrorWithResponse(error)) {
        if (error.response?.status === 404) {
          throw new Error('Donación no encontrada');
        }
        if (error.response?.status === 400) {
          const errorMessage = this.getValidationErrorMessage(error.response.data);
          throw new Error(errorMessage);
        }
      }
      const errorMessage = error instanceof Error ? error.message : `Error desconocido al actualizar donación ${id}`;
      throw new Error(errorMessage);
    }
  }

  /**
   * Eliminar donación
   */
  async eliminarDonacion(id: number): Promise<string> {
    try {
      await donacionesClient.delete(
        buildApiUrlPathDonaciones(DonacionesEndpoints.DONACIONES, `/${id}`)
      );
      return 'Donación eliminada con éxito.';
    } catch (error: unknown) {
      if (isAxiosErrorWithResponse(error)) {
        if (error.response?.status === 404) {
          throw new Error('Donación no encontrada');
        }
      }
      const errorMessage = error instanceof Error ? error.message : `Error desconocido al eliminar donación ${id}`;
      throw new Error(errorMessage);
    }
  }

  /**
   * Obtener donaciones por donante
   */
  async obtenerDonacionesPorDonante(donanteId: number): Promise<DonacionResponse[]> {
    try {
      const response = await donacionesClient.get<DonacionResponse[]>(
        buildApiUrlPathDonaciones(DonacionesEndpoints.DONACIONES, `/por-donante/${donanteId}`)
      );
      return response.data;
    } catch (error: unknown) {
      if (isAxiosErrorWithResponse(error) && error.response?.status === 204) {
        return []; // Retorna array vacío si no hay donaciones
      }
      const errorMessage = error instanceof Error ? error.message : `Error desconocido al obtener donaciones del donante ${donanteId}`;
      throw new Error(errorMessage);
    }
  }

  /**
   * Obtener donaciones simplificadas (para listados)
   */
  async obtenerDonacionesSimplificadas(): Promise<DonacionSimplificada[]> {
    try {
      const donaciones = await this.listarDonaciones();
      
      return donaciones.map(donacion => ({
        idDonacion: donacion.idDonacion,
        monto: donacion.monto,
        fechaDonacion: donacion.fechaDonacion,
        metodoPago: donacion.metodoPago,
        nombreDonante: `Donante ${donacion.idDonante}` // Esto se puede mejorar con datos reales
      }));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al obtener donaciones simplificadas';
      throw new Error(errorMessage);
    }
  }

  /**
   * Obtener total de donaciones
   */
  async obtenerTotalDonaciones(): Promise<number> {
    try {
      const donaciones = await this.listarDonaciones();
      return donaciones.reduce((total, donacion) => total + donacion.monto, 0);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al calcular total de donaciones';
      throw new Error(errorMessage);
    }
  }

  /**
   * Procesar donación rápida (utilidad para uso común)
   */
  async procesarDonacionRapida(
    idDonante: number, 
    monto: number, 
    metodoPago: MetodoPago
  ): Promise<string> {
    try {
      const donacionDTO = crearDonacionDTO(idDonante, monto, metodoPago);
      return await this.crearDonacionDesdeFrontend(donacionDTO);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al procesar donación rápida';
      throw new Error(errorMessage);
    }
  }

  /**
   * Formatear monto para UI (utilidad)
   */
  formatearMonto(monto: number): string {
    return formatearMonto(monto);
  }

  /**
   * Obtener label legible del método de pago
   */
  obtenerLabelMetodoPago(metodoPago: string): string {
    return obtenerLabelMetodoPago(metodoPago);
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
    
    // Mensajes específicos para donaciones
    if (errorData?.includes?.('ID de donante no encontrado')) {
      return 'El ID del donante no existe en el sistema';
    }
    if (errorData?.includes?.('monto debe ser positivo')) {
      return 'El monto debe ser un número positivo';
    }
    
    return 'Error de validación en los datos de la donación';
  }
}

export default new DonacionService();