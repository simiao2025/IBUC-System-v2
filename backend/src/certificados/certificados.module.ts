
import { Module } from '@nestjs/common';
import { CertificadosController } from './certificados.controller';
import { CertificadosService } from './certificados.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { WorkersModule } from '../workers/workers.module';

@Module({
  imports: [SupabaseModule, WorkersModule],
  controllers: [CertificadosController],
  providers: [CertificadosService],
  exports: [CertificadosService]
})
export class CertificadosModule { }
