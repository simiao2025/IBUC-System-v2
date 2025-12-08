import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class DocumentosService {
  constructor(private supabase: SupabaseService) {}
}






