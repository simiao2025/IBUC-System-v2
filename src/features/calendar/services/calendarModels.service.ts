import { api } from '@/shared/api/api';

export interface CalendarModel {
  id: string;
  nome: string;
  modulo_id: string;
  ano: number;
  semestre?: number;
  turno?: string;
  created_at?: string;
}

export interface CalendarModelDay {
  id: string;
  modelo_id: string;
  data_aula: string;
  licao_id?: string;
  observacoes?: string;
}

export interface CreateCalendarModelDto {
  nome: string;
  modulo_id: string;
  ano: number;
  semestre?: number;
  turno?: string;
}

export interface CreateCalendarModelDayDto {
  modelo_id: string;
  data_aula: string;
  licao_id?: string;
  observacoes?: string;
}

export const CalendarModelsAPI = {
  listar: (params?: { modulo_id?: string }) => {
    const query = params?.modulo_id ? `?modulo_id=${encodeURIComponent(params.modulo_id)}` : '';
    return api.get<CalendarModel[]>(`/calendario-modelos${query}`);
  },
  
  criar: (data: CreateCalendarModelDto) => api.post<CalendarModel>('/calendario-modelos', data),
  
  atualizar: (id: string, data: Partial<CreateCalendarModelDto>) => api.put<CalendarModel>(`/calendario-modelos/${id}`, data),
  
  deletar: (id: string) => api.delete<void>(`/calendario-modelos/${id}`),

  // Days
  listarDias: (modeloId: string) => api.get<CalendarModelDay[]>(`/calendario-modelos/${modeloId}/dias`),
  
  adicionarDia: (data: CreateCalendarModelDayDto) => api.post<CalendarModelDay>(`/calendario-modelos/${data.modelo_id}/dias`, data),
  
  removerDia: (diaId: string) => api.delete<void>(`/calendario-modelos/dias/${diaId}`),
};
