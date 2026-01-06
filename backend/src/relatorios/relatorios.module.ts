import { Module } from '@nestjs/common';
import { RelatoriosController } from './relatorios.controller';
import { RelatoriosService } from './relatorios.service';
import { WorkersModule } from '../workers/workers.module';

@Module({
  imports: [WorkersModule],
  controllers: [RelatoriosController],
  providers: [RelatoriosService],
  exports: [RelatoriosService],
})
export class RelatoriosModule {}






