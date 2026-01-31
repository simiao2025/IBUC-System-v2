/*
 * ------------------------------------------------------------------
 * 🔒 ARQUIVO BLINDADO / SHIELDED FILE 🔒
 * ------------------------------------------------------------------
 * ESTE ARQUIVO CONTÉM LÓGICA CRÍTICA DE GERAÇÃO DE RELATÓRIOS.
 * (Certificado, Histórico, Boletim)
 *
 * NÃO REFATORE OU MODIFIQUE SEM UM PLANO DE REFATORAÇÃO APROVADO
 * E UMA ANÁLISE DE IMPACTO PRÉVIA (/impact-analysis).
 *
 * QUALQUER ALTERAÇÃO DEVE SER ESTRITAMENTE NECESSÁRIA E VALIDADA.
 * ------------------------------------------------------------------
 */
import { Injectable } from '@nestjs/common';
import PDFDocument = require('pdfkit');
import * as fs from 'fs';
import * as path from 'path';
import { SupabaseService } from '../supabase/supabase.service';
import * as QRCode from 'qrcode';
import axios from 'axios';
import * as crypto from 'crypto';
import { PDFDocument as LibPDFDocument, StandardFonts } from 'pdf-lib';
import { PoloScopeUtil } from '../auth/utils/polo-scope.util';

@Injectable()
export class PdfService {
  private logoBuffer: Buffer | null = null;

  constructor(private supabase: SupabaseService) { }

  /**
   * Gera um código de validação único para certificados
   * Formato: IBUC-YYYYMMDD-XXXXXX (onde XXXXXX é alfanumérico)
   */
  private gerarCodigoValidacao(): string {
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomPart = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `IBUC-${timestamp}-${randomPart}`;
  }

  private async getLogo() {
    if (this.logoBuffer) return this.logoBuffer;
    try {
      const resp = await axios.get('https://ibuc.com.br/wp-content/uploads/2023/05/logo-site.png', { responseType: 'arraybuffer' });
      this.logoBuffer = Buffer.from(resp.data);
      return this.logoBuffer;
    } catch (e) {
      return null;
    }
  }

  async gerarTermoMatricula(matriculaId: string) {
    // Buscar dados da matrícula
    const { data: matricula } = await this.supabase
      .getAdminClient()
      .from('matriculas')
      .select(`
        *,
        aluno:alunos!fk_aluno(id, nome, cpf, data_nascimento),
        polo:polos!fk_polo(id, nome, codigo),
        turma:turmas!fk_turma(id, nome)
      `)
      .eq('id', matriculaId)
      .single();

    if (!matricula) {
      throw new Error('Matrícula não encontrada');
    }

    // Gerar PDF
    const doc = new PDFDocument({ margin: 50 });
    const fileName = `termo-matricula-${matriculaId}.pdf`;
    const filePath = path.join(process.env.STORAGE_PATH || './storage', fileName);

    // Criar diretório se não existir
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Conteúdo do PDF
    doc.fontSize(20).text('TERMO DE MATRÍCULA', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12);
    doc.text(`Protocolo: ${matricula.protocolo}`);
    doc.text(`Data: ${new Date(matricula.data_matricula).toLocaleDateString('pt-BR')}`);
    doc.moveDown();
    doc.text(`Aluno: ${matricula.aluno?.nome}`);
    doc.text(`Polo: ${matricula.polo?.nome}`);
    if (matricula.turma) {
      doc.text(`Turma: ${matricula.turma?.nome}`);
    }
    doc.moveDown();
    doc.text('Termos e Condições:');
    doc.text('1. O aluno compromete-se a frequentar as aulas regularmente.');
    doc.text('2. O responsável autoriza o uso de imagem do aluno para fins educacionais.');
    doc.text('3. O polo se compromete a fornecer ensino de qualidade.');

    // Gerar QR Code
    const qrData = JSON.stringify({
      protocolo: matricula.protocolo,
      aluno: matricula.aluno?.nome,
      status: matricula.status,
    });
    const qrCodeBuffer = await QRCode.toBuffer(qrData);
    doc.image(qrCodeBuffer, { width: 100, align: 'center' });

    doc.end();

    await new Promise<void>((resolve) => {
      stream.on('finish', () => resolve());
    });

    // Upload para Supabase Storage
    const fileBuffer = fs.readFileSync(filePath);
    const { data: uploadData, error } = await this.supabase
      .getAdminClient()
      .storage
      .from('documentos')
      .upload(`termos/${fileName}`, fileBuffer, {
        contentType: 'application/pdf',
      });

    if (error) {
      console.error('Erro ao fazer upload:', error);
    }

    // Atualizar matrícula com URL do termo
    if (uploadData) {
      const { data: publicUrl } = this.supabase
        .getAdminClient()
        .storage
        .from('documentos')
        .getPublicUrl(`termos/${fileName}`);

      await this.supabase
        .getAdminClient()
        .from('matriculas')
        .update({ metadata: { termo_url: publicUrl.publicUrl } })
        .eq('id', matriculaId);
    }

    // Limpar arquivo local
    fs.unlinkSync(filePath);

    return { success: true, url: uploadData?.path };
  }

  async gerarBoletim(alunoId: string, periodo: string, passedModuloId?: string, passedTurmaId?: string, bulletinId?: string): Promise<Buffer> {
    const client = this.supabase.getAdminClient();

    // 0. Tentar buscar módulo da matrícula ativa se não for passado
    let turmaId = passedTurmaId;
    let moduloId = passedModuloId;

    if (!moduloId) {
      const { data: mAtiva } = await client
        .from('matriculas')
        .select('turma_id, turma:turmas(modulo_atual_id)')
        .eq('aluno_id', alunoId)
        .eq('status', 'ativa')
        .maybeSingle();

      turmaId = mAtiva?.turma_id;
      moduloId = (mAtiva as any)?.turma?.modulo_atual_id;
    }



    // 1. Buscar Dados do Aluno (Sem embedding para evitar ambiguidade)
    const { data: aluno, error: alunoError } = await client
      .from('alunos')
      .select(`
        id,
        nome,
        cpf,
        sexo,
        polo:polos(id, nome)
      `)
      .eq('id', alunoId)
      .single();

    if (alunoError || !aluno) {
      throw new Error(`Aluno não encontrado: ${alunoId} (${alunoError?.message})`);
    }

    // 2. Buscar Matrículas separadamente
    const { data: matriculas, error: matriculasError } = await client
      .from('matriculas')
      .select(`
        id,
        status,
        protocolo,
        turma:turmas(
          id,
          nome,
          dia_semana:dias_semana,
          horario:horario_inicio,
          professor_id,
          nivel:niveis(nome)
        )
      `)
      .eq('aluno_id', alunoId);

    if (matriculasError) {
      throw new Error(`Erro ao buscar matrículas: ${matriculasError.message}`);
    }

    const matriculaAtiva = (matriculas as any)?.find((m: any) => m.status === 'ativa');
    const turma = (matriculaAtiva as any)?.turma;

    // 3. Buscar Dados do Módulo e Lições
    const { data: modulo } = await client
      .from('modulos')
      .select('id, titulo, numero')
      .eq('id', moduloId)
      .single();

    const { data: licoes } = await client
      .from('licoes')
      .select('id, titulo, ordem')
      .eq('modulo_id', moduloId)
      .order('ordem', { ascending: true });

    const licaoIds = licoes?.map(l => l.id) || [];

    // 4. Buscar Presenças (vinculadas a estas lições ou no período se não houver lição_id)
    const { data: presencas } = await client
      .from('presencas')
      .select('status, licao_id, data')
      .eq('aluno_id', alunoId)
      .in('licao_id', licaoIds);

    // 5. Buscar Drácmas (vinculadas às datas das lições ou no período)
    // Para simplificar e bater com a imagem, vamos buscar todas as transações do aluno
    // e tentar bater com as lições se houver um link, ou por data.
    const { data: dracmasTrans } = await client
      .from('dracmas_transacoes')
      .select('quantidade, data, descricao')
      .eq('aluno_id', alunoId);

    // 6. Consolidar dados para a tabela
    const tabelaLicoes = licoes?.map(licao => {
      const presenca = presencas?.find(p => p.licao_id === licao.id);
      // Dracmas da lição: se houver presenca na data, pegamos transações dessa data
      const dracmasNaData = presenca
        ? dracmasTrans?.filter(d => d.data === presenca.data).reduce((acc, curr) => acc + curr.quantidade, 0) || 0
        : 0;

      return {
        titulo: licao.titulo,
        frequencia: presenca ? (presenca.status === 'presente' ? 'P' : presenca.status === 'falta' ? 'F' : 'J') : '-',
        dracmas: dracmasNaData
      };
    }) || [];

    const totalAulas = licoes?.length || 0;
    const presentes = tabelaLicoes.filter(t => t.frequencia === 'P').length;
    const frequencia = totalAulas > 0 ? Math.round((presentes / totalAulas) * 100) : 0;
    const totalDracmas = tabelaLicoes.reduce((acc, curr) => acc + curr.dracmas, 0);

    // 7. Configurações de Cabeçalho (Polo, Professor, Ano Letivo)
    const poloNome = (aluno as any).polo?.nome || '---';
    const diasMapa: Record<number, string> = {
      1: 'Domingo', 2: 'Segunda-feira', 3: 'Terça-feira', 4: 'Quarta-feira',
      5: 'Quinta-feira', 6: 'Sexta-feira', 7: 'Sábado'
    };
    const diaDesc = turma?.dia_semana?.[0] ? diasMapa[turma.dia_semana[0]] : '---';
    const horarioFmt = turma?.horario ? turma.horario.substring(0, 5) : '---';

    const professorId = (turma as any)?.professor_id;
    let professorNome = '---';
    if (professorId) {
      const { data: profData } = await client.from('usuarios').select('nome_completo').eq('id', professorId).single();
      professorNome = profData?.nome_completo || '---';
    }

    const { data: configAno } = await client.from('configuracoes_sistema').select('valor').eq('chave', 'ano_letivo').maybeSingle();
    const anoLetivo = configAno?.valor || new Date().getFullYear().toString();

    // 8. Iniciar PDF
    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));

    // --- Design do Boletim (REFINADO) ---
    doc.rect(40, 30, doc.page.width - 80, doc.page.height - 60).lineWidth(1.5).stroke('#000000');

    // Cabeçalho
    const logo = await this.getLogo();
    if (logo) {
      doc.image(logo, 60, 50, { width: 100 });
      doc.fillColor('#000000').fontSize(14).font('Helvetica-Bold').text('Instituto Bíblico Único Caminho', 170, 60);
      doc.fontSize(12).font('Helvetica').text('Palmas - TO', 170, 80);
    }

    doc.moveTo(60, 130).lineTo(535, 130).lineWidth(1).stroke('#000000');
    doc.fontSize(15).font('Helvetica-Bold').text('BOLETIM DO ALUNO', 40, 145, { align: 'center' });

    // Info do Aluno
    const infoY = 180;
    const infoLineH = 18; // Increased line height to avoid overlap
    doc.fontSize(10).font('Helvetica');

    doc.font('Helvetica-Bold').text('Aluno: ', 60, infoY, { continued: true }).font('Helvetica').text(aluno.nome.toUpperCase());
    const protocolRaw = (matriculaAtiva as any)?.protocolo || '---';
    const protocolFmt = protocolRaw.includes('-') ? protocolRaw.split('-').slice(0, 2).join('-') : protocolRaw;
    doc.font('Helvetica-Bold').text('Matrícula: ', 400, infoY, { continued: true }).font('Helvetica').text(protocolFmt);

    doc.font('Helvetica-Bold').text('CPF: ', 60, infoY + infoLineH, { continued: true }).font('Helvetica').text(aluno.cpf || '---');
    doc.font('Helvetica-Bold').text('Sexo: ', 400, infoY + infoLineH, { continued: true }).font('Helvetica').text(aluno.sexo === 'M' ? 'Masculino' : aluno.sexo === 'F' ? 'Feminino' : 'Outro');

    doc.font('Helvetica-Bold').text('Turma: ', 60, infoY + infoLineH * 2, { continued: true }).font('Helvetica').text(`${turma?.nome || '---'} ${turma?.nivel?.nome || ''}`);
    doc.font('Helvetica-Bold').text('Polo: ', 400, infoY + infoLineH * 2, { continued: true }).font('Helvetica').text(poloNome);

    doc.font('Helvetica-Bold').text('Professor(a): ', 60, infoY + infoLineH * 3, { continued: true }).font('Helvetica').text(professorNome);
    doc.font('Helvetica-Bold').text('Ano Letivo: ', 400, infoY + infoLineH * 3, { continued: true }).font('Helvetica').text(anoLetivo);

    doc.font('Helvetica-Bold').text('Dia/Hora: ', 60, infoY + infoLineH * 4, { continued: true }).font('Helvetica').text(`${diaDesc} às ${horarioFmt}`);

    doc.moveTo(60, 265).lineTo(535, 265).lineWidth(1).stroke('#000000');

    // Módulo Título
    doc.fontSize(12).font('Helvetica-Bold').text(`MÓDULO ${modulo?.numero || ''} - ${modulo?.titulo?.toUpperCase() || ''}`, 40, 270, { align: 'center' });

    // Tabela de Lições
    const tableTop = 290;
    doc.lineWidth(1).strokeColor('#000000');

    // Header da Tabela
    doc.rect(60, tableTop, 475, 20).stroke();
    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('LIÇÕES', 65, tableTop + 6, { width: 340 });

    // Linha vertical 1 (entre LIÇÕES e FREQUÊNCIA)
    doc.moveTo(405, tableTop).lineTo(405, tableTop + 20).stroke();
    doc.text('FREQUÊNCIA', 410, tableTop + 6, { width: 70, align: 'center' });

    // Linha vertical 2 (entre FREQUÊNCIA e DRÁCMAS)
    doc.moveTo(480, tableTop).lineTo(480, tableTop + 20).stroke();
    doc.text('DRÁCMAS', 485, tableTop + 6, { width: 50, align: 'center' });

    // Linhas
    let currentY = tableTop + 20;
    tabelaLicoes.forEach((row, i) => {
      const rowHeight = 18;
      if (currentY + rowHeight > 700) { // Nova página se necessário (simplificado)
        // Para o boletim de 1 página, assumimos que cabe
      }
      doc.rect(60, currentY, 475, rowHeight).stroke();

      // Linhas verticais dos dados
      doc.moveTo(405, currentY).lineTo(405, currentY + rowHeight).stroke();
      doc.moveTo(480, currentY).lineTo(480, currentY + rowHeight).stroke();

      doc.font('Helvetica').fontSize(8);
      doc.text(row.titulo, 65, currentY + 5, { width: 340 });
      doc.text(row.frequencia, 410, currentY + 5, { width: 70, align: 'center' });
      doc.text(row.dracmas.toString(), 485, currentY + 5, { width: 50, align: 'center' });
      currentY += rowHeight;
    });

    // Resumo do Módulo
    const summaryY = currentY + 15;
    doc.rect(60, summaryY, 475, 60).lineWidth(1.2).stroke('#000000');
    doc.fontSize(10).font('Helvetica-Bold').text('RESUMO DO MÓDULO', 70, summaryY + 8);

    doc.font('Helvetica').fontSize(9);
    doc.text(`Total de Presenças: ${presentes} / ${totalAulas}`, 70, summaryY + 25);
    doc.text(`Frequência: ${frequencia}%`, 230, summaryY + 25);
    doc.text(`Total de Drácmas: ${totalDracmas}`, 430, summaryY + 25);

    doc.font('Helvetica-Bold').fontSize(11).text('Situação: CURSANDO', 70, summaryY + 42);

    doc.font('Helvetica').fontSize(7).text(`Legenda: P = Presente | F = Falta | Critério: Frequência mínima de 75%`, 60, summaryY + 65);

    // Assinaturas
    const footY = doc.page.height - 120;

    // Assinatura Professora
    doc.moveTo(60, footY).lineTo(250, footY).stroke();
    doc.fontSize(8).text('Assinatura da Professora', 60, footY + 4, { width: 190, align: 'center' });

    // Assinatura Diretor
    doc.moveTo(345, footY).lineTo(535, footY).stroke();
    doc.fontSize(8).text('Assinatura do Diretor', 345, footY + 4, { width: 190, align: 'center' });

    const dataEmissao = new Date().toLocaleDateString('pt-BR');
    doc.fontSize(8).text(`Data de Emissão: ${dataEmissao}`, 60, footY + 20);

    if (bulletinId) {
      doc.fontSize(7).text(`Autenticação: ${bulletinId}`, 60, footY + 32);
    }

    doc.end();

    return new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      doc.on('error', (err) => {
        reject(err);
      });
    });
  }

  async gerarBoletimLote(alunoIds: string[], moduloId: string) {
    const client = this.supabase.getAdminClient();

    // Gerar nome de arquivo determinístico para permitir "update" (overwrite)
    const crypto = require('crypto');
    const hash = crypto.createHash('md5').update((alunoIds || []).sort().join(',')).digest('hex');
    const fileName = `boletim-lote-${moduloId}-${hash.substring(0, 8)}-${Date.now()}.pdf`;

    const doc = new PDFDocument({ margin: 50, size: 'A4', autoFirstPage: false });
    const filePath = path.join(process.env.STORAGE_PATH || './storage', 'boletins-lote', fileName);

    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // 1. Fetch Modulo Shared
    const { data: modulo } = await client.from('modulos').select('titulo, numero').eq('id', moduloId).single();
    const moduloTitulo = modulo?.titulo || 'Módulo Desconhecido';
    const moduloNumero = modulo?.numero || 0;

    // 2. Fetch Lessons Shared
    const { data: licoesModulo } = await client.from('licoes').select('id').eq('modulo_id', moduloId);
    const licaoIdsSet = new Set(licoesModulo?.map(l => l.id) || []);
    const totalLicoesModulo = licaoIdsSet.size;

    let studentsProcessed = 0;
    let errorLog: string[] = [];

    // Iterar sobre cada aluno e gerar sua página
    for (const alunoId of (alunoIds || [])) {
      if (!alunoId) continue;

      try {
        // --- BUSCA DE DADOS ---
        // 1. Buscar Dados do Aluno
        const { data: aluno, error: alunoError } = await client
          .from('alunos')
          .select(`
            id, 
            nome, 
            cpf, 
            sexo,
            polo:polos(nome)
          `)
          .eq('id', alunoId)
          .single();

        if (alunoError || !aluno) {
          errorLog.push(`[V4-SURGICAL] Aluno ${alunoId}: não encontrado ou erro na query do aluno (${alunoError?.message || 'NULL'})`);
          continue;
        }

        // 2. Buscar Matrículas separadamente para evitar erro "more than one relationship"
        const { data: matriculas, error: matriculasError } = await client
          .from('matriculas')
          .select(`
            id, 
            status, 
            protocolo,
            turma:turmas(
              id, 
              nome, 
              dia_semana:dias_semana, 
              horario:horario_inicio,
              professor_id,
              nivel:niveis(nome)
            )
          `)
          .eq('aluno_id', alunoId);

        if (matriculasError) {
          errorLog.push(`[V4-SURGICAL] Aluno ${alunoId}: erro ao buscar matrículas (${matriculasError.message})`);
          continue;
        }

        const matriculaAtiva = (matriculas as any)?.find((m: any) => m.status === 'ativa');
        const turma = (matriculaAtiva as any)?.turma;

        // Buscar TODAS as presenças do aluno e filtrar em memória
        const { data: presencas } = await client
          .from('presencas')
          .select('status, licao_id')
          .eq('aluno_id', alunoId);

        const presencasFiltradas = (presencas || []).filter((p: any) => p.licao_id && licaoIdsSet.has(p.licao_id));
        const totalAulas = Math.max(totalLicoesModulo, presencasFiltradas.length);
        const presentes = presencasFiltradas.filter((p: any) => ['presente', 'atraso', 'justificativa'].includes(p.status)).length;
        const frequencia = totalAulas > 0 ? Math.round((presentes / totalAulas) * 100) : 0;

        // Drácmas
        const { data: dracmas } = await client
          .from('dracmas_transacoes')
          .select('quantidade')
          .eq('aluno_id', alunoId);
        const totalDracmas = dracmas?.reduce((acc, curr) => acc + (curr.quantidade || 0), 0) || 0;

        // --- GERAÇÃO DA PÁGINA (MODELO ACADÊMICO CLÁSSICO) ---
        doc.addPage();
        studentsProcessed++;

        // --- BACKGROUND & MOLDURA ---
        doc.rect(0, 0, doc.page.width, doc.page.height).fill('#ffffff');
        doc.rect(40, 30, doc.page.width - 80, doc.page.height - 60).lineWidth(1.5).stroke('#000000');

        // --- CABEÇALHO (CENTRALIZADO) ---
        const logoLote = await this.getLogo();
        if (logoLote) {
          doc.image(logoLote, 60, 50, { width: 100 });
          doc.fillColor('#000000').fontSize(14).font('Helvetica').text('Instituto Bíblico Único Caminho', 170, 60);
          doc.fontSize(12).text('Palmas - TO', 170, 80);
        } else {
          doc.fillColor('#000000').fontSize(24).font('Helvetica-Bold').text('IBUC', 40, 60, { align: 'center' });
          doc.fontSize(14).font('Helvetica').text('Instituto Bíblico Único Caminho', 40, 90, { align: 'center' });
          doc.fontSize(12).text('Palmas - TO', 40, 110, { align: 'center' });
        }

        doc.moveTo(60, 125).lineTo(535, 125).lineWidth(1).stroke('#000000');

        doc.fontSize(15).font('Helvetica-Bold').text('BOLETIM DO ALUNO', 40, 140, { align: 'center' });

        // --- DADOS DO ALUNO (GRID COMPACTO) ---
        const infoY = 170;
        doc.fontSize(10).font('Helvetica');

        // Linha 1: Aluno e Matrícula
        doc.font('Helvetica-Bold').text('Aluno: ', 60, infoY, { continued: true }).font('Helvetica').text(aluno.nome.toUpperCase());
        const protocolRawLote = (matriculaAtiva as any)?.protocolo || '---';
        const protocoloFmt = protocolRawLote.split('-').slice(0, 2).join('-');
        doc.font('Helvetica-Bold').text('Matrícula: ', 380, infoY, { continued: true }).font('Helvetica').text(protocoloFmt);

        // Linha 2: CPF e Sexo
        doc.font('Helvetica-Bold').text('CPF: ', 60, infoY + 18, { continued: true }).font('Helvetica').text(aluno.cpf || '---');
        doc.font('Helvetica-Bold').text('Sexo: ', 380, infoY + 18, { continued: true }).font('Helvetica').text(aluno.sexo === 'M' ? 'Masculino' : aluno.sexo === 'F' ? 'Feminino' : 'Outro');

        // Linha 3: Turma e Polo
        doc.font('Helvetica-Bold').text('Turma: ', 60, infoY + 36, { continued: true }).font('Helvetica').text(`${turma?.nome || '---'} ${turma?.nivel?.nome || ''}`);
        doc.font('Helvetica-Bold').text('Polo: ', 380, infoY + 36, { continued: true }).font('Helvetica').text((aluno as any).polo?.nome || '---');

        // Linha 4: Dia da Semana e Professor
        const diasMapa: Record<number, string> = {
          1: 'Domingo', 2: 'Segunda-feira', 3: 'Terça-feira', 4: 'Quarta-feira',
          5: 'Quinta-feira', 6: 'Sexta-feira', 7: 'Sábado'
        };
        const diaDesc = turma?.dia_semana?.[0] ? diasMapa[turma.dia_semana[0]] : '---';
        const horarioFmt = turma?.horario ? turma.horario.substring(0, 5) : '---';

        const { data: configAno } = await client.from('configuracoes_sistema').select('valor').eq('chave', 'ano_letivo').maybeSingle();
        const anoLetivo = configAno?.valor || '---';

        const professorId = (turma as any)?.professor_id;
        let professorNome = '---';
        if (professorId) {
          const { data: profData } = await client.from('usuarios').select('nome_completo').eq('id', professorId).single();
          professorNome = profData?.nome_completo || '---';
        }

        doc.font('Helvetica-Bold').text('Professor(a): ', 60, infoY + 54, { continued: true }).font('Helvetica').text(professorNome);
        doc.font('Helvetica-Bold').text('Ano Letivo: ', 380, infoY + 54, { continued: true }).font('Helvetica').text(anoLetivo);

        // Linha 5: Dia/Hora
        doc.font('Helvetica-Bold').text('Dia/Hora: ', 60, infoY + 72, { continued: true }).font('Helvetica').text(`${diaDesc} às ${horarioFmt}`);

        doc.moveTo(60, 255).lineTo(535, 255).lineWidth(1).stroke('#000000');

        // --- MÓDULO ---
        doc.fontSize(13).font('Helvetica-Bold').text(`MÓDULO ${moduloNumero} - ${moduloTitulo.toUpperCase()}`, 40, 275, { align: 'center' });

        // --- TABELA DE AULAS ---
        const tableY = 295;
        // Cabeçalho da Tabela
        doc.rect(60, tableY, 475, 22).lineWidth(1.2).stroke('#000000');
        doc.fontSize(9).font('Helvetica-Bold');
        doc.text('LIÇÕES', 70, tableY + 7);
        doc.text('FREQUÊNCIA', 415, tableY + 7);
        doc.text('DRÁCMAS', 485, tableY + 7);

        doc.moveTo(410, tableY).lineTo(410, tableY + 22).stroke();
        doc.moveTo(480, tableY).lineTo(480, tableY + 22).stroke();

        let currentY = tableY + 22;
        let totalDracmasCalculados = 0;
        let totalPresentesCalculados = 0;

        const { data: licoes } = await client.from('licoes').select('id, titulo, ordem').eq('modulo_id', moduloId).order('ordem', { ascending: true });

        for (const licao of (licoes || [])) {
          doc.rect(60, currentY, 475, 20).stroke('#000000');
          doc.moveTo(410, currentY).lineTo(410, currentY + 20).stroke();
          doc.moveTo(480, currentY).lineTo(480, currentY + 20).stroke();

          doc.fillColor('#000000').fontSize(8).font('Helvetica');
          doc.text(licao.titulo, 70, currentY + 6, { width: 330, ellipsis: true });

          const presenca = presencasFiltradas.find((p: any) => p.licao_id === licao.id);
          const estaPresente = presenca && ['presente', 'atraso', 'justificativa'].includes(presenca.status);
          const statusChar = presenca ? (estaPresente ? 'P' : 'F') : '-';

          if (estaPresente) {
            totalPresentesCalculados++;
            totalDracmasCalculados += 3;
          }

          doc.text(statusChar, 415, currentY + 6, { width: 60, align: 'center' });
          const dracmaVal = estaPresente ? 3 : 0;
          doc.text(dracmaVal.toString(), 485, currentY + 6, { width: 45, align: 'center' });

          currentY += 20;
          if (currentY > 700) break;
        }

        // --- RESUMO DO MÓDULO ---
        const summaryY = currentY + 15;
        doc.rect(60, summaryY, 475, 70).lineWidth(1.2).stroke('#000000');
        doc.fontSize(10).font('Helvetica-Bold').text('RESUMO DO MÓDULO', 70, summaryY + 8);

        doc.font('Helvetica').fontSize(9);
        doc.text(`Total de Presenças: ${totalPresentesCalculados} / ${totalLicoesModulo}`, 70, summaryY + 28);
        doc.text(`Frequência: ${frequencia}%`, 230, summaryY + 28);
        doc.text(`Total de Drácmas: ${totalDracmasCalculados}`, 380, summaryY + 28);

        const aprovado = frequencia >= 75;
        doc.font('Helvetica-Bold').fontSize(10).text(`Situação: ${aprovado ? 'REGULAR' : 'CURSANDO'}`, 70, summaryY + 48);

        // --- LEGENDA (FORA DO QUADRO) ---
        const footerY = summaryY + 80;
        doc.fontSize(7).font('Helvetica').text('Legenda: P = Presente | F = Falta | Critério: Frequência mínima de 75%', 60, footerY);

        // --- ASSINATURAS ---
        const signY = footerY + 20;

        // Assinatura Professora (esquerda)
        doc.moveTo(60, signY + 30).lineTo(260, signY + 30).stroke();
        doc.fontSize(8).text('Assinatura da Professora', 60, signY + 35, { width: 200, align: 'center' });

        // Assinatura Diretor (direita)
        doc.moveTo(335, signY + 30).lineTo(535, signY + 30).stroke();
        doc.fontSize(8).text('Assinatura do Diretor', 335, signY + 35, { width: 200, align: 'center' });

        doc.text(`Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}`, 60, signY + 55);

      } catch (err) {
        errorLog.push(`Erro geral Aluno ${alunoId}: ${err.message}`);
        console.error(`Erro ao gerar boletim para aluno ${alunoId} no lote:`, err);
      }
    }

    // Se nenhuma página foi adicionada, mostrar log de erros no PDF
    if (studentsProcessed === 0) {
      doc.addPage();
      doc.fontSize(16).fillColor('#b91c1c').text('Falha na Geração do Lote', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).fillColor('#374151').text('Nenhum dado encontrado para os critérios selecionados ou ocorreram erros.', { align: 'center' });
      doc.moveDown();
      doc.text(`Total de IDs enviados: ${alunoIds?.length || 0}`);
      doc.text(`Módulo ID: ${moduloId}`);
      doc.moveDown();
      doc.text('Logs de Erro:', { font: 'Helvetica-Bold' });
      errorLog.slice(0, 20).forEach(log => doc.text(`- ${log}`, { fontSize: 8 }));
      if (errorLog.length > 20) doc.text('... (mais erros omitidos)');
    }

    doc.end();

    await new Promise<void>((resolve) => {
      stream.on('finish', () => resolve());
    });

    // Upload
    const fileBuffer = fs.readFileSync(filePath);
    const storagePath = `boletins-lote/${fileName}`;

    await client.storage
      .from('documentos')
      .upload(storagePath, fileBuffer, { contentType: 'application/pdf', upsert: true });

    fs.unlinkSync(filePath);

    return { success: true, path: storagePath };
  }

  async gerarCertificado(alunoId: string, nivelId: string, turmaIdIn?: string) {
    const client = this.supabase.getAdminClient();

    // 0. Buscar matrícula para obter turma_id se não fornecido
    let turmaId = turmaIdIn;
    if (!turmaId) {
      const { data: matricula } = await client
        .from('matriculas')
        .select('turma_id')
        .eq('aluno_id', alunoId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      turmaId = matricula?.turma_id;
    }

    // 1. Verificar se já existe
    if (turmaId) {
      const { data: exist } = await client
        .from('certificados')
        .select('id, codigo_validacao, data_emissao')
        .eq('aluno_id', alunoId)
        .eq('turma_id', turmaId)
        .eq('tipo', 'modulo')
        .maybeSingle();

      if (exist) {
        return { success: true, id: exist.id, existente: true, codigo_validacao: exist.codigo_validacao, data_emissao: exist.data_emissao };
      }
    }

    // 2. Persistir metadados
    const codigoValidacao = this.gerarCodigoValidacao();
    const dataEmissao = new Date().toISOString();

    let moduloId = null;
    if (turmaId) {
      const { data: tInfo } = await client.from('turmas').select('modulo_atual_id').eq('id', turmaId).maybeSingle();
      moduloId = tInfo?.modulo_atual_id;
    }

    const { data: novo, error } = await client
      .from('certificados')
      .insert({
        aluno_id: alunoId,
        turma_id: turmaId,
        modulo_id: moduloId,
        tipo: 'modulo',
        codigo_validacao: codigoValidacao,
        data_emissao: dataEmissao
      })
      .select()
      .single();

    if (error) {
      console.error('[gerarCertificado] Erro insert:', error);
      throw error;
    }

    return { success: true, id: novo.id, codigoValidacao, dataEmissao };
  }

  async getCertificadoBuffer(id: string): Promise<Buffer> {
    try {
      const client = this.supabase.getAdminClient();
      const { data: cert, error } = await client
        .from('certificados')
        .select(`
          *,
          aluno:alunos(id, nome, cpf),
          turma:turmas(
            id,
            nome,
            nivel:niveis(id, nome, descricao)
          ),
          modulo:modulos(id, titulo, numero)
        `)
        .eq('id', id)
        .single();

      if (error || !cert) throw new Error(`Certificado não encontrado: ${error?.message || 'Erro desconhecido'}`);
      return await this.fillCertificadoTemplate(cert);
    } catch (error) {
      console.error(`[getCertificadoBuffer] ❌ Erro ao gerar buffer para ID ${id}:`, error);
      throw error;
    }
  }

  private async fillCertificadoTemplate(dados: any): Promise<Buffer> {
    const client = this.supabase.getAdminClient();
    const { aluno, modulo, codigo_validacao, data_emissao, turma } = dados;
    const nivel = turma?.nivel;

    const templateCandidates = [
      path.resolve(process.cwd(), 'certificado_template.pdf'),
      path.resolve(process.cwd(), '..', 'certificado_template.pdf'),
      path.resolve(__dirname, '..', '..', 'certificado_template.pdf'),
      path.resolve(__dirname, '..', '..', '..', 'certificado_template.pdf'),
      path.resolve(__dirname, '..', '..', '..', '..', 'certificado_template.pdf'),
    ];
    const templatePath = templateCandidates.find((p) => fs.existsSync(p));
    if (!templatePath) {
      console.error('[fillCertificadoTemplate] ❌ Template não encontrado. Candidatos:', templateCandidates);
      throw new Error('Template não encontrado');
    }

    const pdfDoc = await LibPDFDocument.load(fs.readFileSync(templatePath));
    const page = pdfDoc.getPages()[0];
    const { width, height } = page.getSize();
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const nomeAluno = (aluno?.nome || '').toUpperCase();
    const dateStr = data_emissao ? new Date(data_emissao).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : '---';
    // Modulo Label logic
    let moduloLabel = (modulo?.numero ? `Módulo ${modulo.numero} - ${modulo.titulo}` : (nivel?.nome || '')).trim();

    // Buscar Diretoria para assinaturas
    let diretorNome = 'Pedro Newton';
    let coordenadorNome = 'Neuselice Caetano Vieira';
    try {
      const { data: diretoriaData } = await client
        .from('diretoria_geral')
        .select('cargo, nome_completo')
        .eq('status', 'ativa')
        .in('cargo', ['diretor', 'coordenador']);

      if (diretoriaData) {
        const d = diretoriaData.find(x => x.cargo === 'diretor');
        const c = diretoriaData.find(x => x.cargo === 'coordenador');
        if (d) diretorNome = d.nome_completo;
        if (c) coordenadorNome = c.nome_completo;
      }
    } catch (e) {
      console.error('Erro ao buscar diretoria para renderizar certificado:', e);
    }

    // Logos with dynamic styling
    const logoDirs = [
      path.resolve(process.cwd(), 'public', 'icons', '3d'),
      path.resolve(process.cwd(), '..', 'public', 'icons', '3d'),
      path.resolve(__dirname, '..', '..', '..', '..', 'public', 'icons', '3d'),
      path.resolve(__dirname, '..', '..', '..', '..', '..', 'public', 'icons', '3d'),
    ];

    let ibucLogoPath = '', churchLogoPath = '';
    for (const dir of logoDirs) {
      const p1 = path.join(dir, 'Logo-IBUC.png');
      const p2 = path.join(dir, 'Logo-PRV-Texto-Azul.png');
      if (fs.existsSync(p1) && fs.existsSync(p2)) {
        ibucLogoPath = p1;
        churchLogoPath = p2;
        break;
      }
    }

    if (fs.existsSync(ibucLogoPath) && fs.existsSync(churchLogoPath)) {
      const ibucImg = await pdfDoc.embedPng(fs.readFileSync(ibucLogoPath));
      const churchImg = await pdfDoc.embedPng(fs.readFileSync(churchLogoPath));

      const logosH = 40;
      const ibucW = (ibucImg.width / ibucImg.height) * logosH;
      const churchW = (churchImg.width / churchImg.height) * logosH;
      const gap = 30;
      const startX = (width - (ibucW + gap + churchW)) / 2;

      page.drawImage(ibucImg, { x: startX, y: 45, width: ibucW, height: logosH });
      page.drawImage(churchImg, { x: startX + ibucW + gap, y: 45, width: churchW, height: logosH });
    }

    const drawTL = (text: string, x: number, topY: number, size: number, font: any) => {
      page.drawText(text || '', { x, y: height - topY - size, size, font });
    };

    const bodySize = 11;
    const bodyLeft = 75;
    const bodyWidth = width - 150;
    const moduloUppercase = moduloLabel.toUpperCase();

    const drawJustifiedLine = (segments: { text: string, font: any, size: number }[], x: number, topY: number, targetWidth: number) => {
      const words: { text: string, font: any, size: number }[] = [];
      segments.forEach(seg => {
        seg.text.split(' ').filter(w => w.length > 0).forEach(w => words.push({ text: w, font: seg.font, size: seg.size }));
      });
      if (words.length <= 1) {
        let curX = x;
        words.forEach(w => {
          page.drawText(w.text, { x: curX, y: height - topY - w.size, size: w.size, font: w.font });
        });
        return;
      }
      const totalWordsWidth = words.reduce((acc, w) => acc + w.font.widthOfTextAtSize(w.text, w.size), 0);
      const spaceBetween = (targetWidth - totalWordsWidth) / (words.length - 1);
      let curX = x;
      for (let i = 0; i < words.length; i++) {
        const w = words[i];
        page.drawText(w.text, { x: curX, y: height - topY - w.size, size: w.size, font: w.font });
        curX += w.font.widthOfTextAtSize(w.text, w.size) + spaceBetween;
      }
    };

    // Alinhamento e Espaçamento Padronizado
    const yStart = 150;
    const yStep = 25; // Espaçamento fixo entre todas as linhas do corpo

    // Linha 1: Certificamos que [NOME] (Esquerda)
    drawTL('Certificamos que', bodyLeft, yStart, bodySize, fontRegular);
    const pW = fontRegular.widthOfTextAtSize('Certificamos que', bodySize);
    drawTL(nomeAluno, bodyLeft + pW + 10, yStart - 2, bodySize + 2, fontBold);

    // Linha 2: Justificada
    drawJustifiedLine([
      { text: 'participou com êxito do ', font: fontRegular, size: bodySize },
      { text: moduloUppercase, font: fontBold, size: bodySize },
      { text: ' do Curso de Teologia', font: fontRegular, size: bodySize }
    ], bodyLeft, yStart + yStep, bodyWidth);

    // Linha 3: Justificada
    const line3 = 'Infantojuvenil, promovido pela Igreja Evangélica Assembleia de Deus';
    drawJustifiedLine([{ text: line3, font: fontRegular, size: bodySize }], bodyLeft, yStart + yStep * 2, bodyWidth);

    // Linha 4: Esquerda (Última linha fixa para evitar grandes espaços vazios)
    const line4 = 'Missão - Projeto Restaurando Vidas juntamente com o IBUC.';
    drawTL(line4, bodyLeft, yStart + yStep * 3, bodySize, fontRegular);

    const dateLine = `Palmas - TO, ${dateStr}`;
    const dW = fontRegular.widthOfTextAtSize(dateLine, 12);
    drawTL(dateLine, width - 55 - dW, height - 165, 12, fontRegular);

    // Assinaturas Padronizadas
    const sigY = 110;
    const sigLineW = 160;
    const drawAss = (x: number, nome: string, cargo: string) => {
      page.drawLine({ start: { x, y: sigY }, end: { x: x + sigLineW, y: sigY }, thickness: 1 });
      const nameFontSize = 9;
      const cargoFontSize = 8;
      const nW = fontRegular.widthOfTextAtSize(nome, nameFontSize);
      const cW = fontRegular.widthOfTextAtSize(cargo, cargoFontSize);
      page.drawText(nome, { x: x + (sigLineW - nW) / 2, y: sigY - 12, size: nameFontSize, font: fontRegular });
      page.drawText(cargo, { x: x + (sigLineW - cW) / 2, y: sigY - 24, size: cargoFontSize, font: fontRegular });
    };

    drawAss(40, diretorNome, 'Diretor Geral do IBUC');
    drawAss((width - sigLineW) / 2, 'José Suimar Caetano Ferreira', 'Pr. Presidente');
    drawAss(width - 40 - sigLineW, coordenadorNome, 'Coordenador Geral do IBUC');

    if (codigo_validacao) {
      const valTxt = `Código de Autenticidade: ${codigo_validacao}`;
      const fontSize = 6;
      const vW = fontRegular.widthOfTextAtSize(valTxt, fontSize);
      // Posicionar no limite extremo inferior da área branca
      drawTL(valTxt, width - vW - 40, height - 50, fontSize, fontRegular);
    }

    const bytes = await pdfDoc.save();
    return Buffer.from(bytes);
  }

  async gerarHistorico(alunoId: string) {
    const client = this.supabase.getAdminClient();
    const { data: aluno, error: alunoError } = await client
      .from('alunos')
      .select('id, nome, cpf, rg, data_nascimento, sexo, status, polo:polos(id, nome, codigo)')
      .eq('id', alunoId)
      .single();

    if (alunoError || !aluno) throw new Error(`Aluno não encontrado: ${alunoId}`);

    const { data: historico } = await client
      .from('aluno_historico_modulos')
      .select('*')
      .eq('aluno_id', alunoId)
      .order('ano_conclusao', { ascending: true });

    const { data: matriculas } = await client
      .from('matriculas')
      .select('*, turma:turmas(id, nome, dia_semana:dias_semana, horario:horario_inicio, nivel:niveis(nome), modulo_atual_id, modulo:modulos(id, titulo, numero, carga_horaria))')
      .eq('aluno_id', alunoId)
      .eq('status', 'ativa');

    const { data: presencas } = await client.from('presencas').select('*').eq('aluno_id', alunoId);
    const { data: dracmasTrans } = await client.from('dracmas_transacoes').select('*').eq('aluno_id', alunoId);

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const fileName = `historico-${alunoId}-${Date.now()}.pdf`;
    const filePath = path.join(process.env.STORAGE_PATH || './storage', 'historicos', fileName);
    if (!fs.existsSync(path.dirname(filePath))) fs.mkdirSync(path.dirname(filePath), { recursive: true });

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Render logic (simplified for restoration)
    doc.fillColor('#1e3a8a').fontSize(16).font('Helvetica-Bold').text('HISTÓRICO ESCOLAR', { align: 'center' });
    doc.moveDown();
    doc.fillColor('#374151').fontSize(10).font('Helvetica');
    doc.text(`Aluno: ${aluno.nome}`);
    doc.text(`CPF: ${aluno.cpf || '---'}`);
    doc.moveDown();

    doc.text('MÓDULOS CONCLUÍDOS:', { font: 'Helvetica-Bold' });
    (historico || []).forEach(h => {
      doc.text(`- Módulo ${h.modulo_numero}: ${h.media_final || '---'} | Ano: ${h.ano_conclusao}`);
    });

    doc.end();
    await new Promise<void>(resolve => stream.on('finish', resolve));

    const fileBuffer = fs.readFileSync(filePath);
    const storagePath = `historicos/${fileName}`;
    await client.storage.from('documentos').upload(storagePath, fileBuffer, { contentType: 'application/pdf', upsert: true });
    fs.unlinkSync(filePath);

    return { success: true, path: storagePath };
  }
  async gerarListaAlunosPdf(filtros: any, user?: any) {
    const client = this.supabase.getAdminClient();
    const isGlobal = user && PoloScopeUtil.isGlobal(user);

    // 0. Buscar Nome do Polo se houver ID (para o cabeçalho do admin de polo)
    let poloNomeHeader = '';
    if (filtros.polo_id) {
      try {
        const { data: poloData } = await client.from('polos').select('nome').eq('id', filtros.polo_id).single();
        if (poloData) poloNomeHeader = poloData.nome;
      } catch (e) {
        console.error('Erro ao buscar nome do polo:', e);
      }
    }

    // 1. Buscar Alunos
    let query = client
      .from('alunos')
      .select(`
        id,
        nome,
        cpf,
        whatsapp:telefone_responsavel,
        data_nascimento,
        status,
        polo:polos!fk_polo(id, nome),
        turma:turmas!fk_turma(nome)
      `);

    if (filtros.polo_id) query = query.eq('polo_id', filtros.polo_id);
    if (filtros.turma_id) query = query.eq('turma_id', filtros.turma_id);
    if (filtros.nivel_id) query = query.eq('nivel_atual_id', filtros.nivel_id);
    if (filtros.status) query = query.eq('status', filtros.status);

    const { data: alunosData, error } = await query.order('nome');
    if (error) throw error;

    // Se for admin geral, ordenar por Polo primeiro para o agrupamento
    let alunos = [...(alunosData || [])];
    if (isGlobal) {
      alunos.sort((a: any, b: any) => {
        const poloA = a.polo?.nome || '';
        const poloB = b.polo?.nome || '';
        if (poloA !== poloB) return poloA.localeCompare(poloB);
        return (a.nome || '').localeCompare(b.nome || '');
      });
    }

    // 2. Configurar PDF
    const filterKey = JSON.stringify({
      polo_id: filtros.polo_id || 'all',
      turma_id: filtros.turma_id || 'all',
      nivel_id: filtros.nivel_id || 'all',
      status: filtros.status || 'all'
    });
    const hash = crypto.createHash('md5').update(filterKey).digest('hex');
    const fileName = `lista-alunos-${hash.substring(0, 12)}.pdf`;

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));

    // Cabeçalho Principal
    const logo = await this.getLogo();
    if (logo) {
      doc.image(logo, 40, 40, { width: 80 });
    }

    doc.fillColor('#1f2937').fontSize(16).font('Helvetica-Bold').text('Instituto Bíblico Único Caminho', 130, 45);

    // Se não for admin geral, coloca o polo no cabeçalho
    if (!isGlobal && poloNomeHeader) {
      doc.fontSize(12).fillColor('#4b5563').font('Helvetica-Bold').text(`Polo: ${poloNomeHeader.toUpperCase()}`, 130, 62);
      doc.fontSize(10).font('Helvetica').text('Relatório de Alunos', 130, 77);
      doc.fontSize(8).text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 130, 90);
    } else {
      doc.fontSize(10).font('Helvetica').text('Relatório de Alunos', 130, 65);
      doc.fontSize(8).text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 130, 80);
    }

    // Linha Decorativa
    doc.moveTo(40, 105).lineTo(555, 105).lineWidth(1).stroke('#e5e7eb');

    let currentY = 120;
    let lastPoloId = '';

    // Header da Tabela (Função para reaproveitar em novas páginas ou grupos se necessário)
    const drawTableHeader = (y: number) => {
      doc.rect(40, y, 515, 20).fill('#f3f4f6');
      doc.fillColor('#374151').fontSize(9).font('Helvetica-Bold');
      doc.text('NOME', 50, y + 7);
      doc.text('TURMA', 230, y + 7);
      doc.text('WHATSAPP', 320, y + 7);
      doc.text('NASCIMENTO', 430, y + 7);
      doc.text('STATUS', 510, y + 7);
      return y + 20;
    };

    // Caso o admin seja geral, vamos agrupar
    alunos.forEach((aluno: any, index: number) => {
      // Se o polo mudou e é admin geral, ou se é the first aluno e é admin geral
      if (isGlobal && aluno.polo?.id !== lastPoloId) {
        if (currentY > 700) { doc.addPage(); currentY = 40; }

        doc.moveDown();
        currentY = doc.y;

        doc.fillColor('#1d4ed8').fontSize(11).font('Helvetica-Bold');
        doc.text(`POLO: ${aluno.polo?.nome?.toUpperCase() || 'SEM POLO'}`, 50, currentY);
        currentY += 15;

        // Desenha the header da tabela para este grupo
        currentY = drawTableHeader(currentY);
        lastPoloId = aluno.polo?.id;
      } else if (index === 0 && !isGlobal) {
        // Para admin de polo, desenha the header apenas uma vez no topo
        currentY = drawTableHeader(currentY);
      }

      if (currentY > 750) {
        doc.addPage();
        currentY = 40;
        currentY = drawTableHeader(currentY);
      }

      // Zebra striping
      if (index % 2 === 1) {
        doc.rect(40, currentY, 515, 20).fill('#f9fafb');
      }

      doc.fillColor('#4b5563').font('Helvetica').fontSize(8);
      doc.text((aluno.nome || '').toUpperCase(), 50, currentY + 6, { width: 175, ellipsis: true });
      doc.text((aluno.turma?.nome || 'SEM TURMA').toUpperCase(), 230, currentY + 6, { width: 85, ellipsis: true });
      doc.text(aluno.whatsapp || '---', 320, currentY + 6, { width: 100 });
      doc.text(aluno.data_nascimento ? new Date(aluno.data_nascimento).toLocaleDateString('pt-BR') : '---', 430, currentY + 6, { width: 75 });
      doc.text((aluno.status || '').toUpperCase(), 510, currentY + 6, { width: 40 });

      currentY += 20;
      doc.moveTo(40, currentY).lineTo(555, currentY).lineWidth(0.5).stroke('#f3f4f6');
    });

    // Rodapé
    doc.fontSize(8).fillColor('#9ca3af').text(`Total de alunos: ${alunos.length}`, 40, doc.page.height - 50);

    doc.end();

    const fileBuffer = await new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
    });

    const storagePath = `relatorios/listas/${fileName}`;
    await client.storage.from('documentos').upload(storagePath, fileBuffer, { contentType: 'application/pdf', upsert: true });

    const { data: publicUrl } = client.storage.from('documentos').getPublicUrl(storagePath);
    return { success: true, url: publicUrl.publicUrl };
  }

  async gerarReciboPagamento(pagamentoId: string) {
    // Implementar lógica de recibo de pagamento se necessário
    return { success: true, path: '' };
  }
}
