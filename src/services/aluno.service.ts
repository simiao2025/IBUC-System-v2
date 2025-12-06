// ============================================
// IBUC System - Serviço de Alunos
// ============================================

import { supabase } from '../lib/supabase';
import type { Aluno, Matricula, StatusMatricula } from '../types/database';

export class AlunoService {
  /**
   * Lista alunos (respeitando RLS por polo)
   */
  static async listarAlunos(poloId?: string, status?: string): Promise<Aluno[]> {
    let query = supabase.from('alunos').select('*');

    if (poloId) {
      query = query.eq('polo_id', poloId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('nome');

    if (error) {
      console.error('Erro ao listar alunos:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Busca aluno por ID
   */
  static async buscarAlunoPorId(id: string): Promise<Aluno | null> {
    const { data, error } = await supabase
      .from('alunos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar aluno:', error);
      throw error;
    }

    return data;
  }

  /**
   * Cria um novo aluno
   */
  static async criarAluno(aluno: Omit<Aluno, 'id' | 'data_criacao' | 'data_atualizacao'>): Promise<Aluno> {
    const { data, error } = await supabase
      .from('alunos')
      .insert(aluno)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar aluno:', error);
      throw error;
    }

    return data;
  }

  /**
   * Atualiza um aluno
   */
  static async atualizarAluno(id: string, updates: Partial<Aluno>): Promise<Aluno> {
    const { data, error } = await supabase
      .from('alunos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar aluno:', error);
      throw error;
    }

    return data;
  }

  /**
   * Cria uma pré-matrícula (matrícula online)
   */
  static async criarPreMatricula(
    aluno: Omit<Aluno, 'id' | 'data_criacao' | 'data_atualizacao'>,
    matricula: Omit<Matricula, 'id' | 'created_at' | 'protocolo'>
  ): Promise<{ aluno: Aluno; matricula: Matricula }> {
    // Criar aluno com status pendente
    const alunoCriado = await this.criarAluno({
      ...aluno,
      status: 'pendente',
    });

    // Criar matrícula com status pendente
    const { data: matriculaData, error: matriculaError } = await supabase
      .from('matriculas')
      .insert({
        ...matricula,
        aluno_id: alunoCriado.id,
        status: 'pendente',
        tipo: 'online',
      })
      .select()
      .single();

    if (matriculaError) {
      console.error('Erro ao criar pré-matrícula:', matriculaError);
      throw matriculaError;
    }

    return {
      aluno: alunoCriado,
      matricula: matriculaData,
    };
  }

  /**
   * Efetiva uma matrícula (aprova pré-matrícula)
   */
  static async efetivarMatricula(
    matriculaId: string,
    approvedBy: string,
    turmaId?: string
  ): Promise<Matricula> {
    const { data: matricula, error: matriculaError } = await supabase
      .from('matriculas')
      .select('*')
      .eq('id', matriculaId)
      .single();

    if (matriculaError || !matricula) {
      throw new Error('Matrícula não encontrada');
    }

    // Atualizar matrícula
    const { data: matriculaAtualizada, error: updateError } = await supabase
      .from('matriculas')
      .update({
        status: 'ativa',
        approved_by: approvedBy,
        approved_at: new Date().toISOString(),
        turma_id: turmaId || matricula.turma_id,
      })
      .eq('id', matriculaId)
      .select()
      .single();

    if (updateError) {
      console.error('Erro ao efetivar matrícula:', updateError);
      throw updateError;
    }

    // Atualizar status do aluno
    await this.atualizarAluno(matricula.aluno_id, {
      status: 'ativo',
      turma_id: turmaId || matricula.turma_id,
    });

    return matriculaAtualizada;
  }

  /**
   * Rejeita uma matrícula
   */
  static async rejeitarMatricula(
    matriculaId: string,
    motivoRecusa: string,
    approvedBy: string
  ): Promise<Matricula> {
    const { data, error } = await supabase
      .from('matriculas')
      .update({
        status: 'recusada',
        motivo_recusa: motivoRecusa,
        approved_by: approvedBy,
        approved_at: new Date().toISOString(),
      })
      .eq('id', matriculaId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao rejeitar matrícula:', error);
      throw error;
    }

    return data;
  }
}

