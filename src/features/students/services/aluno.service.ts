// ============================================
// IBUC System - Serviço de Alunos
// ============================================

import { api } from '../../../lib/api';
import type { Aluno, Matricula } from '../../../types/database';

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

        // Placeholder mantido da versão anterior, deve ser implementado de fato na feature de Matrículas
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
        // A lógica de efetivação deve ser movida para o MatriculaService no futuro.
        // Por enquanto, mantemos a assinatura compatível para não quebrar referências.
        const matricula = {} as Matricula;
        if (!matricula) {
            throw new Error('Matrícula não encontrada');
        }
        const matriculaAtualizada = {} as Matricula;

        return matriculaAtualizada;
    }

    static async rejeitarMatricula(
        _matriculaId: string,
        _motivoRecusa: string,
        _approvedBy: string
    ): Promise<Matricula> {
        return {} as Matricula;
    }
}
