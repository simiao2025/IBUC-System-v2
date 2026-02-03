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

        // --- Adicionar Vínculos Regionais ---
        if (dto.role === 'coordenador_regional' && dto.regionalPoloIds && dto.regionalPoloIds.length > 0) {
            const inserts = dto.regionalPoloIds.map(poloId => ({
                usuario_id: data.id,
                polo_id: poloId
            }));

            const { error: regionalError } = await this.supabase
                .getAdminClient()
                .from('coordenadores_regionais_polos')
                .insert(inserts);

            if (regionalError) {
                console.error('Erro ao vincular polos regionais:', regionalError);
                // Não lançamos erro aqui para não invalidar a criação do usuário, 
                // mas idealmente deveria ter uma transação (Supabase RPC seria melhor)
            }
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

            // --- Carregar Vínculos Regionais ---
            const userIds = usuarios.map(u => u.id);
            const { data: regionalLinks } = await this.supabase
                .getAdminClient()
                .from('coordenadores_regionais_polos')
                .select('usuario_id, polo_id')
                .in('usuario_id', userIds);

            const regionalLinksMap = new Map<string, string[]>();
            if (regionalLinks) {
                regionalLinks.forEach(link => {
                    const existing = regionalLinksMap.get(link.usuario_id) || [];
                    regionalLinksMap.set(link.usuario_id, [...existing, link.polo_id]);
                });
            }

            return usuarios.map(usuario => ({
                ...usuario,
                polos: usuario.polo_id ? polosMap.get(usuario.polo_id) || null : null,
                regionalPoloIds: regionalLinksMap.get(usuario.id) || []
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
                    usuario.polos = polo;
                }
            } else {
                usuario.polos = null;
            }

            // --- Carregar Vínculos Regionais ---
            const { data: regionalLinks } = await this.supabase
                .getAdminClient()
                .from('coordenadores_regionais_polos')
                .select('polo_id')
                .eq('usuario_id', id);

            usuario.regionalPoloIds = regionalLinks ? regionalLinks.map(l => l.polo_id) : [];

            return usuario;
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
    async atualizarUsuario(id: string, updateData: UpdateUsuarioDto) {

        const { data, error } = await this.supabase
            .getAdminClient()
            .from('usuarios')
            .update({
                nome_completo: updateData.nome_completo,
                email: updateData.email,
                cpf: updateData.cpf,
                telefone: updateData.telefone,
                role: updateData.role,
                polo_id: updateData.polo_id,
                ativo: updateData.ativo,
                metadata: updateData.metadata,
                password_hash: updateData.password_hash,
                updated_at: updateData.updated_at,
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw new BadRequestException(`Erro ao atualizar usuário: ${error.message}`);

        // --- Sincronizar Vínculos Regionais ---
        if (updateData.regionalPoloIds !== undefined) {
            // 1. Remover antigos
            await this.supabase
                .getAdminClient()
                .from('coordenadores_regionais_polos')
                .delete()
                .eq('usuario_id', id);

            // 2. Inserir novos se houver
            if (Array.isArray(updateData.regionalPoloIds) && updateData.regionalPoloIds.length > 0) {
                const inserts = updateData.regionalPoloIds.map(poloId => ({
                    usuario_id: id,
                    polo_id: poloId
                }));
                await this.supabase
                    .getAdminClient()
                    .from('coordenadores_regionais_polos')
                    .insert(inserts);
            }
        }

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
