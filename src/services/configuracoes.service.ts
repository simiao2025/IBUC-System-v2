import { api } from '../lib/api';

export const ConfiguracoesService = {
    listarTodas: () => api.get<any[]>('/configuracoes'),

    buscarPorChave: (chave: string) => api.get<any>(`/configuracoes/${chave}`),

    atualizar: (chave: string, valor: any) => api.put<any>(`/configuracoes/${chave}`, { valor }),

    /**
     * Busca todas as configurações e retorna um objeto chave:valor
     */
    buscarTodasComoObjeto: async () => {
        try {
            const token = sessionStorage.getItem('auth_token');
            const endpoint = token ? '/configuracoes' : '/configuracoes/publicas';
            const data = await api.get<any[]>(endpoint);
            if (Array.isArray(data)) {
                return data.reduce((acc: any, curr: any) => {
                    // Os valores no banco estão em JSONB, o ApiClient já faz o parse
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
                    return {};
                }
            } catch (fallbackError) {
                console.error('Erro ao buscar configurações como objeto:', fallbackError);
            }

            console.error('Erro ao buscar configurações como objeto:', error);
            return {};
        }
    },

    /**
     * Salva múltiplas configurações de uma vez
     */
    salvarLote: async (configs: Record<string, any>) => {
        const promises = Object.entries(configs).map(([chave, valor]) =>
            ConfiguracoesService.atualizar(chave, valor)
        );
        return Promise.all(promises);
    }
};
