import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { NotificacoesModule } from '../notificacoes/notificacoes.module';

@Module({
  imports: [
    SupabaseModule,
    NotificacoesModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev_secret_change_me',
      signOptions: {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      },
    }),
  ],
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [UsuariosService],
})
export class UsuariosModule {}






