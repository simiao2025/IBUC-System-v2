// ============================================
// IBUC System - Serviço de Documentos
// ============================================

import { supabase } from '../lib/supabase';
import type { Documento, OwnerType, TipoDocumento } from '../types/database';

export class DocumentoService {
  static readonly BUCKET_NAME = 'matriculas';

  /**
   * Faz upload de um documento para o storage
   */
  static async uploadDocument(
    file: File,
    folder: string,
    ownerType: OwnerType,
    ownerId: string,
    tipoDocumento: TipoDocumento,
    validade?: string
  ): Promise<Documento> {
    // Validação básica do arquivo
    if (!file) {
      throw new Error('Nenhum arquivo fornecido');
    }

    // Gera um nome único para o arquivo
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}-${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // Faz upload para o storage
    const { error: uploadError } = await supabase.storage
      .from(this.BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Erro ao fazer upload do documento:', uploadError);
      throw uploadError;
    }

    // Obtém a URL pública do arquivo
    const { data: { publicUrl } } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(filePath);

    // Salva a referência no banco de dados
    const { data, error: dbError } = await supabase
      .from('documentos')
      .insert({
        owner_type: ownerType,
        owner_id: ownerId,
        tipo_documento: tipoDocumento,
        url: publicUrl,
        file_name: file.name,
        validade: validade ? new Date(validade).toISOString() : null,
        validado: false,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Erro ao salvar referência do documento:', dbError);
      // Tenta remover o arquivo do storage em caso de falha no banco
      await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath]);
      
      throw dbError;
    }

    return data;
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
