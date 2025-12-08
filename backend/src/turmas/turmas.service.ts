import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class TurmasService {
  constructor(private supabase: SupabaseService) {}

  async listarTurmas(filtros?: {
    polo_id?: string;
    nivel_id?: string;
    status?: string;
    ano_letivo?: number;
  }) {
    let query = this.supabase
      .getAdminClient()
      .from('turmas')
      .select('*')
      .order('nome');

    if (filtros?.polo_id) {
      query = query.eq('polo_id', filtros.polo_id);
    }

    if (filtros?.nivel_id) {
      query = query.eq('nivel_id', filtros.nivel_id);
    }

    if (filtros?.status) {
      query = query.eq('status', filtros.status);
    }

    if (typeof filtros?.ano_letivo === 'number') {
      query = query.eq('ano_letivo', filtros.ano_letivo);
    }

    const { data, error } = await query;
    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }
}
