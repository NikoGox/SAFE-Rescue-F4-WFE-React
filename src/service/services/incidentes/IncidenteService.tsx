// src/services/IncidenteService.ts

import type {
  IncidenteResponse,
  IncidenteCreationDTO,
  IncidenteUpdateDTO
} from '../../../types/IncidenteType';
import { incidentesClient, buildApiUrlPathIncidentes, IncidentesEndpoints } from '../../clients/IncidentesClient';
import { IncidenteGeolocalizacionService } from './IncidenteGeolocalizacionService';

class IncidenteService {
  /**
   * Obtener todos los incidentes
   */
  async listarIncidentes(): Promise<IncidenteResponse[]> {
    try {
      const response = await incidentesClient.get<IncidenteResponse[]>(
        buildApiUrlPathIncidentes(IncidentesEndpoints.INCIDENTES)
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
   * Buscar incidente por ID
   */
  async buscarIncidentePorId(id: number): Promise<IncidenteResponse> {
    try {
      const response = await incidentesClient.get<IncidenteResponse>(
        buildApiUrlPathIncidentes(IncidentesEndpoints.INCIDENTES, `/${id}`)
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Incidente no encontrado');
      }
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Crear un nuevo incidente
   */
  async crearIncidente(incidente: IncidenteCreationDTO): Promise<string> {
    try {
      const response = await incidentesClient.post(
        buildApiUrlPathIncidentes(IncidentesEndpoints.INCIDENTES),
        incidente
      );

      if (response.status === 201) {
        return 'Incidente creado con éxito.';
      }
      return 'Incidente creado.';
    } catch (error: any) {
      if (error.response?.status === 400) {
        const errorMessage = this.getValidationErrorMessage(error.response.data);
        throw new Error(errorMessage);
      }
      this.handleError(error);
      throw error;
    }
  }

  async obtenerIncidenteConGeolocalizacion(id: number): Promise<any> {
    try {
      const incidente = await this.buscarIncidentePorId(id);

      if (incidente.idDireccion) {
        const direccionCompleta = await IncidenteGeolocalizacionService.obtenerDireccionCompleta(incidente.idDireccion);
        return {
          ...incidente,
          direccionCompleta
        };
      }

      return incidente;
    } catch (error) {
      console.error('Error obteniendo incidente con geolocalización:', error);
      throw error;
    }
  }

  /**
   * Actualizar incidente existente
   */
  async actualizarIncidente(id: number, incidente: IncidenteUpdateDTO): Promise<string> {
    try {
      const response = await incidentesClient.put(
        buildApiUrlPathIncidentes(IncidentesEndpoints.INCIDENTES, `/${id}`),
        incidente
      );

      if (response.status === 200) {
        return 'Actualizado con éxito';
      }
      return 'Incidente actualizado.';
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Incidente no encontrado');
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
   * Eliminar incidente
   */
  async eliminarIncidente(id: number): Promise<string> {
    try {
      await incidentesClient.delete(
        buildApiUrlPathIncidentes(IncidentesEndpoints.INCIDENTES, `/${id}`)
      );
      return 'Incidente eliminado con éxito.';
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Incidente no encontrado');
      }
      if (error.response?.status === 400) {
        throw new Error('No se puede eliminar el incidente: tiene historial asociado');
      }
      this.handleError(error);
      throw error;
    }
  }

  // =========================================================================
  // GESTIÓN DE RELACIONES
  // =========================================================================

  /**
   * Asignar ciudadano a incidente
   */
  async asignarCiudadano(incidenteId: number, ciudadanoId: number): Promise<string> {
    try {
      const response = await incidentesClient.post(
        buildApiUrlPathIncidentes(IncidentesEndpoints.INCIDENTES, `/${incidenteId}/asignar-ciudadano/${ciudadanoId}`)
      );
      return 'Ciudadano asignado al Incidente exitosamente';
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Incidente o Ciudadano no encontrado');
      }
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Asignar estado de incidente
   */
  async asignarEstadoIncidente(incidenteId: number, estadoIncidenteId: number): Promise<string> {
    try {
      const response = await incidentesClient.post(
        buildApiUrlPathIncidentes(IncidentesEndpoints.INCIDENTES, `/${incidenteId}/asignar-estado-incidente/${estadoIncidenteId}`)
      );
      return 'Estado Incidente asignado al Incidente exitosamente';
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Incidente o Estado no encontrado');
      }
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Asignar tipo de incidente
   */
  async asignarTipoIncidente(incidenteId: number, tipoIncidenteId: number): Promise<string> {
    try {
      const response = await incidentesClient.post(
        buildApiUrlPathIncidentes(IncidentesEndpoints.INCIDENTES, `/${incidenteId}/asignar-tipo-incidente/${tipoIncidenteId}`)
      );
      return 'Tipo Incidente asignado al Incidente exitosamente';
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Incidente o Tipo de Incidente no encontrado');
      }
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Asignar usuario responsable
   */
  async asignarUsuarioAsignado(incidenteId: number, usuarioId: number): Promise<string> {
    try {
      const response = await incidentesClient.post(
        buildApiUrlPathIncidentes(IncidentesEndpoints.INCIDENTES, `/${incidenteId}/asignar-usuario-asignado/${usuarioId}`)
      );
      return 'Usuario responsable asignado al Incidente exitosamente';
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Incidente o Usuario no encontrado');
      }
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Crear y asignar nueva ubicación
   */
  async agregarUbicacionAIncidente(incidenteId: number, ubicacionJson: any): Promise<IncidenteResponse> {
    try {
      const response = await incidentesClient.post<IncidenteResponse>(
        buildApiUrlPathIncidentes(IncidentesEndpoints.INCIDENTES, `/${incidenteId}/agregar-ubicacion`),
        ubicacionJson
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Incidente no encontrado');
      }
      if (error.response?.status === 400) {
        throw new Error('Error en el formato JSON de la dirección o falla del microservicio de Geolocalización');
      }
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Asignar dirección existente
   */
  async asignarDireccion(incidenteId: number, direccionId: number): Promise<string> {
    try {
      const response = await incidentesClient.post(
        buildApiUrlPathIncidentes(IncidentesEndpoints.INCIDENTES, `/${incidenteId}/asignar-direccion/${direccionId}`)
      );
      return 'Dirección asignada al incidente exitosamente';
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Incidente o Dirección no encontrada');
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

    // Mensajes específicos para incidentes
    if (errorData?.includes?.('TipoIncidente no existe')) {
      return 'El tipo de incidente especificado no existe';
    }
    if (errorData?.includes?.('Estado no existe')) {
      return 'El estado especificado no existe';
    }
    if (errorData?.includes?.('Ciudadano no existe')) {
      return 'El ciudadano especificado no existe';
    }
    if (errorData?.includes?.('Dirección no existe')) {
      return 'La dirección especificada no existe';
    }

    return 'Error de validación en los datos del incidente';
  }

  async actualizarFotoIncidente(id: number, idFoto: number): Promise<void> {
    try {
      console.log(`🔄 Actualizando foto del incidente ${id} con idFoto: ${idFoto}`);

      const response = await fetch(`http://localhost:8083/api-incidentes/v1/incidentes/${id}/foto`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idFoto: idFoto
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(` Error ${response.status}: ${errorText}`);

        if (response.status === 404) {
          throw new Error('Incidente no encontrado');
        } else if (response.status === 400) {
          throw new Error('Datos inválidos');
        } else {
          throw new Error(`Error al actualizar foto: ${response.status}`);
        }
      }

      const result = await response.json();
      console.log(' Foto actualizada correctamente:', result);

    } catch (error) {
      console.error(' Error en actualizarFotoIncidente:', error);
      throw error;
    }
  }

  // Método para actualización parcial general
  async actualizarParcialIncidente(id: number, campos: any): Promise<void> {
    try {
      console.log(`🔄 Actualizando incidente ${id} con campos:`, campos);

      const response = await fetch(`http://localhost:8083/api-incidentes/v1/incidentes/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(campos)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Error ${response.status}: ${errorText}`);
        throw new Error(`Error al actualizar incidente: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Incidente actualizado correctamente:', result);

    } catch (error) {
      console.error('❌ Error en actualizarParcialIncidente:', error);
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

export default new IncidenteService();