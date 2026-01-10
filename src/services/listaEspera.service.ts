import { api } from '../lib/api';

export const ListaEsperaAPI = {
    cadastrar: (data: { nome: string; email: string; telefone?: string; cidade?: string; bairro?: string }) =>
        api.post<any>('/lista-espera/cadastrar', data),

    listar: () => api.get<any[]>('/lista-espera')
};

export class ListaEsperaService {
    static async cadastrar(data: { nome: string; email: string; telefone?: string; cidade?: string; bairro?: string }) {
        return ListaEsperaAPI.cadastrar(data);
    }

    static async listar() {
        return ListaEsperaAPI.listar();
    }
}
