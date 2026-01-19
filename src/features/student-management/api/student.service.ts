import { studentApi, StudentReportsAPI } from '@/entities/student';

// Bridge types
export interface AlunoFiltros {
    polo_id?: string;
    status?: string;
    search?: string;
    turma_id?: string;
}

// Aliases for compatibility
export const AlunosAPI = {
    listar: (params?: AlunoFiltros) => studentApi.list(params),
    buscarPorId: (id: string) => studentApi.getById(id),
    atualizar: (id: string, data: any) => studentApi.update(id, data),
    buscarHistorico: (id: string) => StudentReportsAPI.historicoAluno(id),
};

export const AlunoService = {
    listarAlunos: (filtros: any) => studentApi.list(filtros),
    atualizarAluno: (id: string, data: any) => studentApi.update(id, data),
    buscarHistoricoModulos: (id: string) => StudentReportsAPI.historicoAluno(id),
    buscarAlunoPorId: (id: string) => studentApi.getById(id),
    criarAluno: (data: any) => studentApi.create(data),
};
