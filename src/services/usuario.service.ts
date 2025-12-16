// ============================================
// IBUC System - Serviço de Usuários
// ============================================

import type { Database } from '../types/database';
import { UsuariosAPI } from '../lib/api';

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
