import { api } from '@/shared/api';

export const settingsApi = {
  list: () => api.get<any[]>('/configuracoes'),

  getByKey: (key: string) => api.get<any>(`/configuracoes/${key}`),

  update: (key: string, value: any) => api.put<any>(`/configuracoes/${key}`, { valor: value }),

  getSettingsAsObject: async () => {
    try {
      const token = sessionStorage.getItem('auth_token');
      const endpoint = token ? '/configuracoes' : '/configuracoes/publicas';
      const data = await api.get<any[]>(endpoint);
      if (Array.isArray(data)) {
        return data.reduce((acc: any, curr: any) => {
          acc[curr.chave] = curr.valor;
          return acc;
        }, {});
      }
      return {};
    } catch (error: any) {
      if (error.message?.toLowerCase().includes('unauthorized')) {
        const dataPublica = await api.get<any[]>('/configuracoes/publicas');
        if (Array.isArray(dataPublica)) {
          return dataPublica.reduce((acc: any, curr: any) => {
            acc[curr.chave] = curr.valor;
            return acc;
          }, {});
        }
      }
      console.error('Error fetching settings:', error);
      return {};
    }
  },

  saveBatch: async (configs: Record<string, any>) => {
    const promises = Object.entries(configs).map(([key, value]) =>
      api.put(`/configuracoes/${key}`, { valor: value })
    );
    return Promise.all(promises);
  }
};
