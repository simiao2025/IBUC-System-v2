// ============================================
// IBUC System - Serviço de Matrículas
// ============================================

import { api } from '../../../lib/api';
import type { Matricula } from '../../../types/database';

/**
 * Interface para criação de matrícula
 */
export interface CreateMatriculaDto {
    aluno_id: string;
    turma_id?: string;
    polo_id?: string;
    nivel_id?: string;
    status: 'pendente' | 'ativa' | 'cancelada' | 'concluida';
    data_matricula?: string;
    observacoes?: string;
}

/**
 * Interface para atualização de matrícula
 */
export interface UpdateMatriculaDto {
    turma_id?: string;
    polo_id?: string;
    status?: string;
    observacoes?: string;
}

/**
 * Interface para filtros de listagem
 */
export interface MatriculaFiltros {
    polo_id?: string;
    status?: string;
    turma_id?: string;
    aluno_id?: string;
    search?: string;
}

/**
 * Serviço de Gerenciamento de Matrículas
 * Localização: src/features/enrollments/services/matricula.service.ts
 */
export const MatriculaService = {
    /**
     * Lista matrículas com filtros
     */
    async listar(filtros: MatriculaFiltros = {}): Promise<Matricula[]> {
        const params = new URLSearchParams();
        if (filtros.polo_id) params.append('polo_id', filtros.polo_id);
        if (filtros.status) params.append('status', filtros.status);
        if (filtros.turma_id) params.append('turma_id', filtros.turma_id);
        if (filtros.aluno_id) params.append('aluno_id', filtros.aluno_id);
        if (filtros.search) params.append('search', filtros.search);

        const query = params.toString() ? `?${params.toString()}` : '';
        return api.get<Matricula[]>(`/matriculas${query}`);
    },

    /**
     * Busca uma matrícula por ID
     */
    async buscarPorId(id: string): Promise<Matricula> {
        return api.get<Matricula>(`/matriculas/${id}`);
    },

    /**
     * Cria uma nova matrícula
     */
    async criar(data: CreateMatriculaDto): Promise<Matricula> {
        return api.post<Matricula>('/matriculas', data);
    },

    /**
     * Atualiza uma matrícula existente
     */
    async atualizar(id: string, data: UpdateMatriculaDto): Promise<Matricula> {
        return api.put<Matricula>(`/matriculas/${id}`, data);
    },

    /**
     * Deleta uma matrícula
     */
    async deletar(id: string): Promise<void> {
        await api.delete(`/matriculas/${id}`);
    },

    /**
     * Aprova uma matrícula pendente
     */
    async aprovar(id: string, data: { turma_id: string; observacoes?: string }): Promise<Matricula> {
        return api.post<Matricula>(`/matriculas/${id}/aprovar`, data);
    },

    /**
     * Rejeita uma matrícula pendente
     */
    async rejeitar(id: string, motivo: string): Promise<Matricula> {
        return api.post<Matricula>(`/matriculas/${id}/rejeitar`, { motivo_rejeicao: motivo });
    }
};
