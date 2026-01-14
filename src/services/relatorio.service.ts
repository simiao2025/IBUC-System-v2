// ============================================
// IBUC System - Serviço de Relatórios e LGPD
// ============================================

import { api } from '../lib/api';

export const RelatoriosAPI = {
  gerarBoletim: (alunoId: string, periodo: string, moduloId?: string, turmaId?: string) => {
    const params = new URLSearchParams();
    params.append('aluno_id', alunoId);
    params.append('periodo', periodo);
    if (moduloId) params.append('modulo_id', moduloId);
    if (turmaId) params.append('turma_id', turmaId);
    return api.get(`/relatorios/boletim?${params.toString()}`);
  },
  getDadosBoletim: async (alunoId: string, moduloId: string) => {
    const res = await api.get(`/relatorios/boletim-dados?aluno_id=${alunoId}&modulo_id=${moduloId}`);
    return res;
  },
  gerarBoletimLote: async (filtros: { polo_id?: string; turma_id?: string; modulo_id: string; aluno_id?: string; aluno_ids?: string[] }) => {
    const res = await api.post('/relatorios/boletim-lote', filtros);
    return res;
  },
  getJobStatus: async (jobId: string) => {
    const res = await api.get(`/workers/job/${jobId}`);
    return res;
  },
  historicoAluno: (alunoId: string, periodo?: string) => {
    const params = new URLSearchParams();
    params.append('aluno_id', alunoId);
    if (periodo) params.append('periodo', periodo);
    const query = params.toString();
    return api.get(`/relatorios/historico?${query}`);
  },
  gerarHistoricoPdf: (alunoId: string) => api.get(`/relatorios/historico-pdf?aluno_id=${alunoId}`),
  estatisticasPorPolo: (periodo?: string) => {
    const params = new URLSearchParams();
    if (periodo) params.append('periodo', periodo);
    const query = params.toString();
    return api.get(`/relatorios/estatisticas-por-polo${query ? `?${query}` : ''}`);
  },
  relatorioDracmas: (filtros: any) => {
    const params = new URLSearchParams();
    Object.entries(filtros).forEach(([key, value]) => {
      if (value) params.append(key, value as string);
    });
    return api.get(`/relatorios/dracmas?${params.toString()}`);
  },
  relatorioListaAlunos: (filtros: any) => {
    const params = new URLSearchParams();
    Object.entries(filtros).forEach(([key, value]) => {
      if (value) params.append(key, value as string);
    });
    return api.get(`/relatorios/lista-alunos?${params.toString()}`);
  },
  gerarListaAlunosPdf: (filtros: any) => {
    const params = new URLSearchParams();
    Object.entries(filtros).forEach(([key, value]) => {
      if (value) params.append(key, value as string);
    });
    return api.get(`/relatorios/lista-alunos-pdf?${params.toString()}`);
  },
  relatorioAtestadoMatricula: (alunoId: string) => api.get(`/relatorios/atestado-matricula?aluno_id=${alunoId}`),
  relatorioListaChamada: (turmaId: string) => api.get(`/relatorios/lista-chamada?turma_id=${turmaId}`),
  relatorioConsolidadoFrequencia: (filtros: any) => {
    const params = new URLSearchParams();
    Object.entries(filtros).forEach(([key, value]) => {
      if (value) params.append(key, value as string);
    });
    return api.get(`/relatorios/consolidado-frequencia?${params.toString()}`);
  },
  relatorioInadimplencia: (filtros: any) => {
    const params = new URLSearchParams();
    Object.entries(filtros).forEach(([key, value]) => {
      if (value) params.append(key, value as string);
    });
    return api.get(`/relatorios/inadimplencia?${params.toString()}`);
  },
  gerarCertificado: (alunoId: string, nivelId: string) => api.get(`/relatorios/certificado?aluno_id=${alunoId}&nivel_id=${nivelId}`),
};

export const LgpdAPI = {
  exportar: (type: string, id: string) => api.get(`/lgpd/export/${type}/${id}`),
  anonymizar: (type: string, id: string) => api.post(`/lgpd/anonymize/${type}/${id}`),
};

export class RelatorioService {
  static async gerarBoletim(alunoId: string, periodo: string, moduloId?: string, turmaId?: string) {
    return RelatoriosAPI.gerarBoletim(alunoId, periodo, moduloId, turmaId);
  }

  static async getDadosBoletim(alunoId: string, moduloId: string) {
    return RelatoriosAPI.getDadosBoletim(alunoId, moduloId);
  }

  static async gerarBoletimLote(filtros: { polo_id?: string; turma_id?: string; modulo_id: string; aluno_id?: string; aluno_ids?: string[] }) {
    return RelatoriosAPI.gerarBoletimLote(filtros);
  }

  static async getJobStatus(jobId: string) {
    return RelatoriosAPI.getJobStatus(jobId);
  }

  static async historicoAluno(alunoId: string, periodo?: string) {
    return RelatoriosAPI.historicoAluno(alunoId, periodo);
  }

  static async gerarHistoricoPdf(alunoId: string) {
    const res = await RelatoriosAPI.gerarHistoricoPdf(alunoId);
    return res;
  }

  static async estatisticasPorPolo(periodo?: string) {
    return RelatoriosAPI.estatisticasPorPolo(periodo);
  }

  static async relatorioDracmas(filtros: any) {
    return RelatoriosAPI.relatorioDracmas(filtros);
  }

  static async relatorioListaAlunos(filtros: any) {
    return RelatoriosAPI.relatorioListaAlunos(filtros);
  }

  static async gerarListaAlunosPdf(filtros: any) {
    return RelatoriosAPI.gerarListaAlunosPdf(filtros);
  }

  static async relatorioAtestadoMatricula(alunoId: string) {
    return RelatoriosAPI.relatorioAtestadoMatricula(alunoId);
  }

  static async relatorioListaChamada(turmaId: string) {
    return RelatoriosAPI.relatorioListaChamada(turmaId);
  }

  static async relatorioConsolidadoFrequencia(filtros: any) {
    return RelatoriosAPI.relatorioConsolidadoFrequencia(filtros);
  }

  static async relatorioInadimplencia(filtros: any) {
    return RelatoriosAPI.relatorioInadimplencia(filtros);
  }

  static async gerarCertificado(alunoId: string, nivelId: string) {
    return RelatoriosAPI.gerarCertificado(alunoId, nivelId);
  }
}

export class LgpdService {
  static async exportar(type: string, id: string) {
    return LgpdAPI.exportar(type, id);
  }

  static async anonymizar(type: string, id: string) {
    return LgpdAPI.anonymizar(type, id);
  }
}
