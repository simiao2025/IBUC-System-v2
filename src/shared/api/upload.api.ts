import { api } from './ApiClient';

export type UploadOptions = {
  folder: string;
  file: File;
  metadata?: Record<string, unknown>;
};

export const uploadApi = {
  uploadFile: async ({
    folder,
    file,
    metadata = {},
  }: UploadOptions): Promise<{ path: string; publicUrl: string }> => {
    // Determina o tipo MIME do arquivo
    const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
    const fileType = file.type || 
      (fileExt === 'pdf' ? 'application/pdf' : 
       fileExt.match(/(jpg|jpeg|png|gif)/) ? `image/${fileExt}` : 
       'application/octet-stream');

    const formData = new FormData();
    formData.append('file', file);
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    // Note: The original upload.service.ts used supabase.storage directly.
    // If the backend has an endpoint for this, we should use it.
    // However, the original code used api.upload which seems to be a custom method.
    // Let's check shared/api/api.ts to see what upload does.
    
    return api.upload<{ path: string; publicUrl: string }>(`/upload/${folder}`, formData);
  }
};
