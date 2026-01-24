import { ApiClient } from './ApiClient';
import { PaymentIntent, SubmitPaymentIntentDTO, ReviewPaymentIntentDTO } from '@/entities/finance/model/types';

const ENDPOINT = '/payments';

export const paymentsApi = {
  /**
   * Iniciar pagamento (Aluno)
   */
  initiate: async (dto: { mensalidade_id: string; metodo: string }) => {
    return ApiClient.post<PaymentIntent>(`${ENDPOINT}/initiate`, dto);
  },

  /**
   * Enviar comprovante (Aluno)
   */
  uploadProof: async (id: string, dto: { comprovante_url: string }) => {
    return ApiClient.post<PaymentIntent>(`${ENDPOINT}/${id}/upload-proof`, dto);
  },

  /**
   * Aprovar pagamento (Admin)
   */
  approve: async (id: string, dto: { diretor_id: string }) => {
    return ApiClient.post<PaymentIntent>(`${ENDPOINT}/${id}/approve`, dto);
  },

  /**
   * Rejeitar pagamento (Admin)
   */
  reject: async (id: string, dto: { rejection_note: string; diretor_id: string }) => {
    return ApiClient.post<PaymentIntent>(`${ENDPOINT}/${id}/reject`, dto);
  },

  /**
   * Listar pagamentos pendentes (Admin)
   */
  getPending: async () => {
    return ApiClient.get<any[]>(`${ENDPOINT}/pending`);
  }
};
