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
  solicitante_id: string;
  total_cents: number;
  status: 'rascunho' | 'cobrado' | 'cancelado';
  created_at: string;
  itens?: MaterialOrderItem[];
  modulo_destino?: { id: string; titulo: string };
  solicitante?: { id: string; nome_completo: string };
}
