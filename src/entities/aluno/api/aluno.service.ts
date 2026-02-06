// ============================================
// IBUC System - Serviço de Alunos
// ============================================

import { api } from '@/shared/api/api';
import type { Aluno, Matricula } from '@/types/database';
// import { ApiError, AppError } from '../lib/errors';

export interface AlunoFiltros {
  polo_id?: string;
  status?: string;
  search?: string;
  turma_id?: string;
}

export type AlunoCreateDto = Omit<Aluno, 'id' | 'data_criacao' | 'data_atualizacao'>;
export type AlunoUpdateDto = Partial<Aluno>;

export const AlunosAPI = {
  listar: (params?: AlunoFiltros) => {
    const searchParams = new URLSearchParams();
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value) searchParams.append(key, value as string);
      }
    }
    const query = searchParams.toString();
    return api.get<Aluno[]>(`/alunos${query ? `?${query}` : ''}`);
  },
  buscarPorId: (id: string) => api.get<Aluno>(`/alunos/${id}`),
  criar: (data: AlunoCreateDto) => api.post<Aluno>('/alunos', data),
  atualizar: (id: string, data: AlunoUpdateDto) => api.put<Aluno>(`/alunos/${id}`, data),
  deletar: (id: string) => api.delete<void>(`/alunos/${id}`),
  buscarHistorico: (id: string) => api.get<any[]>(`/alunos/${id}/historico-modulos`),
  transferir: (id: string, dto: { polo_destino_id: string; motivo: string; observacoes?: string }) => 
    api.post<{ message: string; aluno: Aluno; polo_destino: any }>(`/alunos/${id}/transferir`, dto),
  buscarHistoricoTransferencias: (id: string) => 
    api.get<any[]>(`/alunos/${id}/historico-transferencias`),
};

export class AlunoService {
  static async listarAlunos(filtros: {
    poloId?: string;
    status?: string;
    search?: string;
  } = {}): Promise<Aluno[]> {
    const filtrosApi: AlunoFiltros = {};
    if (filtros.poloId) filtrosApi.polo_id = filtros.poloId;
    if (filtros.status) filtrosApi.status = filtros.status;
    if (filtros.search) filtrosApi.search = filtros.search;
    return AlunosAPI.listar(filtrosApi);
  }

  static async deletarAluno(id: string): Promise<void> {
    await AlunosAPI.deletar(id);
  }

  static async buscarAlunoPorId(id: string): Promise<Aluno | null> {
    return AlunosAPI.buscarPorId(id);
  }

  static async criarAluno(aluno: AlunoCreateDto): Promise<Aluno> {
    return AlunosAPI.criar(aluno);
  }

  static async atualizarAluno(id: string, updates: AlunoUpdateDto): Promise<Aluno> {
    return AlunosAPI.atualizar(id, updates);
  }

  static async buscarHistoricoModulos(id: string): Promise<any[]> {
    return AlunosAPI.buscarHistorico(id);
  }

  static async criarPreMatricula(
    aluno: Omit<Aluno, 'id' | 'data_criacao' | 'data_atualizacao'>,
    _matricula: Omit<Matricula, 'id' | 'created_at' | 'protocolo'>
  ): Promise<{ aluno: Aluno; matricula: Matricula }> {
    const alunoCriado = await this.criarAluno({
      ...aluno,
      status: 'pendente',
    });

    // Placeholder
    const matriculaCriada = {} as Matricula;

    return {
      aluno: alunoCriado,
      matricula: matriculaCriada,
    };
  }

  static async efetivarMatricula(
    _matriculaId: string,
    _approvedBy: string,
    _turmaId?: string
  ): Promise<Matricula> {
    // Placeholder logic replacing MatriculaAPI calls
    const matricula = {} as Matricula; 
    if (!matricula) {
      throw new Error('Matrícula não encontrada');
    }
    const matriculaAtualizada = {} as Matricula;

    // We can't update aluno without real matricula data, but let's assume we can for now or remove it
    // await this.atualizarAluno(matricula.aluno_id, { status: 'ativo' ... });

    return matriculaAtualizada;
  }

  static async transferirAluno(
    id: string,
    poloDestinoId: string,
    motivo: string,
    observacoes?: string
  ): Promise<{ message: string; aluno: Aluno; polo_destino: any }> {
    return AlunosAPI.transferir(id, {
      polo_destino_id: poloDestinoId,
      motivo,
      observacoes
    });
  }

  static async buscarHistoricoTransferencias(id: string): Promise<any[]> {
    return AlunosAPI.buscarHistoricoTransferencias(id);
  }

  static async rejeitarMatricula(
    _matriculaId: string,
    _motivoRecusa: string,
    _approvedBy: string
  ): Promise<Matricula> {
    return {} as Matricula;
  }
}

export default AlunosAPI;
