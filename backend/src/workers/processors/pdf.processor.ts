import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import PDFDocument = require('pdfkit');
import * as fs from 'fs';
import * as path from 'path';
import { SupabaseService } from '../../supabase/supabase.service';
import { PdfService } from '../pdf.service';
import * as QRCode from 'qrcode';
import axios from 'axios';

@Processor('pdf-generation')
export class PdfProcessor {
  private logoBuffer: Buffer | null = null;

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

  constructor(
    private supabase: SupabaseService,
    private pdfService: PdfService
  ) { }

  @Process('termo-matricula')
  async handleTermoMatricula(job: Job<{ matriculaId: string }>) {
    const { matriculaId } = job.data;

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

  @Process('boletim')
  async handleBoletim(job: Job<{ alunoId: string; periodo: string }>) {
    const { alunoId, periodo } = job.data;
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

  @Process('boletim-lote')
  async handleBoletimLote(job: Job<{ alunoIds: string[]; moduloId: string }>) {
    const { alunoIds, moduloId } = job.data;
    const client = this.supabase.getAdminClient();

    // Gerar nome de arquivo determinístico para permitir "update" (overwrite)
    const crypto = require('crypto');
    const hash = crypto.createHash('md5').update((alunoIds || []).sort().join(',')).digest('hex');
    const fileName = `boletim-lote-${moduloId}-${hash.substring(0, 8)}-${job.id}.pdf`;

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
        // 1. Buscar Dados do Aluno (Sem embedding para evitar ambiguidade)
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
      .upload(storagePath, fileBuffer, {
        contentType: 'application/pdf',
        upsert: true
      });

    fs.unlinkSync(filePath);

    return { success: true, path: storagePath };
  }

  @Process('certificado')
  async handleCertificado(job: Job<{ alunoId: string; nivelId: string }>) {
    const { alunoId, nivelId } = job.data;
    console.log(`[PdfProcessor] Iniciando processamento de certificado para aluno ${alunoId}, nivel ${nivelId}`);

    try {
      // Delegar para o PdfService que já possui a lógica de:
      // 1. Verificação de existência
      // 2. Geração com template pdf-lib (melhor qualidade)
      // 3. Persistência na tabela 'certificados'
      // 4. Upload para o Storage
      const result = await this.pdfService.gerarCertificado(alunoId, nivelId);

      return result;
    } catch (error) {
      console.error(`[PdfProcessor] Erro ao processar certificado:`, error);
      throw error;
    }
  }

  @Process('recibo-pagamento')
  async handleReciboPagamento(job: Job<{ pagamentoId: string }>) {
    const { pagamentoId } = job.data;
    const client = this.supabase.getAdminClient();

    // 1. Buscar Dados do Pagamento
    const { data: pagamento, error } = await client
      .from('mensalidades')
      .select(`
        *,
        aluno:alunos!fk_aluno(id, nome, cpf),
        polo:polos!fk_polo(id, nome, codigo)
      `)
      .eq('id', pagamentoId)
      .single();

    if (error || !pagamento) {
      throw new Error(`Pagamento não encontrado: ${pagamentoId}`);
    }

    // 2. Gerar PDF
    const doc = new PDFDocument({ margin: 40, size: 'A5' }); // Size A5 is good for receipts
    const fileName = `recibo-${pagamentoId}.pdf`;
    const filePath = path.join(process.env.STORAGE_PATH || './storage', 'recibos', fileName);

    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // --- Design do Recibo ---
    // Header
    doc.rect(0, 0, doc.page.width, 60).fill('#0f172a');
    doc.fillColor('#ffffff').fontSize(16).font('Helvetica-Bold').text('RECIBO DE PAGAMENTO', 40, 22);

    doc.fillColor('#1e293b').fontSize(10).font('Helvetica');
    doc.moveDown(4);

    const valorBrl = (pagamento.valor_cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    doc.fontSize(12).text(`Nº do Recibo: ${pagamento.id.substring(0, 8).toUpperCase()}`, { align: 'right' });
    doc.moveDown();

    // Conteúdo formal
    doc.fontSize(14).text('Recebemos de:', { continued: true });
    doc.font('Helvetica-Bold').text(` ${pagamento.aluno?.nome}`);
    doc.font('Helvetica').fontSize(12).text(`CPF: ${pagamento.aluno?.cpf || '---'}`);

    doc.moveDown();
    doc.fontSize(14).text('A importância de:', { continued: true });
    doc.font('Helvetica-Bold').text(` ${valorBrl}`);

    doc.moveDown();
    doc.font('Helvetica').fontSize(12).text('Referente a:', { continued: true });
    doc.font('Helvetica-Bold').text(` ${pagamento.titulo}`);

    doc.moveDown();
    doc.font('Helvetica').text(`Polo: ${pagamento.polo?.nome}`);
    const dataPagamento = pagamento.pago_em ? new Date(pagamento.pago_em) : new Date();
    doc.text(`Data do Pagamento: ${dataPagamento.toLocaleDateString('pt-BR')}`);

    doc.moveDown(3);

    // Assinatura
    const dashWidth = 200;
    const dashX = (doc.page.width - dashWidth) / 2;
    doc.moveTo(dashX, doc.y).lineTo(dashX + dashWidth, doc.y).stroke('#94a3b8');
    doc.moveDown(0.5);
    doc.fontSize(10).text('ASSINATURA DO RESPONSÁVEL', { align: 'center' });
    doc.text('IBUC - INSTITUTO BÍBLICO DA ÚLTIMA COLHEITA', { align: 'center' });

    // Footer
    doc.fontSize(8).fillColor('#64748b').text(`Documento gerado em ${new Date().toLocaleString('pt-BR')}`, 40, 540);

    doc.end();

    await new Promise<void>((resolve) => {
      stream.on('finish', () => resolve());
    });

    // 3. Upload
    const fileBuffer = fs.readFileSync(filePath);
    const storagePath = `recibos/${pagamentoId}/${fileName}`;

    await client.storage
      .from('documentos')
      .upload(storagePath, fileBuffer, {
        contentType: 'application/pdf',
        upsert: true
      });

    // Atualizar a mensalidade com a URL do PDF (comprovante interno)
    const { data: publicUrl } = client.storage.from('documentos').getPublicUrl(storagePath);
    await client.from('mensalidades').update({ metadata: { recibo_url: publicUrl.publicUrl } }).eq('id', pagamentoId);

    fs.unlinkSync(filePath);

    return { success: true, path: storagePath };
  }

  @Process('relatorio-financeiro')
  async handleRelatorioFinanceiro(job: Job<{ poloId: string; periodo: string }>) {
    // Implementar relatório financeiro
    console.log('Gerando relatório financeiro...', job.data);
  }

  @Process('historico')
  async handleHistorico(job: Job<{ alunoId: string }>) {
    const { alunoId } = job.data;
    const client = this.supabase.getAdminClient();

    // 1. Buscar Dados Básicos do Aluno
    const { data: aluno, error: alunoError } = await client
      .from('alunos')
      .select('id, nome, cpf, rg, data_nascimento, status, polo:polos!fk_polo(id, nome, codigo)')
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
      .select('*, turma:turmas!fk_turma(id, nome, modulo_atual_id, modulo:modulos(id, titulo, numero, carga_horaria))')
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

    // 4. Iniciar Geração do PDF
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
    doc.font('Helvetica-Bold').text('RG: ', 55, currentY, { continued: true }).font('Helvetica').text(aluno.rg || '---', { continued: true });
    doc.font('Helvetica-Bold').text('   CPF: ', { continued: true }).font('Helvetica').text(aluno.cpf || '---', { continued: true });
    const protocolRaw = (matriculasAtivas?.[0] as any)?.protocolo || '---';
    const protocolParts = protocolRaw.split('-');
    const matriculaNum = protocolParts.length >= 2 ? protocolParts.slice(0, 2).join('-') : protocolRaw;
    doc.font('Helvetica-Bold').text('   Matrícula: ', { continued: true }).font('Helvetica').text(matriculaNum);

    currentY += 18;
    doc.font('Helvetica-Bold').text('Curso: ', 55, currentY, { continued: true }).font('Helvetica').text('TEOLOGIA INFANTO JUVENIL');

    currentY += 18;
    doc.font('Helvetica-Bold').text('Modalidade: ', 55, currentY, { continued: true }).font('Helvetica').text('Educação Teológica Modular por Faixa Etária');

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

    // 5. Upload para Storage
    const fileBuffer = fs.readFileSync(filePath);
    const storagePath = `historicos/${alunoId}/${fileName}`;

    await client.storage
      .from('documentos')
      .upload(storagePath, fileBuffer, {
        contentType: 'application/pdf',
        upsert: true
      });

    fs.unlinkSync(filePath);

    return { success: true, path: storagePath };
  }
}

