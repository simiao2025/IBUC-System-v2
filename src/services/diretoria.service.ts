// ============================================
// IBUC System - Serviço de Diretoria
// ============================================

import { api } from '../lib/api';
import { Database } from '../lib/database.types';

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
