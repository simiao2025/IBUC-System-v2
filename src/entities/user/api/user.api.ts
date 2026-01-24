import { api } from '@/shared/api';
import type { AdminUser, AdminRole, AdminModuleKey } from '../model/types';

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
            modules: string[]; 
        };
        qualifications?: string[];
        hireDate?: string;
    } | null;
    ativo: boolean;
    created_at?: string | null;
    updated_at?: string | null;
}

export interface UserFiltros {
    role?: string;
    polo_id?: string;
    ativo?: boolean;
    search?: string;
}

export const userApi = {
    mapToAdminUser: (u: BackendUsuario): AdminUser => ({
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
    }),

    list: async (filtros: UserFiltros = {}) => {
        const params = new URLSearchParams();
        if (filtros.role) params.append('role', filtros.role);
        if (filtros.polo_id) params.append('polo_id', filtros.polo_id);
        if (filtros.ativo !== undefined) params.append('ativo', String(filtros.ativo));
        if (filtros.search) params.append('search', filtros.search);

        const query = params.toString() ? `?${params.toString()}` : '';
        const data = await api.get<BackendUsuario[]>(`/usuarios${query}`);
        return data.map(userApi.mapToAdminUser);
    },

    getById: async (id: string) => {
        const data = await api.get<BackendUsuario>(`/usuarios/${id}`);
        return userApi.mapToAdminUser(data);
    },

    getByEmail: async (email: string) => {
        const data = await api.get<BackendUsuario>(`/usuarios/email/${email}`);
        return userApi.mapToAdminUser(data);
    },

    create: async (userData: any) => {
        const { permissions, ...rest } = userData;
        const payload = {
            ...rest,
            metadata: {
                ...rest.metadata,
                permissions
            }
        };
        const data = await api.post<BackendUsuario>('/usuarios', payload);
        return userApi.mapToAdminUser(data);
    },

    update: async (id: string, userData: any) => {
        const { permissions, ...rest } = userData;
        const payload = {
            ...rest,
            metadata: {
                ...rest.metadata,
                permissions
            }
        };
        const data = await api.put<BackendUsuario>(`/usuarios/${id}`, payload);
        return userApi.mapToAdminUser(data);
    },

    delete: (id: string) => api.delete<void>(`/usuarios/${id}`),

    login: (data: any) => api.post('/usuarios/login', data),
    
    loginAluno: (data: any) => api.post('/usuarios/login-aluno', data),

    solicitarRecuperacaoSenha: (email: string) => 
        api.post('/usuarios/recuperar-senha/solicitar-codigo', { email }),

    confirmarRecuperacaoSenha: (data: any) => 
        api.post('/usuarios/recuperar-senha/confirmar-codigo', data),

    listRoles: () => api.get<{ value: string; label: string }[]>('/usuarios/meta/roles'),

    listAccessLevels: () => api.get<{ value: string; label: string }[]>('/usuarios/meta/access-levels'),

    // Compatibility Aliases
    listar: (f?: UserFiltros) => userApi.list(f),
    buscarPorId: (id: string) => userApi.getById(id),
    buscarPorEmail: (email: string) => userApi.getByEmail(email),
    criar: (data: any) => userApi.create(data),
    atualizar: (id: string, data: any) => userApi.update(id, data),
    deletar: (id: string) => userApi.delete(id),
};
