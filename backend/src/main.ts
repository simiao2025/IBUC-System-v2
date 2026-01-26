import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  console.log('🏁 Starting bootstrap...');
  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    console.log('✅ Nest app created');

    const configService = app.get(ConfigService);
    const originsConfig = configService.get<string>('ALLOWED_ORIGINS') || '*';
    console.log('📝 ALLOWED_ORIGINS config:', originsConfig);

    let origins: any = originsConfig;
    if (origins !== '*' && typeof origins === 'string' && origins.includes(',')) {
      origins = origins.split(',').map((s: string) => s.trim());
    }
    console.log('🌐 CORS origins to use:', origins);

    const corsOptions: any = {
      origin: origins === '*' ? true : origins,
      credentials: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      allowedHeaders: 'Content-Type, Authorization, X-Requested-With, Accept',
    };

    app.enableCors(corsOptions);
    console.log('🛡️ CORS enabled');

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    console.log('🧹 Validations enabled');

    const config = new DocumentBuilder()
      .setTitle('IBUC System API')
      .setDescription('API REST')
      .setVersion('1.0.2-debug')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    console.log('📖 Swagger configured');

    const port = process.env.PORT || 3000;
    console.log(`🔌 Attempting to listen on port ${port}...`);
    await app.listen(port);
    console.log(`🚀 API ready on port ${port}`);
  } catch (error) {
    console.error('❌ FATAL ERROR during bootstrap:', error);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  }
}

bootstrap();






