import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { NotificacoesModule } from '../notificacoes/notificacoes.module';

import { UserAuthService } from './services/user-auth.service';
import { UserManagementService } from './services/user-management.service';
import { UserPasswordService } from './services/user-password.service';
import { UserMetaService } from './services/user-meta.service';

@Module({
  imports: [
    SupabaseModule,
    NotificacoesModule,
    JwtModule.registerAsync({
      global: true,
      imports: [],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '7d',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UsuariosController],
  providers: [
    UsuariosService,
    UserAuthService,
    UserManagementService,
    UserPasswordService,
    UserMetaService
  ],
  exports: [UsuariosService, UserAuthService, UserManagementService],
})
export class UsuariosModule { }






