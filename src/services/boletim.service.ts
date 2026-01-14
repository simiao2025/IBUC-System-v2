
import { api, API_BASE_URL } from '../lib/api';

export interface Boletim {
    id: string;
    aluno_id: string;
    modulo_id: string;
    turma_id?: string;
    periodo: string;
    nota_final?: number;
    situacao?: string;
    pdf_url?: string;
    generated_at: string;
    aluno?: { nome: string };
    modulo?: { titulo: string, numero: number };
    turma?: { nome: string };
}

export const BoletimAPI = {
    listar: async (alunoId: string) => {
        return api.get<Boletim[]>(`/relatorios/boletins?aluno_id=${alunoId}`);
    },

    visualizarPDF: async (id: string) => {
        const token = sessionStorage.getItem('auth_token');
        const response = await fetch(`${API_BASE_URL}/relatorios/boletim/${id}/view`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao carregar PDF do boletim');
        }

        const blob = await response.blob();
        return URL.createObjectURL(blob);
    }
};

export class BoletimService {
    static async listar(alunoId: string) {
        return BoletimAPI.listar(alunoId);
    }

    static async visualizarPDF(id: string) {
        return BoletimAPI.visualizarPDF(id);
    }
}
