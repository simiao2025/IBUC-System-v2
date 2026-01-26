import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  console.log('🏁 Starting bootstrap v1.0.3...');
  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    console.log('✅ Nest app created');

    app.enableCors({
      origin: true,
      credentials: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      allowedHeaders: 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
    });
    console.log('🛡️ CORS enabled (Reflective Mode)');

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    const config = new DocumentBuilder()
      .setTitle('IBUC System API')
      .setDescription('API REST')
      .setVersion('1.0.3')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`🚀 API ready on port ${port}`);
  } catch (error) {
    console.error('❌ FATAL ERROR during bootstrap:', error);
    process.exit(1);
  }
}

bootstrap();






