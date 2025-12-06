import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class PresencasService {
  constructor(private supabase: SupabaseService) {}

  async lancarPresenca(dto: any) {
    const { data, error } = await this.supabase
      .getAdminClient()
      .from('presencas')
      .insert(dto)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}

