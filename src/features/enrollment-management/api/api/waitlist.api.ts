import { api } from '@/shared/api';

export const waitlistApi = {
  cadastrar: (data: { nome: string; email: string; telefone?: string; cidade?: string; bairro?: string }) =>
    api.post<any>('/lista-espera/cadastrar', data),

  listar: () => api.get<any[]>('/lista-espera')
};
