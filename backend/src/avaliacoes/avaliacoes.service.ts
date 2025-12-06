import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AvaliacoesService {
  constructor(private supabase: SupabaseService) {}
}

