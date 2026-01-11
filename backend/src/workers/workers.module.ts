import { Module } from '@nestjs/common';
import { WorkersService } from './workers.service';
import { WorkersController } from './workers.controller';
import { PdfService } from './pdf.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [
    SupabaseModule
  ],
  controllers: [WorkersController],
  providers: [WorkersService, PdfService],
  exports: [WorkersService, PdfService],
})
export class WorkersModule { }




