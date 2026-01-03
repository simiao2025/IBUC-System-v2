
import { Module } from '@nestjs/common';
import { CertificadosController } from './certificados.controller';
import { CertificadosService } from './certificados.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [CertificadosController],
  providers: [CertificadosService],
  exports: [CertificadosService]
})
export class CertificadosModule {}
