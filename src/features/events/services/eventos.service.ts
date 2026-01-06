import { api } from '../../../lib/api';

export interface Evento {
  id: string;
  titulo: string;
  descricao?: string | null;
  local?: string | null;
  data_inicio: string;
  data_fim?: string | null;
  polo_id?: string | null;
  criado_por?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ListarEventosParams {
  polo_id?: string;
  include_geral?: boolean;
  date_from?: string;
  limit?: number;
}

export interface CriarEventoDto {
  titulo: string;
  descricao?: string;
  local?: string;
  data_inicio: string;
  data_fim?: string;
  polo_id?: string | null;
  criado_por?: string | null;
}

export interface AtualizarEventoDto {
  titulo?: string;
  descricao?: string | null;
  local?: string | null;
  data_inicio?: string;
  data_fim?: string | null;
  polo_id?: string | null;
}

export const EventosService = {
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
