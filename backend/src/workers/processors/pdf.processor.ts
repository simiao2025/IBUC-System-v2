import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
import { SupabaseService } from '../../supabase/supabase.service';
import * as QRCode from 'qrcode';

@Processor('pdf-generation')
export class PdfProcessor {
  constructor(private supabase: SupabaseService) { }

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

    // 1. Buscar Dados do Aluno e Matrícula Ativa
    const { data: aluno, error: alunoError } = await client
      .from('alunos')
      .select(`
        id,
        nome,
        cpf,
        polo:polos(id, nome),
        matriculas:matriculas(
          id,
          status,
          turma:turmas(id, nome, nivel:niveis(nome))
        )
      `)
      .eq('id', alunoId)
      .single();

    if (alunoError || !aluno) {
      throw new Error(`Aluno não encontrado: ${alunoId}`);
    }

    const matriculaAtiva = (aluno as any).matriculas?.find((m: any) => m.status === 'ativa');
    const turma = matriculaAtiva?.turma;

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

    // --- Design do Boletim ---
    // Cabeçalho
    doc.rect(0, 0, doc.page.width, 100).fill('#1e293b');
    doc.fillColor('#ffffff').fontSize(24).text('IBUC - BOLETIM ESCOLAR', 50, 40);
    doc.fontSize(10).text('Instituto Bíblico da Última Colheita', 50, 70);

    doc.fillColor('#334155').fontSize(12);
    doc.moveDown(4);

    // Info do Aluno
    doc.font('Helvetica-Bold').text(`Aluno: ${aluno.nome}`);
    doc.font('Helvetica').text(`CPF: ${aluno.cpf || '---'}`);
    doc.text(`Polo: ${(aluno as any).polo?.nome || '---'}`);
    doc.text(`Período de Referência: ${periodo}`);
    doc.moveDown();

    doc.rect(50, doc.y, 500, 2).fill('#e2e8f0');
    doc.moveDown();

    // Stats Grid
    const startY = doc.y;
    doc.rect(50, startY, 160, 60).stroke('#cbd5e1');
    doc.text('FREQUÊNCIA', 60, startY + 10);
    doc.fontSize(20).text(`${frequencia}%`, 60, startY + 30);

    doc.rect(220, startY, 160, 60).stroke('#cbd5e1');
    doc.fontSize(12).text('AULAS NO MÊS', 230, startY + 10);
    doc.fontSize(20).text(`${totalAulas}`, 230, startY + 30);

    doc.rect(390, startY, 160, 60).stroke('#cbd5e1');
    doc.fontSize(12).text('DRÁCMAS', 400, startY + 10);
    doc.fontSize(20).text(`+${ganhoDracmas}`, 400, startY + 30);

    doc.moveDown(5);
    doc.fontSize(12).font('Helvetica-Bold').text('Detalhamento Acadêmico');
    doc.moveDown();

    // Tabela de Disciplinas (Mockada enquanto não há tabela no banco)
    const tableTop = doc.y;
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Disciplina', 50, tableTop);
    doc.text('Nível', 250, tableTop);
    doc.text('Status', 450, tableTop);

    doc.moveDown();
    doc.font('Helvetica');
    doc.rect(50, doc.y, 500, 1).fill('#f1f5f9');
    doc.moveDown(0.5);

    const nivelNome = turma?.nivel?.nome || 'N/A';
    doc.text('Formação Ministerial', 50, doc.y);
    doc.text(nivelNome, 250, doc.y - 12); // Adjust Y because of moveDown
    doc.text(frequencia >= 75 ? 'Regular' : 'Abaixo da Média', 450, doc.y - 12);

    doc.moveDown(4);
    doc.fontSize(8).fillColor('#64748b').text('Este documento é uma representação digital das atividades realizadas no período.', { align: 'center' });

    // QR Code de Autenticidade
    const qrData = `https://ibuc.com.br/validar/${alunoId}/${periodo}`;
    const qrBuffer = await QRCode.toBuffer(qrData);
    doc.image(qrBuffer, 460, 680, { width: 80 });
    doc.text('Valide este documento em ibuc.com.br/validar', 50, 740);

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

  @Process('certificado')
  async handleCertificado(job: Job<{ alunoId: string; nivelId: string }>) {
    const { alunoId, nivelId } = job.data;
    const client = this.supabase.getAdminClient();

    // 1. Buscar Dados
    const { data: aluno } = await client
      .from('alunos')
      .select('nome, cpf')
      .eq('id', alunoId)
      .single();

    const { data: nivel } = await client
      .from('niveis')
      .select('nome')
      .eq('id', nivelId)
      .single();

    if (!aluno || !nivel) {
      throw new Error('Dados insuficientes para gerar certificado');
    }

    // 2. Gerar PDF (Paisagem)
    const doc = new PDFDocument({
      layout: 'landscape',
      margin: 0,
      size: 'A4'
    });

    const fileName = `certificado-${alunoId}-${nivelId}.pdf`;
    const filePath = path.join(process.env.STORAGE_PATH || './storage', 'certificados', fileName);

    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // --- Design do Certificado ---
    // Moldura Elegante
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).lineWidth(5).stroke('#1e293b');
    doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60).lineWidth(1).stroke('#94a3b8');

    // Fundo Sutil (Marca d'água simulada)
    doc.fillColor('#f8fafc').rect(31, 31, doc.page.width - 62, doc.page.height - 62).fill();

    // Cabeçalho
    doc.fillColor('#1e293b').fontSize(40).font('Helvetica-Bold').text('CERTIFICADO', 0, 100, { align: 'center' });
    doc.fontSize(16).font('Helvetica').text('DE CONCLUSÃO DE NÍVEL', 0, 150, { align: 'center' });

    doc.moveDown(2);
    doc.fontSize(14).text('O Instituto Bíblico da Última Colheita confere a:', { align: 'center' });

    doc.moveDown();
    doc.fontSize(28).font('Helvetica-Bold').fillColor('#0369a1').text(aluno.nome.toUpperCase(), { align: 'center' });

    doc.moveDown();
    doc.fillColor('#1e293b').fontSize(14).font('Helvetica').text(`Pela conclusão com êxito dos requisitos acadêmicos do:`, { align: 'center' });

    doc.moveDown(0.5);
    doc.fontSize(20).font('Helvetica-Bold').text(nivel.nome.toUpperCase(), { align: 'center' });

    doc.moveDown(2);
    const dateStr = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
    doc.fontSize(12).font('Helvetica').text(`Palmas, Tocantins, ${dateStr}`, { align: 'center' });

    // Assinaturas
    const signatureY = 480;
    doc.lineCap('butt').moveTo(150, signatureY).lineTo(350, signatureY).lineWidth(1).stroke('#1e293b');
    doc.fontSize(10).text('COORDENAÇÃO GERAL', 150, signatureY + 10, { width: 200, align: 'center' });

    doc.moveTo(490, signatureY).lineTo(690, signatureY).stroke('#1e293b');
    doc.text('DIRETORIA EXECUTIVA', 490, signatureY + 10, { width: 200, align: 'center' });

    // Selo de Autenticidade QR
    const authCode = `CERT-${alunoId.substring(0, 8)}-${nivelId.substring(0, 8)}`;
    const qrBuffer = await QRCode.toBuffer(`https://ibuc.com.br/validar/${authCode}`);
    doc.image(qrBuffer, 380, 440, { width: 80 });
    doc.fontSize(8).text(`Código de Autenticidade: ${authCode}`, 0, 530, { align: 'center' });

    doc.end();

    await new Promise<void>((resolve) => {
      stream.on('finish', () => resolve());
    });

    // 3. Upload
    const fileBuffer = fs.readFileSync(filePath);
    const storagePath = `certificados/${alunoId}/${fileName}`;

    await client.storage
      .from('documentos')
      .upload(storagePath, fileBuffer, {
        contentType: 'application/pdf',
        upsert: true
      });

    fs.unlinkSync(filePath);

    return { success: true, path: storagePath };
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
        aluno:alunos(id, nome, cpf),
        polo:polos(id, nome, codigo)
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
}

