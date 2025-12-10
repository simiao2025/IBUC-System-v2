import { BadRequestException, Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class DocumentosService {
  constructor(private supabase: SupabaseService) {}

  async uploadDocumentosMatricula(matriculaId: string, files: any[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }

    const bucket = process.env.SUPABASE_MATRICULAS_BUCKET || 'matriculas';
    const client = this.supabase.getAdminClient();

    const uploads: {
      path: string;
      url?: string;
      name: string;
      size: number;
      type: string;
    }[] = [];

    for (const file of files) {
      const timestamp = Date.now();
      const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
      const path = `matriculas/${matriculaId}/${timestamp}_${safeName}`;

      const { error } = await client.storage.from(bucket).upload(path, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

      if (error) {
        throw new BadRequestException(`Erro ao enviar arquivo: ${error.message}`);
      }

      const {
        data: { publicUrl },
      } = client.storage.from(bucket).getPublicUrl(path);

      uploads.push({
        path,
        url: publicUrl,
        name: file.originalname,
        size: file.size,
        type: file.mimetype,
      });
    }

    return {
      matricula_id: matriculaId,
      arquivos: uploads,
    };
  }

  async listarDocumentosMatricula(matriculaId: string) {
    const bucket = process.env.SUPABASE_MATRICULAS_BUCKET || 'matriculas';
    const client = this.supabase.getAdminClient();

    const prefix = `matriculas/${matriculaId}`;

    const { data, error } = await client.storage.from(bucket).list(prefix, {
      limit: 100,
      offset: 0,
    });

    if (error) {
      throw new BadRequestException(`Erro ao listar documentos: ${error.message}`);
    }

    const arquivos = (data || []).map((item) => {
      const path = `${prefix}/${item.name}`;
      const {
        data: { publicUrl },
      } = client.storage.from(bucket).getPublicUrl(path);

      return {
        name: item.name,
        path,
        url: publicUrl,
        size: item.metadata?.size ?? undefined,
        created_at: item.created_at,
        updated_at: item.updated_at,
      };
    });

    return {
      matricula_id: matriculaId,
      arquivos,
    };
  }
}






