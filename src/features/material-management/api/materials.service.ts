import { api } from '@/shared/api';
export type {
  Material,
  MaterialOrderItem,
  MaterialOrder
} from '../model/types';

export const MaterialsAPI = {
  listar: () => api.get<Material[]>('/materiais'),
  criar: (data: Partial<Material>) => api.post<Material>('/materiais', data),
  atualizar: (id: string, data: Partial<Material>) => api.put<Material>(`/materiais/${id}`, data),
  deletar: (id: string) => api.delete(`/materiais/${id}`),
};

export const MaterialOrdersAPI = {
  listar: () => api.get<MaterialOrder[]>('/pedidos-materiais'),
  buscarPorId: (id: string) => api.get<MaterialOrder>(`/pedidos-materiais/${id}`),
  criar: (data: any) => api.post<MaterialOrder>('/pedidos-materiais', data),
  atualizarStatus: (id: string, status: string) => api.patch<MaterialOrder>(`/pedidos-materiais/${id}/status`, { status }),
  gerarCobrancas: (id: string, vencimento: string) => api.post(`/pedidos-materiais/${id}/gerar-cobrancas`, { vencimento }),
};

