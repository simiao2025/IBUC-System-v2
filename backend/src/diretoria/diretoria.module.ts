import { Module } from '@nestjs/common';
import { DiretoriaController } from './diretoria.controller';
import { DiretoriaService } from './diretoria.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [DiretoriaController],
  providers: [DiretoriaService],
  exports: [DiretoriaService],
})
export class DiretoriaModule {}






