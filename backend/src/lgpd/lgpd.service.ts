import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import archiver = require('archiver');
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LgpdService {
  constructor(private supabase: SupabaseService) { }

  async exportarDados(subjectType: string, subjectId: string) {
    const client = this.supabase.getAdminClient();
    const dados: any = {
      data_exportacao: new Date().toISOString(),
      subject_type: subjectType,
      subject_id: subjectId,
    };

    if (subjectType === 'aluno') {
      // 1. Dados Pessoais
      const { data: aluno } = await client.from('alunos').select('*').eq('id', subjectId).single();
      dados.dados_pessoais = aluno;

      // 2. Matrículas
      const { data: matriculas } = await client.from('matriculas').select('*, turma:turmas(nome)').eq('aluno_id', subjectId);
      dados.matriculas = matriculas;

      // 3. Frequência (Presenças)
      const { data: presencas } = await client.from('presencas').select('*, turma:turmas(nome)').eq('aluno_id', subjectId);
      dados.historico_presencas = presencas;

      // 4. Histórico de Módulos
      const { data: historico } = await client.from('aluno_historico_modulos').select('*, modulo:modulos(titulo)').eq('aluno_id', subjectId);
      dados.historico_academico = historico;

      // 5. Financeiro (Mensalidades)
      const { data: mensalidades } = await client.from('mensalidades').select('*').eq('aluno_id', subjectId);
      dados.financeiro = mensalidades;

      // 6. Drácmas (Recompensas)
      const { data: transacoes } = await client.from('dracmas_transacoes').select('*').eq('aluno_id', subjectId);
      dados.recompensas = transacoes;
    }

    // Criar diretório se não existir
    const storageDir = path.join(process.env.STORAGE_PATH || './storage', 'exports');
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }

    const zipName = `export-${subjectType}-${subjectId}-${Date.now()}.zip`;
    const zipPath = path.join(storageDir, zipName);
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    return new Promise<string>((resolve, reject) => {
      output.on('close', () => resolve(zipPath));
      archive.on('error', (err) => reject(err));

      archive.pipe(output);
      archive.append(JSON.stringify(dados, null, 2), { name: 'dados_pessoais.json' });

      // Documentação estática sobre o arquivo
      const readme = `ARQUIVO DE PORTABILIDADE DE DADOS - IBUC\nGerado em: ${new Date().toLocaleString('pt-BR')}\nSubject ID: ${subjectId}\n\nEste arquivo contém todos os dados vinculados ao seu registro no sistema IBUC facilitando a portabilidade conforme a LGPD.`;
      archive.append(readme, { name: 'LEIAME.txt' });

      archive.finalize();
    });
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






