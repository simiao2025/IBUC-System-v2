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

    const rows = transacoes.map(t => ({
      aluno_id: t.aluno_id,
      turma_id,
      quantidade: t.quantidade,
      tipo: t.tipo || tipo, // Usa o tipo específico da transação ou o do lote
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
    let query = this.supabase
      .getAdminClient()
      .from('dracmas_transacoes')
      .select('*')
      .eq('aluno_id', alunoId)
      .order('data');

    if (inicio) query = query.gte('data', inicio);
    if (fim) query = query.lte('data', fim);

    const { data, error } = await query;
    if (error) throw new BadRequestException(`Erro DB Por Aluno: ${error.message}`);

    const saldo = (data || []).reduce((acc, row: any) => acc + (row.quantidade || 0), 0);

    return {
      aluno_id: alunoId,
      saldo,
      transacoes: data || [],
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
}
