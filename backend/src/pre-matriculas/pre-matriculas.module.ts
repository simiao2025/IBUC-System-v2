import { Module } from '@nestjs/common';
import { PreMatriculasController } from './pre-matriculas.controller';
import { PreMatriculasService } from './pre-matriculas.service';
import { NotificacoesModule } from '../notificacoes/notificacoes.module';

@Module({
  imports: [NotificacoesModule],
  controllers: [PreMatriculasController],
  providers: [PreMatriculasService],
  exports: [PreMatriculasService],
})
export class PreMatriculasModule {}
