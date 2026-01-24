import { api } from '@/shared/api';

export interface Presenca {
  id: string;
  aluno_id: string;
  turma_id: string;
  licao_id?: string;
  data: string;
  status: 'presente' | 'falta' | 'justificativa' | 'atraso' | 'reposicao';
  observacoes?: string;
  created_at: string;
}

export interface StudentAttendanceInput {
  aluno_id: string;
  status: string;
  observacao?: string;
}

export interface StudentDracmaInput {
  aluno_id: string;
  quantidade: number;
  tipo: string;
  descricao?: string;
}

export interface SubmitUnifiedDto {
  turma_id: string;
  data: string;
  licao_id?: string;
  registrado_por: string;
  presencas: StudentAttendanceInput[];
  dracmas: StudentDracmaInput[];
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

  submitUnified: (data: SubmitUnifiedDto) =>
    api.post<{ success: boolean; presencas_contagem: number; dracmas_contagem: number }>('/presencas/unified', data),

  deleteBatch: (turmaId: string, data: string, licaoId?: string) =>
    api.post<void>('/presencas/delete-batch', { turma_id: turmaId, data, licao_id: licaoId }),

  delete: (id: string) => api.delete<void>(`/presencas/${id}`),

  // Compatibility Aliases
  porAluno: (id: string, ini?: string, fim?: string) => attendanceApi.listByStudent(id, ini, fim),
  porTurma: (id: string, ini?: string, fim?: string) => attendanceApi.listByClass(id, ini, fim),
  lancamentoLote: (data: any[]) => attendanceApi.submitBatch(data),
  excluirLote: (t: string, d: string, l?: string) => attendanceApi.deleteBatch(t, d, l),
};
