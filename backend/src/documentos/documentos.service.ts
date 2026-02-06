import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { GoogleDriveService } from './google-drive.service';

@Injectable()
export class DocumentosService {
  private readonly logger = new Logger(DocumentosService.name);

  constructor(
    private supabase: SupabaseService,
    private googleDrive: GoogleDriveService,
  ) { }

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

    const client = this.supabase.getAdminClient();
    const uploads: any[] = [];
    const safeTipo = typeof tipo === 'string' && tipo.trim().length > 0 ? tipo.trim() : 'outros';

    for (const file of files) {
      try {
        // Enviar para o Google Drive
        const driveFile = await this.googleDrive.uploadFile(file, `pre-matricula_${preMatriculaId}`);

        // Salvar metadados na tabela 'documentos'
        const { data: docRecord, error: dbError } = await client
          .from('documentos')
          .insert({
            owner_type: 'aluno', // Pré-matrícula é tecnicamente um aluno pendente
            owner_id: preMatriculaId,
            tipo_documento: this.mapTipoDocumento(safeTipo),
            url: driveFile.url,
            file_name: file.originalname,
            uploaded_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (dbError) {
          this.logger.error('Erro ao salvar metadados do documento no banco', dbError);
        }

        uploads.push({
          id: docRecord?.id,
          name: file.originalname,
          url: driveFile.url,
          source: 'google_drive',
          tipo: safeTipo
        });
      } catch (error) {
        this.logger.error(`Falha no upload para o Drive: ${file.originalname}`, error);
        // Fallback para Supabase Storage opcionalmente, ou apenas erro
        throw new BadRequestException(`Erro ao processar ${file.originalname}: ${error.message}`);
      }
    }

    return {
      pre_matricula_id: preMatriculaId,
      arquivos: uploads,
    };
  }

  async listarDocumentosPreMatricula(preMatriculaId: string) {
    const client = this.supabase.getAdminClient();
    const bucket = process.env.SUPABASE_MATRICULAS_BUCKET || 'documentos';
    const allArquivos: any[] = [];

    // 1. Buscar na tabela 'documentos' (Fonte de verdade para novos arquivos no Drive)
    const { data: dbDocs } = await client
      .from('documentos')
      .select('*')
      .eq('owner_id', preMatriculaId);

    if (dbDocs) {
      dbDocs.forEach(doc => {
        allArquivos.push({
          id: doc.id,
          name: doc.file_name,
          url: doc.url,
          path: `google-drive/${doc.tipo_documento}/${doc.file_name}`, // Simula caminho para compatibilidade com o frontend
          source: 'database',
          tipo: doc.tipo_documento,
          created_at: doc.uploaded_at
        });
      });
    }

    // 2. Buscar no Supabase Storage (Compatibilidade Legada)
    const rootPrefix = `pre-matriculas/${preMatriculaId}`;
    try {
      const { data: rootItems } = await client.storage.from(bucket).list(rootPrefix);
      if (rootItems) {
        for (const item of rootItems) {
          if (!item.id) { // Pasta
            const subPrefix = `${rootPrefix}/${item.name}`;
            const { data: subItems } = await client.storage.from(bucket).list(subPrefix);
            if (subItems) {
              for (const subItem of subItems) {
                const path = `${subPrefix}/${subItem.name}`;
                const { data: { publicUrl } } = client.storage.from(bucket).getPublicUrl(path);
                
                // Adiciona se não estiver nas já buscadas pelo banco
                if (!allArquivos.some(a => a.name === subItem.name)) {
                  allArquivos.push({
                    name: subItem.name,
                    path,
                    url: publicUrl,
                    source: 'storage',
                    tipo: item.name,
                    created_at: subItem.created_at
                  });
                }
              }
            }
          } else {
             const path = `${rootPrefix}/${item.name}`;
             const { data: { publicUrl } } = client.storage.from(bucket).getPublicUrl(path);
             if (!allArquivos.some(a => a.name === item.name)) {
               allArquivos.push({
                 name: item.name,
                 path,
                 url: publicUrl,
                 source: 'storage',
                 tipo: 'outros',
                 created_at: item.created_at
               });
             }
          }
        }
      }
    } catch (e) {
      this.logger.warn(`Erro ao buscar no storage legado: ${e.message}`);
    }

    return {
      pre_matricula_id: preMatriculaId,
      arquivos: allArquivos,
    };
  }

  async uploadDocumentosMatricula(matriculaId: string, files: any[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }

    const client = this.supabase.getAdminClient();
    const uploads: any[] = [];

    for (const file of files) {
      try {
        const driveFile = await this.googleDrive.uploadFile(file, `matricula_${matriculaId}`);

        const { data: docRecord } = await client
          .from('documentos')
          .insert({
            owner_type: 'aluno', // Matrícula é vinculada ao aluno
            owner_id: matriculaId,
            tipo_documento: 'outro',
            url: driveFile.url,
            file_name: file.originalname,
            uploaded_at: new Date().toISOString(),
          })
          .select()
          .single();

        uploads.push({
          id: docRecord?.id,
          name: file.originalname,
          url: driveFile.url,
          source: 'google_drive'
        });
      } catch (error) {
        this.logger.error(`Falha no upload da matrícula para o Drive: ${file.originalname}`, error);
        throw new BadRequestException(`Erro ao processar ${file.originalname}: ${error.message}`);
      }
    }

    return {
      matricula_id: matriculaId,
      arquivos: uploads,
    };
  }

  async uploadDocumentosAluno(alunoId: string, tipo: string | undefined, files: any[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }

    const client = this.supabase.getAdminClient();
    const uploads: any[] = [];
    const safeTipo = tipo || 'outro';

    for (const file of files) {
      try {
        const driveFile = await this.googleDrive.uploadFile(file, `aluno_${alunoId}`);

        const { data: docRecord } = await client
          .from('documentos')
          .insert({
            owner_type: 'aluno',
            owner_id: alunoId,
            tipo_documento: this.mapTipoDocumento(safeTipo),
            url: driveFile.url,
            file_name: file.originalname,
            uploaded_at: new Date().toISOString(),
          })
          .select()
          .single();

        uploads.push({
          id: docRecord?.id,
          name: file.originalname,
          url: driveFile.url,
          source: 'google_drive',
          tipo: safeTipo
        });
      } catch (error) {
        this.logger.error(`Falha no upload do aluno para o Drive: ${file.originalname}`, error);
        throw new BadRequestException(`Erro ao enviar ${file.originalname}: ${error.message}`);
      }
    }

    return {
      aluno_id: alunoId,
      arquivos: uploads,
    };
  }

  private mapTipoDocumento(tipo: string): string {
    const map: Record<string, string> = {
      'rg': 'rg',
      'cpf': 'cpf',
      'certidao': 'certidao',
      'foto': 'foto',
      'comprovante_residencia': 'comprovante_residencia',
      'laudo': 'laudo'
    };
    return map[tipo] || 'outro';
  }

  async listarDocumentosAluno(alunoId: string) {
    const client = this.supabase.getAdminClient();
    const bucket = process.env.SUPABASE_MATRICULAS_BUCKET || 'documentos';
    const allArquivos: any[] = [];

    // 1. Buscar na tabela 'documentos' (Fonte de verdade para novos arquivos no Drive)
    // Buscamos tanto pelo aluno_id quanto pela pré-matrícula associada (se houver)
    const { data: dbDocs } = await client
      .from('documentos')
      .select('*')
      .eq('owner_id', alunoId);

    if (dbDocs) {
      dbDocs.forEach(doc => {
        allArquivos.push({
          id: doc.id,
          name: doc.file_name,
          url: doc.url,
          path: `google-drive/${doc.tipo_documento}/${doc.file_name}`,
          source: 'database',
          tipo: doc.tipo_documento,
          created_at: doc.uploaded_at
        });
      });
    }

    // 2. Compatibilidade Legada: Buscar no Supabase Storage
    const processItems = async (prefix: string) => {
      try {
        const { data: rootItems } = await client.storage.from(bucket).list(prefix);
        if (!rootItems) return;

        for (const item of rootItems) {
          if (!item.id) { // Pasta
            const subPrefix = `${prefix}/${item.name}`;
            const { data: subItems } = await client.storage.from(bucket).list(subPrefix);
            if (subItems) {
              for (const subItem of subItems) {
                const path = `${subPrefix}/${subItem.name}`;
                const { data: { publicUrl } } = client.storage.from(bucket).getPublicUrl(path);
                
                if (!allArquivos.some(a => a.name === subItem.name)) {
                  allArquivos.push({
                    name: subItem.name,
                    path,
                    url: publicUrl,
                    source: 'storage',
                    tipo: item.name,
                    created_at: subItem.created_at
                  });
                }
              }
            }
          } else {
             const path = `${prefix}/${item.name}`;
             const { data: { publicUrl } } = client.storage.from(bucket).getPublicUrl(path);
             if (!allArquivos.some(a => a.name === item.name)) {
               allArquivos.push({
                 name: item.name,
                 path,
                 url: publicUrl,
                 source: 'storage',
                 tipo: 'outros',
                 created_at: item.created_at
               });
             }
          }
        }
      } catch (e) {
        this.logger.warn(`Erro no processItems (${prefix}): ${e.message}`);
      }
    };

    // Buscar no caminho padrão e legado
    await processItems(`alunos/${alunoId}`);
    await processItems(`pre-matriculas/${alunoId}`);

    // Buscar também documentos associados ao CPF da pré-matrícula
    const { data: aluno } = await client.from('alunos').select('cpf').eq('id', alunoId).single();
    if (aluno?.cpf) {
      const cpfNormalizado = String(aluno.cpf).replace(/\D/g, '');
      
      // Buscar IDs de pré-matrículas pelo CPF
      const { data: pms } = await client
        .from('pre_matriculas')
        .select('id')
        .eq('cpf', cpfNormalizado);
      
      const ids = pms?.map(pm => pm.id) || [];
      for (const id of ids) {
        // Buscar no DB para essa PM
        const { data: pmDbDocs } = await client.from('documentos').select('*').eq('owner_id', id);
        pmDbDocs?.forEach(doc => {
          if (!allArquivos.some(a => (a.id === doc.id) || (a.name === doc.file_name))) {
            allArquivos.push({
              id: doc.id,
              name: doc.file_name,
              url: doc.url,
              path: `google-drive/${doc.tipo_documento}/${doc.file_name}`,
              source: 'database',
              tipo: doc.tipo_documento,
              created_at: doc.uploaded_at
            });
          }
        });
        // Buscar no Storage para essa PM
        await processItems(`pre-matriculas/${id}`);
      }
    }

    return {
      aluno_id: alunoId,
      arquivos: allArquivos,
    };
  }
}






