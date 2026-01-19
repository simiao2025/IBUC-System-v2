import { api, API_BASE_URL } from '@/shared/api';
import { BoletimFiltros, BoletimParams } from '../model/types';

export const studentReportsApi = {
  gerarBoletim: (params: BoletimParams) => {
    const searchParams = new URLSearchParams();
    searchParams.append('aluno_id', params.alunoId);
    searchParams.append('periodo', params.periodo);
    if (params.moduloId) searchParams.append('modulo_id', params.moduloId);
    if (params.turmaId) searchParams.append('turma_id', params.turmaId);
    return api.get(`/relatorios/boletim?${searchParams.toString()}`);
  },

  getDadosBoletim: (alunoId: string, moduloId: string) =>
    api.get(`/relatorios/boletim-dados?aluno_id=${alunoId}&modulo_id=${moduloId}`),

  gerarBoletimLote: (filtros: BoletimFiltros) =>
    api.post('/relatorios/boletim-lote', filtros),

  historicoAluno: (alunoId: string, periodo?: string) => {
    const params = new URLSearchParams();
    params.append('aluno_id', alunoId);
    if (periodo) params.append('periodo', periodo);
    return api.get(`/relatorios/historico?${params.toString()}`);
  },

  gerarHistoricoPdf: (alunoId: string) => 
    api.get(`/relatorios/historico-pdf?aluno_id=${alunoId}`),

  relatorioAtestadoMatricula: (alunoId: string) => 
    api.get(`/relatorios/atestado-matricula?aluno_id=${alunoId}`),

  // Boletins
  listBoletins: (alunoId: string) =>
    api.get<any[]>(`/relatorios/boletins?aluno_id=${alunoId}`),

  visualizeBoletimPDF: async (id: string) => {
    const token = sessionStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE_URL}/relatorios/boletim/${id}/view`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao carregar PDF do boletim');
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }
};
