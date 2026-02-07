import { api } from '@/shared/api/api';

/**
 * @deprecated Use backend API through DocumentosAPI or the unified /upload endpoint.
 * This service now redirects to the backend to ensure Google Drive storage.
 */

type UploadOptions = {
  folder?: string; // Mantido por compatibilidade de assinatura, mas agora o backend decide a estrutura
  file: File;
  metadata?: Record<string, unknown>;
};

export const uploadFile = async ({
  file,
}: UploadOptions): Promise<{ path: string; publicUrl: string }> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await api.upload<{ url: string; filename: string }>(
      '/upload', 
      formData
    );

    return {
      path: response.filename,
      publicUrl: response.url,
    };
  } catch (error: any) {
    console.error('Erro ao fazer upload do arquivo via backend:', error);
    throw new Error(error.message || 'Erro ao fazer upload do arquivo');
  }
};
