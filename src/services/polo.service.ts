// ============================================
// IBUC System - Serviço de Polos
// ============================================

import type { Polo } from '../types/database';
import { PolosAPI } from '../lib/api';

export class PoloService {
  /**
   * Lista todos os polos (respeitando RLS)
   */
  static async listarPolos(): Promise<Polo[]> {
    const polos = await PolosAPI.listar();
    return polos as Polo[];
  }

  /**
   * Busca um polo por ID
   */
  static async buscarPoloPorId(id: string): Promise<Polo | null> {
    const polo = await PolosAPI.buscarPorId(id);
    return polo as Polo;
  }

  /**
   * Busca polos por cidade ou CEP
   */
  static async buscarPolosPorLocalizacao(cidade?: string, cep?: string): Promise<Polo[]> {
    const polos = (await PolosAPI.listar()) as Polo[];

    return polos.filter(polo => {
      const endereco: any = (polo as any).endereco || {};
      const matchCidade = cidade ? endereco.cidade === cidade : true;
      const matchCep = cep ? endereco.cep === cep : true;
      return matchCidade && matchCep;
    });
  }

  /**
   * Cria um novo polo (apenas super_admin ou admin_geral)
   */
  static async criarPolo(polo: Omit<Polo, 'id' | 'created_at' | 'updated_at'>): Promise<Polo> {
    const criado = await PolosAPI.criar(polo);
    return criado as Polo;
  }

  /**
   * Atualiza um polo
   */
  static async atualizarPolo(id: string, updates: Partial<Polo>): Promise<Polo> {
    const atualizado = await PolosAPI.atualizar(id, updates);
    return atualizado as Polo;
  }

  /**
   * Deleta um polo
   */
  static async deletarPolo(id: string): Promise<void> {
    await PolosAPI.deletar(id);
  }
}
