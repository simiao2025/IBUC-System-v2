import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseModule } from './supabase/supabase.module';
import { PolosModule } from './polos/polos.module';
import { TurmasModule } from './turmas/turmas.module';
import { AlunosModule } from './alunos/alunos.module';
import { MatriculasModule } from './matriculas/matriculas.module';
import { PresencasModule } from './presencas/presencas.module';
import { AvaliacoesModule } from './avaliacoes/avaliacoes.module';
import { DracmasModule } from './dracmas/dracmas.module';
import { MensalidadesModule } from './mensalidades/mensalidades.module';
import { PagamentosModule } from './pagamentos/pagamentos.module';
import { DocumentosModule } from './documentos/documentos.module';
import { RelatoriosModule } from './relatorios/relatorios.module';
import { NotificacoesModule } from './notificacoes/notificacoes.module';
import { LgpdModule } from './lgpd/lgpd.module';
import { WorkersModule } from './workers/workers.module';
import { DiretoriaModule } from './diretoria/diretoria.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { PreMatriculasModule } from './pre-matriculas/pre-matriculas.module';
import { NiveisModule } from './niveis/niveis.module';
import { CertificadosModule } from './certificados/certificados.module';
import { EventosModule } from './eventos/eventos.module';
import { ModulosModule } from './modulos/modulos.module';
import { AuthModule } from './auth/auth.module';
import { ConfiguracoesModule } from './configuracoes/configuracoes.module';
import { ListaEsperaModule } from './lista-espera/lista-espera.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SupabaseModule,
    PolosModule,
    TurmasModule,
    AlunosModule,
    MatriculasModule,
    PresencasModule,
    AvaliacoesModule,
    DracmasModule,
    MensalidadesModule,
    PagamentosModule,
    DocumentosModule,
    RelatoriosModule,
    NotificacoesModule,
    LgpdModule,
    WorkersModule,
    DiretoriaModule,
    UsuariosModule,
    PreMatriculasModule,
    NiveisModule,
    CertificadosModule,
    EventosModule,
    ModulosModule,
    AuthModule,
    ConfiguracoesModule,
    ListaEsperaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
