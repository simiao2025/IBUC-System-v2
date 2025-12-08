import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class MensalidadesService {
  constructor(private supabase: SupabaseService) {}
}






