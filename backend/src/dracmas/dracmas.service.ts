import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class DracmasService {
  constructor(private supabase: SupabaseService) { }

  async lancarLote(body: {
    turma_id: string;
    data: string;
    tipo: string;
    descricao?: string;
    registrado_por: string;
    transacoes: { aluno_id: string; quantidade: number; tipo?: string }[];
  }) {
    const { turma_id, data, tipo, descricao, registrado_por, transacoes } = body;

    if (!transacoes || transacoes.length === 0) {
      throw new Error('Lista de transações vazia');
    }

    // 1. Remove transações anteriores deste tipo para esta turma e data (evita duplicidade ao reenviar)
    // Se o tipo for 'AJUSTE', talvez devêssemos ter cuidado, mas como o frontend reenvia o estado atual da tela,
    // o comportamento correto é substituir.
    // O ideal seria filtrar também pelo 'tipo' para não apagar outros lançamentos do mesmo dia.
    // Assumindo que o 'tipo' venha preenchido (ex: 'presenca', 'assiduidade').

    if (tipo) {
      await this.supabase
        .getAdminClient()
        .from('dracmas_transacoes')
        .delete()
        .eq('turma_id', turma_id)
        .eq('data', data)
        .eq('tipo', tipo);
    }

    const rows = transacoes.map(t => ({
      aluno_id: t.aluno_id,
      turma_id,
      quantidade: t.quantidade,
      tipo: t.tipo || tipo,
      descricao,
      data,
      registrado_por,
    }));

    const { data: inserted, error } = await this.supabase
      .getAdminClient()
      .from('dracmas_transacoes')
      .insert(rows)
      .select();

    if (error) throw new BadRequestException(`Erro DB Drácmas Lote: ${error.message}`);
    return inserted;
  }

  async excluirLote(turmaId: string, data: string) {
    const { error } = await this.supabase
      .getAdminClient()
      .from('dracmas_transacoes')
      .delete()
      .eq('turma_id', turmaId)
      .eq('data', data); // Remove todas as transações desta turma nesta data

    if (error) throw new BadRequestException(`Erro ao excluir drácmas: ${error.message}`);
    return { success: true };
  }

  async excluirLoteAluno(turmaId: string, alunoId: string, data: string) {
    const { error } = await this.supabase
      .getAdminClient()
      .from('dracmas_transacoes')
      .delete()
      .eq('turma_id', turmaId)
      .eq('aluno_id', alunoId)
      .eq('data', data);

    if (error) throw new BadRequestException(`Erro ao excluir drácmas do aluno: ${error.message}`);
    return { success: true };
  }

  async saldoPorAluno(alunoId: string) {
    const { data, error } = await this.supabase
      .getAdminClient()
      .from('dracmas_transacoes')
      .select('quantidade')
      .eq('aluno_id', alunoId);

    if (error) throw new BadRequestException(`Erro DB Saldo: ${error.message}`);

    const saldo = (data || []).reduce((acc, row: any) => acc + (row.quantidade || 0), 0);
    return { aluno_id: alunoId, saldo };
  }

  async porAluno(alunoId: string, inicio?: string, fim?: string) {
    // 1. Buscar transações ativas
    let queryTransacoes = this.supabase
      .getAdminClient()
      .from('dracmas_transacoes')
      .select('*')
      .eq('aluno_id', alunoId);

    if (inicio) queryTransacoes = queryTransacoes.gte('data', inicio);
    if (fim) queryTransacoes = queryTransacoes.lte('data', fim);

    const { data: transacoes, error: errTp } = await queryTransacoes;
    if (errTp) throw new BadRequestException(`Erro DB Transacoes: ${errTp.message}`);

    // 2. Buscar histórico de resgates (dracmas antigas)
    let queryResgate = this.supabase
      .getAdminClient()
      .from('dracmas_resgate')
      .select('*')
      .eq('aluno_id', alunoId);

    if (inicio) queryResgate = queryResgate.gte('data', inicio);
    if (fim) queryResgate = queryResgate.lte('data', fim);

    const { data: resgates, error: errRes } = await queryResgate;
    if (errRes) throw new BadRequestException(`Erro DB Resgates: ${errRes.message}`);

    // 3. Unificar listas
    const todasTransacoes = [
      ...(transacoes || []),
      ...(resgates || []).map((r: any) => ({ ...r, is_resgate: true })) // Mark items from rescue table if needed
    ].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()); // Sort desc

    const saldo = (todasTransacoes || []).reduce((acc, row: any) => acc + (row.quantidade || 0), 0);

    return {
      aluno_id: alunoId,
      saldo,
      transacoes: todasTransacoes,
    };
  }

  async porTurma(turmaId: string, inicio?: string, fim?: string) {
    let query = this.supabase
      .getAdminClient()
      .from('dracmas_transacoes')
      .select('*')
      .eq('turma_id', turmaId)
      .order('data');

    if (inicio) query = query.gte('data', inicio);
    if (fim) query = query.lte('data', fim);

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    const transacoes = data || [];

    const porAluno: Record<string, { aluno_id: string; total_dracmas: number }> = {};

    transacoes.forEach((t: any) => {
      if (!porAluno[t.aluno_id]) {
        porAluno[t.aluno_id] = { aluno_id: t.aluno_id, total_dracmas: 0 };
      }
      porAluno[t.aluno_id].total_dracmas += t.quantidade || 0;
    });

    const totalTurma = transacoes.reduce((acc, t: any) => acc + (t.quantidade || 0), 0);

    return {
      turma_id: turmaId,
      totalTurma,
      resumoPorAluno: Object.values(porAluno),
      transacoes,
    };
  }

  async total(poloId?: string) {
    let query = this.supabase
      .getAdminClient()
      .from('dracmas_transacoes')
      .select('quantidade');

    // Se houver poloId, precisamos filtrar via join, mas faremos de forma mais robusta
    if (poloId) {
      // Usando query builder para filtrar por polo_id através da relação com turmas
      // Verificamos se o join 'turma!inner' funciona (padrão Supabase para filtrar por relação)
      query = query.select('quantidade, turma:turmas!inner(polo_id)').eq('turma.polo_id', poloId);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Erro na consulta de dracmas:', error);
      throw new Error(error.message);
    }

    const total = (data || []).reduce((acc, row: any) => acc + (row.quantidade || 0), 0);
    return { polo_id: poloId || null, total };
  }

  async listarCriterios() {
    const { data, error } = await this.supabase
      .getAdminClient()
      .from('dracmas_criterios')
      .select('*')
      .order('nome');

    if (error) throw new Error(error.message);
    return data || [];
  }

  async criarCriterio(body: {
    codigo: string;
    nome: string;
    descricao?: string;
    quantidade_padrao: number;
    ativo?: boolean;
  }) {
    const { data, error } = await this.supabase
      .getAdminClient()
      .from('dracmas_criterios')
      .insert({
        codigo: body.codigo,
        nome: body.nome,
        descricao: body.descricao || null,
        quantidade_padrao: body.quantidade_padrao,
        ativo: body.ativo !== undefined ? body.ativo : true,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async atualizarCriterio(
    id: string,
    body: { ativo?: boolean; quantidade_padrao?: number; nome?: string; descricao?: string },
  ) {
    const update: Record<string, any> = {};
    if (typeof body.ativo === 'boolean') update.ativo = body.ativo;
    if (typeof body.quantidade_padrao === 'number') update.quantidade_padrao = body.quantidade_padrao;
    if (typeof body.nome === 'string') update.nome = body.nome;
    if (typeof body.descricao === 'string') update.descricao = body.descricao;

    const { data, error } = await this.supabase
      .getAdminClient()
      .from('dracmas_criterios')
      .update(update)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async resgatar(body: { turma_id: string; aluno_id?: string; resgatado_por: string }) {
    const { turma_id, aluno_id, resgatado_por } = body;
    const client = this.supabase.getAdminClient();

    // 1. Buscar transações a serem resgatadas
    let query = client
      .from('dracmas_transacoes')
      .select('*')
      .eq('turma_id', turma_id);

    if (aluno_id) {
      query = query.eq('aluno_id', aluno_id);
    }

    const { data: transacoes, error: fetchError } = await query;

    if (fetchError) throw new BadRequestException(`Erro ao buscar transações para resgate: ${fetchError.message}`);
    if (!transacoes || transacoes.length === 0) {
      return { message: 'Nenhuma transação encontrada para resgate.', count: 0 };
    }

    // 2. Preparar dados para inserção na tabela de resgate
    const resgateRows = transacoes.map(t => ({
      original_id: t.id,
      aluno_id: t.aluno_id,
      turma_id: t.turma_id,
      quantidade: t.quantidade,
      tipo: t.tipo,
      descricao: t.descricao,
      data: t.data,
      registrado_por: t.registrado_por,
      created_at: t.created_at,
      resgatado_por,
      data_resgate: new Date().toISOString()
    }));

    // 3. Inserir na tabela dracmas_resgate
    const { error: insertError } = await client
      .from('dracmas_resgate')
      .insert(resgateRows);

    if (insertError) throw new BadRequestException(`Erro ao registrar resgate: ${insertError.message}`);

    // 4. Deletar da tabela dracmas_transacoes
    // Para segurança, deletar pelos IDs que acabamos de ler
    const ids = transacoes.map(t => t.id);
    const { error: deleteError } = await client
      .from('dracmas_transacoes')
      .delete()
      .in('id', ids);

    if (deleteError) {
      // Se falhar o delete, ideal seria rollback do insert, mas via client HTTP não temos transação real fácil.
      // Logamos erro crítico.
      console.error('CRITICAL: Failed to delete rescued dracmas transactions', ids, deleteError);
      throw new BadRequestException(`Erro ao remover transações originais (mas cópia foi feita): ${deleteError.message}`);
    }

    return {
      message: 'Resgate realizado com sucesso.',
      count: ids.length,
      total_resgatado: transacoes.reduce((acc, t) => acc + (t.quantidade || 0), 0)
    };
  }
}
