import { Injectable } from '@nestjs/common';
import { PdfService } from './pdf.service';

@Injectable()
export class WorkersService {
  constructor(
    private pdfService: PdfService,
  ) { }

  async gerarTermoMatricula(matriculaId: string) {
    return this.pdfService.gerarTermoMatricula(matriculaId);
  }

  async gerarBoletim(alunoId: string, periodo: string, moduloId?: string, turmaId?: string, bulletinId?: string): Promise<Buffer> {
    return this.pdfService.gerarBoletim(alunoId, periodo, moduloId, turmaId, bulletinId);
  }

  async gerarHistorico(alunoId: string) {
    return this.pdfService.gerarHistorico(alunoId);
  }

  async gerarBoletimLote(alunoIds: string[], moduloId: string) {
    return this.pdfService.gerarBoletimLote(alunoIds, moduloId);
  }

  // Mock de compatibilidade para não quebrar chamadas antigas se houver
  async getJobStatus(jobId: string) {
    // Como agora é síncrono, não existem mais jobs para consultar.
    // O frontend deve ser atualizado para não chamar isso.
    return { state: 'completed', progress: 100, result: null };
  }

  async gerarCertificado(alunoId: string, nivelId: string, turmaId?: string) {
    return this.pdfService.gerarCertificado(alunoId, nivelId, turmaId);
  }

  async gerarReciboPagamento(pagamentoId: string) {
    return this.pdfService.gerarReciboPagamento(pagamentoId);
  }

  async gerarRelatorioFinanceiro(poloId: string, periodo: string) {
    // Implementar no PdfService se necessário, ou deixar vazio se não usado
    console.warn('Gerar relatorio financeiro not implemented in PDF Service yet');
  }

  async gerarListaAlunosPdf(filtros: any, user?: any) {
    return this.pdfService.gerarListaAlunosPdf(filtros, user);
  }

  async gerarFichaPreMatricula(preMatriculaId: string, turmaId?: string) {
    return this.pdfService.gerarFichaPreMatricula(preMatriculaId, turmaId);
  }

  async gerarFichaAluno(alunoId: string) {
    return this.pdfService.gerarFichaAluno(alunoId);
  }
}






