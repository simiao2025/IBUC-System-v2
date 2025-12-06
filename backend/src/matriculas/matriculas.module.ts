import { Module } from '@nestjs/common';
import { MatriculasController } from './matriculas.controller';
import { MatriculasService } from './matriculas.service';
import { NotificacoesModule } from '../notificacoes/notificacoes.module';
import { WorkersModule } from '../workers/workers.module';

@Module({
  imports: [NotificacoesModule, WorkersModule],
  controllers: [MatriculasController],
  providers: [MatriculasService],
  exports: [MatriculasService],
})
export class MatriculasModule {}

