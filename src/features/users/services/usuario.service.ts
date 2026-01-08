import { api } from '../../../lib/api';
import type { AdminUser, AdminRole, AdminModuleKey } from '../../../types';

/**
 * Representação do Usuário no Backend (Supabase/Postgres)
 */
export interface BackendUsuario {
    id: string;
    nome_completo: string;
    email: string;
    cpf?: string | null;
    telefone?: string | null;
    role: AdminRole;
    polo_id?: string | null;
    metadata?: {
        permissions?: {
            mode: 'full' | 'limited';
            modules: string[]; // No backend é string[], no front é AdminModuleKey[]
        };
        qualifications?: string[];
        hireDate?: string;
    } | null;
    ativo: boolean;
    created_at?: string | null;
    updated_at?: string | null;
}

/**
 * Filtros para listagem de usuários
 */
export interface UsuarioFiltros {
    role?: string;
    polo_id?: string;
    ativo?: boolean;
    search?: string;
}

/**
 * Serviço de Gerenciamento de Usuários
 * Localização: src/features/users/services/usuario.service.ts
 */
export const UsuarioService = {
    /**
     * Converte o formato do backend para o formato da aplicação frontend
     */
    mapToAdminUser(u: BackendUsuario): AdminUser {
        return {
            id: u.id,
            name: u.nome_completo || u.email.split('@')[0],
            email: u.email,
            cpf: u.cpf || '',
            phone: u.telefone || '',
            role: u.role,
            accessLevel: u.polo_id ? 'polo_especifico' : 'geral',
            poloId: u.polo_id || '',
            permissions: {
                mode: u.metadata?.permissions?.mode || 'full',
                modules: (u.metadata?.permissions?.modules || []) as AdminModuleKey[]
            },
            qualifications: u.metadata?.qualifications || [],
            hireDate: u.metadata?.hireDate || u.created_at || new Date().toISOString(),
            isActive: u.ativo,
            createdAt: u.created_at || new Date().toISOString(),
            updatedAt: u.updated_at || new Date().toISOString(),
        };
    },

    /**
     * Lista usuários com filtros opcionais
     */
    async listar(filtros: UsuarioFiltros = {}): Promise<AdminUser[]> {
        const params = new URLSearchParams();
        if (filtros.role) params.append('role', filtros.role);
        if (filtros.polo_id) params.append('polo_id', filtros.polo_id);
        if (filtros.ativo !== undefined) params.append('ativo', String(filtros.ativo));
        if (filtros.search) params.append('search', filtros.search);

        // Evita enviar ? vazio
        const query = params.toString() ? `?${params.toString()}` : '';
        const data = await api.get<BackendUsuario[]>(`/usuarios${query}`);
        return data.map(this.mapToAdminUser);
    },

    /**
     * Busca usuário por ID
     */
    async buscarPorId(id: string): Promise<AdminUser> {
        const data = await api.get<BackendUsuario>(`/usuarios/${id}`);
        return this.mapToAdminUser(data);
    },

    /**
     * Busca usuário por Email
     */
    async buscarPorEmail(email: string): Promise<AdminUser | null> {
        try {
            const data = await api.get<BackendUsuario>(`/usuarios/email/${email}`);
            return this.mapToAdminUser(data);
        } catch (error: any) {
            if (error.message && (error.message.includes('404') || error.message.includes('não encontrado'))) {
                return null;
            }
            throw error;
        }
    },

    /**
     * Cria um novo usuário
     */
    async criar(userData: Partial<AdminUser> & { password?: string }): Promise<AdminUser> {
        const payload = {
            nome_completo: userData.name,
            email: userData.email,
            cpf: userData.cpf,
            telefone: userData.phone,
            password: userData.password,
            role: userData.role,
            polo_id: userData.accessLevel === 'polo_especifico' ? userData.poloId : undefined,
            ativo: userData.isActive !== false,
            metadata: {
                permissions: userData.permissions || { mode: 'full', modules: [] },
                qualifications: (userData as any).qualifications || [],
                hireDate: (userData as any).hireDate
            }
        };

        const data = await api.post<BackendUsuario>('/usuarios', payload);
        return this.mapToAdminUser(data);
    },

    /**
     * Atualiza um usuário existente
     */
    async atualizar(id: string, userData: Partial<AdminUser>): Promise<AdminUser> {
        const payload: any = {};
        if (userData.name !== undefined) payload.nome_completo = userData.name;
        if (userData.email !== undefined) payload.email = userData.email;
        if (userData.cpf !== undefined) payload.cpf = userData.cpf;
        if (userData.phone !== undefined) payload.phone = userData.phone;
        if (userData.role !== undefined) payload.role = userData.role;
        if (userData.isActive !== undefined) payload.ativo = userData.isActive;

        const metadata: any = {};
        if (userData.permissions !== undefined) metadata.permissions = userData.permissions;
        if ((userData as any).qualifications !== undefined) metadata.qualifications = (userData as any).qualifications;
        if ((userData as any).hireDate !== undefined) metadata.hireDate = (userData as any).hireDate;

        if (Object.keys(metadata).length > 0) {
            payload.metadata = metadata;
        }

        // Lógica para polo_id baseada no nível de acesso
        if (userData.accessLevel === 'geral') {
            payload.polo_id = null;
        } else if (userData.poloId !== undefined) {
            payload.polo_id = userData.poloId;
        }

        const data = await api.put<BackendUsuario>(`/usuarios/${id}`, payload);
        return this.mapToAdminUser(data);
    },

    /**
     * Remove um usuário
     */
    async deletar(id: string): Promise<void> {
        await api.delete(`/usuarios/${id}`);
    },

    /**
     * Realiza login administrativo
     */
    async login(data: { email: string; password: string }): Promise<any> {
        return api.post('/usuarios/login', data);
    },

    /**
     * Realiza login de aluno
     */
    async loginAluno(data: { cpf: string; password: string }): Promise<any> {
        return api.post('/usuarios/login-aluno', data);
    },

    /**
     * Solicita código de recuperação de senha
     */
    async solicitarRecuperacaoSenha(email: string): Promise<void> {
        await api.post('/usuarios/recuperar-senha/solicitar-codigo', { email });
    },

    /**
     * Confirma alteração de senha com código
     */
    async confirmarRecuperacaoSenha(data: { email: string; codigo: string; senhaNova: string }): Promise<void> {
        await api.post('/usuarios/recuperar-senha/confirmar-codigo', data);
    },

    /**
     * Lista funções/cargos disponíveis
     */
    async listarRoles(): Promise<{ value: string; label: string }[]> {
        return api.get('/usuarios/meta/roles');
    },

    /**
     * Lista níveis de acesso disponíveis
     */
    async listarNiveisAcesso(): Promise<{ value: string; label: string }[]> {
        return api.get('/usuarios/meta/access-levels');
    }
};
