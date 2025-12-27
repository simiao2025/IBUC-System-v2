// ============================================
// IBUC System - Serviço de Frequência
// ============================================

import { api } from '../lib/api';

export const PresencasAPI = {
  lancarLote: (presencas: unknown[]) => api.post('/presencas/batch', { presencas }),
  porAluno: (alunoId: string, inicio?: string, fim?: string) => {
    const params = new URLSearchParams();
    params.append('aluno_id', alunoId);
    if (inicio) params.append('inicio', inicio);
    if (fim) params.append('fim', fim);
    return api.get(`/presencas/por-aluno?${params.toString()}`);
  },
  porTurma: (turmaId: string, inicio?: string, fim?: string) => {
    const params = new URLSearchParams();
    params.append('turma_id', turmaId);
    if (inicio) params.append('inicio', inicio);
    if (fim) params.append('fim', fim);
    return api.get(`/presencas/por-turma?${params.toString()}`);
  },
};

export class PresencaService {
  static async lancarLote(presencas: any[]) {
    return PresencasAPI.lancarLote(presencas);
  }

  static async porAluno(alunoId: string, inicio?: string, fim?: string) {
    return PresencasAPI.porAluno(alunoId, inicio, fim);
  }

  static async porTurma(turmaId: string, inicio?: string, fim?: string) {
    return PresencasAPI.porTurma(turmaId, inicio, fim);
  }
}
