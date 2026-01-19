import { api } from '@/shared/api';

interface CreateCobrancaLoteData {
  turma_id: string;
  titulo: string;
  valor_cents: number;
  vencimento: string;
}

interface ListarCobrancasParams {
  turma_id?: string;
  aluno_id?: string;
  polo_id?: string;
  status?: string;
}

export const FinanceiroService = {
  async gerarCobrancasLote(data: CreateCobrancaLoteData) {
    return api.post('/mensalidades/lote', data);
  },

  async listarCobrancas(filtros?: ListarCobrancasParams) {
    const params = new URLSearchParams();
    if (filtros?.turma_id) params.append('turma_id', filtros.turma_id);
    if (filtros?.aluno_id) params.append('aluno_id', filtros.aluno_id);
    if (filtros?.polo_id) params.append('polo_id', filtros.polo_id);
    if (filtros?.status) params.append('status', filtros.status);
    
    const query = params.toString();
    return api.get(`/mensalidades${query ? `?${query}` : ''}`);
  },

  async confirmarPagamento(id: string, comprovante_url?: string) {
    return api.post(`/mensalidades/${id}/confirmar`, { comprovante_url });
  },

  async buscarConfiguracao(): Promise<any> {
    return api.get('/mensalidades/configuracao');
  },
};
