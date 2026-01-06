import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class NiveisService {
  constructor(private supabase: SupabaseService) {}

  async listar() {
    const { data, error } = await this.supabase
      .getAdminClient()
      .from('niveis')
      .select('*')
      .order('ordem');

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }
}
