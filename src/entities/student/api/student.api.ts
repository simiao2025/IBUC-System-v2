import { api } from '@/shared/api';
import { Aluno, AlunoFiltros, AlunoCreateDto, AlunoUpdateDto } from '../model/types';

export const studentApi = {
  list: (params?: AlunoFiltros) => {
    const searchParams = new URLSearchParams();
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value) searchParams.append(key, value as string);
      }
    }
    const query = searchParams.toString();
    return api.get<Aluno[]>(`/alunos${query ? `?${query}` : ''}`);
  },
  getById: (id: string) => api.get<Aluno>(`/alunos/${id}`),
  create: (data: AlunoCreateDto) => api.post<Aluno>('/alunos', data),
  update: (id: string, data: AlunoUpdateDto) => api.put<Aluno>(`/alunos/${id}`, data),
  delete: (id: string) => api.delete<void>(`/alunos/${id}`),
  getHistory: (id: string) => api.get<any[]>(`/alunos/${id}/historico-modulos`),

  // Aliases for backward compatibility
  listar: (params?: AlunoFiltros) => studentApi.list(params),
  buscarPorId: (id: string) => studentApi.getById(id),
  atualizar: (id: string, data: AlunoUpdateDto) => studentApi.update(id, data),
  buscarHistorico: (id: string) => studentApi.getHistory(id),
};
