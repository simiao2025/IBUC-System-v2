// Cliente API para comunicação com o backend NestJS
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = localStorage.getItem('auth_token');

    const isFormData = options.body instanceof FormData;

    const headers: HeadersInit = {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    if (!isFormData) {
      // Para JSON definimos Content-Type explicitamente
      (headers as Record<string, string>)['Content-Type'] = 'application/json';
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient(API_BASE_URL);

// Serviços específicos
export const MatriculaAPI = {
  criar: (data: unknown) => api.post('/matriculas', data),
  uploadDocumentos: (id: string, formData: FormData) => api.upload(`/documentos/matriculas/${id}`, formData),
  listar: (params?: { polo_id?: string; status?: string }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return api.get(`/matriculas?${query}`);
  },
  buscarPorProtocolo: (protocolo: string) => api.get(`/matriculas/protocolo/${protocolo}`),
  aprovar: (id: string, data: { approved_by: string }) => api.put(`/matriculas/${id}/aprovar`, data),
  recusar: (id: string, data: { motivo: string; user_id: string }) => api.put(`/matriculas/${id}/recusar`, data),
};

export const DocumentosAPI = {
  listarPorMatricula: (matriculaId: string) => api.get(`/documentos/matriculas/${matriculaId}`),
};

export const TurmasAPI = {
  listar: (params?: { polo_id?: string; nivel_id?: string; status?: string; ano_letivo?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.polo_id) searchParams.append('polo_id', params.polo_id);
    if (params?.nivel_id) searchParams.append('nivel_id', params.nivel_id);
    if (params?.status) searchParams.append('status', params.status);
    if (typeof params?.ano_letivo === 'number') searchParams.append('ano_letivo', String(params.ano_letivo));

    const query = searchParams.toString();
    return api.get(`/turmas${query ? `?${query}` : ''}`);
  },
};

export const PresencasAPI = {
  lancarLote: (presencas: unknown[]) => api.post('/presencas/batch', { presencas }),
  porAluno: (alunoId: string, inicio?: string, fim?: string) => {
    const params = new URLSearchParams();
    params.append('aluno_id', alunoId);
    if (inicio) params.append('inicio', inicio);
    if (fim) params.append('fim', fim);
    return api.get(`/presencas/por-aluno?${params.toString()}`);
  },
  porTurma: (turmaId: string, inicio?: string, fim?: string) => {
    const params = new URLSearchParams();
    params.append('turma_id', turmaId);
    if (inicio) params.append('inicio', inicio);
    if (fim) params.append('fim', fim);
    return api.get(`/presencas/por-turma?${params.toString()}`);
  },
};

export const DracmasAPI = {
  lancarLote: (data: {
    turma_id: string;
    data: string;
    tipo: string;
    descricao?: string;
    registrado_por: string;
    transacoes: { aluno_id: string; quantidade: number }[];
  }) => api.post('/dracmas/lancar-lote', data),

  saldoPorAluno: (alunoId: string) => api.get(`/dracmas/saldo?aluno_id=${alunoId}`),

  porAluno: (alunoId: string, inicio?: string, fim?: string) => {
    const params = new URLSearchParams();
    params.append('aluno_id', alunoId);
    if (inicio) params.append('inicio', inicio);
    if (fim) params.append('fim', fim);
    return api.get(`/dracmas/por-aluno?${params.toString()}`);
  },

  porTurma: (turmaId: string, inicio?: string, fim?: string) => {
    const params = new URLSearchParams();
    params.append('turma_id', turmaId);
    if (inicio) params.append('inicio', inicio);
    if (fim) params.append('fim', fim);
    return api.get(`/dracmas/por-turma?${params.toString()}`);
  },
};

export const RelatoriosAPI = {
  gerarBoletim: (alunoId: string, periodo: string) => api.get(`/relatorios/boletim?aluno_id=${alunoId}&periodo=${periodo}`),
  historicoAluno: (alunoId: string, periodo?: string) => {
    const params = new URLSearchParams();
    params.append('aluno_id', alunoId);
    if (periodo) params.append('periodo', periodo);
    const query = params.toString();
    return api.get(`/relatorios/historico?${query}`);
  },
  estatisticasPorPolo: (periodo?: string) => {
    const params = new URLSearchParams();
    if (periodo) params.append('periodo', periodo);
    const query = params.toString();
    return api.get(`/relatorios/estatisticas-por-polo${query ? `?${query}` : ''}`);
  },
  // Endpoints em desenvolvimento (não existem no backend ainda)
  // desempenhoPorNivel: (poloId?: string, periodo?: string) => { /* em desenvolvimento */ },
  // certificadosEmitidos: (poloId?: string, periodo?: string) => { /* em desenvolvimento */ },
  // relatorioProfessores: (poloId?: string) => { /* em desenvolvimento */ },
  // atividadesEventos: (poloId?: string, periodo?: string) => { /* em desenvolvimento */ },
  // relatorioFinanceiro: (poloId?: string, periodo?: string) => { /* em desenvolvimento */ },
};

export const LgpdAPI = {
  exportar: (type: string, id: string) => api.get(`/lgpd/export/${type}/${id}`),
  anonymizar: (type: string, id: string) => api.post(`/lgpd/anonymize/${type}/${id}`),
};

export const DiretoriaAPI = {
  // Diretoria Geral
  criarGeral: (data: unknown) => api.post('/diretoria/geral', data),
  listarGeral: (ativo?: boolean) => {
    const query = ativo !== undefined ? `?ativo=${ativo}` : '';
    return api.get(`/diretoria/geral${query}`);
  },
  buscarGeralPorId: (id: string) => api.get(`/diretoria/geral/${id}`),
  atualizarGeral: (id: string, data: unknown) => api.put(`/diretoria/geral/${id}`, data),
  desativarGeral: (id: string) => api.put(`/diretoria/geral/${id}/desativar`),
  
  // Diretoria Polo
  criarPolo: (poloId: string, data: unknown) => api.post(`/diretoria/polo/${poloId}`, data),
  listarPolo: (poloId?: string, ativo?: boolean) => {
    const params = new URLSearchParams();
    if (poloId) params.append('polo_id', poloId);
    if (ativo !== undefined) params.append('ativo', String(ativo));
    const query = params.toString() ? `?${params.toString()}` : '';
    return api.get(`/diretoria/polo${query}`);
  },
  buscarPoloPorId: (id: string) => api.get(`/diretoria/polo/${id}`),
  atualizarPolo: (id: string, data: unknown) => api.put(`/diretoria/polo/${id}`, data),
  desativarPolo: (id: string) => api.put(`/diretoria/polo/${id}/desativar`),
};

export const UsuariosAPI = {
  criar: (data: unknown) => api.post('/usuarios', data),
  listar: (filtros?: { role?: string; polo_id?: string; ativo?: boolean; search?: string }) => {
    const params = new URLSearchParams();
    if (filtros?.role) params.append('role', filtros.role);
    if (filtros?.polo_id) params.append('polo_id', filtros.polo_id);
    if (filtros?.ativo !== undefined) params.append('ativo', String(filtros.ativo));
    if (filtros?.search) params.append('search', filtros.search);
    const query = params.toString() ? `?${params.toString()}` : '';
    return api.get(`/usuarios${query}`);
  },
  buscarPorId: (id: string) => api.get(`/usuarios/${id}`),
  buscarPorEmail: (email: string) => api.get(`/usuarios/email/${email}`),
  atualizar: (id: string, data: unknown) => api.put(`/usuarios/${id}`, data),
  ativar: (id: string) => api.put(`/usuarios/${id}/ativar`),
  desativar: (id: string) => api.put(`/usuarios/${id}/desativar`),
  deletar: (id: string) => api.delete(`/usuarios/${id}`),
};

export const PolosAPI = {
  criar: (data: unknown) => api.post('/polos', data),
  listar: (ativo?: boolean) => {
    const query = ativo !== undefined ? `?ativo=${ativo}` : '';
    return api.get(`/polos${query}`);
  },
  buscarPorId: (id: string) => api.get(`/polos/${id}`),
  buscarPorCodigo: (codigo: string) => api.get(`/polos/codigo/${codigo}`),
  atualizar: (id: string, data: unknown) => api.put(`/polos/${id}`, data),
  deletar: (id: string) => api.delete(`/polos/${id}`),
};

export const AlunosAPI = {
  criar: (data: unknown) => api.post('/alunos', data),
  listar: (params?: { polo_id?: string; turma_id?: string; nivel_id?: string; status?: string; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.polo_id) searchParams.append('polo_id', params.polo_id);
    if (params?.turma_id) searchParams.append('turma_id', params.turma_id);
    if (params?.nivel_id) searchParams.append('nivel_id', params.nivel_id);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.search) searchParams.append('search', params.search);

    const query = searchParams.toString();
    return api.get(`/alunos${query ? `?${query}` : ''}`);
  },
  buscarPorId: (id: string) => api.get(`/alunos/${id}`),
  atualizar: (id: string, data: unknown) => api.put(`/alunos/${id}`, data),
  deletar: (id: string) => api.delete(`/alunos/${id}`),
};
