// ============================================
// IBUC System - ServiÃ§o de MatrÃ­culas
// ============================================

import { api } from '@/shared/api';
import type { Matricula } from '@/types/database';

/**
 * Interface para criaÃ§Ã£o de matrÃ­cula
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
 * Interface para atualizaÃ§Ã£o de matrÃ­cula
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
 * ServiÃ§o de Gerenciamento de MatrÃ­culas
 * LocalizaÃ§Ã£o: src/features/enrollments/services/matricula.service.ts
 */
export const MatriculaService = {
    /**
     * Lista matrÃ­culas com filtros
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
     * Busca uma matrÃ­cula por ID
     */
    async buscarPorId(id: string): Promise<Matricula> {
        return api.get<Matricula>(`/matriculas/${id}`);
    },

    /**
     * Cria uma nova matrÃ­cula
     */
    async criar(data: CreateMatriculaDto): Promise<Matricula> {
        return api.post<Matricula>('/matriculas', data);
    },

    /**
     * Atualiza uma matrÃ­cula existente
     */
    async atualizar(id: string, data: UpdateMatriculaDto): Promise<Matricula> {
        return api.put<Matricula>(`/matriculas/${id}`, data);
    },

    /**
     * Deleta uma matrÃ­cula
     */
    async deletar(id: string): Promise<void> {
        await api.delete(`/matriculas/${id}`);
    },

    /**
     * Aprova uma matrÃ­cula pendente
     */
    async aprovar(id: string, data: { turma_id: string; observacoes?: string }): Promise<Matricula> {
        return api.post<Matricula>(`/matriculas/${id}/aprovar`, data);
    },

    /**
     * Rejeita uma matrÃ­cula pendente
     */
    async rejeitar(id: string, motivo: string): Promise<Matricula> {
        return api.post<Matricula>(`/matriculas/${id}/rejeitar`, { motivo_rejeicao: motivo });
    },

    /**
     * Lista documentos vinculados a uma matrÃ­cula
     */
    async listarPorMatricula(matriculaId: string): Promise<any> {
        return api.get(`/documentos/matriculas/${matriculaId}`);
    }
};

// Alias para compatibilidade
export const MatriculaAPI = MatriculaService;

// API de PrÃ©-MatrÃ­culas
export const PreMatriculasAPI = {
    listar: (filtros: { polo_id?: string } = {}) => {
        const params = new URLSearchParams();
        if (filtros.polo_id) params.append('polo_id', filtros.polo_id);
        const query = params.toString() ? `?${params.toString()}` : '';
        return api.get(`/pre-matriculas${query}`);
    },
    buscarPorId: (id: string) => api.get(`/pre-matriculas/${id}`),
    criar: (data: any) => api.post('/pre-matriculas', data),
    atualizar: (id: string, data: any) => api.put(`/pre-matriculas/${id}`, data),
    deletar: (id: string) => api.delete(`/pre-matriculas/${id}`),
    aprovar: (id: string, data: any) => api.post(`/pre-matriculas/${id}/aprovar`, data),
    rejeitar: (id: string, motivo: string) => api.post(`/pre-matriculas/${id}/rejeitar`, { motivo_rejeicao: motivo })
};
