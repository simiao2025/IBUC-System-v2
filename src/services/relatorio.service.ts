// ============================================
// IBUC System - Serviço de Relatórios e LGPD
// ============================================

import { api } from '../lib/api';

export const RelatoriosAPI = {
  gerarBoletim: (alunoId: string, periodo: string) => api.get(`/relatorios/boletim?aluno_id=${alunoId}&periodo=${periodo}`),
  historicoAluno: (alunoId: string, periodo?: string) => {
    const params = new URLSearchParams();
    params.append('aluno_id', alunoId);
    if (periodo) params.append('periodo', periodo);
    const query = params.toString();
    return api.get(`/relatorios/historico?${query}`);
  },
  estatisticasPorPolo: (periodo?: string) => {
    const params = new URLSearchParams();
    if (periodo) params.append('periodo', periodo);
    const query = params.toString();
    return api.get(`/relatorios/estatisticas-por-polo${query ? `?${query}` : ''}`);
  },
};

export const LgpdAPI = {
  exportar: (type: string, id: string) => api.get(`/lgpd/export/${type}/${id}`),
  anonymizar: (type: string, id: string) => api.post(`/lgpd/anonymize/${type}/${id}`),
};

export class RelatorioService {
  static async gerarBoletim(alunoId: string, periodo: string) {
    return RelatoriosAPI.gerarBoletim(alunoId, periodo);
  }

  static async historicoAluno(alunoId: string, periodo?: string) {
    return RelatoriosAPI.historicoAluno(alunoId, periodo);
  }

  static async estatisticasPorPolo(periodo?: string) {
    return RelatoriosAPI.estatisticasPorPolo(periodo);
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
