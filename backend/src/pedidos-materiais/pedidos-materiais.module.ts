import { Module } from '@nestjs/common';
import { PedidosMateriaisController } from './pedidos-materiais.controller';
import { PedidosMateriaisService } from './pedidos-materiais.service';
import { MensalidadesModule } from '../mensalidades/mensalidades.module';

@Module({
  imports: [MensalidadesModule],
  controllers: [PedidosMateriaisController],
  providers: [PedidosMateriaisService],
  exports: [PedidosMateriaisService],
})
export class PedidosMateriaisModule {}
