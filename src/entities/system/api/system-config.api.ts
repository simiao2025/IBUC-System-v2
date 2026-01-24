import { api } from '@/shared/api';

export const systemConfigApi = {
  listAll: () => api.get<any[]>('/configuracoes'),

  getByKey: (chave: string) => api.get<any>(`/configuracoes/${chave}`),

  update: (chave: string, valor: any) => api.put<any>(`/configuracoes/${chave}`, { valor }),

  /**
   * Fetch all configurations as a key:value object.
   */
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
    } catch (error) {
      try {
        const errMsg = (error as any)?.message || '';
        if (typeof errMsg === 'string' && errMsg.toLowerCase().includes('unauthorized')) {
          const dataPublica = await api.get<any[]>('/configuracoes/publicas');
          if (Array.isArray(dataPublica)) {
            return dataPublica.reduce((acc: any, curr: any) => {
              acc[curr.chave] = curr.valor;
              return acc;
            }, {});
          }
        }
      } catch (fallbackError) {
        console.error('Error fetching public config:', fallbackError);
      }
      console.error('Error fetching system settings:', error);
      return {};
    }
  },

  updateBatch: async (configs: Record<string, any>) => {
    const promises = Object.entries(configs).map(([chave, valor]) =>
      systemConfigApi.update(chave, valor)
    );
    return Promise.all(promises);
  },

  // Compatibility Aliases
  listar: () => systemConfigApi.listAll(),
  atualizar: (chave: string, valor: any) => systemConfigApi.update(chave, valor),
};
