import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateCobrancaLoteDto, UpdateConfiguracaoFinanceiraDto } from './dto';
import { NotificacoesService } from '../notificacoes/notificacoes.service';

@Injectable()
export class MensalidadesService {
  constructor(
    private supabase: SupabaseService,
    private notificacoesService: NotificacoesService
  ) {}

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

    // Notificar alunos no painel
    for (const cobranca of data) {
      this.notificarCobranca(cobranca.aluno_id, cobranca.titulo, cobranca.valor_cents);
    }

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

    // Notificar alunos no painel
    for (const cobranca of data) {
      this.notificarCobranca(cobranca.aluno_id, cobranca.titulo, cobranca.valor_cents);
    }

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

  // Método auxiliar para notificar cobrança buscando usuario_id
  private async notificarCobranca(alunoId: string, titulo: string, valorCents: number) {
    try {
      const { data: aluno } = await this.supabase.getAdminClient()
        .from('alunos')
        .select('usuario_id')
        .eq('id', alunoId)
        .single();
      
      if (aluno?.usuario_id) {
        await this.notificacoesService.enviarNotificacaoCobrancaGerada(aluno.usuario_id, titulo, valorCents);
      }
    } catch (e) {
      console.error('Erro ao notificar cobrança:', e);
    }
  }

  /**
   * Publicar/Notificar uma cobrança específica (Disponibilizar endpoint)
   */
  async publishBilling(id: string) {
      const { data: cobranca, error } = await this.supabase.getAdminClient()
        .from('mensalidades')
        .select('aluno_id, titulo, valor_cents')
        .eq('id', id)
        .single();

      if (error || !cobranca) throw new BadRequestException('Cobrança não encontrada');

      await this.notificarCobranca(cobranca.aluno_id, cobranca.titulo, cobranca.valor_cents);
      return { message: 'Cobrança publicada e notificada com sucesso' };
  }
}
