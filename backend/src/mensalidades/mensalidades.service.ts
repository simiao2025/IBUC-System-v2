import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateCobrancaLoteDto, ConfirmarPagamentoDto } from './dto';

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
   * Listar cobranças com filtros
   */
  async listarCobrancas(filtros?: {
    turma_id?: string;
    aluno_id?: string;
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
    if (filtros?.status) query = query.eq('status', filtros.status);

    const { data, error } = await query;
    if (error) throw new BadRequestException(error.message);

    return data;
  }

  /**
   * Confirmar pagamento manualmente
   */
  async confirmarPagamento(id: string, dto?: ConfirmarPagamentoDto) {
    const { data, error } = await this.supabase
      .getAdminClient()
      .from('mensalidades')
      .update({
        status: 'pago',
        pago_em: new Date().toISOString(),
        comprovante_url: dto?.comprovante_url || null,
      })
      .eq('id', id)
      .select()
      .single();

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
}
