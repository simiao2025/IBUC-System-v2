import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { NotificacoesModule } from '../notificacoes/notificacoes.module';

@Module({
  imports: [
    SupabaseModule,
    NotificacoesModule,
    SupabaseModule,
    NotificacoesModule,
    JwtModule.registerAsync({
      global: true,
      imports: [],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'dev_secret_change_me',
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '7d',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [UsuariosService],
})
export class UsuariosModule {}






