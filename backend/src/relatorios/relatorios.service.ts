import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { WorkersService } from '../workers/workers.service';

@Injectable()
export class RelatoriosService {
  constructor(
    private supabase: SupabaseService,
    private workers: WorkersService,
  ) {}

  async gerarBoletim(alunoId: string, periodo: string) {
    await this.workers.gerarBoletim(alunoId, periodo);
    return { status: 'processing' };
  }

  async historicoAluno(alunoId: string, periodo?: string) {
    // Contrato inicial para o histórico do aluno.
    // No futuro, este método poderá agregar dados de boletins, notas e frequência
    // a partir das tabelas correspondentes no Supabase.

    return {
      alunoId,
      periodo: periodo || null,
      periodos: [],
    };
  }
}






