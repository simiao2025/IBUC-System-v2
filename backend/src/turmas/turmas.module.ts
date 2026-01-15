import { Module } from '@nestjs/common';
import { TurmasController } from './turmas.controller';
import { TurmasService } from './turmas.service';
import { ModulosModule } from '../modulos/modulos.module';
import { PresencasModule } from '../presencas/presencas.module';
import { MensalidadesModule } from '../mensalidades/mensalidades.module';
import { NotificacoesModule } from '../notificacoes/notificacoes.module';

@Module({
  imports: [ModulosModule, PresencasModule, MensalidadesModule, NotificacoesModule],
  controllers: [TurmasController],
  providers: [TurmasService],
  exports: [TurmasService],
})
export class TurmasModule {}
