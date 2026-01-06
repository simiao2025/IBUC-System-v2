import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
import { SupabaseService } from '../../supabase/supabase.service';
import * as QRCode from 'qrcode';

@Processor('pdf-generation')
export class PdfProcessor {
  constructor(private supabase: SupabaseService) {}

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
    // Implementar geração de boletim
    console.log('Gerando boletim...', job.data);
  }

  @Process('certificado')
  async handleCertificado(job: Job<{ alunoId: string; nivelId: string }>) {
    // Implementar geração de certificado
    console.log('Gerando certificado...', job.data);
  }

  @Process('recibo-pagamento')
  async handleReciboPagamento(job: Job<{ pagamentoId: string }>) {
    // Implementar geração de recibo
    console.log('Gerando recibo...', job.data);
  }

  @Process('relatorio-financeiro')
  async handleRelatorioFinanceiro(job: Job<{ poloId: string; periodo: string }>) {
    // Implementar relatório financeiro
    console.log('Gerando relatório financeiro...', job.data);
  }
}

