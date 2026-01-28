// ============================================
// IBUC System - Serviço de Turmas e Níveis (Feature Migration)
// ============================================

import { api } from '@/shared/api/api';

export interface TurmaItem {
  id: string;
  nome: string;
  polo_id: string;
  nivel_id: string;
  professor_id?: string | null;
  capacidade: number;
  ano_letivo: number;
  turno: 'manha' | 'tarde' | 'noite';
  status: 'ativa' | 'inativa' | 'concluida';
  modulo_atual_id?: string | null;
  dias_semana?: number[] | null;
  horario_inicio?: string | null;
  horario_fim?: string | null;
  data_inicio?: string | null;
  data_previsao_termino?: string | null;
  data_conclusao?: string | null;
  migracao_concluida?: boolean;
  created_at?: string;
}

export const TurmasAPI = {
  listar: (params?: { polo_id?: string; nivel_id?: string; professor_id?: string; status?: string; modulo_atual_id?: string; ano_letivo?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.polo_id) searchParams.append('polo_id', params.polo_id);
    if (params?.nivel_id) searchParams.append('nivel_id', params.nivel_id);
    if (params?.professor_id) searchParams.append('professor_id', params.professor_id);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.modulo_atual_id) searchParams.append('modulo_atual_id', params.modulo_atual_id);
    if (typeof params?.ano_letivo === 'number') searchParams.append('ano_letivo', String(params.ano_letivo));

    const query = searchParams.toString();
    return api.get(`/turmas${query ? `?${query}` : ''}`);
  },
  criar: (data: unknown) => api.post('/turmas', data),
  buscarPorId: (id: string) => api.get(`/turmas/${id}`),
  atualizar: (id: string, data: unknown) => api.put(`/turmas/${id}`, data),
  deletar: (id: string) => api.delete(`/turmas/${id}`),
  previewTransicao: (id: string) => api.get<any[]>(`/turmas/${id}/preview-transition`),
  encerrarModulo: (id: string, data: { alunos_confirmados: string[]; valor_cents?: number }) =>
    api.post(`/turmas/${id}/close-module`, data),
  trazerAlunos: (id: string, moduloAnteriorNumero: number) =>
    api.post(`/turmas/${id}/trazer-alunos`, { modulo_anterior_numero: moduloAnteriorNumero }),
  getOccupancy: (id: string) => api.get<{ count: number }>(`/turmas/${id}/occupancy`),
};

export const NiveisAPI = {
  listar: () => api.get('/niveis'),
};

/** @deprecated Use named exports TurmasAPI and NiveisAPI */
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

  static async previewTransicao(id: string) {
    return TurmasAPI.previewTransicao(id);
  }

  static async encerrarModulo(id: string, data: { alunos_confirmados: string[]; valor_cents?: number }) {
    return TurmasAPI.encerrarModulo(id, data);
  }

  static async traerAlunos(id: string, moduloAnteriorNumero: number) {
    return TurmasAPI.trazerAlunos(id, moduloAnteriorNumero);
  }

  static async getOccupancy(id: string) {
    return TurmasAPI.getOccupancy(id);
  }
}

export default TurmaService;
