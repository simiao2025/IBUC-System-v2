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

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
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

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
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
  criar: (data: any) => api.post('/matriculas', data),
  listar: (params?: { polo_id?: string; status?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return api.get(`/matriculas?${query}`);
  },
  buscarPorProtocolo: (protocolo: string) => api.get(`/matriculas/protocolo/${protocolo}`),
  aprovar: (id: string, data: { approved_by: string }) => api.put(`/matriculas/${id}/aprovar`, data),
  recusar: (id: string, data: { motivo: string; user_id: string }) => api.put(`/matriculas/${id}/recusar`, data),
};

export const RelatoriosAPI = {
  gerarBoletim: (alunoId: string, periodo: string) => api.get(`/relatorios/boletim?aluno_id=${alunoId}&periodo=${periodo}`),
  exportarPresenca: (turmaId: string, data: string) => api.get(`/relatorios/presenca?turma_id=${turmaId}&data=${data}`),
  relatorioFinanceiro: (poloId: string, periodo: string) => api.get(`/relatorios/financeiro?polo_id=${poloId}&periodo=${periodo}`),
};

export const LgpdAPI = {
  exportar: (type: string, id: string) => api.get(`/lgpd/export/${type}/${id}`),
  anonymizar: (type: string, id: string) => api.post(`/lgpd/anonymize/${type}/${id}`),
};

