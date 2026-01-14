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

  async gerarBoletim(alunoId: string, periodo: string) {
    const client = this.supabase.getAdminClient();

    // 1. Buscar Dados do Aluno (Sem embedding para evitar ambiguidade)
    const { data: aluno, error: alunoError } = await client
      .from('alunos')
      .select(`
        id,
        nome,
        cpf,
        sexo,
        polo:polos!fk_polo(id, nome)
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
        turma:turmas!fk_turma(
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

    // 2. Buscar Presenças no Período
    // Simplificando período: se for YYYY-MM, pegamos o mês inteiro
    const startOfMonth = `${periodo}-01`;
    const endOfMonth = `${periodo}-31`; // Simplificação aceitável para o banco

    const { data: presencas } = await client
      .from('presencas')
      .select('*')
      .eq('aluno_id', alunoId)
      .gte('data', startOfMonth)
      .lte('data', endOfMonth);

    const totalAulas = presencas?.length || 0;
    const presentes = presencas?.filter(p => ['presente', 'atraso', 'justificativa'].includes(p.status)).length || 0;
    const frequencia = totalAulas > 0 ? Math.round((presentes / totalAulas) * 100) : 0;

    // 3. Buscar Drácmas
    const { data: dracmas } = await client
      .from('dracmas_transacoes')
      .select('quantidade')
      .eq('aluno_id', alunoId)
      .gte('data', startOfMonth)
      .lte('data', endOfMonth);

    const ganhoDracmas = dracmas?.reduce((sum, t) => sum + (t.quantidade || 0), 0) || 0;

    // 4. Gerar PDF
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const fileName = `boletim-${alunoId}-${periodo}.pdf`;
    const filePath = path.join(process.env.STORAGE_PATH || './storage', 'boletins', fileName);

    // Criar diretório
    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // --- Design do Boletim (ACADÊMICO) ---
    doc.rect(40, 30, doc.page.width - 80, doc.page.height - 60).lineWidth(1.5).stroke('#000000');

    // Cabeçalho
    const logo = await this.getLogo();
    if (logo) {
      doc.image(logo, 60, 50, { width: 100 });
      doc.fillColor('#000000').fontSize(14).font('Helvetica').text('Instituto Bíblico Único Caminho', 170, 60);
      doc.fontSize(12).text('Palmas - TO', 170, 80);
    } else {
      doc.fillColor('#000000').fontSize(24).font('Helvetica-Bold').text('IBUC', 40, 60, { align: 'center' });
      doc.fontSize(14).font('Helvetica').text('Instituto Bíblico Único Caminho', 40, 90, { align: 'center' });
      doc.fontSize(12).text('Palmas - TO', 40, 110, { align: 'center' });
    }

    doc.moveTo(60, 130).lineTo(535, 130).lineWidth(1).stroke('#000000');
    doc.fontSize(15).font('Helvetica-Bold').text('BOLETIM DO ALUNO', 40, 145, { align: 'center' });

    // Info do Aluno
    const infoY = 180;
    doc.fontSize(11).font('Helvetica');

    doc.font('Helvetica-Bold').text('Aluno: ', 60, infoY, { continued: true }).font('Helvetica').text(aluno.nome.toUpperCase());
    const protocolRaw = (matriculaAtiva as any)?.protocolo || '---';
    const protocolFmt = protocolRaw.split('-').slice(0, 2).join('-');
    doc.font('Helvetica-Bold').text('Matrícula: ', 400, infoY, { continued: true }).font('Helvetica').text(protocolFmt);

    doc.font('Helvetica-Bold').text('CPF: ', 60, infoY + 20, { continued: true }).font('Helvetica').text(aluno.cpf || '---');
    doc.font('Helvetica-Bold').text('Sexo: ', 400, infoY + 20, { continued: true }).font('Helvetica').text(aluno.sexo === 'M' ? 'Masculino' : aluno.sexo === 'F' ? 'Feminino' : 'Outro');

    doc.font('Helvetica-Bold').text('Turma: ', 60, infoY + 40, { continued: true }).font('Helvetica').text(`${turma?.nome || '---'} ${turma?.nivel?.nome || ''}`);
    doc.font('Helvetica-Bold').text('Polo: ', 400, infoY + 40, { continued: true }).font('Helvetica').text((aluno as any).polo?.nome || '---');

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

    // Buscar Ano Letivo das configurações
    const { data: configAno } = await client
      .from('configuracoes_sistema')
      .select('valor')
      .eq('chave', 'ano_letivo')
      .maybeSingle();

    const anoLetivo = configAno?.valor || '---';

    doc.font('Helvetica-Bold').text('Ano Letivo: ', 60, infoY + 60, { continued: true }).font('Helvetica').text(anoLetivo);
    doc.font('Helvetica-Bold').text('Período Ref: ', 400, infoY + 60, { continued: true }).font('Helvetica').text(periodo);

    doc.font('Helvetica-Bold').text('Dia/Hora: ', 60, infoY + 80, { continued: true }).font('Helvetica').text(`${diaDesc} às ${horarioFmt}`);
    doc.font('Helvetica-Bold').text('Professor(a): ', 400, infoY + 80, { continued: true }).font('Helvetica').text(professorNome);

    doc.moveTo(60, 260).lineTo(535, 260).lineWidth(1).stroke('#000000');

    // Resumo Mensal
    const summaryY = 280;
    doc.rect(60, summaryY, 475, 80).lineWidth(1.5).stroke('#000000');
    doc.fontSize(11).font('Helvetica-Bold').text('RESUMO DO PERÍODO', 70, summaryY + 10);

    doc.font('Helvetica').fontSize(10);
    doc.text(`Aulas Registradas: ${totalAulas}`, 70, summaryY + 35);
    doc.text(`Frequência no Mês: ${frequencia}%`, 230, summaryY + 35);
    doc.text(`Drácmas Ganhos: ${ganhoDracmas}`, 380, summaryY + 35);

    const situacao = frequencia >= 75 ? 'REGULAR' : 'CURSANDO';
    doc.font('Helvetica-Bold').fontSize(11).text(`Situação: ${situacao}`, 70, summaryY + 55);

    // Detalhamento de Presenças (Se houver espaço)
    doc.moveDown(8);
    doc.fontSize(10).font('Helvetica-Bold').text('Detalhamento de Frequência');
    doc.moveTo(60, doc.y + 5).lineTo(535, doc.y + 5).stroke();

    doc.moveDown();
    doc.font('Helvetica').fontSize(9);
    presencas?.slice(0, 10).forEach((p, idx) => {
      doc.text(`${new Date(p.data).toLocaleDateString('pt-BR')} - Status: ${p.status.toUpperCase()}`, 60, doc.y + 5);
    });

    // Assinaturas
    const footY = doc.page.height - 150;
    doc.moveTo(60, footY).lineTo(535, footY).lineWidth(1).stroke('#000000');

    // Assinatura Professora (esquerda)
    doc.moveTo(60, footY + 75).lineTo(260, footY + 75).stroke();
    doc.fontSize(9).font('Helvetica').text('Assinatura da Professora', 60, footY + 80, { width: 200, align: 'center' });

    // Assinatura Diretor (direita)
    doc.moveTo(335, footY + 75).lineTo(535, footY + 75).stroke();
    doc.fontSize(9).font('Helvetica').text('Assinatura do Diretor', 335, footY + 80, { width: 200, align: 'center' });

    doc.fontSize(8).text('Este documento é uma representação digital das atividades realizadas no período.', 60, footY + 100);

    doc.end();

    await new Promise<void>((resolve) => {
      stream.on('finish', () => resolve());
    });

    // 5. Upload para Storage
    const fileBuffer = fs.readFileSync(filePath);
    const storagePath = `boletins/${alunoId}/${fileName}`;

    await client.storage
      .from('documentos')
      .upload(storagePath, fileBuffer, {
        contentType: 'application/pdf',
        upsert: true
      });

    // Limpar arquivo local
    fs.unlinkSync(filePath);

    return { success: true, path: storagePath };
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
            polo:polos!fk_polo(nome)
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
            turma:turmas!fk_turma(
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

  async gerarCertificado(alunoId: string, nivelId: string) {
    const client = this.supabase.getAdminClient();

    // 1. Fetch Data
    const { data: aluno, error: alunoError } = await client
      .from('alunos')
      .select('nome, cpf')
      .eq('id', alunoId)
      .single();

    const { data: nivel, error: nivelError } = await client
      .from('niveis')
      .select('nome, descricao')
      .eq('id', nivelId)
      .single();

    if (alunoError || !aluno || nivelError || !nivel) {
      throw new Error('Aluno ou Nível não encontrado para o certificado');
    }

    // 2. Generate PDF based on template PDF (high quality)
    const fileName = `certificado_v2_${alunoId}_${nivelId}_${Date.now()}.pdf`;
    const filePath = path.join(process.env.STORAGE_PATH || './storage', 'certificados', fileName);
    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }

    const templateCandidates = [
      path.resolve(process.cwd(), 'certificado_template.pdf'),
      path.resolve(process.cwd(), '..', 'certificado_template.pdf'),
      path.resolve(process.cwd(), '..', '..', 'certificado_template.pdf'),
      path.resolve(process.cwd(), '..', '..', '..', 'certificado_template.pdf'),
      path.resolve(__dirname, '..', '..', '..', '..', 'certificado_template.pdf'),
      path.resolve(__dirname, '..', '..', '..', '..', '..', 'certificado_template.pdf'),
    ];

    const templatePath = templateCandidates.find((p) => fs.existsSync(p));
    if (!templatePath) {
      throw new Error('Template do certificado não encontrado (certificado_template.pdf)');
    }

    console.log('[gerarCertificado] templatePath:', templatePath);

    const templateBytes = fs.readFileSync(templatePath);
    const pdfDoc = await LibPDFDocument.load(templateBytes);
    const page = pdfDoc.getPages()[0];
    if (!page) {
      throw new Error('Template do certificado está vazio (sem páginas)');
    }

    const { width, height } = page.getSize();

    const fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.TimesRoman);

    const nomeAluno = (aluno.nome || '').toUpperCase();
    const nivelNome = nivel.nome || '';
    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

    let moduloLabel = (nivel.descricao || nivelNome || '').trim();

    let diretorNome = 'Pedro Newton';
    let coordenadorNome = 'Neuselice Caetano Vieira';

    try {
      const { data: diretoriaData } = await this.supabase.getAdminClient()
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
      console.error('Erro ao buscar diretoria para certificado:', e);
    }
    try {
      const { data: matriculaAtiva } = await client
        .from('matriculas')
        .select(`
          turma:turmas!fk_turma (
            modulo_atual_id
          )
        `)
        .eq('aluno_id', alunoId)
        .eq('status', 'ativa')
        .limit(1)
        .maybeSingle();

      const moduloAtualId = (matriculaAtiva?.turma as any)?.modulo_atual_id;

      if (moduloAtualId) {
        const { data: modAtual } = await client
          .from('modulos')
          .select('numero, titulo')
          .eq('id', moduloAtualId)
          .limit(1)
          .maybeSingle();

        if (modAtual?.numero && modAtual?.titulo) {
          moduloLabel = `Módulo ${modAtual.numero} - ${modAtual.titulo}`;
        }
      }

      if (!moduloLabel) {
        moduloLabel = (nivel.descricao || nivelNome || '').trim();
      }

      if (!moduloAtualId) {
        const { data: hist } = await client
          .from('aluno_historico_modulos')
          .select('modulo_numero, ano_conclusao')
          .eq('aluno_id', alunoId)
          .order('ano_conclusao', { ascending: false })
          .order('modulo_numero', { ascending: false })
          .limit(1);

        const last = (hist || [])[0] as any;
        if (last?.modulo_numero) {
          const { data: mod } = await client
            .from('modulos')
            .select('numero, titulo')
            .eq('numero', last.modulo_numero)
            .limit(1)
            .maybeSingle();

          if ((mod as any)?.numero && (mod as any)?.titulo) {
            moduloLabel = `Módulo ${(mod as any).numero} - ${(mod as any).titulo}`;
          } else {
            moduloLabel = `Módulo ${last.modulo_numero}`;
          }
        }
      }
    } catch (e) {
    }

    const embedImage = async (bytes: Uint8Array) => {
      try {
        return await pdfDoc.embedPng(bytes);
      } catch {
        return await pdfDoc.embedJpg(bytes);
      }
    };

    const ibucLogoCandidates = [
      path.resolve(process.cwd(), 'public', 'icons', '3d', 'Logo-IBUC.png'),
      path.resolve(process.cwd(), '..', 'public', 'icons', '3d', 'Logo-IBUC.png'),
      path.resolve(process.cwd(), '..', '..', 'public', 'icons', '3d', 'Logo-IBUC.png'),
      path.resolve(__dirname, '..', '..', '..', '..', '..', 'public', 'icons', '3d', 'Logo-IBUC.png'),
      path.resolve(__dirname, '..', '..', '..', '..', '..', '..', 'public', 'icons', '3d', 'Logo-IBUC.png'),
    ];

    const churchLogoCandidates = [
      path.resolve(process.cwd(), 'public', 'icons', '3d', 'Logo-PRV-Texto-Azul.png'),
      path.resolve(process.cwd(), '..', 'public', 'icons', '3d', 'Logo-PRV-Texto-Azul.png'),
      path.resolve(process.cwd(), '..', '..', 'public', 'icons', '3d', 'Logo-PRV-Texto-Azul.png'),
      path.resolve(__dirname, '..', '..', '..', '..', '..', 'public', 'icons', '3d', 'Logo-PRV-Texto-Azul.png'),
      path.resolve(__dirname, '..', '..', '..', '..', '..', '..', 'public', 'icons', '3d', 'Logo-PRV-Texto-Azul.png'),
    ];

    const ibucLogoPath = ibucLogoCandidates.find((p) => fs.existsSync(p));
    const churchLogoPath = churchLogoCandidates.find((p) => fs.existsSync(p));

    if (!ibucLogoPath) {
      throw new Error("Logo do IBUC não encontrada em public/icons/3d/Logo-IBUC.png");
    }
    if (!churchLogoPath) {
      throw new Error("Logo da igreja não encontrada em public/icons/3d/Logo-PRV-Texto-Azul.png");
    }

    const ibucLogoBytes = fs.readFileSync(ibucLogoPath);
    const churchLogoBytes = fs.readFileSync(churchLogoPath);

    const ibucImg = await embedImage(ibucLogoBytes);
    const churchImg = await embedImage(churchLogoBytes);


    
    const logosH = 40; // Reduced height
    const ibucW = (ibucImg.width / ibucImg.height) * logosH;
    const churchW = (churchImg.width / churchImg.height) * logosH;

    const gap = 30;
    const totalLogosWidth = ibucW + gap + churchW;

    const startX = (width - totalLogosWidth) / 2;
    
    // Position vertically clearly at bottom
    // User requested to move up slightly to avoid covering blue border.
    const logosY = 45;

    page.drawImage(ibucImg, { x: startX, y: logosY, width: ibucW, height: logosH });
    page.drawImage(churchImg, { x: startX + ibucW + gap, y: logosY, width: churchW, height: logosH }); 

    const bodyLeft = 55;
    const bodyTop = 150;
    const bodyWidth = width - bodyLeft * 2;
    const lineHeight = 18;

    const drawTL = (text: string, topX: number, topY: number, size: number, font: any, options?: any) => {
      page.drawText(text, {
        x: topX,
        y: height - topY - size,
        size,
        font,
        ...(options || {}),
      });
    };

    const fontBody = 14;
    const fontName = 14;
    const fontDate = 12;

    let cursorY = bodyTop;

    const prefix = 'Certificamos que';
    const prefixWidth = fontRegular.widthOfTextAtSize(prefix, fontBody);
    drawTL(prefix, bodyLeft, cursorY, fontBody, fontRegular);

    const lineX = bodyLeft + prefixWidth + 10;
    const lineW = Math.max(0, bodyLeft + bodyWidth - lineX);
    const lineY = height - cursorY - (fontBody / 2);

    const nameWidth = fontBold.widthOfTextAtSize(nomeAluno, fontName);
    const nameX = Math.max(lineX, lineX + 25);
    const nameTopY = cursorY - 2;
    drawTL(nomeAluno, nameX, nameTopY, fontName, fontBold);

    // Lines removed as per request
    // const gapPad = 6; ...

    cursorY += lineHeight * 1.25;

    // Helper for Justified Text
    const drawJustifiedLine = (tokens: { text: string, font: any, size: number }[], yTop: number, maxWidth: number, isJustified: boolean = true) => {
        let totalWordWidth = 0;
        const tokensWithWidth = tokens.map(t => {
            const w = t.font.widthOfTextAtSize(t.text, t.size);
            totalWordWidth += w;
            return { ...t, width: w };
        });

        let spacing = 5; // Default spacing
        if (isJustified && tokensWithWidth.length > 1) {
            const spaceAvailable = maxWidth - totalWordWidth;
            spacing = spaceAvailable / (tokensWithWidth.length - 1);
            // Safety: if spacing is huge (short line), disable justification
            if (spacing > 30) {
                 spacing = fontRegular.widthOfTextAtSize(' ', fontBody);
                 isJustified = false;
            }
        } else {
             spacing = fontRegular.widthOfTextAtSize(' ', fontBody);
        }

        let currentX = bodyLeft;
        // If not justified (centered or left), we might want to adjust startX?
        // For this cert, left-aligned fallback starts at bodyLeft.
        
        tokensWithWidth.forEach((token) => {
             drawTL(token.text, currentX, yTop, token.size, token.font);
             // drawTL logic: y = height - topY - size.
             // Here we pass yTop as usual.
             currentX += token.width + spacing;
        });
    };

    // Construct Line 1: "participou do [Modulo] do Curso de Teologia"
    const line1Tokens = [
        { text: 'participou', font: fontRegular, size: fontBody },
        { text: 'do', font: fontRegular, size: fontBody }
    ];
    
    // Split module label (Bold)
    if (moduloLabel) {
        // e.g. "Módulo 1 - Entendendo..."
        const modParts = moduloLabel.split(' ');
        modParts.forEach(part => line1Tokens.push({ text: part, font: fontBold, size: fontBody }));
    }
    
    // Add suffix
    const suffix = "do Curso de Teologia";
    suffix.trim().split(' ').forEach(part => line1Tokens.push({ text: part, font: fontRegular, size: fontBody }));

    drawJustifiedLine(line1Tokens, cursorY, bodyWidth, true);
    cursorY += lineHeight * 1.5; // Extra spacing

    // Line 2: "Infantojuvenil, promovido pela Igreja Evangélica Assembleia de Deus"
    const line2Text = "Infantojuvenil, promovido pela Igreja Evangélica Assembleia de Deus";
    const line2Tokens = line2Text.split(' ').map(t => ({ text: t, font: fontRegular, size: fontBody }));
    drawJustifiedLine(line2Tokens, cursorY, bodyWidth, true);
    cursorY += lineHeight;

    // Line 3: "Missão - Projeto Restaurando Vidas juntamente com o Instituto Bíblico"
    const line3Text = "Missão - Projeto Restaurando Vidas juntamente com o Instituto Bíblico";
    const line3Tokens = line3Text.split(' ').map(t => ({ text: t, font: fontRegular, size: fontBody }));
    drawJustifiedLine(line3Tokens, cursorY, bodyWidth, true);
    cursorY += lineHeight;

    // Line 4: "Único Caminho." (Left aligned / Last line)
    const line4Text = "Único Caminho.";
    const line4Tokens = line4Text.split(' ').map(t => ({ text: t, font: fontRegular, size: fontBody }));
    drawJustifiedLine(line4Tokens, cursorY, bodyWidth, false); // Not justified

    const dataLine = `Palmas - TO, ${dateStr}`;
    // Position Date relative to BOTTOM (Y=0 is bottom)
    // We want it above signatures. Signatures at Y=110 (from bottom). 
    // Let's put Date at Y=160 (from bottom).
    // drawTL uses "Distance from Top". So topY = height - 160.
    const dataBottomY = 160;
    const dataTopY = height - dataBottomY;
    
    const dataTextWidth = fontRegular.widthOfTextAtSize(dataLine, fontDate);
    const dataX = Math.max(0, width - bodyLeft - dataTextWidth);
    drawTL(dataLine, dataX, dataTopY, fontDate, fontRegular);

    // Signatures
    // Desired Y line from bottom = 110.
    // drawTL expects "Distance from Top".
    // drawAssinatura expects "assinaturaTopY" to be treated as "height - assinaturaTopY" = Y line?
    // Let's check drawAssinatura:
    // const yLine = height - assinaturaTopY;
    // So if we want yLine = 110, then height - assinaturaTopY = 110 => assinaturaTopY = height - 110.
    const assinaturaBottomY = 110;
    const assinaturaTopY = height - assinaturaBottomY;

    const blocoW = 160; 
    const marginX = 40; 

    // Adjust horizontal spread - User requested:
    // Pedro (Diretor Geral) -> Left (shift left?) already at marginX=40 (quite left)
    // Neuselice (Coord) -> Right (shift right?) already at width-40-160 (quite right)
    // Suimar -> Center
    // We can push margins slightly more if needed, but 40 is close to border.
    // Let's keep 40.

    const assX1 = marginX; 
    const assX2 = (width - blocoW) / 2; 
    const assX3 = width - marginX - blocoW;

    const drawAssinatura = (x: number, nome: string, cargo: string) => {
      const yLine = height - assinaturaTopY;
      page.drawLine({ start: { x, y: yLine }, end: { x: x + blocoW, y: yLine }, thickness: 1 });

      const nomeSize = 8;
      const cargoSize = 8;
      const nomeW = fontRegular.widthOfTextAtSize(nome, nomeSize);
      const cargoW = fontRegular.widthOfTextAtSize(cargo, cargoSize);
      drawTL(nome, x + Math.max(0, (blocoW - nomeW) / 2), assinaturaTopY + 5, nomeSize, fontRegular);
      drawTL(cargo, x + Math.max(0, (blocoW - cargoW) / 2), assinaturaTopY + 17, cargoSize, fontRegular);
    };

    drawAssinatura(assX1, diretorNome, 'Diretor Geral do IBUC');
    drawAssinatura(assX2, 'José Suimar Caetano Ferreira', 'Pr. Presidente');
    drawAssinatura(assX3, coordenadorNome, 'Coordenadora Geral do IBUC');

    const pdfBytesOut = await pdfDoc.save();
    fs.writeFileSync(filePath, pdfBytesOut);

    const fileBuffer = fs.readFileSync(filePath);
    const storagePath = `certificados/${alunoId}/${fileName}`;
    await client.storage.from('documentos').upload(storagePath, fileBuffer, { contentType: 'application/pdf', upsert: true });

    fs.unlinkSync(filePath);
    return { success: true, path: storagePath };
  }
  
  async gerarHistorico(alunoId: string) {
     // Implementa a geração do Histórico (CRÍTICO para o User)
     const client = this.supabase.getAdminClient();
     
     // 1. Buscar Dados
    const { data: aluno, error: alunoError } = await client
      .from('alunos')
      .select('id, nome, cpf, rg, data_nascimento, sexo, status, polo:polos!fk_polo(id, nome, codigo)')
      .eq('id', alunoId)
      .single();

    if (alunoError || !aluno) {
      throw new Error(`Aluno não encontrado: ${alunoId}`);
    }

    // 2. Buscar Histórico de Módulos (Concluídos)
    const { data: historico, error: histError } = await client
      .from('aluno_historico_modulos')
      .select('*')
      .eq('aluno_id', alunoId)
      .order('ano_conclusao', { ascending: true })
      .order('modulo_numero', { ascending: true });

    if (histError) throw new Error(`Erro ao buscar histórico de módulos: ${histError.message}`);

    // Buscar informações dos módulos e suas lições para o histórico
    const moduloNumeros = [...new Set((historico || []).map(h => h.modulo_numero))];
    let modulosInfo: any[] = [];
    let licoesPorModulo: Record<string, any[]> = {};

    if (moduloNumeros.length > 0) {
      const { data: mods } = await client
        .from('modulos')
        .select('id, numero, titulo, carga_horaria')
        .in('numero', moduloNumeros);
      modulosInfo = mods || [];

      // Buscar lições dos módulos históricos
      const modIds = modulosInfo.map(m => m.id);
      const { data: licoes } = await client
        .from('licoes')
        .select('modulo_id, titulo, ordem')
        .in('modulo_id', modIds)
        .order('ordem', { ascending: true });

      (licoes || []).forEach(l => {
        if (!licoesPorModulo[l.modulo_id]) licoesPorModulo[l.modulo_id] = [];
        licoesPorModulo[l.modulo_id].push(l);
      });
    }

    // 3. Matrícula Atual e Turmas em Curso
    const { data: matriculasAtivas, error: mError } = await client
      .from('matriculas')
      .select('*, turma:turmas!fk_turma(id, nome, dia_semana:dias_semana, horario:horario_inicio, nivel:niveis(nome), modulo_atual_id, modulo:modulos(id, titulo, numero, carga_horaria))')
      .eq('aluno_id', alunoId)
      .eq('status', 'ativa');

    if (mError) throw new Error(`Erro ao buscar matrículas ativas: ${mError.message}`);

    // 4. Buscar Presenças e Drácmas (Para o Histórico Detalhado)
    const { data: presencas } = await client
      .from('presencas')
      .select('status, licao_id, data, turma_id')
      .eq('aluno_id', alunoId);

    const { data: dracmasTrans } = await client
      .from('dracmas_transacoes')
      .select('quantidade, data, turma_id')
      .eq('aluno_id', alunoId);

    // Buscar lições para todos os módulos (históricos e em curso)
    for (const mAtiva of (matriculasAtivas || [])) {
      const modId = mAtiva.turma?.modulo_atual_id;
      if (modId && !licoesPorModulo[modId]) {
        const { data: licoes, error: lError } = await client
          .from('licoes')
          .select('id, modulo_id, titulo, ordem')
          .eq('modulo_id', modId)
          .order('ordem', { ascending: true });
        if (lError) console.warn(`Erro ao buscar lições para módulo ${modId}: ${lError.message}`);
        licoesPorModulo[modId] = licoes || [];
      }
    }
    
    // --- Iniciar Geração do PDF ---
    const doc = new PDFDocument({ margin: 0, size: 'A4' });
    const fileName = `historico-${alunoId}-${Date.now()}.pdf`;
    const filePath = path.join(process.env.STORAGE_PATH || './storage', 'historicos', fileName);

    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // --- Layout das Cores ---
    const primaryBlue = '#1e3a8a';
    const lightGray = '#f3f4f6';
    const borderGray = '#d1d5db';
    const textGray = '#374151';

    // --- Header ---
    doc.rect(0, 0, 595.28, 100).fill(primaryBlue);
    const logoRel = await this.getLogo();
    if (logoRel) {
      doc.image(logoRel, 40, 20, { width: 60 });
    } else {
      doc.fillColor('#ffffff').fontSize(20).font('Helvetica-Bold').text('IBUC', 40, 40);
    }

    doc.fillColor('#ffffff').fontSize(16).font('Helvetica-Bold').text('INSTITUTO BÍBLICO ÚNICO CAMINHO', 120, 35, { align: 'center', width: 400 });
    doc.fontSize(12).font('Helvetica').text('HISTÓRICO ESCOLAR - CURSO MODULAR', 120, 58, { align: 'center', width: 400 });

    let currentY = 120;

    // --- Seção: Dados do Aluno ---
    doc.rect(40, currentY, 515, 110).fill(lightGray).stroke(primaryBlue);
    doc.fillColor(primaryBlue).fontSize(11).font('Helvetica-Bold').text('DADOS DO ALUNO', 55, currentY + 10);

    currentY += 30;
    doc.fillColor(textGray).fontSize(10).font('Helvetica');
    doc.font('Helvetica-Bold').text('Nome: ', 55, currentY, { continued: true }).font('Helvetica').text(aluno.nome.toUpperCase());

    currentY += 18;
    // Linha 2: RG | CPF | Sexo
    doc.font('Helvetica-Bold').text('RG: ', 55, currentY, { continued: true }).font('Helvetica').text(aluno.rg || '---', { continued: true });
    doc.font('Helvetica-Bold').text('   CPF: ', { continued: true }).font('Helvetica').text(aluno.cpf || '---', { continued: true });
    doc.font('Helvetica-Bold').text('   Sexo: ', { continued: true }).font('Helvetica').text(aluno.sexo === 'M' ? 'Masculino' : aluno.sexo === 'F' ? 'Feminino' : 'Outro');

    currentY += 18;
    // Linha 3: Matrícula | Curso
    const protocolRaw = (matriculasAtivas?.[0] as any)?.protocolo || '---';
    const protocolParts = protocolRaw.split('-');
    const matriculaNum = protocolParts.length >= 2 ? protocolParts.slice(0, 2).join('-') : protocolRaw;

    doc.font('Helvetica-Bold').text('Matrícula: ', 55, currentY, { continued: true }).font('Helvetica').text(matriculaNum, { continued: true });
    doc.font('Helvetica-Bold').text('   Curso: ', { continued: true }).font('Helvetica').text('TEOLOGIA INFANTO JUVENIL');

    currentY += 18;
    // Linha 4: Modalidade | Polo
    doc.font('Helvetica-Bold').text('Modalidade: ', 55, currentY, { continued: true }).font('Helvetica').text('Educação Teológica Modular por Faixa Etária', { continued: true });
    doc.font('Helvetica-Bold').text('   Polo: ', { continued: true }).font('Helvetica').text((aluno as any).polo?.nome || '---');

    currentY += 18;
    // Linha 5: Ano Letivo | Nível
    // Buscar Ano Letivo Config
    const { data: configAno } = await client.from('configuracoes_sistema').select('valor').eq('chave', 'ano_letivo').maybeSingle();
    const anoLetivo = configAno?.valor || '---';

    // Linha extra: Turma (Dia/Hora/Nível)
    const t = (matriculasAtivas?.[0] as any)?.turma;
    const diasMapa: Record<number, string> = { 1: 'Domingo', 2: 'Segunda-feira', 3: 'Terça-feira', 4: 'Quarta-feira', 5: 'Quinta-feira', 6: 'Sexta-feira', 7: 'Sábado' };
    const diaDesc = t?.dia_semana?.[0] ? diasMapa[t.dia_semana[0]] : '---';
    const horaFmt = t?.horario ? t.horario.substring(0, 5) : '---';
    const nivelNome = t?.nivel?.nome || '---';

    doc.font('Helvetica-Bold').text('Ano Letivo: ', 55, currentY, { continued: true }).font('Helvetica').text(anoLetivo, { continued: true });
    doc.font('Helvetica-Bold').text('   Nível: ', { continued: true }).font('Helvetica').text(nivelNome);

    currentY += 18;
    // Linha 6: Dia/Hora
    doc.font('Helvetica-Bold').text('Dia/Hora: ', 55, currentY, { continued: true }).font('Helvetica').text(`${diaDesc} às ${horaFmt}`);

    currentY += 40;

    // --- Módulos Concluídos ---
    let totalCH = 0;
    let totalNotas = 0;
    let countDisciplinas = 0;

    for (const histItem of (historico || [])) {
      const modInfo = modulosInfo.find(m => m.numero === histItem.modulo_numero);
      const ch = modInfo?.carga_horaria || 60;
      totalCH += ch;
      totalNotas += histItem.media_final || 0;
      countDisciplinas++;

      // Verificar quebra de página
      if (currentY > 700) {
        doc.addPage();
        currentY = 40;
      }

      // Título do Módulo
      doc.rect(40, currentY, 515, 25).fill(primaryBlue);
      doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold').text(`MÓDULO ${histItem.modulo_numero} - ${modInfo?.titulo?.toUpperCase() || 'MODULO'} (${ch}h)`, 50, currentY + 7);

      currentY += 28;

      // Header da Tabela
      doc.rect(40, currentY, 515, 20).fill(borderGray);
      doc.fillColor(textGray).fontSize(9).font('Helvetica-Bold');
      doc.text('LIÇÃO', 50, currentY + 6);
      doc.text('FREQUÊNCIA', 350, currentY + 6);
      doc.text('DRÁCMAS', 420, currentY + 6);
      doc.text('SITUAÇÃO', 480, currentY + 6);

      currentY += 20;

      // Listar Lições como Linhas da Tabela
      const licoesM = licoesPorModulo[modInfo?.id] || [];
      for (const licao of licoesM) {
        if (currentY > 750) { doc.addPage(); currentY = 40; }

        // Buscar frequência e drácmas para esta lição
        const presencaItem = (presencas || []).find(p => p.licao_id === licao.id);
        const freq = presencaItem ? (['presente', 'atraso', 'justificativa'].includes(presencaItem.status) ? 'P' : 'F') : '---';

        let dracmasLicao = 0;
        if (presencaItem?.data) {
          dracmasLicao = (dracmasTrans || [])
            .filter(d => d.data === presencaItem.data)
            .reduce((acc, curr) => acc + (curr.quantidade || 0), 0);
        }

        doc.rect(40, currentY, 515, 20).stroke(borderGray);
        doc.fillColor(textGray).fontSize(8).font('Helvetica');
        doc.text(licao.titulo, 50, currentY + 6, { width: 280, ellipsis: true });
        doc.text(freq, 350, currentY + 6, { width: 50, align: 'center' });
        doc.text(dracmasLicao.toString(), 420, currentY + 6, { width: 50, align: 'center' });
        doc.text(histItem.situacao?.toUpperCase() || '---', 480, currentY + 6);

        currentY += 20;
      }
      currentY += 10;
    }

    // --- Em Curso (Se houver) ---
    for (const mAtiva of (matriculasAtivas || [])) {
      if (currentY > 700) { doc.addPage(); currentY = 40; }
      const t = mAtiva.turma;
      const modNum = t?.modulo?.numero || '?';
      const modTitulo = t?.modulo?.titulo || 'MÓDULO';

      doc.rect(40, currentY, 515, 25).fill('#fbbf24'); // Amarelo para "Em Curso"
      doc.fillColor('#000000').fontSize(10).font('Helvetica-Bold').text(`MÓDULO ${modNum} - ${modTitulo.toUpperCase()} (EM CURSO)`, 50, currentY + 7);

      currentY += 28;
      doc.fillColor(primaryBlue).fontSize(9).font('Helvetica-Bold').text(`Turma: ${t?.nome || ''}`, 55, currentY);
      currentY += 15;

      // Header da Tabela (Em Curso)
      doc.rect(40, currentY, 515, 20).fill(borderGray);
      doc.fillColor(textGray).fontSize(9).font('Helvetica-Bold');
      doc.text('LIÇÃO', 50, currentY + 6);
      doc.text('FREQUÊNCIA', 350, currentY + 6);
      doc.text('DRÁCMAS', 420, currentY + 6);
      doc.text('SITUAÇÃO', 480, currentY + 6);
      currentY += 20;

      const licoesC = licoesPorModulo[t?.modulo_atual_id] || [];
      for (const licao of licoesC) {
        if (currentY > 750) { doc.addPage(); currentY = 40; }

        const presencaItem = (presencas || []).find(p => p.licao_id === licao.id && p.turma_id === t?.id);
        const freq = presencaItem ? (['presente', 'atraso', 'justificativa'].includes(presencaItem.status) ? 'P' : 'F') : '---';

        let dracmasLicao = 0;
        if (presencaItem?.data) {
          dracmasLicao = (dracmasTrans || [])
            .filter(d => d.data === presencaItem.data && d.turma_id === t?.id)
            .reduce((acc, curr) => acc + (curr.quantidade || 0), 0);
        }

        doc.rect(40, currentY, 515, 20).stroke(borderGray);
        doc.fillColor(textGray).fontSize(8).font('Helvetica');
        doc.text(licao.titulo, 50, currentY + 6, { width: 280, ellipsis: true });
        doc.text(freq, 350, currentY + 6, { width: 50, align: 'center' });
        doc.text(dracmasLicao.toString(), 420, currentY + 6, { width: 50, align: 'center' });
        doc.text('CURSANDO', 480, currentY + 6);

        currentY += 20;
      }
      currentY += 20;
    }

    // --- Resumo Geral ---
    if (currentY > 650) { doc.addPage(); currentY = 40; }
    const mediaGeral = countDisciplinas > 0 ? (totalNotas / countDisciplinas).toFixed(1) : '---';

    doc.rect(40, currentY, 515, 60).fill(lightGray).stroke(primaryBlue);
    doc.fillColor(primaryBlue).fontSize(11).font('Helvetica-Bold').text('RESUMO GERAL', 55, currentY + 10);
    doc.fillColor(textGray).fontSize(9).font('Helvetica');
    doc.text(`Carga Horária Cumprida: `, 55, currentY + 30, { continued: true }).font('Helvetica-Bold').text(`${totalCH}h`, { continued: true }).font('Helvetica').text(`  |  Média Final: `, { continued: true }).font('Helvetica-Bold').text(mediaGeral);
    const situacaoFinal = aluno.status === 'concluido' ? 'CONCLUÍDO' : 'EM ANDAMENTO';
    doc.font('Helvetica').text(`Situação Final: `, { continued: true }).font('Helvetica-Bold').fillColor(aluno.status === 'concluido' ? '#059669' : primaryBlue).text(situacaoFinal);

    // --- Footer & Assinaturas ---
    const signY = 750;
    doc.fillColor(textGray).fontSize(8).font('Helvetica').text(`Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}`, 40, signY - 20);

    doc.moveTo(60, signY + 30).lineTo(250, signY + 30).stroke(textGray);
    doc.fontSize(8).text('Assinatura do Diretor', 60, signY + 35, { width: 190, align: 'center' });

    doc.moveTo(345, signY + 30).lineTo(535, signY + 30).stroke(textGray);
    doc.fontSize(8).text('Assinatura do Secretário Acadêmico', 345, signY + 35, { width: 190, align: 'center' });

    doc.fontSize(7).fillColor('#9ca3af').text(`Documento emitido pelo IBUC System v2 | ID de Validação: HIST-${alunoId.substring(0, 8)}`, 0, 810, { align: 'center', width: 595 });

    doc.end();

    await new Promise<void>((resolve) => {
      stream.on('finish', () => resolve());
    });
    
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
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const fileName = `lista-alunos-${Date.now()}.pdf`;
    const filePath = path.join(process.env.STORAGE_PATH || './storage', 'relatorios', fileName);

    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

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
      // Se o polo mudou e é admin geral, ou se é o primeiro aluno e é admin geral
      if (isGlobal && aluno.polo?.id !== lastPoloId) {
        if (currentY > 700) { doc.addPage(); currentY = 40; }
        
        doc.moveDown();
        currentY = doc.y;
        
        doc.fillColor('#1d4ed8').fontSize(11).font('Helvetica-Bold');
        doc.text(`POLO: ${aluno.polo?.nome?.toUpperCase() || 'SEM POLO'}`, 50, currentY);
        currentY += 15;
        
        // Desenha o header da tabela para este grupo
        currentY = drawTableHeader(currentY);
        lastPoloId = aluno.polo?.id;
      } else if (index === 0 && !isGlobal) {
        // Para admin de polo, desenha o header apenas uma vez no topo
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

    await new Promise<void>((resolve) => {
      stream.on('finish', () => resolve());
    });

    const fileBuffer = fs.readFileSync(filePath);
    const storagePath = `relatorios/listas/${fileName}`;
    await client.storage.from('documentos').upload(storagePath, fileBuffer, { contentType: 'application/pdf', upsert: true });
    
    fs.unlinkSync(filePath);
    
    const { data: publicUrl } = client.storage.from('documentos').getPublicUrl(storagePath);
    return { success: true, url: publicUrl.publicUrl };
  }

  async gerarReciboPagamento(pagamentoId: string) {
    // Implementar lógica de recibo de pagamento se necessário
    return { success: true, path: '' }; 
  }
}
