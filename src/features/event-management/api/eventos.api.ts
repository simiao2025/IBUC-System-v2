import { api } from '@/shared/api';
import type {
  Evento,
  ListarEventosParams,
  CriarEventoDto,
  AtualizarEventoDto
} from '../model/types';

export const EventosAPI = {
  async listar(params?: ListarEventosParams) {
    const sp = new URLSearchParams();
    if (params?.polo_id) sp.append('polo_id', params.polo_id);
    if (params?.include_geral !== undefined) sp.append('include_geral', String(params.include_geral));
    if (params?.date_from) sp.append('date_from', params.date_from);
    if (typeof params?.limit === 'number') sp.append('limit', String(params.limit));

    const q = sp.toString();
    return api.get<Evento[]>(`/eventos${q ? `?${q}` : ''}`);
  },

  async criar(dto: CriarEventoDto) {
    return api.post<Evento>('/eventos', dto);
  },

  async atualizar(id: string, dto: AtualizarEventoDto) {
    return api.put<Evento>(`/eventos/${id}`, dto);
  },

  async deletar(id: string) {
    return api.delete<void>(`/eventos/${id}`);
  },
};

/** @deprecated Use EventosAPI instead. */
export const EventosService = EventosAPI;

