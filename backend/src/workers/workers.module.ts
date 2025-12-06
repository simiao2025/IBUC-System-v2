import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { WorkersService } from './workers.service';
import { PdfProcessor } from './processors/pdf.processor';
import { NotificacoesModule } from '../notificacoes/notificacoes.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'pdf-generation',
    }),
    NotificacoesModule,
  ],
  providers: [WorkersService, PdfProcessor],
  exports: [WorkersService],
})
export class WorkersModule {}

