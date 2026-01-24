import { api } from '@/shared/api';

export interface DracmasTransaction {
  id: string;
  aluno_id: string;
  quantidade: number;
  tipo: string;
  descricao?: string;
  data: string;
  turma_id?: string;
  registrado_por: string;
  created_at: string;
}

export interface DracmasCriterio {
  id: string;
  codigo: string;
  nome: string;
  descricao?: string;
  quantidade_padrao: number;
  ativo: boolean;
}

export const dracmasApi = {
  submitBatch: (data: {
    turma_id: string;
    data: string;
    tipo: string;
    descricao?: string;
    registrado_por: string;
    transacoes: { aluno_id: string; quantidade: number; tipo: string }[];
  }) => api.post<void>('/dracmas/lancar-lote', data),

  deleteBatch: (data: { turma_id: string; data: string }) => 
    api.post<void>('/dracmas/delete-batch', data),

  deleteStudentBatch: (data: { turma_id: string; aluno_id: string; data: string }) => 
    api.post<void>('/dracmas/delete-student-batch', data),

  getSaldo: (alunoId: string) => api.get<{ saldo: number }>(`/dracmas/saldo?aluno_id=${alunoId}`),

  getTotal: (poloId?: string) => {
    const query = poloId ? `?polo_id=${encodeURIComponent(poloId)}` : '';
    return api.get<{ total: number }>(`/dracmas/total${query}`);
  },

  listCriterios: () => api.get<DracmasCriterio[]>('/dracmas/criterios'),
  listCriteria: () => dracmasApi.listCriterios(),

  createCriterio: (data: Omit<DracmasCriterio, 'id'>) => 
    api.post<DracmasCriterio>('/dracmas/criterios', data),

  updateCriterio: (id: string, data: Partial<DracmasCriterio>) => 
    api.put<DracmasCriterio>(`/dracmas/criterios/${id}`, data),

  listByStudent: (alunoId: string, inicio?: string, fim?: string) => {
    const params = new URLSearchParams();
    params.append('aluno_id', alunoId);
    if (inicio) params.append('inicio', inicio);
    if (fim) params.append('fim', fim);
    return api.get<DracmasTransaction[]>(`/dracmas/por-aluno?${params.toString()}`);
  },

  listByClass: (turmaId: string, inicio?: string, fim?: string) => {
    const params = new URLSearchParams();
    params.append('turma_id', turmaId);
    if (inicio) params.append('inicio', inicio);
    if (fim) params.append('fim', fim);
    return api.get<DracmasTransaction[]>(`/dracmas/por-turma?${params.toString()}`);
  },

  redeem: (data: { turma_id: string; aluno_id?: string; resgatado_por: string }) => 
    api.post<void>('/dracmas/resgatar', data),

  // Compatibility Aliases
  porAluno: (alunoId: string, inicio?: string, fim?: string) => dracmasApi.listByStudent(alunoId, inicio, fim),
};
