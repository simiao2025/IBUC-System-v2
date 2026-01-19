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
  limit?: number;}

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
