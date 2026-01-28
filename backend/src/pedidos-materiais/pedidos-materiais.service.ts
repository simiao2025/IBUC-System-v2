import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreatePedidoMaterialDto } from './dto';
import { MensalidadesService } from '../mensalidades/mensalidades.service';
import PDFDocument = require('pdfkit');
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class PedidosMateriaisService {
  constructor(
    private supabase: SupabaseService,
    private mensalidadesService: MensalidadesService
  ) { }

  async listar(filtros?: { polo_id?: string; status?: string; aluno_id?: string }) {
    let query = this.supabase
      .getAdminClient()
      .from('pedidos_materiais')
      .select(`
        *,
        modulo_destino:modulos(id, titulo),
        solicitante:usuarios!pedidos_materiais_solicitante_id_fkey(id, nome_completo),
        aluno:alunos(id, nome),
        polo:polos(id, nome),
        itens:itens_pedido_material(material_id)
      `);

    if (filtros?.polo_id) {
      query = query.eq('polo_id', filtros.polo_id);
    }
    if (filtros?.status) {
      query = query.eq('status', filtros.status);
    }
    if (filtros?.aluno_id) {
      query = query.eq('aluno_id', filtros.aluno_id);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

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
        solicitante:usuarios!pedidos_materiais_solicitante_id_fkey(id, nome_completo),
        aluno:alunos(id, nome),
        polo:polos(id, nome),
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

    // 0. Auto-vincular Polo se for de aluno
    let polo_id = dto.polo_id;
    if (dto.aluno_id && !polo_id) {
      const { data: aluno } = await client.from('alunos').select('polo_id').eq('id', dto.aluno_id).single();
      if (aluno) polo_id = aluno.polo_id;
    }

    // 1. Calcular total
    const total_cents = dto.itens.reduce((acc, item) => acc + (item.valor_unitario_cents * item.quantidade), 0);

    // 2. Criar pedido (Pendente por padrão para pedidos externos)
    const { data: pedido, error: pedidoError } = await client
      .from('pedidos_materiais')
      .insert({
        tipo_cobranca: dto.tipo_cobranca,
        modulo_destino_id: dto.modulo_destino_id || null,
        niveis_destino_ids: dto.niveis_destino_ids || [],
        solicitante_id: dto.solicitante_id,
        aluno_id: dto.aluno_id || null,
        polo_id: polo_id || null,
        total_cents: total_cents,
        status: 'rascunho', // A diretoria ou o próprio sistema no futuro pode mudar para rascunho ou pendente
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

    if (pedido.status === 'cobrado') {
      throw new BadRequestException('Este pedido já foi faturado.');
    }

    const client = this.supabase.getAdminClient();

    let alunoIds: string[] = [];
    let descricao = '';

    // CASO 1: Pedido Individual (para um aluno específico)
    if (pedido.aluno_id) {
      alunoIds = [pedido.aluno_id];
      descricao = `Material Didático Individual: ${pedido.itens?.map(i => i.material?.nome).join(', ')}`;
    } 
    // CASO 2: Pedido por Módulo (Legado/Global)
    else if (pedido.modulo_destino_id) {
      descricao = `Material Didático: ${pedido.modulo_destino.titulo}`;
      
      let queryTurmas = client
        .from('turmas')
        .select('id, nome, modulo_atual_id, nivel_id')
        .eq('modulo_atual_id', pedido.modulo_destino_id);

      if (pedido.niveis_destino_ids && pedido.niveis_destino_ids.length > 0) {
        queryTurmas = queryTurmas.in('nivel_id', pedido.niveis_destino_ids);
      }

      if (pedido.polo_id) {
        queryTurmas = queryTurmas.eq('polo_id', pedido.polo_id);
      }

      const { data: turmas, error: turmasError } = await queryTurmas;
      if (turmasError) throw new BadRequestException(turmasError.message);

      const turmaIds = turmas.map(t => t.id);
      if (turmaIds.length === 0) {
        throw new BadRequestException('Nenhuma turma encontrada para os critérios selecionados.');
      }

      const { data: alunos, error: alunosError } = await client
        .from('alunos')
        .select('id')
        .in('turma_id', turmaIds)
        .eq('status', 'ativo');

      if (alunosError) throw new BadRequestException(alunosError.message);
      alunoIds = alunos.map(a => a.id);
    } else {
      throw new BadRequestException('Pedido inválido: informe um aluno ou um módulo de destino.');
    }

    if (alunoIds.length === 0) {
      throw new BadRequestException('Nenhum aluno encontrado para gerar cobrança.');
    }

    // 3. Chamar MensalidadesService para gerar as cobranças
    const result = await this.mensalidadesService.gerarCobrancasMaterialAprovados(
      alunoIds,
      descricao,
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

  async aprovar(id: string, aprovadorId: string) {
    const { data, error } = await this.supabase
      .getAdminClient()
      .from('pedidos_materiais')
      .update({ 
        status: 'aprovado',
        aprovado_por_id: aprovadorId,
        data_aprovacao: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async recusar(id: string) {
    return this.atualizarStatus(id, 'recusado');
  }

  async validarPagamento(id: string, validadorId: string, observacoes?: string) {
    const pedido = await this.buscarPorId(id);
    
    // Validação de status
    if (pedido.status !== 'pendente_validacao') {
      throw new BadRequestException('Apenas pedidos pendentes de validação podem ser validados.');
    }

    const { data, error } = await this.supabase
      .getAdminClient()
      .from('pedidos_materiais')
      .update({
        status: 'pago',
        validado_por_id: validadorId,
        data_validacao: new Date().toISOString(),
        observacoes_validacao: observacoes || null
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async rejeitarPagamento(id: string, validadorId: string, motivo: string) {
    const pedido = await this.buscarPorId(id);
    
    // Validação de status
    if (pedido.status !== 'pendente_validacao') {
      throw new BadRequestException('Apenas pedidos pendentes de validação podem ser rejeitados.');
    }

    const { data, error } = await this.supabase
      .getAdminClient()
      .from('pedidos_materiais')
      .update({
        status: 'pagamento_rejeitado',
        validado_por_id: validadorId,
        data_validacao: new Date().toISOString(),
        motivo_rejeicao: motivo
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async atualizarComprovante(id: string, url_comprovante: string) {
    const { data, error } = await this.supabase
      .getAdminClient()
      .from('pedidos_materiais')
      .update({ 
        url_comprovante,
        status: 'pendente_validacao'
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async deletar(id: string) {
    const pedido = await this.buscarPorId(id);
    if (pedido.status !== 'rascunho') {
      throw new BadRequestException('Apenas pedidos em rascunho podem ser deletados.');
    }

    const client = this.supabase.getAdminClient();

    const { error } = await client
      .from('pedidos_materiais')
      .delete()
      .eq('id', id);

    if (error) {
      throw new BadRequestException(`Erro ao deletar pedido: ${error.message}`);
    }
  }

  async gerarPdfLista(filtros?: { polo_id?: string; status?: string; aluno_id?: string }) {
    const pedidos = await this.listar(filtros);
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    
    // Configurar layout do PDF
    doc.fontSize(16).text('Relatório de Pedidos de Materiais', { align: 'center' });
    doc.fontSize(10).text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, { align: 'center' });
    doc.moveDown();

    if (filtros?.polo_id) {
       const { data: polo } = await this.supabase.getAdminClient().from('polos').select('nome').eq('id', filtros.polo_id).single();
       if (polo) doc.fontSize(12).text(`Polo: ${polo.nome}`, { align: 'left' });
    }
    if (filtros?.status) {
       doc.fontSize(12).text(`Status: ${filtros.status.toUpperCase()}`, { align: 'left' });
    }
    doc.moveDown();

    // Cabeçalho da Tabela
    const tableTop = 150;
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Data', 40, tableTop);
    doc.text('Destinatário', 100, tableTop);
    doc.text('Polo', 250, tableTop);
    doc.text('Total', 400, tableTop);
    doc.text('Status', 500, tableTop);
    
    doc.moveTo(40, tableTop + 15).lineTo(550, tableTop + 15).stroke();
    
    let y = tableTop + 25;
    doc.font('Helvetica');

    pedidos.forEach(pedido => {
      const dataStr = new Date(pedido.created_at).toLocaleDateString('pt-BR');
      const destinatario = (pedido as any).aluno?.nome || (pedido as any).modulo_destino?.titulo || '—';
      const poloNome = (pedido as any).polo?.nome || '—';
      const totalStr = ((pedido.total_cents || 0) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      
      doc.text(dataStr, 40, y);
      doc.text(destinatario.substring(0, 30), 100, y);
      doc.text(poloNome.substring(0, 30), 250, y);
      doc.text(totalStr, 400, y);
      doc.text(pedido.status.toUpperCase(), 500, y);
      
      y += 20;

      if (y > 750) {
        doc.addPage();
        y = 50;
      }
    });

    const fileName = `pedidos-materiais-${Date.now()}.pdf`;
    const filePath = path.join(process.env.STORAGE_PATH || './storage', 'relatorios', fileName);
    
    // Garantir diretório
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);
    doc.end();

    return new Promise((resolve, reject) => {
      stream.on('finish', () => {
        // Obter URL pública ou apenas retornar o buffer
        resolve({ success: true, fileName, filePath });
      });
      stream.on('error', reject);
    });
  }
}
