import type { TipoEquipo, TipoEquipoRequest } from '../../../types/PerfilesType';
import { perfilesClient, buildApiUrlPathPerfiles, PerfilesEndpoints } from '../../../service/clients/PerfilesClient';

class TipoEquipoService {
  async listarTiposEquipo(): Promise<TipoEquipo[]> {
    const response = await perfilesClient.get<TipoEquipo[]>(
      buildApiUrlPathPerfiles(PerfilesEndpoints.TIPOSEQUIPO)
    );
    return response.data;
  }

  async buscarTipoEquipoPorId(id: number): Promise<TipoEquipo> {
    const response = await perfilesClient.get<TipoEquipo>(
      buildApiUrlPathPerfiles(PerfilesEndpoints.TIPOSEQUIPO, `/${id}`)
    );
    return response.data;
  }

  async crearTipoEquipo(tipoEquipo: TipoEquipoRequest): Promise<TipoEquipo> {
    const response = await perfilesClient.post<TipoEquipo>(
      buildApiUrlPathPerfiles(PerfilesEndpoints.TIPOSEQUIPO),
      tipoEquipo
    );
    return response.data;
  }

  async actualizarTipoEquipo(id: number, tipoEquipo: TipoEquipoRequest): Promise<TipoEquipo> {
    const response = await perfilesClient.put<TipoEquipo>(
      buildApiUrlPathPerfiles(PerfilesEndpoints.TIPOSEQUIPO, `/${id}`),
      tipoEquipo
    );
    return response.data;
  }

  async eliminarTipoEquipo(id: number): Promise<void> {
    await perfilesClient.delete(
      buildApiUrlPathPerfiles(PerfilesEndpoints.TIPOSEQUIPO, `/${id}`)
    );
  }
}

export default new TipoEquipoService();