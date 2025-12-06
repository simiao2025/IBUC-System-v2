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
    const job = await this.workers.gerarBoletim(alunoId, periodo);
    return { jobId: job.id, status: 'processing' };
  }
}

