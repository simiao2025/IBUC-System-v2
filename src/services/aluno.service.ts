// ============================================
// IBUC System - Serviço de Alunos
// ============================================

import type { Aluno, Matricula, StatusMatricula } from '../types/database';
import { AlunosAPI, MatriculaAPI } from '../lib/api';

export class AlunoService {
  /**
   * Lista alunos (respeitando RLS por polo)
   */
  static async listarAlunos(filtros: {
    poloId?: string;
    status?: string;
    search?: string;
  } = {}): Promise<any[]> {
    const filtrosApi: any = {};
    if (filtros.poloId) filtrosApi.polo_id = filtros.poloId;
    if (filtros.status) filtrosApi.status = filtros.status;
    if (filtros.search) filtrosApi.search = filtros.search;
    const data = await AlunosAPI.listar(filtrosApi);
    return data as any[];
  }

  /**
   * Deleta um aluno
   */
  static async deletarAluno(id: string): Promise<void> {
    await AlunosAPI.deletar(id);
  }

  /**
   * Busca aluno por ID
   */
  static async buscarAlunoPorId(id: string): Promise<any | null> {
    const data = await AlunosAPI.buscarPorId(id);
    return data as any;
  }

  /**
   * Cria um novo aluno
   */
  static async criarAluno(aluno: Omit<Aluno, 'id' | 'data_criacao' | 'data_atualizacao'>): Promise<Aluno> {
    const data = await AlunosAPI.criar(aluno);
    return data as Aluno;
  }

  /**
   * Atualiza um aluno
   */
  static async atualizarAluno(id: string, updates: Partial<Aluno>): Promise<Aluno> {
    const data = await AlunosAPI.atualizar(id, updates);
    return data as Aluno;
  }

  /**
   * Cria uma pré-matrícula (matrícula online)
   */
  static async criarPreMatricula(
    aluno: Omit<Aluno, 'id' | 'data_criacao' | 'data_atualizacao'>,
    matricula: Omit<Matricula, 'id' | 'created_at' | 'protocolo'>
  ): Promise<{ aluno: Aluno; matricula: Matricula }> {
    // Criar aluno com status pendente via API
    const alunoCriado = await this.criarAluno({
      ...aluno,
      status: 'pendente',
    });

    // Criar matrícula com status pendente via API
    const matriculaCriada = await MatriculaAPI.criar({
      ...matricula,
      aluno_id: alunoCriado.id,
      status: 'pendente',
      tipo: 'online',
    });

    return {
      aluno: alunoCriado,
      matricula: matriculaCriada as Matricula,
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
    // Buscar matrícula atual via API
    const matricula = (await MatriculaAPI.buscarPorId(matriculaId)) as Matricula;

    if (!matricula) {
      throw new Error('Matrícula não encontrada');
    }

    // Atualizar matrícula para ativa via API genérica de aprovação
    const matriculaAtualizada = await MatriculaAPI.aprovar(matriculaId, {
      approved_by: approvedBy,
    });

    // Atualizar status do aluno via API de alunos
    await this.atualizarAluno(matricula.aluno_id, {
      status: 'ativo',
      turma_id: turmaId || (matricula as any).turma_id,
    });

    return matriculaAtualizada as Matricula;
  }

  /**
   * Rejeita uma matrícula
   */
  static async rejeitarMatricula(
    matriculaId: string,
    motivoRecusa: string,
    approvedBy: string
  ): Promise<Matricula> {
    const data = await MatriculaAPI.recusar(matriculaId, {
      motivo: motivoRecusa,
      user_id: approvedBy,
    });
    return data as Matricula;
  }
}
