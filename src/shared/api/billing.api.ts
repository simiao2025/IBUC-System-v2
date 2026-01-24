import { ApiClient } from './ApiClient';
import { Billing, BillingFilters, CreateBillingBatchDTO } from '@/entities/finance/model/types';

const ENDPOINT = '/billing';

export const billingApi = {
  /**
   * Listar cobranças (Admin ou Aluno)
   */
  getBilling: async (filters?: BillingFilters) => {
    const params = new URLSearchParams();
    if (filters?.student_id) params.append('aluno_id', filters.student_id);
    if (filters?.turma_id) params.append('turma_id', filters.turma_id);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.polo_id) params.append('polo_id', filters.polo_id);

    return ApiClient.get<Billing[]>(`${ENDPOINT}?${params.toString()}`);
  },

  /**
   * Criar cobrança em lote (Admin)
   */
  createBatch: async (dto: CreateBillingBatchDTO) => {
    return ApiClient.post<any>(ENDPOINT, dto);
  },

  /**
   * Publicar/Notificar cobrança (Admin)
   */
  publish: async (id: string) => {
    return ApiClient.post<any>(`${ENDPOINT}/${id}/publish`, {});
  },

  /**
   * Buscar configuração financeira
   */
  getConfig: async () => {
    return ApiClient.get<any>(`${ENDPOINT}/configuration`);
  },

  /**
   * Atualizar configuração financeira
   */
  updateConfig: async (dto: any) => {
    return ApiClient.put<any>(`${ENDPOINT}/configuration`, dto);
  }
};
