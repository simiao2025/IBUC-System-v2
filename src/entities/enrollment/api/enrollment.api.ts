import { api } from '@/shared/api';
import { Matricula, PreMatricula, EnrollmentFiltros, CreateMatriculaDto } from '../model/types';

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

  // Aliases for backward compatibility
  listar: (params?: EnrollmentFiltros) => enrollmentApi.list(params),
  listarPreMatriculas: (params?: EnrollmentFiltros) => enrollmentApi.listPreMatriculas(params),
  buscarPorId: (id: string) => enrollmentApi.getById(id),
};
