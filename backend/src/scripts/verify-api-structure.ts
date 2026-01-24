import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { PaymentsController } from '../pagamentos/pagamentos.controller';
import { BillingController } from '../mensalidades/mensalidades.controller';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('ApiVerification');
  logger.log('Inicializando contexto...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    const paymentsController = app.get(PaymentsController);
    const billingController = app.get(BillingController);

    if (paymentsController) {
        logger.log('PaymentsController carregado com sucesso.');
        // Basic method check
        if (typeof paymentsController.initiate === 'function') logger.log(' - initiate() ok');
        if (typeof paymentsController.approve === 'function') logger.log(' - approve() ok');
    } else {
        logger.error('Falha ao carregar PaymentsController');
    }

    if (billingController) {
        logger.log('BillingController carregado com sucesso.');
        if (typeof billingController.createBatch === 'function') logger.log(' - createBatch() ok');
        if (typeof billingController.publish === 'function') logger.log(' - publish() ok'); // new endpoint
    } else {
        logger.error('Falha ao carregar BillingController');
    }

  } catch (error) {
    logger.error('Erro na verificação de API:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
