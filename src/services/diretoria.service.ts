// ============================================
// IBUC System - Serviço de Diretoria
// ============================================

import type { Database } from '../types/database';
import { DiretoriaAPI } from '../lib/api';

// Tipos auxiliares baseados no banco
type DiretoriaGeral = Database['public']['Tables']['diretoria_geral']['Row'];
type DiretoriaPolo = Database['public']['Tables']['diretoria_polo']['Row'];

export class DiretoriaService {
  /**
   * Lista membros da diretoria geral
   */
  static async listarDiretoriaGeral(ativo: boolean = true): Promise<DiretoriaGeral[]> {
    const data = await DiretoriaAPI.listarGeral(ativo);
    return data as DiretoriaGeral[];
  }

  /**
   * Busca membro da diretoria geral por ID
   */
  static async buscarDiretoriaGeralPorId(id: string): Promise<DiretoriaGeral | null> {
    const data = await DiretoriaAPI.buscarGeralPorId(id);
    return data as DiretoriaGeral;
  }

  /**
   * Cria novo membro na diretoria geral
   */
  static async criarDiretoriaGeral(dados: any): Promise<DiretoriaGeral> {
    const data = await DiretoriaAPI.criarGeral(dados);
    return data as DiretoriaGeral;
  }

  /**
   * Atualiza membro da diretoria geral
   */
  static async atualizarDiretoriaGeral(id: string, dados: any): Promise<DiretoriaGeral> {
    const data = await DiretoriaAPI.atualizarGeral(id, dados);
    return data as DiretoriaGeral;
  }

  /**
   * Desativa membro da diretoria geral
   */
  static async desativarDiretoriaGeral(id: string): Promise<void> {
    await DiretoriaAPI.desativarGeral(id);
  }

  // ============================================
  // DIRETORIA DE POLO
  // ============================================

  /**
   * Lista diretoria de um polo específico
   */
  static async listarDiretoriaPolo(poloId: string, ativo: boolean = true): Promise<DiretoriaPolo[]> {
    const data = await DiretoriaAPI.listarPolo(poloId, ativo);
    return data as DiretoriaPolo[];
  }

  /**
   * Cria membro na diretoria do polo
   */
  static async criarDiretoriaPolo(dados: any): Promise<DiretoriaPolo> {
    const data = await DiretoriaAPI.criarPolo(dados.polo_id, dados);
    return data as DiretoriaPolo;
  }

  static async atualizarDiretoriaPolo(id: string, dados: any): Promise<DiretoriaPolo> {
    const data = await DiretoriaAPI.atualizarPolo(id, dados);
    return data as DiretoriaPolo;
  }

  static async desativarDiretoriaPolo(id: string): Promise<void> {
    await DiretoriaAPI.desativarPolo(id);
  }
}
