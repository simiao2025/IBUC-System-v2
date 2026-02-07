// ============================================
// IBUC System - Serviço de Documentos
// ============================================

import { api } from '../lib/api';
import { supabase } from '../lib/supabase';
import type { Documento, OwnerType, TipoDocumento } from '../types/database';

export const DocumentosAPI = {
  listarPorMatricula: (matriculaId: string) => api.get(`/documentos/matriculas/${matriculaId}`),
  listarPorAluno: (alunoId: string) => api.get(`/documentos/alunos/${alunoId}`),
  uploadPorPreMatricula: (preMatriculaId: string, formData: FormData, tipo?: string) => {
    const query = tipo ? `?tipo=${encodeURIComponent(tipo)}` : '';
    return api.upload(`/documentos/pre-matriculas/${preMatriculaId}${query}`, formData);
  },
  uploadPorAluno: (alunoId: string, formData: FormData, tipo?: string) => {
    const query = tipo ? `?tipo=${encodeURIComponent(tipo)}` : '';
    return api.upload(`/documentos/alunos/${alunoId}${query}`, formData);
  },
  listarPorPreMatricula: (preMatriculaId: string) => api.get(`/documentos/pre-matriculas/${preMatriculaId}`),
};

export class DocumentoService {
  static readonly BUCKET_NAME = 'documentos';

  /**
   * Faz upload de um documento para o storage (Redirecionado para Google Drive via Backend)
   */
  static async uploadDocument(
    file: File,
    _folder: string,
    ownerType: 'aluno' | 'matricula' | 'pre-matricula',
    ownerId: string,
    tipoDocumento: TipoDocumento,
    _validade?: string
  ): Promise<any> {
    // Validação básica do arquivo
    if (!file) {
      throw new Error('Nenhum arquivo fornecido');
    }

    const formData = new FormData();
    formData.append('files', file);

    try {
      let response;
      if (ownerType === 'pre-matricula') {
        response = await DocumentosAPI.uploadPorPreMatricula(ownerId, formData, tipoDocumento);
      } else {
        // Por padrão, usa o upload de aluno que já está mapeado para o Drive
        response = await DocumentosAPI.uploadPorAluno(ownerId, formData, tipoDocumento);
      }

      return response;
    } catch (error) {
      console.error('Erro ao fazer upload do documento via API:', error);
      throw error;
    }
  }

  /**
   * Registra no banco um documento que já foi enviado ao storage
   * (útil para fluxos em que o upload é feito diretamente no frontend).
   */
  static async registrarDocumentoExistente(
    url: string,
    ownerType: OwnerType,
    ownerId: string,
    tipoDocumento: TipoDocumento,
    fileName: string,
    validade?: string
  ): Promise<Documento> {
    const { data, error } = await supabase
      .from('documentos')
      .insert({
        owner_type: ownerType,
        owner_id: ownerId,
        tipo_documento: tipoDocumento,
        url,
        file_name: fileName,
        validade: validade ? new Date(validade).toISOString() : null,
        validado: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao registrar documento existente:', error);
      throw error;
    }

    return data;
  }

  /**
   * Lista documentos de um proprietário
   */
  static async listarDocumentos(
    ownerType: OwnerType,
    ownerId: string,
    tipoDocumento?: TipoDocumento
  ): Promise<Documento[]> {
    let query = supabase
      .from('documentos')
      .select('*')
      .eq('owner_type', ownerType)
      .eq('owner_id', ownerId);

    if (tipoDocumento) {
      query = query.eq('tipo_documento', tipoDocumento);
    }

    const { data, error } = await query.order('uploaded_at', { ascending: false });

    if (error) {
      console.error('Erro ao listar documentos:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Remove um documento
   */
  static async removerDocumento(id: string): Promise<void> {
    // Primeiro obtém a referência do documento
    const { data: documento, error: fetchError } = await supabase
      .from('documentos')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Erro ao buscar documento para remoção:', fetchError);
      throw fetchError;
    }

    if (!documento) {
      throw new Error('Documento não encontrado');
    }

    // Remove do storage
    const filePath = documento.url.split('/').pop();
    if (filePath) {
      const { error: storageError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath]);

      if (storageError) {
        console.error('Erro ao remover arquivo do storage:', storageError);
        // Continua mesmo com erro, pois podemos ter apenas a referência no banco
      }
    }

    // Remove a referência do banco de dados
    const { error: dbError } = await supabase
      .from('documentos')
      .delete()
      .eq('id', id);

    if (dbError) {
      console.error('Erro ao remover referência do documento:', dbError);
      throw dbError;
    }
  }

  /**
   * Atualiza o status de validação de um documento
   */
  static async atualizarValidacaoDocumento(
    id: string, 
    validado: boolean, 
    validadoPor: string
  ): Promise<Documento> {
    const { data, error } = await supabase
      .from('documentos')
      .update({
        validado,
        validado_por: validado ? validadoPor : null,
        validado_em: validado ? new Date().toISOString() : null
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar validação do documento:', error);
      throw error;
    }

    return data;
  }

  /**
   * Obtém a URL assinada para download direto (se necessário)
   */
  static async getSignedUrl(filePath: string, expiresIn = 3600): Promise<string | null> {
    const { data, error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      console.error('Erro ao gerar URL assinada:', error);
      return null;
    }

    return data.signedUrl;
  }
}
