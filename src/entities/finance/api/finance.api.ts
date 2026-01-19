import { api } from '@/shared/api';
import type { Mensalidade } from '@/types/database';

export interface FinanceConfig {
  chave_pix: string;
  tipo_chave: string;
  nome_beneficiario?: string;
}

export const financeApi = {
  listCobrancas: (params: { aluno_id?: string; polo_id?: string; status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params.aluno_id) searchParams.append('aluno_id', params.aluno_id);
    if (params.polo_id) searchParams.append('polo_id', params.polo_id);
    if (params.status) searchParams.append('status', params.status);
    
    const query = searchParams.toString();
    return api.get<Mensalidade[]>(`/financeiro/mensalidades${query ? `?${query}` : ''}`);
  },

  getConfig: () => api.get<FinanceConfig>('/financeiro/config'),

  updateConfig: (data: FinanceConfig) => api.put<FinanceConfig>('/financeiro/config', data),

  confirmPayment: (id: string, comprovanteUrl: string) => 
    api.post<Mensalidade>(`/financeiro/mensalidades/${id}/confirmar`, { comprovante_url: comprovanteUrl }),

  listPedidosMateriais: () => api.get<any[]>('/financeiro/pedidos-materiais'),

  // Aliases for backward compatibility
  listarCobrancas: (params: { aluno_id?: string; polo_id?: string; status?: string }) => financeApi.listCobrancas(params),
};
