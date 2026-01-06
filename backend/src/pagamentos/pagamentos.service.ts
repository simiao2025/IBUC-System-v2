import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class PagamentosService {
  constructor(private supabase: SupabaseService) {}
}






