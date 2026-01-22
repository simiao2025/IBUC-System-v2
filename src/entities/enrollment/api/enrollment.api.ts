import { api } from '@/shared/api';
import type { Matricula, PreMatricula } from '@/shared/model/database';

export interface EnrollmentFiltros {
  polo_id?: string;
  status?: string;
  turma_id?: string;
  ano_letivo?: number | string;
}

export interface CreateMatriculaDto {
  aluno_id: string;
  turma_id: string;
  polo_id: string;
  tipo: string;
  origem?: string;
}

export const enrollmentApi = {
  list: (params?: EnrollmentFiltros) => {
    const searchParams = new URLSearchParams();
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value) searchParams.append(key, value as string);
      }
    }
    const query = searchParams.toString();
    return api.get<Matricula[]>(`/matriculas${query ? `?${query}` : ''}`);
  },
  listPreMatriculas: (params?: EnrollmentFiltros) => {
    const searchParams = new URLSearchParams();
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value) searchParams.append(key, value as string);
      }
    }
    const query = searchParams.toString();
    return api.get<PreMatricula[]>(`/pre-matriculas${query ? `?${query}` : ''}`);
  },
  getById: (id: string) => api.get<Matricula>(`/matriculas/${id}`),
  create: (data: CreateMatriculaDto) => api.post<Matricula>('/matriculas', data),
  update: (id: string, data: any) => api.put<Matricula>(`/matriculas/${id}`, data),
  delete: (id: string) => api.delete<void>(`/matriculas/${id}`),
  approve: (id: string, data: { turma_id: string; observacoes?: string }) =>
    api.post<Matricula>(`/matriculas/${id}/aprovar`, data),
  reject: (id: string, reason: string) =>
    api.post<Matricula>(`/matriculas/${id}/rejeitar`, { motivo_rejeicao: reason }),
  
  // Waitlist / Lista de Espera
  waitlistRegister: (data: { nome: string; email: string; telefone?: string; cidade?: string; bairro?: string }) =>
    api.post<any>('/lista-espera/cadastrar', data),
  
  waitlistList: () => api.get<any[]>('/lista-espera'),

  // Pre-Matriculas Specific
  getPreMatriculaById: (id: string) => api.get<PreMatricula>(`/pre-matriculas/${id}`),
  updatePreMatricula: (id: string, data: any) => api.put<PreMatricula>(`/pre-matriculas/${id}`, data),
  updatePreMatriculaStatus: (id: string, data: { status: string }) => api.patch<PreMatricula>(`/pre-matriculas/${id}/status`, data),
  deletePreMatricula: (id: string) => api.delete<void>(`/pre-matriculas/${id}`),
  concludePreMatricula: (id: string, data: { turma_id: string; approved_by: string }) => 
    api.post<any>(`/pre-matriculas/${id}/concluir`, data),

  // Aliases for backward compatibility
  listar: (params?: EnrollmentFiltros) => enrollmentApi.list(params),
  listarPreMatriculas: (params?: EnrollmentFiltros) => enrollmentApi.listPreMatriculas(params),
  buscarPorId: (id: string) => enrollmentApi.getById(id),
};
