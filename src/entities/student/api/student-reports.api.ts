import { api, API_BASE_URL } from '@/shared/api';
import type { Boletim } from '../model/types';

export const StudentReportsAPI = {
  // Boletins
  listBoletins: (alunoId: string) => api.get<Boletim[]>(`/relatorios/boletins?aluno_id=${alunoId}`),
  
  generateBoletim: (alunoId: string, periodo: string, moduloId?: string, turmaId?: string) => {
    const params = new URLSearchParams();
    params.append('aluno_id', alunoId);
    params.append('periodo', periodo);
    if (moduloId) params.append('modulo_id', moduloId);
    if (turmaId) params.append('turma_id', turmaId);
    return api.get(`/relatorios/boletim?${params.toString()}`);
  },

  getBoletimData: async (alunoId: string, moduloId: string) => {
    return api.get(`/relatorios/boletim-dados?aluno_id=${alunoId}&modulo_id=${moduloId}`);
  },

  generateBoletimBatch: async (filtros: { polo_id?: string; turma_id?: string; modulo_id: string; aluno_id?: string; aluno_ids?: string[] }) => {
    return api.post('/relatorios/boletim-lote', filtros);
  },

  viewBoletimPDF: async (id: string) => {
    const token = sessionStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE_URL}/relatorios/boletim/${id}/view`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Erro ao carregar PDF do boletim');
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  },

  // Histórico
  getHistory: (alunoId: string, periodo?: string) => {
    const params = new URLSearchParams();
    params.append('aluno_id', alunoId);
    if (periodo) params.append('periodo', periodo);
    const query = params.toString();
    return api.get(`/relatorios/historico?${query}`);
  },

  generateHistoryPDF: (alunoId: string) => api.get(`/relatorios/historico-pdf?aluno_id=${alunoId}`),

  // Certificados
  listCertificates: (alunoId?: string) => {
    const query = alunoId ? `?aluno_id=${alunoId}` : '';
    return api.get<any[]>(`/certificados${query}`);
  },

  countCertificates: async () => {
    const res = await api.get<{ count: number }>('/certificados/count');
    return res.count;
  },

  generateCertificate: (dados: { aluno_id: string, modulo_id?: string, turma_id?: string, tipo: string }) =>
    api.post<any>('/certificados/gerar', dados),

  generateCertificateLegacy: (alunoId: string, nivelId: string) => 
    api.get(`/relatorios/certificado?aluno_id=${alunoId}&nivel_id=${nivelId}`),

  validateCertificate: (codigo: string) => api.get<any>(`/certificados/validar/${codigo}`),

  // Listas
  listStudentsReport: (filtros: any) => {
    const params = new URLSearchParams();
    Object.entries(filtros).forEach(([key, value]) => {
      if (value) params.append(key, value as string);
    });
    return api.get(`/relatorios/lista-alunos?${params.toString()}`);
  },

  generateStudentsListPDF: (filtros: any) => {
    const params = new URLSearchParams();
    Object.entries(filtros).forEach(([key, value]) => {
      if (value) params.append(key, value as string);
    });
    return api.get(`/relatorios/lista-alunos-pdf?${params.toString()}`);
  },

  getEnrollmentCertificate: (alunoId: string) => api.get(`/relatorios/atestado-matricula?aluno_id=${alunoId}`),

  gerarFichaAluno: (alunoId: string) => api.get<{ success: boolean; url: string }>(`/relatorios/ficha-aluno?aluno_id=${alunoId}`),

  // Workers
  getJobStatus: (jobId: string) => api.get<any>(`/workers/job/${jobId}`),

  // Compatibility Aliases
  historicoAluno: (alunoId: string, periodo?: string) => StudentReportsAPI.getHistory(alunoId, periodo),
  gerarBoletim: (alunoId: string, periodo: string, moduloId?: string, turmaId?: string) => StudentReportsAPI.generateBoletim(alunoId, periodo, moduloId, turmaId),
  getDadosBoletim: (alunoId: string, moduloId: string) => StudentReportsAPI.getBoletimData(alunoId, moduloId),
  gerarBoletimLote: (filtros: any) => StudentReportsAPI.generateBoletimBatch(filtros),
  visualizarBoletimPDF: (id: string) => StudentReportsAPI.viewBoletimPDF(id),
  listCertificados: (alunoId?: string) => StudentReportsAPI.listCertificates(alunoId),
  gerarCertificado: (alunoId: string, nivelId: string) => StudentReportsAPI.generateCertificateLegacy(alunoId, nivelId),
  gerarCertificadoV2: (dados: any) => StudentReportsAPI.generateCertificate(dados),
  validarCertificado: (codigo: string) => StudentReportsAPI.validateCertificate(codigo),
  relatorioAtestadoMatricula: (alunoId: string) => StudentReportsAPI.getEnrollmentCertificate(alunoId),
  contarCertificados: () => StudentReportsAPI.countCertificates(),
  gerarFicha: (alunoId: string) => StudentReportsAPI.gerarFichaAluno(alunoId),
};

/** @deprecated Use StudentReportsAPI.listBoletins */
export const BoletimAPI = {
  listar: StudentReportsAPI.listBoletins,
};

/** @deprecated Use StudentReportsAPI.listCertificates */
export const CertificadoAPI = {
  listar: StudentReportsAPI.listCertificates,
};
