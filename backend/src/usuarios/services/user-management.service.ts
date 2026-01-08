import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateUsuarioDto, UpdateUsuarioDto } from '../usuarios.service';

@Injectable()
export class UserManagementService {
    constructor(private supabase: SupabaseService) { }

    async criarUsuario(dto: CreateUsuarioDto) {
        // Logic from UsuariosService.criarUsuario
        const { data: existing } = await this.supabase
            .getAdminClient()
            .from('usuarios')
            .select('id')
            .ilike('email', dto.email)
            .single();

        if (existing) {
            throw new BadRequestException('Email já cadastrado');
        }

        if (dto.cpf) {
            const { data: existingCpf } = await this.supabase
                .getAdminClient()
                .from('usuarios')
                .select('id')
                .eq('cpf', dto.cpf)
                .single();

            if (existingCpf) {
                throw new BadRequestException('CPF já cadastrado');
            }
        }

        if (dto.polo_id) {
            const { data: polo } = await this.supabase
                .getAdminClient()
                .from('polos')
                .select('id')
                .eq('id', dto.polo_id)
                .single();

            if (!polo) {
                throw new NotFoundException('Polo não encontrado');
            }
        }

        const { data, error } = await this.supabase
            .getAdminClient()
            .from('usuarios')
            .insert({
                email: dto.email,
                nome_completo: dto.nome_completo,
                cpf: dto.cpf,
                telefone: dto.telefone,
                role: dto.role,
                polo_id: dto.polo_id || null,
                password_hash: dto.password_hash,
                ativo: dto.ativo !== undefined ? dto.ativo : true,
                metadata: dto.metadata || {},
            })
            .select()
            .single();

        if (error) {
            throw new BadRequestException(`Erro ao criar usuário: ${error.message}`);
        }

        return data;
    }

    async listarUsuarios(filtros?: {
        role?: string;
        polo_id?: string;
        ativo?: boolean;
        search?: string;
    }) {
        try {
            let query = this.supabase
                .getAdminClient()
                .from('usuarios')
                .select('*')
                .order('nome_completo');

            if (filtros?.role) query = query.eq('role', filtros.role);
            if (filtros?.polo_id) query = query.eq('polo_id', filtros.polo_id);
            if (filtros?.ativo !== undefined) query = query.eq('ativo', filtros.ativo);
            if (filtros?.search) {
                query = query.or(
                    `nome_completo.ilike.%${filtros.search}%,email.ilike.%${filtros.search}%,cpf.ilike.%${filtros.search}%`
                );
            }

            const { data: usuarios, error: usuariosError } = await query;
            if (usuariosError) throw usuariosError;
            if (!usuarios || usuarios.length === 0) return [];

            const poloIds = [...new Set(usuarios.map(u => u.polo_id).filter(Boolean))];
            let polos = [];

            if (poloIds.length > 0) {
                const { data: polosData, error: polosError } = await this.supabase
                    .getAdminClient()
                    .from('polos')
                    .select('id, nome, codigo')
                    .in('id', poloIds);

                if (!polosError) polos = polosData || [];
            }

            const polosMap = new Map(polos.map(polo => [polo.id, polo]));
            return usuarios.map(usuario => ({
                ...usuario,
                polos: usuario.polo_id ? polosMap.get(usuario.polo_id) || null : null
            }));
        } catch (error) {
            throw new BadRequestException(error.message || 'Erro ao listar usuários.');
        }
    }

    async buscarUsuarioPorId(id: string) {
        try {
            const { data: usuario, error: usuarioError } = await this.supabase
                .getAdminClient()
                .from('usuarios')
                .select('*, aluno:alunos!usuario_id(id)')
                .eq('id', id)
                .single();

            if (usuarioError || !usuario) throw new NotFoundException('Usuário não encontrado');

            if (usuario.aluno && (usuario.aluno as any[]).length > 0) {
                usuario.aluno_id = (usuario.aluno as any[])[0].id;
            }

            if (usuario.polo_id) {
                const { data: polo, error: poloError } = await this.supabase
                    .getAdminClient()
                    .from('polos')
                    .select('id, nome, codigo')
                    .eq('id', usuario.polo_id)
                    .single();

                if (!poloError && polo) {
                    return { ...usuario, polos: polo };
                }
            }

            return { ...usuario, polos: null };
        } catch (error) {
            throw new NotFoundException(error.message || 'Usuário não encontrado');
        }
    }

    async buscarUsuarioPorEmail(email: string) {
        const { data: usuario, error } = await this.supabase
            .getAdminClient()
            .from('usuarios')
            .select('*')
            .ilike('email', email)
            .single();

        if (error || !usuario) throw new NotFoundException('Usuário não encontrado');

        if (usuario.role === 'aluno') {
            const { data: alunoData } = await this.supabase
                .getAdminClient()
                .from('alunos')
                .select('id')
                .eq('usuario_id', usuario.id)
                .single();

            if (alunoData) usuario.aluno_id = alunoData.id;
        }

        return usuario;
    }

    async buscarUsuarioPorCpf(cpf: string) {
        const { data: usuario, error } = await this.supabase
            .getAdminClient()
            .from('usuarios')
            .select('*, aluno:alunos!usuario_id(id)')
            .eq('cpf', cpf)
            .single();

        if (error || !usuario) throw new NotFoundException('Usuário não encontrado');

        if (usuario.aluno && (usuario.aluno as any[]).length > 0) {
            usuario.aluno_id = (usuario.aluno as any[])[0].id;
        }

        return usuario;
    }

    async atualizarUsuario(id: string, updateData: any) {
        const { data, error } = await this.supabase
            .getAdminClient()
            .from('usuarios')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new BadRequestException(`Erro ao atualizar usuário: ${error.message}`);
        return data;
    }

    async deletarUsuario(id: string) {
        const { error } = await this.supabase
            .getAdminClient()
            .from('usuarios')
            .delete()
            .eq('id', id);

        if (error) throw new BadRequestException(`Erro ao deletar usuário: ${error.message}`);
        return { message: 'Usuário deletado com sucesso' };
    }
}
