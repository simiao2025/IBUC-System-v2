import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsuariosModule } from '../usuarios/usuarios.module';

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        UsuariosModule,
    ],
    providers: [JwtStrategy],
    exports: [PassportModule],
})
export class AuthV2Module { }
