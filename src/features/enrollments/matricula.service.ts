import { api } from '../../lib/api';
import type { Matricula, StatusMatricula } from '../../types/database';
import { ApiError, AppError } from '../../lib/errors';

export const MatriculaAPI = {
  criar: (data: unknown) => api.post('/matriculas', data),
  uploadDocumentos: (id: string, formData: FormData) => api.upload(`/documentos/matriculas/${id}`, formData),
  listar: (params?: { polo_id?: string; status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (typeof value === 'string' && value.trim().length > 0) {
          searchParams.append(key, value);
        }
      }
    }
    const query = searchParams.toString();
    return api.get(`/matriculas${query ? `?${query}` : ''}`);
  },
  buscarPorProtocolo: (protocolo: string) => api.get(`/matriculas/protocolo/${protocolo}`),
  buscarPorId: (id: string) => api.get(`/matriculas/${id}`),
  aprovar: (id: string, data: { approved_by: string }) => api.put(`/matriculas/${id}/aprovar`, data),
  recusar: (id: string, data: { motivo: string; user_id: string }) => api.put(`/matriculas/${id}/recusar`, data),
};

export const PreMatriculasAPI = {
  criar: (data: Partial<PreMatricula>) => api.post('/pre-matriculas', data),
  listar: (params?: { polo_id?: string; status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.polo_id) searchParams.append('polo_id', params.polo_id);
    if (params?.status) searchParams.append('status', params.status);
    const query = searchParams.toString();
    return api.get(`/pre-matriculas${query ? `?${query}` : ''}`);
  },
  atualizarStatus: (id: string, data: { status: string }) => api.put(`/pre-matriculas/${id}/status`, data),
  atualizar: (id: string, data: Partial<PreMatricula>) => api.patch(`/pre-matriculas/${id}`, data),
  deletar: (id: string) => api.delete(`/pre-matriculas/${id}`),
  concluir: (id: string, data: { turma_id: string; approved_by: string }) => api.post(`/pre-matriculas/${id}/concluir`, data),
};

export class MatriculaService {
  /**
   * Lista matrículas (respeitando RLS)
   */
  static async listarMatriculas(
    poloId?: string,
    status?: StatusMatricula
  ): Promise<Matricula[]> {
    const filtros: any = {};
    if (poloId) filtros.polo_id = poloId;
    if (status) filtros.status = status;
    const data = await MatriculaAPI.listar(filtros);
    return data as Matricula[];
  }

  /**
   * Busca matrícula por protocolo
   */
  static async buscarMatriculaPorProtocolo(protocolo: string): Promise<Matricula | null> {
    try {
      const data = await MatriculaAPI.buscarPorProtocolo(protocolo);
      return data as Matricula;
    } catch (error: any) {
      if (error.message && error.message.includes('Matrícula não encontrada')) {
        return null;
      }
      console.error('Erro ao buscar matrícula:', error);
      throw error;
    }
  }

  /**
   * Busca matrícula por ID
   */
  static async buscarMatriculaPorId(id: string): Promise<Matricula | null> {
    try {
      const data = await MatriculaAPI.buscarPorId(id);
      return data as Matricula;
    } catch (error: any) {
      throw new ApiError('Erro ao buscar matrícula por ID', error);
    }
  }

  /**
   * Cria uma nova matrícula
   */
  static async criarMatricula(
    matricula: Omit<Matricula, 'id' | 'created_at' | 'protocolo'>
  ): Promise<Matricula> {
    const data = await MatriculaAPI.criar(matricula);
    return data as Matricula;
  }

  /**
   * Atualiza status da matrícula
   */
  static async atualizarStatusMatricula(
    id: string,
    status: StatusMatricula,
    approvedBy?: string,
    motivoRecusa?: string
  ): Promise<Matricula> {
    if (status === 'ativa' as StatusMatricula) {
      const data = await MatriculaAPI.aprovar(id, { approved_by: approvedBy || '' });
      return data as Matricula;
    }

    if (status === 'recusada') {
      const data = await MatriculaAPI.recusar(id, { motivo: motivoRecusa || '', user_id: approvedBy || '' });
      return data as Matricula;
    }

    // Para outros status, poderia haver um endpoint genérico; por enquanto, lança erro explícito
    throw new AppError('Atualização de status não suportada por esta API', 'VALIDATION_ERROR');
  }
}
