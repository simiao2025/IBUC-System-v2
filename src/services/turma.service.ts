// ============================================
// IBUC System - Serviço de Turmas e Níveis
// ============================================

import { api } from '../lib/api';

export const TurmasAPI = {
  listar: (params?: { polo_id?: string; nivel_id?: string; professor_id?: string; status?: string; ano_letivo?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.polo_id) searchParams.append('polo_id', params.polo_id);
    if (params?.nivel_id) searchParams.append('nivel_id', params.nivel_id);
    if (params?.professor_id) searchParams.append('professor_id', params.professor_id);
    if (params?.status) searchParams.append('status', params.status);
    if (typeof params?.ano_letivo === 'number') searchParams.append('ano_letivo', String(params.ano_letivo));

    const query = searchParams.toString();
    return api.get(`/turmas${query ? `?${query}` : ''}`);
  },
  criar: (data: unknown) => api.post('/turmas', data),
  buscarPorId: (id: string) => api.get(`/turmas/${id}`),
  atualizar: (id: string, data: unknown) => api.put(`/turmas/${id}`, data),
  deletar: (id: string) => api.delete(`/turmas/${id}`),
};

export const NiveisAPI = {
  listar: () => api.get('/niveis'),
};

export class TurmaService {
  static async listarTurmas(params?: any) {
    return TurmasAPI.listar(params);
  }

  static async criarTurma(data: any) {
    return TurmasAPI.criar(data);
  }

  static async buscarPorId(id: string) {
    return TurmasAPI.buscarPorId(id);
  }

  static async atualizar(id: string, data: any) {
    return TurmasAPI.atualizar(id, data);
  }

  static async deletar(id: string) {
    return TurmasAPI.deletar(id);
  }

  static async listarNiveis() {
    return NiveisAPI.listar();
  }
}
