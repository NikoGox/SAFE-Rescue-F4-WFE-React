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

// Interface para errores de Axios - CORREGIDA
interface AxiosErrorWithResponse extends Error {
  response?: {
    status: number;
    data?: unknown;
    headers?: unknown;
  };
  request?: unknown;
  config?: unknown;
}

/**
 * Verifica si el error es un AxiosError con response
 */
const isAxiosErrorWithResponse = (error: unknown): error is AxiosErrorWithResponse => {
  return error instanceof Error && 'response' in error;
};

// Interfaces para donantes temporales
interface DonanteTemporalDTO {
  nombre: string;
  email: string;
  telefono?: string;
}

interface DonanteTemporalResponse {
  idDonante: number;
  nombre: string;
  email: string;
  telefono?: string;
  esTemporal: boolean;
}

/**
 * Servicio para manejar donantes anónimos
 */
class DonanteAnonimoService {
  private donanteAnonimoId: number = 0; // ID temporal para donantes anónimos

  /**
   * Obtener o crear un ID de donante anónimo
   */
  async obtenerDonanteAnonimoId(): Promise<number> {
    if (this.donanteAnonimoId === 0) {
      // En una implementación real, aquí llamarías al backend para crear un donante anónimo
      // Por ahora usamos un ID temporal
      this.donanteAnonimoId = this.generarIdTemporal();
      console.log('🆔 Donante anónimo creado con ID:', this.donanteAnonimoId);
    }
    return this.donanteAnonimoId;
  }

  /**
   * Crear donante anónimo en el backend (cuando implementes el endpoint)
   */
  async crearDonanteAnonimoEnBackend(datos: { nombre: string, email: string, telefono?: string }): Promise<number> {
    try {
      // SIMULACIÓN - reemplaza con tu endpoint real
      console.log('📝 Creando donante anónimo en backend:', datos);

      
      // Por ahora retornamos un ID temporal
      const idTemporal = this.generarIdTemporal();
      return idTemporal;
    } catch (error) {
      console.error('Error creando donante anónimo:', error);
      throw new Error('No se pudo crear el donante temporal');
    }
  }

  private generarIdTemporal(): number {
    return Math.floor(Math.random() * 100000) + 1000;
  }
}

export const donanteAnonimoService = new DonanteAnonimoService();

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
   * Crear una nueva donación - CÓDIGO CORREGIDO
   */
  async crearDonacion(donacion: DonacionCreationDTO): Promise<string> {
    try {
      console.log('🔄 Intentando crear donación:', donacion);

      // Validar monto antes de enviar
      if (!validarMontoChile(donacion.monto)) {
        throw new Error('El monto debe ser un número entero positivo');
      }

      // Validar datos requeridos
      if (!donacion.idDonante || donacion.idDonante <= 0) {
        throw new Error('ID de donante inválido');
      }

      if (!donacion.metodoPago) {
        throw new Error('Método de pago es requerido');
      }

      const url = buildApiUrlPathDonaciones(DonacionesEndpoints.DONACIONES);
      console.log('📤 URL de la petición:', url);
      console.log('📦 Datos enviados:', JSON.stringify(donacion, null, 2));

      const response = await donacionesClient.post(url, donacion);
      
      console.log('✅ Respuesta del servidor:', response.status, response.data);

      if (response.status === 201) {
        return 'Donación creada con éxito.';
      }
      return 'Donación creada.';
    } catch (error: unknown) {
      console.error('💥 Error en crearDonacion:', error);
      
      if (isAxiosErrorWithResponse(error)) {
        console.error('🔍 Detalles del error Axios:');
        console.error('Status:', error.response?.status);
        console.error('Data:', error.response?.data);
        // REMOVIDO: console.error('Headers:', error.response?.headers); // Esta línea causaba el error

        if (error.response?.status === 400) {
          const errorMessage = this.getValidationErrorMessage(error.response.data);
          throw new Error(errorMessage);
        }
        if (error.response?.status === 500) {
          const serverError = this.getServerErrorMessage(error.response.data);
          throw new Error(`Error del servidor: ${serverError}`);
        }
        if (error.request) {
          throw new Error('No se pudo conectar al servidor. Verifica que el servicio de donaciones esté ejecutándose.');
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
      console.log('🔄 Convirtiendo donación frontend a backend');
      const donacionBackend = convertirDonacionABackend(donacion);
      console.log('📦 Donación convertida:', donacionBackend);
      return await this.crearDonacion(donacionBackend);
    } catch (error: unknown) {
      console.error('💥 Error en crearDonacionDesdeFrontend:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al crear donación desde frontend';
      throw new Error(errorMessage);
    }
  }

  /**
   * Crear donante temporal para usuarios no logueados
   */
  async crearDonanteTemporal(datosDonante: DonanteTemporalDTO): Promise<DonanteTemporalResponse> {
    try {
      console.log('📝 Creando donante temporal:', datosDonante);

      // Validar datos requeridos
      if (!datosDonante.nombre?.trim()) {
        throw new Error('El nombre es obligatorio para crear un donante temporal');
      }
      if (!datosDonante.email?.trim()) {
        throw new Error('El email es obligatorio para crear un donante temporal');
      }

      // Validar formato de email
      const emailRegex = /\S+@\S+\.\S+/;
      if (!emailRegex.test(datosDonante.email)) {
        throw new Error('El formato del email no es válido');
      }

      // SIMULACIÓN: En una implementación real, aquí llamarías a tu endpoint de donantes temporales
      // Por ahora usamos un ID fijo para testing
      const donanteTemporal: DonanteTemporalResponse = {
        idDonante: 9999, // ID fijo para testing - cambiar por uno real después
        nombre: datosDonante.nombre.trim(),
        email: datosDonante.email.trim(),
        telefono: datosDonante.telefono?.trim(),
        esTemporal: true
      };

      console.log('✅ Donante temporal creado (simulación):', donanteTemporal);
      return donanteTemporal;

    } catch (error: unknown) {
      console.error('💥 Error creando donante temporal:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al crear donante temporal';
      throw new Error(errorMessage);
    }
  }

  /**
   * Procesar donación completa para usuarios no logueados
   */
  async procesarDonacionNoLogueado(
    datosDonante: DonanteTemporalDTO,
    monto: number,
    metodoPago: MetodoPago = 'TARJETA_CREDITO',
    tipoHomenaje?: string,
    detalleHomenaje?: string
  ): Promise<string> {
    try {
      console.log('🔄 Procesando donación para usuario no logueado');

      // 1. Crear donante temporal
      const donanteTemporal = await this.crearDonanteTemporal(datosDonante);

      // 2. Crear DTO de donación
      const donacionDTO: DonacionCreationFrontendDTO = {
        idDonante: donanteTemporal.idDonante,
        monto: monto,
        metodoPago: metodoPago,
        tipoHomenaje: tipoHomenaje || null,
        detalleHomenaje: detalleHomenaje || null
      };

      // 3. Crear la donación
      const resultado = await this.crearDonacionDesdeFrontend(donacionDTO);

      console.log('✅ Donación procesada exitosamente para usuario no logueado');
      return resultado;

    } catch (error: unknown) {
      console.error('💥 Error procesando donación para usuario no logueado:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al procesar donación';
      throw new Error(errorMessage);
    }
  }

  /**
   * Procesar donación para cualquier tipo de usuario (logueado o no)
   */
  async procesarDonacionUniversal(
    datosUsuario: {
      idUsuario?: number;
      nombre: string;
      email: string;
      telefono?: string;
      estaLogueado: boolean;
    },
    monto: number,
    metodoPago: MetodoPago = 'TARJETA_CREDITO',
    tipoHomenaje?: string,
    detalleHomenaje?: string
  ): Promise<string> {
    try {
      console.log(' Procesando donación universal, usuario logueado:', datosUsuario.estaLogueado);

      if (datosUsuario.estaLogueado && datosUsuario.idUsuario) {
        // Usuario logueado - usar ID existente
        console.log(' Usando usuario logueado ID:', datosUsuario.idUsuario);
        const donacionDTO: DonacionCreationFrontendDTO = {
          idDonante: datosUsuario.idUsuario,
          monto: monto,
          metodoPago: metodoPago,
          tipoHomenaje: tipoHomenaje || null,
          detalleHomenaje: detalleHomenaje || null
        };
        return await this.crearDonacionDesdeFrontend(donacionDTO);
      } else {
        // Usuario no logueado - crear donante temporal
        console.log(' Creando donante temporal');
        const datosDonante: DonanteTemporalDTO = {
          nombre: datosUsuario.nombre,
          email: datosUsuario.email,
          telefono: datosUsuario.telefono
        };
        return await this.procesarDonacionNoLogueado(
          datosDonante,
          monto,
          metodoPago,
          tipoHomenaje,
          detalleHomenaje
        );
      }
    } catch (error: unknown) {
      console.error('💥 Error en procesarDonacionUniversal:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al procesar donación universal';
      throw new Error(errorMessage);
    }
  }

  /**
   * Método de emergencia - usar ID de donante fijo que SÍ existe en tu BD
   */
  async crearDonacionConDonanteFijo(
    monto: number,
    metodoPago: MetodoPago = 'TARJETA_CREDITO',
    tipoHomenaje?: string,
    detalleHomenaje?: string
  ): Promise<string> {
    try {
      console.log('🆘 Usando donante fijo para testing');
      
      // IMPORTANTE: Cambia este ID por uno que SÍ exista en tu base de datos
      const ID_DONANTE_FIJO = 1; // ← CAMBIA ESTO por un ID válido
      
      const donacionDTO: DonacionCreationFrontendDTO = {
        idDonante: ID_DONANTE_FIJO,
        monto: monto,
        metodoPago: metodoPago,
        tipoHomenaje: tipoHomenaje || null,
        detalleHomenaje: detalleHomenaje || null
      };

      console.log('📦 Donación con donante fijo:', donacionDTO);
      return await this.crearDonacionDesdeFrontend(donacionDTO);
    } catch (error: unknown) {
      console.error('💥 Error en crearDonacionConDonanteFijo:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error con donante fijo';
      throw new Error(errorMessage);
    }
  }

  /**
   * Generar ID temporal (simulación - en producción usaría el ID del backend)
   */
  private generarIdTemporal(): number {
    return Math.floor(Math.random() * 1000000) + 1000;
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
    console.log('🔍 Analizando error de validación:', errorData);

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

  /**
   * Extrae mensajes de error del servidor (500)
   */
  private getServerErrorMessage(errorData: any): string {
    console.log('🔍 Analizando error del servidor:', errorData);

    if (typeof errorData === 'string') {
      return errorData;
    }
    if (errorData?.message) {
      return errorData.message;
    }
    if (errorData?.error) {
      return errorData.error;
    }
    if (errorData?.path && errorData?.timestamp) {
      return `Error interno en ${errorData.path}`;
    }
    
    return 'Error interno del servidor. Por favor, contacta al administrador.';
  }
}

export default new DonacionService();