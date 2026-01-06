
import { api } from '../lib/api';
import { Certificado } from '../types/database';

export const CertificadoAPI = {
  listar: async (alunoId?: string) => {
    const params = new URLSearchParams();
    if (alunoId) params.append('aluno_id', alunoId);
    return api.get<Certificado[]>(`/certificados?${params.toString()}`);
  },

  contarTotal: async () => {
    // Retorna a contagem simples de certificados emitidos
    const response = await api.get<{ count: number }>('/certificados/count');
    return response.count;
  },

  gerar: async (dados: { aluno_id: string, modulo_id?: string, turma_id?: string, tipo: string }) => {
    return api.post<Certificado>('/certificados/gerar', dados);
  },

  buscarPorCodigo: async (codigo: string) => {
    return api.get<Certificado>(`/certificados/validar/${codigo}`);
  }
};

export class CertificadoService {
  static async listar(alunoId?: string) {
    return CertificadoAPI.listar(alunoId);
  }

  static async contarTotal() {
    try {
      return await CertificadoAPI.contarTotal();
    } catch (error) {
      console.error('Erro ao contar certificados:', error);
      return 0; // Fallback seguro
    }
  }

  static async gerar(dados: { aluno_id: string, modulo_id?: string, turma_id?: string, tipo: string }) {
    return CertificadoAPI.gerar(dados);
  }
}
