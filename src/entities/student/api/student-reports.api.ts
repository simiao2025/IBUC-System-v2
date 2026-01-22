import { api, API_BASE_URL } from '@/shared/api';
import type { Boletim } from '../model/types';

export const StudentReportsAPI = {
  // Boletins
  listBoletins: (alunoId: string) => api.get<Boletim[]>(`/relatorios/boletins?aluno_id=${alunoId}`),
  
  gerarBoletim: (alunoId: string, periodo: string, moduloId?: string, turmaId?: string) => {
    const params = new URLSearchParams();
    params.append('aluno_id', alunoId);
    params.append('periodo', periodo);
    if (moduloId) params.append('modulo_id', moduloId);
    if (turmaId) params.append('turma_id', turmaId);
    return api.get(`/relatorios/boletim?${params.toString()}`);
  },

  getDadosBoletim: async (alunoId: string, moduloId: string) => {
    return api.get(`/relatorios/boletim-dados?aluno_id=${alunoId}&modulo_id=${moduloId}`);
  },

  gerarBoletimLote: async (filtros: { polo_id?: string; turma_id?: string; modulo_id: string; aluno_id?: string; aluno_ids?: string[] }) => {
    return api.post('/relatorios/boletim-lote', filtros);
  },

  visualizarBoletimPDF: async (id: string) => {
    const token = sessionStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE_URL}/relatorios/boletim/${id}/view`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Erro ao carregar PDF do boletim');
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  },

  // Histórico
  historicoAluno: (alunoId: string, periodo?: string) => {
    const params = new URLSearchParams();
    params.append('aluno_id', alunoId);
    if (periodo) params.append('periodo', periodo);
    const query = params.toString();
    return api.get(`/relatorios/historico?${query}`);
  },

  gerarHistoricoPdf: (alunoId: string) => api.get(`/relatorios/historico-pdf?aluno_id=${alunoId}`),

  // Certificados
  listCertificados: (alunoId?: string) => {
    const query = alunoId ? `?aluno_id=${alunoId}` : '';
    return api.get<any[]>(`/certificados${query}`);
  },

  contarCertificados: async () => {
    const res = await api.get<{ count: number }>('/certificados/count');
    return res.count;
  },

  gerarCertificado: (alunoId: string, nivelId: string) => 
    api.get(`/relatorios/certificado?aluno_id=${alunoId}&nivel_id=${nivelId}`),
  
  gerarCertificadoV2: (dados: { aluno_id: string, modulo_id?: string, turma_id?: string, tipo: string }) =>
    api.post<any>('/certificados/gerar', dados),

  validarCertificado: (codigo: string) => api.get<any>(`/certificados/validar/${codigo}`),

  // Listas
  relatorioListaAlunos: (filtros: any) => {
    const params = new URLSearchParams();
    Object.entries(filtros).forEach(([key, value]) => {
      if (value) params.append(key, value as string);
    });
    return api.get(`/relatorios/lista-alunos?${params.toString()}`);
  },

  gerarListaAlunosPdf: (filtros: any) => {
    const params = new URLSearchParams();
    Object.entries(filtros).forEach(([key, value]) => {
      if (value) params.append(key, value as string);
    });
    return api.get(`/relatorios/lista-alunos-pdf?${params.toString()}`);
  },

  relatorioAtestadoMatricula: (alunoId: string) => api.get(`/relatorios/atestado-matricula?aluno_id=${alunoId}`),

  // Workers
  getJobStatus: (jobId: string) => api.get<any>(`/workers/job/${jobId}`),
};
