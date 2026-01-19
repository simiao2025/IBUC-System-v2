import { api } from '@/shared/api';

export interface Presenca {
  id: string;
  aluno_id: string;
  turma_id: string;
  licao_id?: string;
  data: string;
  status: 'presente' | 'ausente' | 'justificado';
  observacoes?: string;
  created_at: string;
}

export const attendanceApi = {
  listByStudent: (alunoId: string, inicio?: string, fim?: string) => {
    const params = new URLSearchParams();
    params.append('aluno_id', alunoId);
    if (inicio) params.append('inicio', inicio);
    if (fim) params.append('fim', fim);
    return api.get<Presenca[]>(`/presencas/por-aluno?${params.toString()}`);
  },

  listByClass: (turmaId: string, inicio?: string, fim?: string) => {
    const params = new URLSearchParams();
    params.append('turma_id', turmaId);
    if (inicio) params.append('inicio', inicio);
    if (fim) params.append('fim', fim);
    return api.get<Presenca[]>(`/presencas/por-turma?${params.toString()}`);
  },

  listAulasLancadas: (turmaId: string) => 
    api.get<string[]>(`/presencas/aulas-lancadas?turma_id=${turmaId}`),

  submitBatch: (presencas: Omit<Presenca, 'id' | 'created_at'>[]) => 
    api.post<void>('/presencas/batch', { presencas }),

  deleteBatch: (turmaId: string, data: string, licaoId?: string) =>
    api.post<void>('/presencas/delete-batch', { turma_id: turmaId, data, licao_id: licaoId }),

  delete: (id: string) => api.delete<void>(`/presencas/${id}`),

  // Aliases for backward compatibility
  listarPorAluno: (alunoId: string, inicio?: string, fim?: string) => attendanceApi.listByStudent(alunoId, inicio, fim),
  listarPorTurma: (turmaId: string, inicio?: string, fim?: string) => attendanceApi.listByClass(turmaId, inicio, fim),
};
