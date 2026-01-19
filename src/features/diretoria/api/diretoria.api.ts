import { api } from '@/shared/api';

export const diretoriaApi = {
  // Diretoria Geral
  criarGeral: (data: unknown) => api.post('/diretoria/geral', data),
  listarGeral: (params?: { ativo?: boolean }) => {
    const query = params?.ativo !== undefined ? `?ativo=${params.ativo}` : '';
    return api.get<any[]>(`/diretoria/geral${query}`);
  },
  buscarGeralPorId: (id: string) => api.get(`/diretoria/geral/${id}`),
  atualizarGeral: (id: string, data: unknown) => api.put(`/diretoria/geral/${id}`, data),
  desativarGeral: (id: string) => api.put(`/diretoria/geral/${id}/desativar`),
  
  // Diretoria Polo
  criarPolo: (data: { polo_id: string } & any) => api.post(`/diretoria/polo/${data.polo_id}`, data),
  listarPolo: (params?: { polo_id?: string, ativo?: boolean }) => {
    const searchParams = new URLSearchParams();
    if (params?.polo_id) searchParams.append('polo_id', params.polo_id);
    if (params?.ativo !== undefined) searchParams.append('ativo', String(params.ativo));
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return api.get<any[]>(`/diretoria/polo${query}`);
  },
  buscarPoloPorId: (id: string) => api.get(`/diretoria/polo/${id}`),
  atualizarPolo: (id: string, data: unknown) => api.put(`/diretoria/polo/${id}`, data),
  desativarPolo: (id: string) => api.put(`/diretoria/polo/${id}/desativar`),
};
