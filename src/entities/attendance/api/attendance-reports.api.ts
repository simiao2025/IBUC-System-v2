import { api } from '@/shared/api';

export const attendanceReportsApi = {
  relatorioListaChamada: (turmaId: string) => api.get(`/relatorios/lista-chamada?turma_id=${turmaId}`),

  relatorioConsolidadoFrequencia: (filtros: any) => {
    const params = new URLSearchParams();
    Object.entries(filtros).forEach(([key, value]) => {
      if (value) params.append(key, value as string);
    });
    return api.get(`/relatorios/consolidado-frequencia?${params.toString()}`);
  },
};
