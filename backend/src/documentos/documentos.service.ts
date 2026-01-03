import { BadRequestException, Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class DocumentosService {
  constructor(private supabase: SupabaseService) {}

  async uploadDocumentosMatricula(matriculaId: string, files: any[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }

    const bucket = process.env.SUPABASE_MATRICULAS_BUCKET || 'documentos';
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
    const bucket = process.env.SUPABASE_MATRICULAS_BUCKET || 'documentos';
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

  async uploadDocumentosPreMatricula(preMatriculaId: string, files: any[]): Promise<any>;
  async uploadDocumentosPreMatricula(preMatriculaId: string, tipo: string | undefined, files: any[]): Promise<any>;
  async uploadDocumentosPreMatricula(
    preMatriculaId: string,
    tipoOrFiles: string | undefined | any[],
    maybeFiles?: any[],
  ) {
    const tipo = Array.isArray(tipoOrFiles) ? undefined : tipoOrFiles;
    const files = Array.isArray(tipoOrFiles) ? tipoOrFiles : maybeFiles;

    if (!files || files.length === 0) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }

    const bucket = process.env.SUPABASE_MATRICULAS_BUCKET || 'documentos';
    const client = this.supabase.getAdminClient();

    const uploads: {
      path: string;
      url?: string;
      name: string;
      size: number;
      type: string;
    }[] = [];

    const safeTipo = typeof tipo === 'string' && tipo.trim().length > 0 ? tipo.trim() : 'outros';

    for (const file of files) {
      const timestamp = Date.now();
      const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
      const path = `pre-matriculas/${preMatriculaId}/${safeTipo}/${timestamp}_${safeName}`;

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
      pre_matricula_id: preMatriculaId,
      arquivos: uploads,
    };
  }

  async listarDocumentosPreMatricula(preMatriculaId: string) {
    const bucket = process.env.SUPABASE_MATRICULAS_BUCKET || 'documentos';
    const client = this.supabase.getAdminClient();

    const rootPrefix = `pre-matriculas/${preMatriculaId}`;

    // Listar itens na raiz para encontrar as "pastas" (document types)
    const { data: rootItems, error: rootError } = await client.storage.from(bucket).list(rootPrefix, {
      limit: 100,
      offset: 0,
    });

    if (rootError) {
      throw new BadRequestException(`Erro ao listar documentos: ${rootError.message}`);
    }

    const allArquivos = [];

    // Para cada item encontrado na raiz
    for (const item of (rootItems || [])) {
      // Se não tiver id, geralmente significa que é uma pasta na API do Supabase Storage
      if (!item.id) {
        const subPrefix = `${rootPrefix}/${item.name}`;
        const { data: subItems, error: subError } = await client.storage.from(bucket).list(subPrefix, {
          limit: 100,
          offset: 0,
        });

        if (!subError && subItems) {
          for (const subItem of subItems) {
            const path = `${subPrefix}/${subItem.name}`;
            const {
              data: { publicUrl },
            } = client.storage.from(bucket).getPublicUrl(path);

            allArquivos.push({
              name: subItem.name,
              path,
              url: publicUrl,
              size: subItem.metadata?.size ?? undefined,
              created_at: subItem.created_at,
              updated_at: subItem.updated_at,
            });
          }
        }
      } else {
        // Arquivo na raiz
        const path = `${rootPrefix}/${item.name}`;
        const {
          data: { publicUrl },
        } = client.storage.from(bucket).getPublicUrl(path);

        allArquivos.push({
          name: item.name,
          path,
          url: publicUrl,
          size: item.metadata?.size ?? undefined,
          created_at: item.created_at,
          updated_at: item.updated_at,
        });
      }
    }

    return {
      pre_matricula_id: preMatriculaId,
      arquivos: allArquivos,
    };
  }
}






