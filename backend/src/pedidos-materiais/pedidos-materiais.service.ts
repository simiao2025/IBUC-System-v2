import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreatePedidoMaterialDto } from './dto';
import { MensalidadesService } from '../mensalidades/mensalidades.service';

@Injectable()
export class PedidosMateriaisService {
  constructor(
    private supabase: SupabaseService,
    private mensalidadesService: MensalidadesService
  ) {}

  async listar() {
    const { data, error } = await this.supabase
      .getAdminClient()
      .from('pedidos_materiais')
      .select(`
        *,
        modulo_destino:modulos(id, titulo),
        solicitante:usuarios(id, nome_completo)
      `)
      .order('created_at', { ascending: false });

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async buscarPorId(id: string) {
    const { data, error } = await this.supabase
      .getAdminClient()
      .from('pedidos_materiais')
      .select(`
        *,
        modulo_destino:modulos(id, titulo),
        solicitante:usuarios(id, nome_completo),
        itens:itens_pedido_material(
          *,
          material:materiais(id, nome)
        )
      `)
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundException('Pedido não encontrado');
    return data;
  }

  async criar(dto: CreatePedidoMaterialDto) {
    const client = this.supabase.getAdminClient();

    // 1. Calcular total
    const total_cents = dto.itens.reduce((acc, item) => acc + (item.valor_unitario_cents * item.quantidade), 0);

    // 2. Criar pedido (Rascunho)
    const { data: pedido, error: pedidoError } = await client
      .from('pedidos_materiais')
      .insert({
        tipo_cobranca: dto.tipo_cobranca,
        modulo_destino_id: dto.modulo_destino_id || null,
        solicitante_id: dto.solicitante_id,
        total_cents: total_cents,
        status: 'rascunho',
      })
      .select()
      .single();

    if (pedidoError) throw new BadRequestException(pedidoError.message);

    // 3. Criar itens do pedido
    const itens = dto.itens.map(item => ({
      pedido_id: pedido.id,
      material_id: item.material_id,
      quantidade: item.quantidade,
      valor_unitario_cents: item.valor_unitario_cents,
    }));

    const { error: itensError } = await client
      .from('itens_pedido_material')
      .insert(itens);

    if (itensError) {
      // Rollback manual (deletar pedido se itens falharem)
      await client.from('pedidos_materiais').delete().eq('id', pedido.id);
      throw new BadRequestException(itensError.message);
    }

    return this.buscarPorId(pedido.id);
  }

  async atualizarStatus(id: string, status: string) {
    const { data, error } = await this.supabase
      .getAdminClient()
      .from('pedidos_materiais')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async gerarCobrancas(id: string, vencimento: string) {
    const pedido = await this.buscarPorId(id);
    if (!pedido.modulo_destino_id) {
      throw new BadRequestException('Este pedido não possui um módulo de destino vinculado.');
    }

    if (pedido.status === 'faturado') {
      throw new BadRequestException('Este pedido já foi faturado.');
    }

    const client = this.supabase.getAdminClient();

    // 1. Buscar todos os alunos ativos em turmas que estão no módulo de destino
    // Nota: Pegamos turmas onde modulo_atual_id é o modulo_destino do pedido
    const { data: turmas, error: turmasError } = await client
      .from('turmas')
      .select('id')
      .eq('modulo_atual_id', pedido.modulo_destino_id);

    if (turmasError) throw new BadRequestException(turmasError.message);

    const turmaIds = turmas.map(t => t.id);
    if (turmaIds.length === 0) {
      throw new BadRequestException('Nenhuma turma ativa encontrada para este módulo.');
    }

    // 2. Buscar matrículas ativas nessas turmas
    const { data: matriculas, error: matriculasError } = await client
      .from('matriculas')
      .select('aluno_id')
      .in('turma_id', turmaIds)
      .eq('status', 'ativa');

    if (matriculasError) throw new BadRequestException(matriculasError.message);

    const alunoIds = [...new Set(matriculas.map(m => m.aluno_id))];
    if (alunoIds.length === 0) {
      throw new BadRequestException('Nenhum aluno ativo encontrado nas turmas deste módulo.');
    }

    // 3. Chamar MensalidadesService para gerar as cobranças
    const result = await this.mensalidadesService.gerarCobrancasMaterialAprovados(
      alunoIds,
      `Material Didático: ${pedido.modulo_destino.titulo}`,
      pedido.total_cents,
      vencimento
    );

    // 4. Atualizar status do pedido para cobrado
    await this.atualizarStatus(id, 'cobrado');

    return {
      message: `${result.total_gerado} cobranças geradas com sucesso!`,
      total_gerado: result.total_gerado
    };
  }
}
