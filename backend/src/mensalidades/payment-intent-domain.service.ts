import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { BillingDomainService } from './billing-domain.service';

// ===========================================
// IBUC System - PaymentIntent Domain Service
// Fase 4.3 - Refatoração de Domínio Financeiro
// ===========================================

// ============================================
// ENUMS - Estados Explícitos
// ============================================

/**
 * Estados de uma Tentativa de Pagamento (PaymentIntent)
 * Mapeamento banco: 'pending' -> SUBMITTED, 'success' -> APPROVED, 'failed' -> REJECTED
 */
export type PaymentIntentStatus = 'SUBMITTED' | 'APPROVED' | 'REJECTED';

/**
 * Métodos de pagamento suportados
 */
export type PaymentMethod = 'PIX_STATIC' | 'PRESENCIAL';

// ============================================
// DTOs
// ============================================

export interface InitiatePaymentDTO {
  billing_id: string;
  aluno_id: string;
  method?: PaymentMethod;
}

export interface UploadPaymentProofDTO {
  billing_id: string;
  aluno_id: string;
  receipt_url: string;
}

export interface ApprovePaymentDTO {
  intent_id: string;
  reviewer_id: string;
}

export interface RejectPaymentDTO {
  intent_id: string;
  reviewer_id: string;
  rejection_note: string;
}

// ============================================
// TRANSIÇÕES DE ESTADO
// ============================================

/**
 * Matriz de transições válidas para PaymentIntent
 * 
 * SUBMITTED -> APPROVED (admin aprova)
 * SUBMITTED -> REJECTED (admin rejeita)
 * REJECTED  -> SUBMITTED (aluno reenvia)
 * APPROVED  -> (terminal, sem transições)
 */
const PAYMENT_INTENT_TRANSITIONS: Record<PaymentIntentStatus, PaymentIntentStatus[]> = {
  SUBMITTED: ['APPROVED', 'REJECTED'],
  APPROVED: [], // Terminal
  REJECTED: ['SUBMITTED'], // Reenvio
};

function canTransitionPaymentIntent(from: PaymentIntentStatus, to: PaymentIntentStatus): boolean {
  return PAYMENT_INTENT_TRANSITIONS[from]?.includes(to) ?? false;
}

function mapDbStatusToDomain(dbStatus: string): PaymentIntentStatus {
  switch (dbStatus) {
    case 'success': return 'APPROVED';
    case 'failed': return 'REJECTED';
    default: return 'SUBMITTED';
  }
}

function mapDomainStatusToDb(domainStatus: PaymentIntentStatus): string {
  switch (domainStatus) {
    case 'APPROVED': return 'success';
    case 'REJECTED': return 'failed';
    default: return 'pending';
  }
}

function mapPaymentMethodToDb(method?: PaymentMethod): string {
  return method === 'PRESENCIAL' ? 'presencial' : 'pix';
}

// ============================================
// SERVICE
// ============================================

@Injectable()
export class PaymentIntentDomainService {
  constructor(
    private supabase: SupabaseService,
    private billingService: BillingDomainService,
  ) {}

  // ==========================================
  // COMMAND: Iniciar Pagamento (sem comprovante)
  // ==========================================
  /**
   * Inicia o fluxo de pagamento para uma cobrança.
   * Cria um registro de PaymentIntent no estado SUBMITTED 
   * sem comprovante (para cenários de baixa manual futura).
   * 
   * Pré-condições:
   * - Billing deve existir e estar PENDING ou OVERDUE
   * - Não deve haver PaymentIntent APPROVED para esta Billing
   * 
   * Pós-condições:
   * - PaymentIntent criado com status='pending'
   * 
   * @param dto Dados do início de pagamento
   * @returns PaymentIntent criado
   */
  async initiatePayment(dto: InitiatePaymentDTO): Promise<{ intent_id: string }> {
    const client = this.supabase.getAdminClient();

    // ========================================
    // VALIDAR BILLING
    // ========================================
    const billing = await this.billingService.getBillingById(dto.billing_id);
    
    // Verificar se billing permite novo intent
    if (billing.status === 'pago') {
      throw new ForbiddenException('Esta cobrança já foi paga');
    }

    // Verificar se já existe intent aprovado
    const { data: existingApproved } = await client
      .from('pagamentos')
      .select('id')
      .eq('mensalidade_id', dto.billing_id)
      .eq('status_gateway', 'success')
      .limit(1);

    if (existingApproved && existingApproved.length > 0) {
      throw new ForbiddenException('Já existe um pagamento aprovado para esta cobrança');
    }

    // ========================================
    // CRIAR PAYMENT INTENT
    // ========================================
    const valorFinal = (billing.valor_cents || 0) + 
                       (billing.juros_cents || 0) - 
                       (billing.desconto_cents || 0);

    const { data: intent, error } = await client
      .from('pagamentos')
      .insert({
        mensalidade_id: dto.billing_id,
        metodo: mapPaymentMethodToDb(dto.method),
        valor_cents: valorFinal,
        status_gateway: 'pending',
        comprovante_url: null,
        data_recebimento: new Date().toISOString(),
        created_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) {
      throw new BadRequestException(`Erro ao criar intent: ${error.message}`);
    }

    // Audit
    await this.registrarAuditLog({
      entity: 'payment_intent',
      entity_id: intent.id,
      action: 'initiate',
      actor_id: dto.aluno_id,
      payload: { billing_id: dto.billing_id, method: dto.method },
    });

    return { intent_id: intent.id };
  }

  // ==========================================
  // COMMAND: Enviar Comprovante de Pagamento
  // ==========================================
  /**
   * Aluno envia comprovante de pagamento.
   * Cria ou atualiza PaymentIntent com a URL do comprovante.
   * 
   * REGRA IMPORTANTE:
   * - Upload de comprovante NÃO confirma o pagamento automaticamente
   * - O status permanece SUBMITTED até aprovação da Diretoria
   * 
   * Pré-condições:
   * - Billing deve existir e estar PENDING ou OVERDUE
   * - receipt_url deve ser válida
   * 
   * Pós-condições:
   * - PaymentIntent criado/atualizado com status='pending' e receipt_url
   * - Billing permanece inalterada
   * 
   * @param dto Dados do upload
   * @returns PaymentIntent atualizado
   */
  async uploadPaymentProof(dto: UploadPaymentProofDTO): Promise<{
    intent_id: string;
    status: PaymentIntentStatus;
  }> {
    const client = this.supabase.getAdminClient();

    // ========================================
    // VALIDAR BILLING
    // ========================================
    const billing = await this.billingService.getBillingById(dto.billing_id);

    if (billing.status === 'pago') {
      throw new ForbiddenException('Esta cobrança já foi paga');
    }

    // ========================================
    // VERIFICAR INTENT EXISTENTE REJEITADO (reenvio)
    // ========================================
    const { data: existingRejected } = await client
      .from('pagamentos')
      .select('id')
      .eq('mensalidade_id', dto.billing_id)
      .eq('status_gateway', 'failed')
      .order('created_at', { ascending: false })
      .limit(1);

    let intentId: string;

    if (existingRejected && existingRejected.length > 0) {
      // Reenvio: atualizar intent rejeitado para pending
      const { error } = await client
        .from('pagamentos')
        .update({
          status_gateway: 'pending',
          comprovante_url: dto.receipt_url,
          data_recebimento: new Date().toISOString(),
          rejection_note: null, // Limpar motivo anterior
        })
        .eq('id', existingRejected[0].id);

      if (error) throw new BadRequestException(error.message);
      intentId = existingRejected[0].id;

      // Audit reenvio
      await this.registrarAuditLog({
        entity: 'payment_intent',
        entity_id: intentId,
        action: 'resubmit',
        actor_id: dto.aluno_id,
        payload: { receipt_url: dto.receipt_url },
      });
    } else {
      // Novo intent
      const valorFinal = (billing.valor_cents || 0) + 
                         (billing.juros_cents || 0) - 
                         (billing.desconto_cents || 0);

      const { data: newIntent, error } = await client
        .from('pagamentos')
        .insert({
          mensalidade_id: dto.billing_id,
          metodo: 'pix',
          valor_cents: valorFinal,
          status_gateway: 'pending', // NUNCA 'success' aqui
          comprovante_url: dto.receipt_url,
          data_recebimento: new Date().toISOString(),
          created_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (error) throw new BadRequestException(error.message);
      intentId = newIntent.id;

      // Audit novo
      await this.registrarAuditLog({
        entity: 'payment_intent',
        entity_id: intentId,
        action: 'upload_proof',
        actor_id: dto.aluno_id,
        payload: { billing_id: dto.billing_id, receipt_url: dto.receipt_url },
      });
    }

    return {
      intent_id: intentId,
      status: 'SUBMITTED',
    };
  }

  // ==========================================
  // COMMAND: Aprovar Pagamento (Diretoria)
  // ==========================================
  /**
   * Diretoria aprova um pagamento pendente.
   * 
   * Transição:
   * - PaymentIntent: SUBMITTED -> APPROVED
   * - Billing: PENDING/OVERDUE -> PAID (via BillingDomainService)
   * 
   * Pré-condições:
   * - PaymentIntent deve existir com status='pending'
   * - Reviewer deve ser um admin autorizado
   * 
   * Pós-condições:
   * - PaymentIntent.status_gateway = 'success'
   * - PaymentIntent.recebido_por = reviewer_id
   * - Billing.status = 'pago' (via trigger ou service)
   * - Audit log registrado
   * 
   * @param dto Dados da aprovação
   */
  async approvePayment(dto: ApprovePaymentDTO): Promise<void> {
    const client = this.supabase.getAdminClient();

    // ========================================
    // BUSCAR INTENT
    // ========================================
    const { data: intent, error } = await client
      .from('pagamentos')
      .select('id, status_gateway, mensalidade_id, comprovante_url')
      .eq('id', dto.intent_id)
      .single();

    if (error || !intent) {
      throw new BadRequestException('PaymentIntent não encontrado');
    }

    // ========================================
    // VALIDAR TRANSIÇÃO
    // ========================================
    const currentStatus = mapDbStatusToDomain(intent.status_gateway);

    if (!canTransitionPaymentIntent(currentStatus, 'APPROVED')) {
      throw new ForbiddenException(
        `Não é possível aprovar um pagamento com status ${currentStatus}`
      );
    }

    // ========================================
    // ATUALIZAR INTENT
    // ========================================
    const { error: updateError } = await client
      .from('pagamentos')
      .update({
        status_gateway: 'success',
        recebido_por: dto.reviewer_id,
      })
      .eq('id', dto.intent_id);

    if (updateError) throw new BadRequestException(updateError.message);

    // ========================================
    // ATUALIZAR BILLING (via trigger ou explícito)
    // O trigger SQL já cuida disso, mas chamamos explicitamente
    // para garantir consistência e auditoria
    // ========================================
    await this.billingService.transitionToPaid(
      intent.mensalidade_id,
      intent.comprovante_url
    );

    // ========================================
    // AUDIT LOG
    // ========================================
    await this.registrarAuditLog({
      entity: 'payment_intent',
      entity_id: dto.intent_id,
      action: 'approve',
      actor_id: dto.reviewer_id,
      payload: { billing_id: intent.mensalidade_id },
    });
  }

  // ==========================================
  // COMMAND: Rejeitar Pagamento (Diretoria)
  // ==========================================
  /**
   * Diretoria rejeita um pagamento pendente.
   * 
   * Transição:
   * - PaymentIntent: SUBMITTED -> REJECTED
   * - Billing: permanece inalterada
   * 
   * Pré-condições:
   * - PaymentIntent deve existir com status='pending'
   * - rejection_note é obrigatório
   * 
   * Pós-condições:
   * - PaymentIntent.status_gateway = 'failed'
   * - PaymentIntent.rejection_note preenchido
   * - Aluno pode reenviar novo comprovante
   * 
   * @param dto Dados da rejeição
   */
  async rejectPayment(dto: RejectPaymentDTO): Promise<void> {
    const client = this.supabase.getAdminClient();

    // ========================================
    // VALIDAR MOTIVO
    // ========================================
    if (!dto.rejection_note || dto.rejection_note.trim().length === 0) {
      throw new BadRequestException('Motivo da rejeição é obrigatório');
    }

    // ========================================
    // BUSCAR INTENT
    // ========================================
    const { data: intent, error } = await client
      .from('pagamentos')
      .select('id, status_gateway, mensalidade_id')
      .eq('id', dto.intent_id)
      .single();

    if (error || !intent) {
      throw new BadRequestException('PaymentIntent não encontrado');
    }

    // ========================================
    // VALIDAR TRANSIÇÃO
    // ========================================
    const currentStatus = mapDbStatusToDomain(intent.status_gateway);

    if (!canTransitionPaymentIntent(currentStatus, 'REJECTED')) {
      throw new ForbiddenException(
        `Não é possível rejeitar um pagamento com status ${currentStatus}`
      );
    }

    // ========================================
    // ATUALIZAR INTENT
    // ========================================
    const { error: updateError } = await client
      .from('pagamentos')
      .update({
        status_gateway: 'failed',
        recebido_por: dto.reviewer_id,
        rejection_note: dto.rejection_note,
      })
      .eq('id', dto.intent_id);

    if (updateError) throw new BadRequestException(updateError.message);

    // ========================================
    // AUDIT LOG
    // ========================================
    await this.registrarAuditLog({
      entity: 'payment_intent',
      entity_id: dto.intent_id,
      action: 'reject',
      actor_id: dto.reviewer_id,
      payload: {
        billing_id: intent.mensalidade_id,
        rejection_note: dto.rejection_note,
      },
    });
  }

  // ==========================================
  // QUERY: Listar Pagamentos Pendentes
  // ==========================================
  async listPendingPayments() {
    const { data, error } = await this.supabase
      .getAdminClient()
      .from('pagamentos')
      .select(`
        *,
        mensalidade:mensalidades!fk_mensalidade(
          id, titulo, valor_cents,
          aluno:alunos!fk_aluno(id, nome)
        )
      `)
      .eq('status_gateway', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  // ==========================================
  // QUERY: Buscar Intent por ID
  // ==========================================
  async getIntentById(intentId: string) {
    const { data, error } = await this.supabase
      .getAdminClient()
      .from('pagamentos')
      .select('*')
      .eq('id', intentId)
      .single();

    if (error) throw new BadRequestException('PaymentIntent não encontrado');
    return data;
  }

  // ==========================================
  // HELPERS
  // ==========================================

  private async registrarAuditLog(log: {
    entity: string;
    entity_id?: string;
    action: string;
    actor_id: string;
    payload?: Record<string, any>;
  }) {
    try {
      await this.supabase.getAdminClient().from('audit_logs').insert({
        entity: log.entity,
        entity_id: log.entity_id || null,
        action: log.action,
        user_id: log.actor_id,
        payload: log.payload || {},
        created_at: new Date().toISOString(),
      });
    } catch (e) {
      console.error('Erro ao registrar audit log:', e);
    }
  }
}
