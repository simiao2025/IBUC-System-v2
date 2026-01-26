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
    const originsConfig = configService.get<string>('ALLOWED_ORIGINS') || '';
    console.log('📝 ALLOWED_ORIGINS from env:', originsConfig);

    const allowedOrigins = originsConfig.split(',').map(s => s.trim()).filter(Boolean);
    
    // Adiciona origens padrão se não estiverem presentes
    const defaultOrigins = [
      'https://www.ibucadmprv.com.br',
      'https://ibucadmprv.com.br',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175'
    ];
    
    const allAllowed = [...new Set([...allowedOrigins, ...defaultOrigins])];
    console.log('🌐 Consolidated Allowed Origins:', allAllowed);

    const corsOptions: any = {
      origin: (origin, callback) => {
        // Permite requisições sem origin (como ferramentas de teste ou mobile)
        if (!origin) {
          return callback(null, true);
        }

        const isExplicitlyAllowed = allAllowed.some(allowed => origin === allowed);
        const isVercelPreview = origin.endsWith('.vercel.app');

        if (isExplicitlyAllowed || isVercelPreview) {
          callback(null, true);
        } else {
          console.warn(`🚫 CORS blocked for origin: ${origin}`);
          callback(null, false); // Não bloqueia com erro, apenas não envia os headers
        }
      },
      credentials: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      allowedHeaders: 'Content-Type, Authorization, X-Requested-With, Accept',
      preflightContinue: false,
      optionsSuccessStatus: 204,
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






