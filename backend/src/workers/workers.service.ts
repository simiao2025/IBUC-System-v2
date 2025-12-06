import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class WorkersService {
  constructor(
    @InjectQueue('pdf-generation') private pdfQueue: Queue,
  ) {}

  async gerarTermoMatricula(matriculaId: string) {
    await this.pdfQueue.add('termo-matricula', { matriculaId });
  }

  async gerarBoletim(alunoId: string, periodo: string) {
    await this.pdfQueue.add('boletim', { alunoId, periodo });
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

