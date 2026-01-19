import { api } from '@/shared/api';
import type { Polo } from '../model/types';

export const poloApi = {
  create: (data: unknown) => api.post<Polo>('/polos', data),
  
  list: async (active?: boolean): Promise<Polo[]> => {
    const query = active !== undefined ? `?ativo=${active}` : '';
    return api.get<Polo[]>(`/polos${query}`);
  },
  
  getById: (id: string) => api.get<Polo>(`/polos/${id}`),
  
  getByCode: (codigo: string) => api.get<Polo>(`/polos/codigo/${codigo}`),
  
  update: (id: string, data: unknown) => api.put<Polo>(`/polos/${id}`, data),
  
  delete: (id: string) => api.delete<void>(`/polos/${id}`),

  listByLocation: async (cidade?: string, cep?: string): Promise<Polo[]> => {
    const polos = await poloApi.list();
    return polos.filter(polo => {
      const endereco: any = polo.endereco || {};
      const matchCidade = cidade ? endereco.cidade === cidade : true;
      const matchCep = cep ? endereco.cep === cep : true;
      return matchCidade && matchCep;
    });
  },

  // Diretoria Geral
  listDirectoryGeral: (active?: boolean) => {
    const query = active !== undefined ? `?ativo=${active}` : '';
    return api.get<any[]>(`/diretoria/geral${query}`);
  },
  createDirectoryGeral: (data: any) => api.post('/diretoria/geral', data),
  getDirectoryGeralById: (id: string) => api.get(`/diretoria/geral/${id}`),
  updateDirectoryGeral: (id: string, data: any) => api.put(`/diretoria/geral/${id}`, data),
  deactivateDirectoryGeral: (id: string) => api.put(`/diretoria/geral/${id}/desativar`),

  // Diretoria Polo
  listDirectoryPolo: (poloId?: string, active?: boolean) => {
    const params = new URLSearchParams();
    if (poloId) params.append('polo_id', poloId);
    if (active !== undefined) params.append('ativo', String(active));
    const query = params.toString() ? `?${params.toString()}` : '';
    return api.get<any[]>(`/diretoria/polo${query}`);
  },
  createDirectoryPolo: (poloId: string, data: any) => api.post(`/diretoria/polo/${poloId}`, data),
  getDirectoryPoloById: (id: string) => api.get(`/diretoria/polo/${id}`),
  updateDirectoryPolo: (id: string, data: any) => api.put(`/diretoria/polo/${id}`, data),
  deactivateDirectoryPolo: (id: string) => api.put(`/diretoria/polo/${id}/desativar`),
  
  // Aliases for backward compatibility
  listar: async (active?: boolean) => poloApi.list(active),
};
