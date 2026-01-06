import { api } from '../lib/api';
import type { Modulo, Licao } from '../types/database';

export type ModuloCreateDto = {
  numero: number;
  titulo: string;
  descricao?: string;
  duracao_sugestiva?: number;
  requisitos?: string;
  objetivos?: string;
  carga_horaria?: number;
};

export type ModuloUpdateDto = Partial<ModuloCreateDto>;

export type LicaoCreateDto = {
  modulo_id: string;
  titulo: string;
  descricao?: string;
  ordem: number;
  video_url?: string;
  material_pdf_url?: string;
  liberacao_data?: string;
  duracao_minutos?: number;
};

export type LicaoUpdateDto = Partial<Omit<LicaoCreateDto, 'modulo_id'>>;

export const ModulosAPI = {
  listar: () => api.get<Modulo[]>('/modulos'),
  buscarPorId: (id: string) => api.get<Modulo>(`/modulos/${id}`),
  criar: (data: ModuloCreateDto) => api.post<Modulo>('/modulos', data),
  atualizar: (id: string, data: ModuloUpdateDto) => api.put<Modulo>(`/modulos/${id}`, data),
  deletar: (id: string) => api.delete<void>(`/modulos/${id}`),
};

export const LicoesAPI = {
  listar: (params?: { modulo_id?: string }) => {
    const query = params?.modulo_id ? `?modulo_id=${encodeURIComponent(params.modulo_id)}` : '';
    return api.get<Licao[]>(`/licoes${query}`);
  },
  buscarPorId: (id: string) => api.get<Licao>(`/licoes/${id}`),
  criar: (data: LicaoCreateDto) => api.post<Licao>('/licoes', data),
  atualizar: (id: string, data: LicaoUpdateDto) => api.put<Licao>(`/licoes/${id}`, data),
  deletar: (id: string) => api.delete<void>(`/licoes/${id}`),
};
