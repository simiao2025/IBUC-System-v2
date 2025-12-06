// ============================================
// IBUC System - Serviço de Matrículas
// ============================================

import { supabase } from '../lib/supabase';
import type { Matricula, StatusMatricula } from '../types/database';

export class MatriculaService {
  /**
   * Lista matrículas (respeitando RLS)
   */
  static async listarMatriculas(
    poloId?: string,
    status?: StatusMatricula
  ): Promise<Matricula[]> {
    let query = supabase.from('matriculas').select('*');

    if (poloId) {
      query = query.eq('polo_id', poloId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao listar matrículas:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Busca matrícula por protocolo
   */
  static async buscarMatriculaPorProtocolo(protocolo: string): Promise<Matricula | null> {
    const { data, error } = await supabase
      .from('matriculas')
      .select('*')
      .eq('protocolo', protocolo)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Não encontrado
      }
      console.error('Erro ao buscar matrícula:', error);
      throw error;
    }

    return data;
  }

  /**
   * Busca matrícula por ID
   */
  static async buscarMatriculaPorId(id: string): Promise<Matricula | null> {
    const { data, error } = await supabase
      .from('matriculas')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar matrícula:', error);
      throw error;
    }

    return data;
  }

  /**
   * Cria uma nova matrícula
   */
  static async criarMatricula(
    matricula: Omit<Matricula, 'id' | 'created_at' | 'protocolo'>
  ): Promise<Matricula> {
    const { data, error } = await supabase
      .from('matriculas')
      .insert(matricula)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar matrícula:', error);
      throw error;
    }

    return data;
  }

  /**
   * Atualiza status da matrícula
   */
  static async atualizarStatusMatricula(
    id: string,
    status: StatusMatricula,
    approvedBy?: string,
    motivoRecusa?: string
  ): Promise<Matricula> {
    const updates: any = { status };

    if (approvedBy) {
      updates.approved_by = approvedBy;
      updates.approved_at = new Date().toISOString();
    }

    if (motivoRecusa) {
      updates.motivo_recusa = motivoRecusa;
    }

    const { data, error } = await supabase
      .from('matriculas')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar matrícula:', error);
      throw error;
    }

    return data;
  }
}

