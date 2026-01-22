import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateCobrancaLoteDto, ConfirmarPagamentoDto, UpdateConfiguracaoFinanceiraDto } from './dto';

@Injectable()
export class MensalidadesService {
  constructor(private supabase: SupabaseService) {}

  /**
   * Gera cobranças para todos os alunos de uma turma
   */
  async gerarCobrancasLote(dto: CreateCobrancaLoteDto) {
    const client = this.supabase.getAdminClient();

    // 1. Buscar todos alunos da turma com status 'ativo'
    const { data: matriculas, error: matriculasError } = await client
      .from('matriculas')
      .select('aluno_id, polo_id')
      .eq('turma_id', dto.turma_id)
      .eq('status', 'ativa');

    if (matriculasError) throw new BadRequestException(matriculasError.message);
    
    if (!matriculas || matriculas.length === 0) {
      throw new BadRequestException('Nenhum aluno ativo encontrado nesta turma');
    }

    // 2. Criar registros de cobrança para cada aluno
    const cobrancas = matriculas.map(m => ({
      aluno_id: m.aluno_id,
      polo_id: m.polo_id,
      titulo: dto.titulo,
      valor_cents: dto.valor_cents,
      vencimento: dto.vencimento,
      status: 'pendente',
      desconto_cents: 0,
      juros_cents: 0,
    }));

    const { data, error } = await client
      .from('mensalidades')
      .insert(cobrancas)
      .select();

    if (error) throw new BadRequestException(error.message);

    return {
      total_gerado: data.length,
      cobrancas: data,
    };
  }

  /**
   * Gera cobranças de material apenas para os alunos aprovados no encerramento do módulo
   */
  async gerarCobrancasMaterialAprovados(
    alunoIds: string[], 
    titulo: string, 
    valorCents: number, 
    vencimento: string
  ) {
    if (alunoIds.length === 0) return { total_gerado: 0 };

    const client = this.supabase.getAdminClient();

    // 1. Buscar polos dos alunos para vincular corretamente
    const { data: alunos, error: alunosError } = await client
      .from('alunos')
      .select('id, polo_id')
      .in('id', alunoIds);

    if (alunosError) throw new BadRequestException(alunosError.message);

    // 2. Criar registros de cobrança
    const cobrancas = alunos.map(a => ({
      aluno_id: a.id,
      polo_id: a.polo_id,
      titulo: titulo,
      valor_cents: valorCents,
      vencimento: vencimento,
      status: 'pendente',
      desconto_cents: 0,
      juros_cents: 0,
    }));

    const { data, error } = await client
      .from('mensalidades')
      .insert(cobrancas)
      .select();

    if (error) throw new BadRequestException(error.message);

    return {
      total_gerado: data.length,
      cobrancas: data,
    };
  }

  /**
   * Listar cobranças com filtros
   */
  async listarCobrancas(filtros?: {
    turma_id?: string;
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

    if (filtros?.aluno_id) query = query.eq('aluno_id', filtros.aluno_id);
    if (filtros?.polo_id) query = query.eq('polo_id', filtros.polo_id);
    if (filtros?.status) query = query.eq('status', filtros.status);

    const { data, error } = await query;
    if (error) throw new BadRequestException(error.message);

    return data;
  }

  /**
   * Confirmar pagamento (Aluno enviando comprovante ou Baixa manual imediata)
   */
  async confirmarPagamento(id: string, dto?: ConfirmarPagamentoDto) {
    const client = this.supabase.getAdminClient();
    
    // 1. Buscar a mensalidade para ter o valor exato (incluindo juros/descontos que podem ter sido aplicados)
    const { data: mensalidade } = await client
      .from('mensalidades')
      .select('valor_cents, juros_cents, desconto_cents')
      .eq('id', id)
      .single();
    
    if (!mensalidade) throw new BadRequestException('Mensalidade não encontrada');
    
    const valorFinal = (mensalidade.valor_cents || 0) + (mensalidade.juros_cents || 0) - (mensalidade.desconto_cents || 0);

    // 2. Registrar na tabela de pagamentos
    // Se houver comprovante, fica 'pending' para a Diretoria validar.
    // Se não houver comprovante (baixa direta), já entra como 'success'.
    const statusGateway = dto?.comprovante_url ? 'pending' : 'success';

    const { data: pagamento, error: pagError } = await client
      .from('pagamentos')
      .insert({
        mensalidade_id: id,
        metodo: 'pix',
        valor_cents: valorFinal,
        status_gateway: statusGateway,
        comprovante_url: dto?.comprovante_url || null,
        data_recebimento: new Date().toISOString(),
      })
      .select()
      .single();

    if (pagError) throw new BadRequestException(pagError.message);

    // 3. A TRIGGER 'update_mensalidade_status' no banco cuidará de atualizar a tabela 'mensalidades'.
    // Buscamos o estado atualizado para retornar ao front.
    const { data: updated } = await client
      .from('mensalidades')
      .select('*')
      .eq('id', id)
      .single();

    return updated;
  }

  /**
   * Aprovar um pagamento pendente (Diretoria Geral)
   */
  async aprovarPagamento(pagamentoId: string, diretorId: string) {
    const { data, error } = await this.supabase
      .getAdminClient()
      .from('pagamentos')
      .update({
        status_gateway: 'success',
        recebido_por: diretorId,
      })
      .eq('id', pagamentoId)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  /**
   * Listar pagamentos para validação
   */
  async listarPagamentosPendentes() {
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

  /**
   * Buscar configurações financeiras (chave PIX)
   */
  async buscarConfiguracaoFinanceira() {
    const { data, error } = await this.supabase
      .getAdminClient()
      .from('configuracoes_financeiras')
      .select('*')
      .limit(1)
      .single();

    if (error) throw new BadRequestException('Configuração financeira não encontrada');
    return data;
  }
  /**
   * Atualizar configurações financeiras
   */
  async atualizarConfiguracaoFinanceira(dto: any) {
    // 1. Verificar se já existe (deveria existir pelo insert inicial)
    const { data: existente } = await this.supabase
      .getAdminClient()
      .from('configuracoes_financeiras')
      .select('id')
      .limit(1)
      .single();

    let query;
    if (existente) {
      query = this.supabase
        .getAdminClient()
        .from('configuracoes_financeiras')
        .update({
          ...dto,
          updated_at: new Date().toISOString()
        })
        .eq('id', existente.id);
    } else {
      query = this.supabase
        .getAdminClient()
        .from('configuracoes_financeiras')
        .insert(dto);
    }

    const { data, error } = await query.select().single();
    if (error) throw new BadRequestException(error.message);
    return data;
  }
}
