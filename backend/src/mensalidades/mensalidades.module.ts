import { Module } from '@nestjs/common';
import { BillingController } from './mensalidades.controller';
import { MensalidadesService } from './mensalidades.service';
import { BillingDomainService } from './billing-domain.service';
import { PaymentIntentDomainService } from './payment-intent-domain.service';
import { NotificacoesModule } from '../notificacoes/notificacoes.module';

@Module({
  imports: [NotificacoesModule],
  controllers: [BillingController],
  providers: [
    MensalidadesService,
    BillingDomainService,
    PaymentIntentDomainService,
  ],
  exports: [
    MensalidadesService,
    BillingDomainService,
    PaymentIntentDomainService,
  ],
})
export class MensalidadesModule {}







