import type { Compania, CompaniaRequest } from '../../../types/PerfilesType';
import { perfilesClient, buildApiUrlPathPerfiles, PerfilesEndpoints } from '../../../service/clients/PerfilesClient';

class CompaniaService {
  async listarCompanias(): Promise<Compania[]> {
    const response = await perfilesClient.get<Compania[]>(
      buildApiUrlPathPerfiles(PerfilesEndpoints.COMPANIAS)
    );
    return response.data;
  }

  async buscarCompaniaPorId(id: number): Promise<Compania> {
    const response = await perfilesClient.get<Compania>(
      buildApiUrlPathPerfiles(PerfilesEndpoints.COMPANIAS, `/${id}`)
    );
    return response.data;
  }

  async crearCompania(compania: CompaniaRequest): Promise<Compania> {
    const response = await perfilesClient.post<Compania>(
      buildApiUrlPathPerfiles(PerfilesEndpoints.COMPANIAS),
      compania
    );
    return response.data;
  }

  async actualizarCompania(id: number, compania: CompaniaRequest): Promise<Compania> {
    const response = await perfilesClient.put<Compania>(
      buildApiUrlPathPerfiles(PerfilesEndpoints.COMPANIAS, `/${id}`),
      compania
    );
    return response.data;
  }

  async eliminarCompania(id: number): Promise<void> {
    await perfilesClient.delete(
      buildApiUrlPathPerfiles(PerfilesEndpoints.COMPANIAS, `/${id}`)
    );
  }
}

export default new CompaniaService();