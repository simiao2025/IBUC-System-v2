import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log('🏁 INICIANDO BACKEND NESTJS - VERSÃO 1.0.5-DYNAMIC-CORS 🏁');
  const app = await NestFactory.create(AppModule);

  // Ler e Normalizar ALLOWED_ORIGINS
  const rawOrigins = process.env.ALLOWED_ORIGINS || '';
  const allowedOrigins = rawOrigins.split(',')
    .map(origin => origin.trim().replace(/\/$/, ''))
    .filter(Boolean);

  if (allowedOrigins.length === 0) {
    allowedOrigins.push('http://localhost:5173');
  }

  console.log('🔒 CORS habilitado para origens:', allowedOrigins);

  app.enableCors({
    origin: (origin, callback) => {
      // Permitir requisições sem origin (como ferramentas locais ou apps mobile)
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.trim().replace(/\/$/, '');
      const isAllowed = allowedOrigins.includes(normalizedOrigin);
      const isVercelPreview = normalizedOrigin.endsWith('.vercel.app');

      if (isAllowed || isVercelPreview) {
        callback(null, true);
      } else {
        console.warn(`🚫 CORS BLOQUEADO!`);
        console.warn(`🔹 Origem recebida: "${origin}"`);
        console.warn(`🔹 Origem normalizada: "${normalizedOrigin}"`);
        console.warn(`🔹 Origens permitidas: ${allowedOrigins.join(', ')}`);
        // Não bloqueia o preflight com erro, apenas não envia os cabeçalhos
        callback(null, false);
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
      'Access-Control-Allow-Origin'
    ],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`✅ Aplicação rodando porta: ${port}`);
}

bootstrap();
