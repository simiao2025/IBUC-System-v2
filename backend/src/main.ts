import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log('🚀🚀🚀 NESTJS STARTING - ATTEMPTING VERSION 1.0.4-BOOST - 14:25 🚀🚀🚀');
  const app = await NestFactory.create(AppModule);

  // Ler ALLOWED_ORIGINS da variável de ambiente
  const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
    : ['http://localhost:5173'];

  console.log('🔒 CORS habilitado para:', allowedOrigins);

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'Accept',
      'Origin',
      'X-Requested-With'
    ],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`✅ Aplicação rodando em: ${await app.getUrl()}`);
}

bootstrap();
