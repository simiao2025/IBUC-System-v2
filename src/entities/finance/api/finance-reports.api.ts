import { api } from '@/shared/api';

export const financeReportsApi = {
  relatorioDracmas: (filtros: any) => {
    const params = new URLSearchParams();
    Object.entries(filtros).forEach(([key, value]) => {
      if (value) params.append(key, value as string);
    });
    return api.get(`/relatorios/dracmas?${params.toString()}`);
  },

  relatorioInadimplencia: (filtros: any) => {
    const params = new URLSearchParams();
    Object.entries(filtros).forEach(([key, value]) => {
      if (value) params.append(key, value as string);
    });
    return api.get(`/relatorios/inadimplencia?${params.toString()}`);
  },
};
