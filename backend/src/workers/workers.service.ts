import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class WorkersService {
  constructor(
    @InjectQueue('pdf-generation') private pdfQueue: Queue,
  ) { }

  async gerarTermoMatricula(matriculaId: string) {
    await this.pdfQueue.add('termo-matricula', { matriculaId });
  }

  async gerarBoletim(alunoId: string, periodo: string) {
    await this.pdfQueue.add('boletim', { alunoId, periodo });
  }

  async gerarBoletimLote(alunoIds: string[], moduloId: string) {
    const job = await this.pdfQueue.add('boletim-lote', { alunoIds, moduloId });
    return job.id;
  }

  async getJobStatus(jobId: string) {
    const job = await this.pdfQueue.getJob(jobId);
    if (!job) return null;

    // Se terminou, retornar o resultado (caminho do PDF)
    const state = await job.getState();
    const result = job.returnvalue;

    return {
      id: job.id,
      state,
      result,
      progress: job.progress,
      failedReason: job.failedReason,
      stacktrace: job.stacktrace
    };
  }

  async gerarCertificado(alunoId: string, nivelId: string) {
    await this.pdfQueue.add('certificado', { alunoId, nivelId });
  }

  async gerarReciboPagamento(pagamentoId: string) {
    await this.pdfQueue.add('recibo-pagamento', { pagamentoId });
  }

  async gerarRelatorioFinanceiro(poloId: string, periodo: string) {
    await this.pdfQueue.add('relatorio-financeiro', { poloId, periodo });
  }
}






