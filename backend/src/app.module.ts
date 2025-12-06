import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseModule } from './supabase/supabase.module';
import { PolosModule } from './polos/polos.module';
import { AlunosModule } from './alunos/alunos.module';
import { MatriculasModule } from './matriculas/matriculas.module';
import { PresencasModule } from './presencas/presencas.module';
import { AvaliacoesModule } from './avaliacoes/avaliacoes.module';
import { MensalidadesModule } from './mensalidades/mensalidades.module';
import { PagamentosModule } from './pagamentos/pagamentos.module';
import { DocumentosModule } from './documentos/documentos.module';
import { RelatoriosModule } from './relatorios/relatorios.module';
import { NotificacoesModule } from './notificacoes/notificacoes.module';
import { LgpdModule } from './lgpd/lgpd.module';
import { WorkersModule } from './workers/workers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD || undefined,
      },
    }),
    SupabaseModule,
    PolosModule,
    AlunosModule,
    MatriculasModule,
    PresencasModule,
    AvaliacoesModule,
    MensalidadesModule,
    PagamentosModule,
    DocumentosModule,
    RelatoriosModule,
    NotificacoesModule,
    LgpdModule,
    WorkersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

