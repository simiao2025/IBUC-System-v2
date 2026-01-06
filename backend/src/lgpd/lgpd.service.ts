import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import * as archiver from 'archiver';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LgpdService {
  constructor(private supabase: SupabaseService) {}

  async exportarDados(subjectType: string, subjectId: string) {
    // Buscar todos os dados relacionados
    const dados: any = {};

    if (subjectType === 'aluno') {
      const { data: aluno } = await this.supabase
        .getAdminClient()
        .from('alunos')
        .select('*')
        .eq('id', subjectId)
        .single();

      dados.aluno = aluno;

      // Buscar documentos
      const { data: documentos } = await this.supabase
        .getAdminClient()
        .from('documentos')
        .select('*')
        .eq('owner_type', 'aluno')
        .eq('owner_id', subjectId);

      dados.documentos = documentos;
    }

    // Criar arquivo ZIP
    const zipPath = path.join(process.env.STORAGE_PATH || './storage', `export-${subjectId}.zip`);
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip');

    archive.pipe(output);
    archive.append(JSON.stringify(dados, null, 2), { name: 'dados.json' });

    // Adicionar documentos se houver
    if (dados.documentos) {
      for (const doc of dados.documentos) {
        // Baixar do Supabase Storage e adicionar ao ZIP
        // Implementar download de arquivos
      }
    }

    await archive.finalize();

    return zipPath;
  }

  async anonymizarDados(subjectType: string, subjectId: string) {
    // Anonymizar dados mantendo apenas o necessário para auditoria
    if (subjectType === 'aluno') {
      await this.supabase
        .getAdminClient()
        .from('alunos')
        .update({
          nome: 'ANONIMIZADO',
          cpf: null,
          email: null,
          telefone: null,
        })
        .eq('id', subjectId);
    }

    return { success: true };
  }
}






