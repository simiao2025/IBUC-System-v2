// ============================================
// IBUC System - Serviço de Frequência
// ============================================

import { api } from '../../lib/api';

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
  aulasLancadas: (turmaId: string) => api.get(`/presencas/aulas-lancadas?turma_id=${turmaId}`),
  excluirLote: (turmaId: string, data: string, licaoId?: string) =>
    api.post('/presencas/delete-batch', { turma_id: turmaId, data, licao_id: licaoId }),
  excluir: (id: string) => api.delete(`/presencas/${id}`),
};

export class PresencaService {
  static async lancarLote(presencas: { aluno_id: string; data: string; status: string }[]) {
    return PresencasAPI.lancarLote(presencas);
  }

  static async porAluno(alunoId: string, inicio?: string, fim?: string) {
    return PresencasAPI.porAluno(alunoId, inicio, fim);
  }

  static async porTurma(turmaId: string, inicio?: string, fim?: string) {
    return PresencasAPI.porTurma(turmaId, inicio, fim);
  }
}
