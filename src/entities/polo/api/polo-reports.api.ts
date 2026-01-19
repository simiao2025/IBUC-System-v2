import { api } from '@/shared/api';

export const PoloReportsAPI = {
  estatisticasPorPolo: (periodo?: string) => {
    const params = new URLSearchParams();
    if (periodo) params.append('periodo', periodo);
    const query = params.toString();
    return api.get(`/relatorios/estatisticas-por-polo${query ? `?${query}` : ''}`);
  },
};
