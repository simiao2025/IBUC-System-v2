// ============================================
// IBUC System - Serviço de Usuários
// ============================================

import { api } from '../lib/api';
import { Database } from '../lib/database.types';

export const UsuariosAPI = {
  criar: (data: unknown) => api.post('/usuarios', data),
  login: (data: { email: string; password: string }) => api.post('/usuarios/login', data),
  solicitarCodigoRecuperacaoSenha: (data: { email: string }) => api.post('/usuarios/recuperar-senha/solicitar-codigo', data),
  confirmarCodigoRecuperacaoSenha: (data: { email: string; codigo: string; senhaNova: string }) =>
    api.post('/usuarios/recuperar-senha/confirmar-codigo', data),
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
  // Metadados para selects dinâmicos
  listarRoles: () => api.get('/usuarios/meta/roles'),
  listarAccessLevels: () => api.get('/usuarios/meta/access-levels'),
};

type Usuario = Database['public']['Tables']['usuarios']['Row'];

export class UsuarioService {
  /**
   * Lista usuários com filtros opcionais
   */
  static async listarUsuarios(filtros: { role?: string; polo_id?: string; ativo?: boolean } = {}): Promise<Usuario[]> {
    return UsuariosAPI.listar(filtros) as Promise<Usuario[]>;
  }

  /**
   * Busca usuário por e-mail
   */
  static async buscarPorEmail(email: string): Promise<Usuario | null> {
    try {
      const usuario = await UsuariosAPI.buscarPorEmail(email);
      return usuario as Usuario;
    } catch (error: any) {
      // Se o backend retornar 404, o cliente ApiClient lança Error com message adequada
      if (error.message && error.message.includes('Usuário não encontrado')) {
        return null;
      }
      console.error('Erro ao buscar usuário por e-mail:', error);
      throw error;
    }
  }

  /**
   * Cria um novo usuário
   */
  static async criarUsuario(dados: Partial<Usuario>): Promise<Usuario> {
    const usuario = await UsuariosAPI.criar(dados);
    return usuario as Usuario;
  }

  /**
   * Atualiza um usuário
   */
  static async atualizarUsuario(id: string, dados: Partial<Usuario>): Promise<Usuario> {
    const usuario = await UsuariosAPI.atualizar(id, dados);
    return usuario as Usuario;
  }

  /**
   * Deleta um usuário
   */
  static async deletarUsuario(id: string): Promise<void> {
    await UsuariosAPI.deletar(id);
  }

  /**
   * Lista funções (roles) disponíveis para selects dinâmicos
   */
  static async listarRoles(): Promise<{ value: string; label: string }[]> {
    return UsuariosAPI.listarRoles() as Promise<{ value: string; label: string }[]>;
  }

  /**
   * Lista níveis de acesso disponíveis para selects dinâmicos
   */
  static async listarAccessLevels(): Promise<{ value: string; label: string }[]> {
    return UsuariosAPI.listarAccessLevels() as Promise<{ value: string; label: string }[]>;
  }
}
