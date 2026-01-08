import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserManagementService } from './user-management.service';

@Injectable()
export class UserAuthService {
    constructor(
        private jwtService: JwtService,
        private managementService: UserManagementService,
    ) { }

    async signToken(usuario: any): Promise<string> {
        const payload = {
            sub: usuario.id,
            aud: 'authenticated',
            role: 'authenticated',
            user_metadata: {
                role: usuario.role,
                polo_id: usuario.polo_id || null,
            },
            app_role: usuario.role,
            polo_id: usuario.polo_id || null,
        };
        return this.jwtService.signAsync(payload);
    }

    async login(email: string, password: string) {
        let usuario: any;
        try {
            usuario = await this.managementService.buscarUsuarioPorEmail(email);
        } catch (e) {
            throw new BadRequestException('Credenciais inválidas');
        }

        if (!usuario.ativo) throw new BadRequestException('Usuário inativo');
        if (!usuario.password_hash) throw new BadRequestException('Usuário sem senha configurada');

        const matches = await bcrypt.compare(password, usuario.password_hash);
        if (!matches) throw new BadRequestException('Credenciais inválidas');

        const token = await this.signToken(usuario);
        const { password_hash, ...safeUser } = usuario;
        return { token, user: safeUser };
    }

    async loginPorCpf(cpf: string, password: string) {
        let usuario: any;
        try {
            usuario = await this.managementService.buscarUsuarioPorCpf(cpf);
        } catch (e) {
            throw new BadRequestException('Credenciais inválidas');
        }

        if (!usuario.ativo) throw new BadRequestException('Usuário inativo');
        if (!usuario.password_hash) throw new BadRequestException('Usuário sem senha configurada');

        const matches = await bcrypt.compare(password, usuario.password_hash);
        if (!matches) throw new BadRequestException('Credenciais inválidas');

        const token = await this.signToken(usuario);
        const { password_hash, ...safeUser } = usuario;
        return { token, user: safeUser };
    }
}
