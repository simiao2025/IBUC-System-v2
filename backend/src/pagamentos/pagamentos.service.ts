import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { UploadComprovanteDto, RejeitarPagamentoDto, AprovarPagamentoDto, InitiatePaymentDto } from './dto/payment-action.dto';

@Injectable()
export class PagamentosService {
  constructor(private supabase: SupabaseService) {}

  /**
   * Helper privado para registrar auditoria
   */
  private async logAudit(
    action: 'INITIATE' | 'UPLOAD_PROOF' | 'APPROVE' | 'REJECT',
    entityId: string,
    previousState: any,
    newState: any,
    actorId?: string,
    metadata?: any
  ) {
    try {
      await this.supabase.getAdminClient()
        .from('financial_audit_logs')
        .insert({
          entity_type: 'PAYMENT',
          entity_id: entityId,
          action,
          previous_state: previousState,
          new_state: newState,
          actor_id: actorId || null,
          metadata: metadata || {}
        });
    } catch (e) {
      console.error('Falha ao registrar auditoria:', e);
      // Não falhar a transação principal por erro de auditoria (fail-open vs fail-close decision)
      // Aqui optamos por fail-open (log erro mas continua), mas em sistemas críticos poderia ser fail-close.
    }
  }

  /**
   * Inicia um pagamento (Intenção de pagamento)
   */
  async initiatePayment(dto: InitiatePaymentDto) {
    const client = this.supabase.getAdminClient();

    // 1. Validar Mensalidade
    const { data: mensalidade, error: mensError } = await client
      .from('mensalidades')
      .select('valor_cents, juros_cents, desconto_cents, status')
      .eq('id', dto.mensalidade_id)
      .single();

    if (mensError || !mensalidade) throw new NotFoundException('Mensalidade não encontrada');
    if (mensalidade.status === 'pago') throw new BadRequestException('Esta mensalidade já está paga');

    const valorFinal = (mensalidade.valor_cents || 0) + (mensalidade.juros_cents || 0) - (mensalidade.desconto_cents || 0);

    // 2. Criar Pagamento
    const { data, error } = await client
      .from('pagamentos')
      .insert({
        mensalidade_id: dto.mensalidade_id,
        metodo: dto.metodo,
        valor_cents: valorFinal,
        status_gateway: 'pending',
        data_recebimento: null,
      })
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);

    // Log Audit
    this.logAudit('INITIATE', data.id, null, data, undefined, { mensalidade_id: dto.mensalidade_id });

    return data;
  }

  /**
   * Upload de comprovante pelo Aluno
   */
  async uploadPaymentProof(pagamentoId: string, dto: UploadComprovanteDto) {
    const client = this.supabase.getAdminClient();

    // Validar estado atual
    const { data: current } = await client
      .from('pagamentos')
      .select('*') // Need full object for audit
      .eq('id', pagamentoId)
      .single();

    if (!current) throw new NotFoundException('Pagamento não encontrado');
    if (current.status_gateway === 'success') throw new BadRequestException('Pagamento já foi aprovado');

    const { data, error } = await client
      .from('pagamentos')
      .update({
        comprovante_url: dto.comprovante_url,
        status_gateway: 'pending',
        rejection_note: null,
      })
      .eq('id', pagamentoId)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);

    // Log Audit
    // Actor ID is missing here because it's student -> ideally passed via context/dto or inferred from request user.
    // For now logging without actor_id or if we had it. The verifying script mocks it or we rely on authenticated request usually.
    // We don't have actor_id in DTO here. Future improvement: Pass user context to service methods.
    this.logAudit('UPLOAD_PROOF', pagamentoId, current, data);

    return data;
  }

  /**
   * Aprovar Pagamento (Diretoria)
   */
  async approvePayment(pagamentoId: string, dto: AprovarPagamentoDto) {
    const client = this.supabase.getAdminClient();

    const { data: current } = await client
      .from('pagamentos')
      .select('*')
      .eq('id', pagamentoId)
      .single();

    if (!current) throw new NotFoundException('Pagamento não encontrado');
    if (current.status_gateway !== 'pending') throw new BadRequestException(`Pagamento não está pendente (Status: ${current.status_gateway})`);

    // Atualiza Pagamento
    const { data, error } = await client
      .from('pagamentos')
      .update({
        status_gateway: 'success',
        recebido_por: dto.diretor_id,
        data_recebimento: new Date().toISOString(),
      })
      .eq('id', pagamentoId)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);

    // Log Audit
    this.logAudit('APPROVE', pagamentoId, current, data, dto.diretor_id);

    return data;
  }

  /**
   * Rejeitar Pagamento (Diretoria)
   */
  async rejectPayment(pagamentoId: string, dto: RejeitarPagamentoDto) {
    const client = this.supabase.getAdminClient();

    const { data: current } = await client
      .from('pagamentos')
      .select('*')
      .eq('id', pagamentoId)
      .single();

    if (!current) throw new NotFoundException('Pagamento não encontrado');
    if (current.status_gateway === 'success') throw new BadRequestException('Não é possível rejeitar um pagamento já aprovado');

    const { data, error } = await client
      .from('pagamentos')
      .update({
        status_gateway: 'failed',
        rejection_note: dto.rejection_note,
        recebido_por: dto.diretor_id,
      })
      .eq('id', pagamentoId)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);

    // Log Audit
    this.logAudit('REJECT', pagamentoId, current, data, dto.diretor_id, { reason: dto.rejection_note });

    return data;
  }

  /**
   * Listar pagamentos Pendentes
   */
  async listarPendentes() {
    const { data, error } = await this.supabase
      .getAdminClient()
      .from('pagamentos')
      .select(`
        *,
        mensalidade:mensalidades!fk_mensalidade(
          id, titulo,
          aluno:alunos!fk_aluno(id, nome)
        )
      `)
      .eq('status_gateway', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw new BadRequestException(error.message);
    return data;
  }
}
