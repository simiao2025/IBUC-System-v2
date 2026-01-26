import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    const configService = app.get(ConfigService);
    let origins: any = configService.get<string>('ALLOWED_ORIGINS', '*');
    
    if (origins !== '*') {
      origins = origins.includes(',') ? origins.split(',').map((s: string) => s.trim()) : origins;
    }

    // Se origins for '*', não podemos usar credentials: true
    const corsOptions: any = {
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      allowedHeaders: 'Content-Type, Authorization, X-Requested-With, Accept',
    };

    if (origins === '*') {
      corsOptions.origin = true; // Reflete a origem da requisição, compatível com credentials
      corsOptions.credentials = true;
    } else {
      corsOptions.origin = origins;
      corsOptions.credentials = true;
    }

    app.enableCors(corsOptions);

    // Validation
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    // Swagger/OpenAPI
    const config = new DocumentBuilder()
      .setTitle('IBUC System API')
      .setDescription('API REST')
      .setVersion('1.0.1')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`🚀 API ready on port ${port}`);
  } catch (error) {
    console.error('❌ Error during bootstrap:', error);
    process.exit(1);
  }
}

bootstrap();






