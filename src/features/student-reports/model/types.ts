export interface BoletimFiltros {
  polo_id?: string;
  turma_id?: string;
  modulo_id: string;
  aluno_id?: string;
  aluno_ids?: string[];
}

export interface BoletimParams {
  alunoId: string;
  periodo: string;
  moduloId?: string;
  turmaId?: string;
}
