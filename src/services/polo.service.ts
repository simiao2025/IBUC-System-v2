// ============================================
// IBUC System - Serviço de Polos
// ============================================

import { supabase } from '../lib/supabase';
import type { Polo } from '../types/database';

export class PoloService {
  /**
   * Lista todos os polos (respeitando RLS)
   */
  static async listarPolos(): Promise<Polo[]> {
    const { data, error } = await supabase
      .from('polos')
      .select('*')
      .order('nome');

    if (error) {
      console.error('Erro ao listar polos:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Busca um polo por ID
   */
  static async buscarPoloPorId(id: string): Promise<Polo | null> {
    const { data, error } = await supabase
      .from('polos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar polo:', error);
      throw error;
    }

    return data;
  }

  /**
   * Busca polos por cidade ou CEP
   */
  static async buscarPolosPorLocalizacao(cidade?: string, cep?: string): Promise<Polo[]> {
    let query = supabase.from('polos').select('*');

    if (cidade) {
      query = query.contains('endereco', { cidade });
    }

    if (cep) {
      query = query.contains('endereco', { cep });
    }

    const { data, error } = await query.order('nome');

    if (error) {
      console.error('Erro ao buscar polos por localização:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Cria um novo polo (apenas super_admin ou admin_geral)
   */
  static async criarPolo(polo: Omit<Polo, 'id' | 'created_at' | 'updated_at'>): Promise<Polo> {
    const { data, error } = await supabase
      .from('polos')
      .insert(polo)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar polo:', error);
      throw error;
    }

    return data;
  }

  /**
   * Atualiza um polo
   */
  static async atualizarPolo(id: string, updates: Partial<Polo>): Promise<Polo> {
    const { data, error } = await supabase
      .from('polos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar polo:', error);
      throw error;
    }

    return data;
  }

  /**
   * Remove um polo (soft delete - atualiza status)
   */
  static async removerPolo(id: string): Promise<void> {
    const { error } = await supabase
      .from('polos')
      .update({ status: 'inativo' })
      .eq('id', id);

    if (error) {
      console.error('Erro ao remover polo:', error);
      throw error;
    }
  }
}

