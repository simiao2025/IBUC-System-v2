import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class UploadService {
  constructor(private supabase: SupabaseService) {}

  async uploadFile(folder: string, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }

    const client = this.supabase.getAdminClient();
    const bucket = 'documentos'; // Bucket padrão

    const timestamp = Date.now();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const path = `${folder}/${timestamp}_${safeName}`;

    const { error } = await client.storage
      .from(bucket)
      .upload(path, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throw new BadRequestException(`Erro ao enviar arquivo: ${error.message}`);
    }

    const { data: { publicUrl } } = client.storage
      .from(bucket)
      .getPublicUrl(path);

    return {
      path,
      publicUrl,
    };
  }
}
