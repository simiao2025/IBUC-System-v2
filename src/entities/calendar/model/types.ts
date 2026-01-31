export interface AgendamentoAula {
  id: string;
  turma_id: string;
  modulo_id: string;
  licao_id: string;
  data_aula: string; // ISO date YYYY-MM-DD
  observacoes?: string;
  created_at?: string;
  licao?: {
      titulo: string;
      ordem: number;
  };
  modulo?: {
      titulo: string;
  };
}

export interface CreateAgendamentoPayload {
    turma_id: string;
    modulo_id: string;
    licao_id: string;
    data_aula: string;
    observacoes?: string;
}
