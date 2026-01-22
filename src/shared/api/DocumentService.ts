import { api } from './ApiClient';
import { supabase } from '@/lib/supabase';
import type { 
  Documento, 
  OwnerType, 
  TipoDocumento 
} from '@/shared/model/database';

export interface DocumentResponse {
  aluno_id: string;
  arquivos: Documento[];
}

/**
 * REST API Client for Document-related endpoints in the NestJS backend.
 */
export const DocumentAPI = {
  /** Lists all documents for a specific enrollment */
  listByEnrollment: (enrollmentId: string) => api.get<Documento[]>(`/documentos/matriculas/${enrollmentId}`),
  
  /** Lists all documents for a specific student */
  listByStudent: (studentId: string) => api.get<DocumentResponse>(`/documentos/alunos/${studentId}`),
  
  /** Lists all documents for a specific pre-enrollment */
  listByPreEnrollment: (preEnrollmentId: string) => api.get<Documento[]>(`/documentos/pre-matriculas/${preEnrollmentId}`),

  /** Uploads a document for a pre-enrollment */
  uploadByPreEnrollment: (preEnrollmentId: string, formData: FormData, type?: string) => {
    const query = type ? `?tipo=${encodeURIComponent(type)}` : '';
    return api.upload(`/documentos/pre-matriculas/${preEnrollmentId}${query}`, formData);
  },

  /** Uploads a single document for a student */
  uploadByStudent: (studentId: string, formData: FormData, type?: string) => {
    const query = type ? `?tipo=${encodeURIComponent(type)}` : '';
    return api.upload(`/documentos/alunos/${studentId}${query}`, formData);
  },

  /** Uploads multiple documents for a student */
  uploadMultipleByStudent: (studentId: string, files: File[], type?: string) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    const url = type
      ? `/documentos/alunos/${studentId}?tipo=${encodeURIComponent(type)}`
      : `/documentos/alunos/${studentId}`;

    return api.upload(url, formData);
  },
};

/**
 * Service for handling document storage (Supabase) and database records.
 */
export class DocumentService {
  private static readonly BUCKET_NAME = 'matriculas';

  /**
   * Uploads a document to Supabase storage and creates a database record.
   */
  static async uploadToStorage(
    file: File,
    folder: string,
    ownerType: OwnerType,
    ownerId: string,
    documentType: TipoDocumento,
    expiryDate?: string
  ): Promise<Documento> {
    if (!file) throw new Error('No file provided');

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}-${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(this.BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading document to storage:', uploadError);
      throw uploadError;
    }

    // Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(filePath);

    // Save reference in Database
    const { data, error: dbError } = await supabase
      .from('documentos')
      .insert({
        owner_type: ownerType,
        owner_id: ownerId,
        tipo_documento: documentType,
        url: publicUrl,
        file_name: file.name,
        validade: expiryDate ? new Date(expiryDate).toISOString() : null,
        validado: false,
      } as any)
      .select()
      .single();

    if (dbError) {
      console.error('Error saving document reference to DB:', dbError);
      // Cleanup: remove file from storage on DB failure
      await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath]);
      
      throw dbError;
    }

    return data;
  }

  /**
   * Registers an existing storage URL in the database.
   */
  static async registerDocument(
    url: string,
    ownerType: OwnerType,
    ownerId: string,
    documentType: TipoDocumento,
    fileName: string,
    expiryDate?: string
  ): Promise<Documento> {
    const { data, error } = await supabase
      .from('documentos')
      .insert({
        owner_type: ownerType,
        owner_id: ownerId,
        tipo_documento: documentType,
        url,
        file_name: fileName,
        validade: expiryDate ? new Date(expiryDate).toISOString() : null,
        validado: false,
      } as any)
      .select()
      .single();

    if (error) {
      console.error('Error registering existing document:', error);
      throw error;
    }

    return data;
  }

  /**
   * Lists documents from the database for a specific owner.
   */
  static async listFromDb(
    ownerType: OwnerType,
    ownerId: string,
    documentType?: TipoDocumento
  ): Promise<Documento[]> {
    let query = supabase
      .from('documentos')
      .select('*')
      .eq('owner_type', ownerType)
      .eq('owner_id', ownerId);

    if (documentType) {
      query = query.eq('tipo_documento', documentType);
    }

    const { data, error } = await query.order('uploaded_at', { ascending: false });

    if (error) {
      console.error('Error listing documents from DB:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Deletes a document from both storage and database.
   */
  static async removeDocument(id: string): Promise<void> {
    // Fetch reference first
    const { data: document, error: fetchError } = await supabase
      .from('documentos')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching document for removal:', fetchError);
      throw fetchError;
    }

    if (!document) throw new Error('Document not found');

    // Remove from Storage
    const filePath = (document as any).url.split('/').pop();
    if (filePath) {
      const { error: storageError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath]);

      if (storageError) {
        console.error('Error removing file from storage:', storageError);
        // Continue to DB removal even if storage removal failed (orphan record check)
      }
    }

    // Remove from Database
    const { error: dbError } = await supabase
      .from('documentos')
      .delete()
      .eq('id', id);

    if (dbError) {
      console.error('Error removing document reference from DB:', dbError);
      throw dbError;
    }
  }

  /**
   * Updates the validation status of a document.
   */
  static async updateValidation(
    id: string, 
    isValidated: boolean, 
    validatedBy: string
  ): Promise<Documento> {
    const { data, error } = await supabase
      .from('documentos')
      .update({
        validado: isValidated,
        validado_por: isValidated ? validatedBy : null,
        validado_em: isValidated ? new Date().toISOString() : null
      } as any)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating document validation:', error);
      throw error;
    }

    return data;
  }

  /**
   * Generates a signed URL for temporary access to a document.
   */
  static async getSignedUrl(filePath: string, expiresIn = 3600): Promise<string | null> {
    const { data, error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      console.error('Error creating signed URL:', error);
      return null;
    }

    return data.signedUrl;
  }
}
