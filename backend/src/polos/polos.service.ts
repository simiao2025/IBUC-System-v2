import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class PolosService {
  constructor(private supabase: SupabaseService) {}

  async listarPolos() {
    const { data, error } = await this.supabase
      .getAdminClient()
      .from('polos')
      .select('*')
      .eq('status', 'ativo')
      .order('nome');

    if (error) throw new Error(error.message);
    return data;
  }
}

