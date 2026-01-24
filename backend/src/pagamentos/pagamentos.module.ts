import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase/supabase.module';
import { PaymentsController } from './pagamentos.controller';
import { PagamentosService } from './pagamentos.service';

@Module({
  imports: [SupabaseModule],
  controllers: [PaymentsController],
  providers: [PagamentosService],
  exports: [PagamentosService],
})
export class PagamentosModule {}






