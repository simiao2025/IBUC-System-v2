import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { WorkersService } from './workers.service';
import { WorkersController } from './workers.controller';
import { PdfProcessor } from './processors/pdf.processor';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'pdf-generation',
    }),
    SupabaseModule
  ],
  controllers: [WorkersController],
  providers: [WorkersService, PdfProcessor],
  exports: [WorkersService],
})
export class WorkersModule { }




