import { api } from '../../lib/api';

export interface Material {
  id: string;
  nome: string;
  descricao?: string;
  valor_padrao_cents: number;
}

export interface MaterialOrderItem {
  id?: string;
  pedido_id?: string;
  material_id: string;
  quantidade: number;
  valor_unitario_cents: number;
  material?: Material;
}

export interface MaterialOrder {
  id: string;
  tipo_cobranca: string;
  modulo_destino_id?: string;
  niveis_destino_ids?: string[];
  solicitante_id: string;
  total_cents: number;
  status: 'rascunho' | 'cobrado' | 'cancelado';
  created_at: string;
  itens?: MaterialOrderItem[];
  modulo_destino?: { id: string; titulo: string };
  solicitante?: { id: string; nome_completo: string };
}

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
  deletar: (id: string) => api.delete(`/pedidos-materiais/${id}`),
};
