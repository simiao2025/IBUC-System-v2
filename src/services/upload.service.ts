import { supabase } from '../lib/supabase';

/**
 * @deprecated Use src/services/documento.service.ts instead.
 * This service bypasses validation and creates orphan files.
 */

type UploadOptions = {
  folder: string;
  file: File;
  metadata?: Record<string, unknown>;
};

export const uploadFile = async ({
  folder,
  file,
  metadata = {},
}: UploadOptions): Promise<{ path: string; publicUrl: string }> => {
  // Gera um nome de arquivo único
  const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
  const fileName = `${Math.random().toString(36).substring(2, 15)}-${Date.now()}.${fileExt}`;
  const filePath = `${folder}/${fileName}`;

  // Determina o tipo MIME do arquivo
  const fileType = file.type || 
    (fileExt === 'pdf' ? 'application/pdf' : 
     fileExt.match(/(jpg|jpeg|png|gif)/) ? `image/${fileExt}` : 
     'application/octet-stream');

  // Configura o upload com progresso
  const { data, error } = await supabase.storage
    .from('matriculas')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: fileType,
      metadata: {
        ...metadata,
        originalName: file.name,
        size: file.size,
        type: fileType,
        uploadedAt: new Date().toISOString(),
      },
    });

  if (error) {
    console.error('Erro ao fazer upload do arquivo:', error);
    throw new Error(error.message || 'Erro ao fazer upload do arquivo');
  }

  // Obtém a URL pública do arquivo
  const { data: { publicUrl } } = supabase.storage
    .from('matriculas')
    .getPublicUrl(data.path);

  return {
    path: data.path,
    publicUrl,
  };
};
