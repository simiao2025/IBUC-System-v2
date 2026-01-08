import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { NotificacoesService } from '../../notificacoes/notificacoes.service';
import { UserManagementService } from './user-management.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserPasswordService {
    constructor(
        private supabase: SupabaseService,
        private managementService: UserManagementService,
        private notifications: NotificacoesService,
    ) { }

    async alterarSenha(email: string, senhaAtual: string, senhaNova: string) {
        const usuario = await this.managementService.buscarUsuarioPorEmail(email);
        if (!usuario.ativo) throw new BadRequestException('Usuário inativo');
        if (!usuario.password_hash) throw new BadRequestException('Usuário sem senha configurada');

        const matches = await bcrypt.compare(senhaAtual, usuario.password_hash);
        if (!matches) throw new BadRequestException('Credenciais inválidas');

        const novoHash = await bcrypt.hash(senhaNova, 10);
        const { error } = await this.supabase
            .getAdminClient()
            .from('usuarios')
            .update({ password_hash: novoHash, updated_at: new Date().toISOString() })
            .eq('id', usuario.id);

        if (error) throw new BadRequestException(`Erro ao alterar senha: ${error.message}`);
        return { message: 'Senha alterada com sucesso' };
    }

    async solicitarCodigoRecuperacaoSenha(email: string) {
        const usuario = await this.managementService.buscarUsuarioPorEmail(email);
        if (!usuario.ativo) throw new BadRequestException('Usuário inativo');

        const codigo = String(Math.floor(100000 + Math.random() * 900000));
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

        const metadata = usuario.metadata || {};
        metadata.password_reset = { codigo, expires_at: expiresAt };

        await this.managementService.atualizarUsuario(usuario.id, { metadata });
        await this.notifications.enviarCodigoRecuperacaoSenha(email, codigo);
        return { message: 'Código enviado para o e-mail informado' };
    }

    async confirmarCodigoRecuperacaoSenha(email: string, codigo: string, senhaNova: string) {
        const usuario = await this.managementService.buscarUsuarioPorEmail(email);
        const pr = usuario?.metadata?.password_reset;

        if (!pr?.codigo || pr.codigo !== codigo || new Date(pr.expires_at).getTime() < Date.now()) {
            throw new BadRequestException('Código inválido ou expirado');
        }

        const novoHash = await bcrypt.hash(senhaNova, 10);
        const metadata = { ...usuario.metadata };
        delete metadata.password_reset;

        await this.managementService.atualizarUsuario(usuario.id, {
            password_hash: novoHash,
            metadata,
            updated_at: new Date().toISOString()
        });

        return { message: 'Senha redefinida com sucesso' };
    }
}
