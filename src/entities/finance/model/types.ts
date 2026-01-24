// ===========================================
// IBUC System - Finance Domain Types
// Fase 4.5 - Frontend Refactoring
// ===========================================

import type { MetodoPagamento } from '@/shared/api/types/database';

// ===========================================
// ENUMS - Estados Explícitos
// ===========================================

/**
 * Estados de uma Cobrança (Billing)
 * Backend usa: 'pendente' | 'pago' | 'vencido' (legacy strings, but we map them)
 * Or did we update backend entities? Backend migration added default 'pendente'.
 * We will assume backend returns these strings.
 */
export type BillingStatus = 
  | 'pendente'
  | 'pago'
  | 'vencido'
  | 'cancelada';

/**
 * Estados de uma Tentativa de Pagamento (PaymentIntent)
 * Backend usa: 'pending' | 'success' | 'failed'
 */
export type PaymentIntentStatus = 
  | 'pending'   // Aguardando análise
  | 'success'   // Aprovado
  | 'failed';   // Rejeitado

/**
 * Métodos de pagamento
 */
export type PaymentMethod = 
  | 'pix'
  | 'cartao'
  | 'boleto'
  | 'dinheiro';

// ===========================================
// ENTIDADE: Billing (Cobrança)
// ===========================================

export interface Billing {
  id: string;
  aluno_id: string;
  polo_id: string;
  titulo: string;
  valor_cents: number;
  vencimento: string; // ISO date
  status: BillingStatus;
  desconto_cents: number;
  juros_cents: number;
  updated_at?: string;
  
  // Relations (often returned by API)
  aluno?: { id: string; nome: string };
  polo?: { id: string; nome: string };
}

export interface CreateBillingBatchDTO {
  turma_id: string;
  titulo: string;
  valor_cents: number;
  vencimento: string; // YYYY-MM-DD
}

export interface BillingFilters {
  student_id?: string;
  polo_id?: string;
  status?: string;
  turma_id?: string;
}

// ===========================================
// ENTIDADE: PaymentIntent (Tentativa de Pagamento)
// ===========================================

export interface PaymentIntent {
  id: string;
  mensalidade_id: string;
  metodo: PaymentMethod;
  valor_cents: number;
  status_gateway: PaymentIntentStatus;
  comprovante_url?: string;
  rejection_note?: string;
  recebido_por?: string;
  data_recebimento?: string;
  created_at: string;
}

// ===========================================
// UTILS
// ===========================================

export function getStatusLabel(status: BillingStatus): string {
  const map: Record<BillingStatus, string> = {
    'pendente': 'Pendente',
    'pago': 'Pago',
    'vencido': 'Vencido',
    'cancelada': 'Cancelada'
  };
  return map[status] || status;
}

export function getPaymentStatusLabel(status: PaymentIntentStatus): string {
  const map: Record<PaymentIntentStatus, string> = {
    'pending': 'Em Análise',
    'success': 'Aprovado',
    'failed': 'Rejeitado'
  };
  return map[status] || status;
}

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(cents / 100);
}

