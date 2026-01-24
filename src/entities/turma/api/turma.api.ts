import { api } from '@/shared/api';
import { 
  Turma, TurmaFiltros, Nivel, 
  Modulo, ModuloCreateDto, ModuloUpdateDto,
  Licao, LicaoCreateDto, LicaoUpdateDto 
} from '../model/types';

export const turmaApi = {
  list: (params?: TurmaFiltros) => {
    const searchParams = new URLSearchParams();
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) searchParams.append(key, String(value));
      }
    }
    const query = searchParams.toString();
    return api.get<Turma[]>(`/turmas${query ? `?${query}` : ''}`);
  },
  getById: (id: string) => api.get<Turma>(`/turmas/${id}`),
  create: (data: unknown) => api.post<Turma>('/turmas', data),
  update: (id: string, data: unknown) => api.put<Turma>(`/turmas/${id}`, data),
  delete: (id: string) => api.delete<void>(`/turmas/${id}`),
  
  // Niveis
  listNiveis: () => api.get<Nivel[]>('/niveis'),
  
  // Specific extensions
  previewTransition: (id: string) => api.get<any[]>(`/turmas/${id}/preview-transition`),
  closeModule: (id: string, data: { alunos_confirmados: string[]; valor_cents?: number }) =>
    api.post(`/turmas/${id}/close-module`, data),
  trazerAlunos: (id: string, moduloAnteriorNumero: number) =>
    api.post(`/turmas/${id}/trazer-alunos`, { modulo_anterior_numero: moduloAnteriorNumero }),
  getOccupancy: (id: string) => api.get<{ count: number }>(`/turmas/${id}/occupancy`),

  // Compatibility Aliases
  listar: (params?: TurmaFiltros) => turmaApi.list(params),
  listarTurmas: (params?: TurmaFiltros) => turmaApi.list(params),
  buscarPorId: (id: string) => turmaApi.getById(id),
  listarNiveis: () => turmaApi.listNiveis(),
};

/** @deprecated Use turmaApi */
export const TurmasAPI = turmaApi;

export const moduleApi = {
  list: () => api.get<Modulo[]>('/modulos'),
  getById: (id: string) => api.get<Modulo>(`/modulos/${id}`),
  create: (data: ModuloCreateDto) => api.post<Modulo>('/modulos', data),
  update: (id: string, data: ModuloUpdateDto) => api.put<Modulo>(`/modulos/${id}`, data),
  delete: (id: string) => api.delete<void>(`/modulos/${id}`),
};

export const lessonApi = {
  list: (params?: { modulo_id?: string }) => {
    const query = params?.modulo_id ? `?modulo_id=${encodeURIComponent(params.modulo_id)}` : '';
    return api.get<Licao[]>(`/licoes${query}`);
  },
  getById: (id: string) => api.get<Licao>(`/licoes/${id}`),
  create: (data: LicaoCreateDto) => api.post<Licao>('/licoes', data),
  update: (id: string, data: LicaoUpdateDto) => api.put<Licao>(`/licoes/${id}`, data),
  delete: (id: string) => api.delete<void>(`/licoes/${id}`),
};
