import { api } from '@/shared/api';

export const diretoriaApi = {
  // Diretoria Geral
  criarDiretoriaGeral: (data: unknown) => api.post('/diretoria/geral', data),
  listarDiretoriaGeral: (params?: { ativo?: boolean }) => {
    const isAtivo = typeof params === 'boolean' ? params : (params?.ativo ?? true);
    const query = `?ativo=${isAtivo}`;
    return api.get<any[]>(`/diretoria/geral${query}`);
  },
  buscarGeralPorId: (id: string) => api.get(`/diretoria/geral/${id}`),
  atualizarDiretoriaGeral: (id: string, data: unknown) => api.put(`/diretoria/geral/${id}`, data),
  desativarGeral: (id: string) => api.put(`/diretoria/geral/${id}/desativar`),
  
  // Diretoria Polo
  criarDiretoriaPolo: (data: { polo_id: string } & any) => api.post(`/diretoria/polo/${data.polo_id}`, data),
  listarDiretoriaPolo: (poloId: string, ativo?: boolean) => {
    const searchParams = new URLSearchParams();
    if (poloId) searchParams.append('polo_id', poloId);
    if (ativo !== undefined) searchParams.append('ativo', String(ativo));
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return api.get<any[]>(`/diretoria/polo${query}`);
  },
  buscarPoloPorId: (id: string) => api.get(`/diretoria/polo/${id}`),
  atualizarDiretoriaPolo: (id: string, data: unknown) => api.put(`/diretoria/polo/${id}`, data),
  desativarPolo: (id: string) => api.put(`/diretoria/polo/${id}/desativar`),
};
