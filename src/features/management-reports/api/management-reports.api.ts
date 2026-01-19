import { api } from '@/shared/api';
import { ManagementReportFiltros } from '../model/types';

export const managementReportsApi = {
  estatisticasPorPolo: (periodo?: string) => {
    const params = new URLSearchParams();
    if (periodo) params.append('periodo', periodo);
    const query = params.toString();
    return api.get(`/relatorios/estatisticas-por-polo${query ? `?${query}` : ''}`);
  },

  relatorioDracmas: (filtros: ManagementReportFiltros) => {
    const params = new URLSearchParams();
    Object.entries(filtros).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    return api.get(`/relatorios/dracmas?${params.toString()}`);
  },

  relatorioListaAlunos: (filtros: ManagementReportFiltros) => {
    const params = new URLSearchParams();
    Object.entries(filtros).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    return api.get(`/relatorios/lista-alunos?${params.toString()}`);
  },

  gerarListaAlunosPdf: (filtros: ManagementReportFiltros) => {
    const params = new URLSearchParams();
    Object.entries(filtros).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    return api.get(`/relatorios/lista-alunos-pdf?${params.toString()}`);
  },

  relatorioListaChamada: (turmaId: string) => 
    api.get(`/relatorios/lista-call?turma_id=${turmaId}`),

  relatorioConsolidadoFrequencia: (filtros: ManagementReportFiltros) => {
    const params = new URLSearchParams();
    Object.entries(filtros).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    return api.get(`/relatorios/consolidado-frequencia?${params.toString()}`);
  },

  relatorioInadimplencia: (filtros: ManagementReportFiltros) => {
    const params = new URLSearchParams();
    Object.entries(filtros).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    return api.get(`/relatorios/inadimplencia?${params.toString()}`);
  },
};
