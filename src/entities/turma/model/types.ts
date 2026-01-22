import { Turno, StatusTurma, StatusPresenca } from '@/shared/types';

export type { Turno, StatusTurma } from '@/shared/types';

export interface Turma {
  id: string;
  nome: string;
  polo_id: string;
  nivel_id: string;
  modulo_atual_id?: string;
  professor_id?: string;
  coordenador_id?: string;
  capacidade: number;
  ano_letivo: number;
  turno: Turno;
  dias_semana: number[];
  horario_inicio?: string;
  horario_fim?: string;
  local?: string;
  status: StatusTurma;
  data_inicio?: string;
  data_previsao_termino?: string;
  data_conclusao?: string;
  migracao_concluida: boolean;
  created_at: string;
}

export interface Nivel {
  id: string;
  nome: string;
  idade_min: number;
  idade_max: number;
  descricao?: string;
  ordem: number;
  created_at: string;
}

export interface Modulo {
  id: string;
  numero: number;
  titulo: string;
  descricao?: string;
  duracao_sugestiva?: number;
  requisitos?: string;
  objetivos?: string;
  carga_horaria?: number;
  created_at: string;
}

export interface Licao {
  id: string;
  modulo_id: string;
  titulo: string;
  descricao?: string;
  ordem: number;
  video_url?: string;
  material_pdf_url?: string;
  liberacao_data?: string;
  duracao_minutos?: number;
  created_at: string;
}

export type ModuloCreateDto = Omit<Modulo, 'id' | 'created_at'>;
export type ModuloUpdateDto = Partial<ModuloCreateDto>;

export type LicaoCreateDto = Omit<Licao, 'id' | 'created_at'>;
export type LicaoUpdateDto = Partial<Omit<LicaoCreateDto, 'modulo_id'>>;

export interface TurmaFiltros {
  polo_id?: string;
  nivel_id?: string;
  professor_id?: string;
  status?: string;
  modulo_atual_id?: string;
  ano_letivo?: number;
}

// 12. PRESENCAS
export interface Presenca {
  id: string;
  aluno_id: string;
  turma_id: string;
  data: string;
  status: StatusPresenca;
  lancado_por: string;
  observacao?: string;
  created_at: string;
}

// 13. AVALIACOES
export interface Avaliacao {
  id: string;
  turma_id: string;
  modulo_id?: string;
  titulo: string;
  descricao?: string;
  data_avaliacao: string;
  peso: number;
  created_at: string;
}

// 14. NOTAS
export interface Nota {
  id: string;
  avaliacao_id: string;
  aluno_id: string;
  nota: number;
  comentario?: string;
  lancado_por: string;
  created_at: string;
}
