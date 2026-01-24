import { api } from '@/shared/api';
import type { Mensalidade } from '@/shared/model/database';

export interface FinanceConfig {
  chave_pix: string;
  tipo_chave: string;
  nome_beneficiario?: string;
}

export const financeApi = {
  listCharges: (params: { aluno_id?: string; polo_id?: string; status?: string }) => {
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

  listMaterialOrders: () => api.get<any[]>('/financeiro/pedidos-materiais'),

  listPendingPayments: () => api.get<any[]>('/financeiro/pagamentos-pendentes'),

  approvePayment: (id: string, adminId: string) => 
    api.post(`/financeiro/pagamentos/${id}/aprovar`, { aprovado_por: adminId }),

  // Compatibility Aliases
  listCobrancas: (params: any) => financeApi.listCharges(params),
  listPagamentosPendentes: () => financeApi.listPendingPayments(),
};
