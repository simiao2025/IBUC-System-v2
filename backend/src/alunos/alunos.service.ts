import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AlunosService {
  constructor(private supabase: SupabaseService) {}

  async criarAluno(dto: any) {
    const { data, error } = await this.supabase
      .getAdminClient()
      .from('alunos')
      .insert(dto)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}

