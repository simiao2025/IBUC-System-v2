// ============================================
// IBUC System - Serviço de Matrículas
// ============================================

import type { Matricula, StatusMatricula } from '../types/database';
import { MatriculaAPI } from '../lib/api';

export class MatriculaService {
  /**
   * Lista matrículas (respeitando RLS)
   */
  static async listarMatriculas(
    poloId?: string,
    status?: StatusMatricula
  ): Promise<Matricula[]> {
    const filtros: any = {};
    if (poloId) filtros.polo_id = poloId;
    if (status) filtros.status = status;
    const data = await MatriculaAPI.listar(filtros);
    return data as Matricula[];
  }

  /**
   * Busca matrícula por protocolo
   */
  static async buscarMatriculaPorProtocolo(protocolo: string): Promise<Matricula | null> {
    try {
      const data = await MatriculaAPI.buscarPorProtocolo(protocolo);
      return data as Matricula;
    } catch (error: any) {
      if (error.message && error.message.includes('Matrícula não encontrada')) {
        return null;
      }
      console.error('Erro ao buscar matrícula:', error);
      throw error;
    }
  }

  /**
   * Busca matrícula por ID
   */
  static async buscarMatriculaPorId(id: string): Promise<Matricula | null> {
    const data = await MatriculaAPI.buscarPorId(id);
    return data as Matricula;
  }

  /**
   * Cria uma nova matrícula
   */
  static async criarMatricula(
    matricula: Omit<Matricula, 'id' | 'created_at' | 'protocolo'>
  ): Promise<Matricula> {
    const data = await MatriculaAPI.criar(matricula);
    return data as Matricula;
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
    if (status === 'aprovada') {
      const data = await MatriculaAPI.aprovar(id, { approved_by: approvedBy || '' });
      return data as Matricula;
    }

    if (status === 'recusada') {
      const data = await MatriculaAPI.recusar(id, { motivo: motivoRecusa || '', user_id: approvedBy || '' });
      return data as Matricula;
    }

    // Para outros status, poderia haver um endpoint genérico; por enquanto, lança erro explícito
    throw new Error('Atualização de status não suportada por esta API');
  }
}
