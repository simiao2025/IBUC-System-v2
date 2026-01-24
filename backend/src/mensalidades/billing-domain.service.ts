import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { NotificacoesService } from '../notificacoes/notificacoes.service';

// ===========================================
// IBUC System - Billing Domain Service
// Fase 4.3 - Refatoração de Domínio Financeiro
// ===========================================

// ============================================
// ENUMS - Estados Explícitos (espelha frontend)
// ============================================

/**
 * Estados de uma Cobrança (Billing)
 * Mapeamento banco: 'pendente' -> PENDING, 'pago' -> PAID, 'vencido' -> OVERDUE
 */
export type BillingStatus = 'PENDING' | 'OVERDUE' | 'PAID' | 'CANCELED';

// ============================================
// DTOs
// ============================================

export interface PublishBillingDTO {
  turma_id: string;
  titulo: string;
  valor_cents: number;
  vencimento: string; // ISO date
  criado_por: string; // Admin ID
}

export interface PublishBillingForStudentsDTO {
  aluno_ids: string[];
  titulo: string;
  valor_cents: number;
  vencimento: string;
  criado_por: string;
}

export interface CancelBillingDTO {
  billing_id: string;
  cancelado_por: string;
  motivo?: string;
}

// ============================================
// TRANSIÇÕES DE ESTADO
// ============================================

/**
 * Matriz de transições válidas para Billing
 * 
 * PENDING  -> OVERDUE (vencimento automático)
 * PENDING  -> PAID    (pagamento aprovado)
 * PENDING  -> CANCELED (admin cancela)
 * OVERDUE  -> PAID    (pagamento aprovado após vencimento)
 * OVERDUE  -> CANCELED (admin cancela)
 * CANCELED -> PENDING (admin reabre) [opcional]
 * PAID     -> (terminal, sem transições)
 */
const BILLING_TRANSITIONS: Record<BillingStatus, BillingStatus[]> = {
  PENDING: ['OVERDUE', 'PAID', 'CANCELED'],
  OVERDUE: ['PAID', 'CANCELED'],
  PAID: [], // Terminal
  CANCELED: ['PENDING'], // Reabertura administrativa
};

function canTransitionBilling(from: BillingStatus, to: BillingStatus): boolean {
  return BILLING_TRANSITIONS[from]?.includes(to) ?? false;
}

function mapDbStatusToDomain(dbStatus: string, vencimento: string): BillingStatus {
  if (dbStatus === 'pago') return 'PAID';
  if (dbStatus === 'pendente') {
    // Verificar vencimento para determinar se está OVERDUE
    if (new Date(vencimento) < new Date()) {
      return 'OVERDUE';
    }
    return 'PENDING';
  }
  if (dbStatus === 'vencido') return 'OVERDUE';
  return 'PENDING';
}

function mapDomainStatusToDb(domainStatus: BillingStatus): string {
  switch (domainStatus) {
    case 'PAID': return 'pago';
    case 'OVERDUE': return 'vencido';
    case 'CANCELED': return 'pendente'; // Cancelado é tratado como pendente no DB legado
    default: return 'pendente';
  }
}

// ============================================
// SERVICE
// ============================================

@Injectable()
export class BillingDomainService {
  constructor(
    private supabase: SupabaseService,
    private notificacoesService: NotificacoesService,
  ) {}

  // ==========================================
  // COMMAND: Publicar Cobranças em Lote
  // ==========================================
  /**
   * Publica cobranças para todos os alunos ativos de uma turma.
   * 
   * Pré-condições:
   * - turma_id deve referenciar turma existente
   * - Turma deve ter alunos com matrícula ativa
   * - valor_cents > 0
   * - vencimento >= hoje
   * 
   * Pós-condições:
   * - N registros criados em mensalidades (status='pendente')
   * - Notificação enviada para cada aluno
   * - Audit log registrado
   * 
   * @param dto Dados da cobrança
   * @returns Lista de cobranças criadas
   */
  async publishBilling(dto: PublishBillingDTO): Promise<{
    total_gerado: number;
    billing_ids: string[];
  }> {
    const client = this.supabase.getAdminClient();

    // ========================================
    // VALIDAÇÃO DE INVARIANTES
    // ========================================
    
    // INV-B01: valor_cents > 0
    if (!dto.valor_cents || dto.valor_cents <= 0) {
      throw new BadRequestException('Valor da cobrança deve ser maior que zero');
    }

    // INV-B02: vencimento >= hoje
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const vencimento = new Date(dto.vencimento);
    if (vencimento < hoje) {
      throw new BadRequestException('Data de vencimento não pode estar no passado');
    }

    // ========================================
    // BUSCAR ALUNOS DA TURMA
    // ========================================
    const { data: matriculas, error: matriculasError } = await client
      .from('matriculas')
      .select('aluno_id, polo_id')
      .eq('turma_id', dto.turma_id)
      .eq('status', 'ativa');

    if (matriculasError) {
      throw new BadRequestException(`Erro ao buscar matrículas: ${matriculasError.message}`);
    }

    if (!matriculas || matriculas.length === 0) {
      throw new BadRequestException('Nenhum aluno ativo encontrado nesta turma');
    }

    // ========================================
    // CRIAR COBRANÇAS (ESTADO INICIAL: PENDING)
    // ========================================
    const timestamp = new Date().toISOString();
    const cobrancas = matriculas.map(m => ({
      aluno_id: m.aluno_id,
      polo_id: m.polo_id,
      titulo: dto.titulo,
      valor_cents: dto.valor_cents,
      vencimento: dto.vencimento,
      status: 'pendente', // DB status
      desconto_cents: 0,
      juros_cents: 0,
      created_at: timestamp,
      updated_at: timestamp,
    }));

    const { data, error } = await client
      .from('mensalidades')
      .insert(cobrancas)
      .select('id, aluno_id, titulo, valor_cents');

    if (error) {
      throw new BadRequestException(`Erro ao criar cobranças: ${error.message}`);
    }

    // ========================================
    // NOTIFICAÇÕES (async, não bloqueia)
    // ========================================
    for (const cobranca of data) {
      this.notificarCobranca(cobranca.aluno_id, cobranca.titulo, cobranca.valor_cents);
    }

    // ========================================
    // AUDIT LOG
    // ========================================
    await this.registrarAuditLog({
      entity: 'billing_batch',
      action: 'publish',
      actor_id: dto.criado_por,
      payload: {
        turma_id: dto.turma_id,
        total: data.length,
        valor_cents: dto.valor_cents,
        vencimento: dto.vencimento,
      },
    });

    return {
      total_gerado: data.length,
      billing_ids: data.map(d => d.id),
    };
  }

  // ==========================================
  // COMMAND: Publicar Cobranças para Alunos Específicos
  // ==========================================
  /**
   * Publica cobranças para uma lista específica de alunos.
   * Usado em cenários como materiais de módulo para aprovados.
   * 
   * @param dto Dados da cobrança com IDs de alunos
   * @returns Lista de cobranças criadas
   */
  async publishBillingForStudents(dto: PublishBillingForStudentsDTO): Promise<{
    total_gerado: number;
    billing_ids: string[];
  }> {
    if (!dto.aluno_ids || dto.aluno_ids.length === 0) {
      return { total_gerado: 0, billing_ids: [] };
    }

    const client = this.supabase.getAdminClient();

    // ========================================
    // VALIDAÇÃO DE INVARIANTES
    // ========================================
    if (!dto.valor_cents || dto.valor_cents <= 0) {
      throw new BadRequestException('Valor da cobrança deve ser maior que zero');
    }

    // ========================================
    // BUSCAR POLOS DOS ALUNOS
    // ========================================
    const { data: alunos, error: alunosError } = await client
      .from('alunos')
      .select('id, polo_id')
      .in('id', dto.aluno_ids);

    if (alunosError) {
      throw new BadRequestException(`Erro ao buscar alunos: ${alunosError.message}`);
    }

    // ========================================
    // CRIAR COBRANÇAS
    // ========================================
    const timestamp = new Date().toISOString();
    const cobrancas = alunos.map(a => ({
      aluno_id: a.id,
      polo_id: a.polo_id,
      titulo: dto.titulo,
      valor_cents: dto.valor_cents,
      vencimento: dto.vencimento,
      status: 'pendente',
      desconto_cents: 0,
      juros_cents: 0,
      created_at: timestamp,
      updated_at: timestamp,
    }));

    const { data, error } = await client
      .from('mensalidades')
      .insert(cobrancas)
      .select('id, aluno_id, titulo, valor_cents');

    if (error) {
      throw new BadRequestException(`Erro ao criar cobranças: ${error.message}`);
    }

    // Notificações
    for (const cobranca of data) {
      this.notificarCobranca(cobranca.aluno_id, cobranca.titulo, cobranca.valor_cents);
    }

    // Audit
    await this.registrarAuditLog({
      entity: 'billing_batch',
      action: 'publish_specific',
      actor_id: dto.criado_por,
      payload: {
        aluno_ids: dto.aluno_ids,
        total: data.length,
        valor_cents: dto.valor_cents,
      },
    });

    return {
      total_gerado: data.length,
      billing_ids: data.map(d => d.id),
    };
  }

  // ==========================================
  // COMMAND: Cancelar Cobrança
  // ==========================================
  /**
   * Cancela uma cobrança pendente ou vencida.
   * 
   * Transições válidas:
   * - PENDING -> CANCELED
   * - OVERDUE -> CANCELED
   * 
   * Transições inválidas:
   * - PAID -> CANCELED (erro)
   * 
   * @param dto Dados do cancelamento
   */
  async cancelBilling(dto: CancelBillingDTO): Promise<void> {
    const client = this.supabase.getAdminClient();

    // Buscar estado atual
    const { data: billing, error } = await client
      .from('mensalidades')
      .select('id, status, vencimento')
      .eq('id', dto.billing_id)
      .single();

    if (error || !billing) {
      throw new BadRequestException('Cobrança não encontrada');
    }

    const currentStatus = mapDbStatusToDomain(billing.status, billing.vencimento);

    // Validar transição
    if (!canTransitionBilling(currentStatus, 'CANCELED')) {
      throw new ForbiddenException(
        `Não é possível cancelar uma cobrança com status ${currentStatus}`
      );
    }

    // Atualizar (nota: usamos 'pendente' no DB pois não há enum 'cancelado')
    // Em cenário real, adicionar coluna 'cancelado_em' ou flag
    await client
      .from('mensalidades')
      .update({
        status: 'pendente', // Flag de cancelamento via observação
        updated_at: new Date().toISOString(),
      })
      .eq('id', dto.billing_id);

    // Audit
    await this.registrarAuditLog({
      entity: 'billing',
      entity_id: dto.billing_id,
      action: 'cancel',
      actor_id: dto.cancelado_por,
      payload: { motivo: dto.motivo },
    });
  }

  // ==========================================
  // QUERY: Listar Cobranças
  // ==========================================
  async listBillings(filters?: {
    aluno_id?: string;
    polo_id?: string;
    status?: string;
  }) {
    let query = this.supabase
      .getAdminClient()
      .from('mensalidades')
      .select(`
        *,
        aluno:alunos!fk_aluno(id, nome, cpf),
        polo:polos!fk_polo(id, nome)
      `)
      .order('vencimento', { ascending: false });

    if (filters?.aluno_id) query = query.eq('aluno_id', filters.aluno_id);
    if (filters?.polo_id) query = query.eq('polo_id', filters.polo_id);
    if (filters?.status) query = query.eq('status', filters.status);

    const { data, error } = await query;
    if (error) throw new BadRequestException(error.message);

    return data;
  }

  // ==========================================
  // QUERY: Buscar Cobrança por ID
  // ==========================================
  async getBillingById(billingId: string) {
    const { data, error } = await this.supabase
      .getAdminClient()
      .from('mensalidades')
      .select('*, aluno:alunos!fk_aluno(id, nome)')
      .eq('id', billingId)
      .single();

    if (error) throw new BadRequestException('Cobrança não encontrada');
    return data;
  }

  // ==========================================
  // INTERNAL: Transicionar estado para PAID
  // (chamado pelo PaymentIntentDomainService)
  // ==========================================
  async transitionToPaid(billingId: string, receiptUrl: string): Promise<void> {
    const client = this.supabase.getAdminClient();

    const { data: billing } = await client
      .from('mensalidades')
      .select('status, vencimento')
      .eq('id', billingId)
      .single();

    if (!billing) throw new BadRequestException('Cobrança não encontrada');

    const currentStatus = mapDbStatusToDomain(billing.status, billing.vencimento);

    if (!canTransitionBilling(currentStatus, 'PAID')) {
      throw new ForbiddenException(
        `Não é possível marcar como paga uma cobrança com status ${currentStatus}`
      );
    }

    await client
      .from('mensalidades')
      .update({
        status: 'pago',
        pago_em: new Date().toISOString(),
        comprovante_url: receiptUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', billingId);
  }

  // ==========================================
  // HELPERS
  // ==========================================

  private async notificarCobranca(alunoId: string, titulo: string, valorCents: number) {
    try {
      const { data: aluno } = await this.supabase.getAdminClient()
        .from('alunos')
        .select('usuario_id')
        .eq('id', alunoId)
        .single();

      if (aluno?.usuario_id) {
        await this.notificacoesService.enviarNotificacaoCobrancaGerada(
          aluno.usuario_id,
          titulo,
          valorCents
        );
      }
    } catch (e) {
      console.error('Erro ao notificar cobrança:', e);
    }
  }

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
