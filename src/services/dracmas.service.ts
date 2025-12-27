// ============================================
// IBUC System - Serviço de Drácmas
// ============================================

import { api } from '../lib/api';

export const DracmasAPI = {
  lancarLote: (data: {
    turma_id: string;
    data: string;
    tipo: string;
    descricao?: string;
    registrado_por: string;
    transacoes: { aluno_id: string; quantidade: number }[];
  }) => api.post('/dracmas/lancar-lote', data),

  saldoPorAluno: (alunoId: string) => api.get(`/dracmas/saldo?aluno_id=${alunoId}`),

  total: (poloId?: string) => {
    const query = poloId ? `?polo_id=${encodeURIComponent(poloId)}` : '';
    return api.get(`/dracmas/total${query}`);
  },

  listarCriterios: () => api.get('/dracmas/criterios'),

  criarCriterio: (data: {
    codigo: string;
    nome: string;
    descricao?: string;
    quantidade_padrao: number;
    ativo?: boolean;
  }) => api.post('/dracmas/criterios', data),

  atualizarCriterio: (
    id: string,
    data: { ativo?: boolean; quantidade_padrao?: number; nome?: string; descricao?: string },
  ) => api.put(`/dracmas/criterios/${id}`, data),

  porAluno: (alunoId: string, inicio?: string, fim?: string) => {
    const params = new URLSearchParams();
    params.append('aluno_id', alunoId);
    if (inicio) params.append('inicio', inicio);
    if (fim) params.append('fim', fim);
    return api.get(`/dracmas/por-aluno?${params.toString()}`);
  },

  porTurma: (turmaId: string, inicio?: string, fim?: string) => {
    const params = new URLSearchParams();
    params.append('turma_id', turmaId);
    if (inicio) params.append('inicio', inicio);
    if (fim) params.append('fim', fim);
    return api.get(`/dracmas/por-turma?${params.toString()}`);
  },
};

export class DracmasService {
  static async lancarLote(data: any) {
    return DracmasAPI.lancarLote(data);
  }

  static async getSaldo(alunoId: string) {
    return DracmasAPI.saldoPorAluno(alunoId);
  }

  static async getTotal(poloId?: string) {
    return DracmasAPI.total(poloId);
  }

  static async listarCriterios() {
    return DracmasAPI.listarCriterios();
  }
}
