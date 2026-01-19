import { api } from '@/shared/api';
import { AdminUser } from '@/types';
import { UserFiltros, CreateUserDto, UpdateUserDto } from '../model/types';

/**
 * Interface for Backend User representation (Supabase/Postgres)
 */
export interface BackendUsuario {
  id: string;
  nome_completo: string;
  email: string;
  cpf?: string | null;
  telefone?: string | null;
  role: any; // Using any to avoid complex imports for now
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

const mapToAdminUser = (u: BackendUsuario): AdminUser => {
  return {
    id: u.id,
    name: u.nome_completo || u.email.split('@')[0],
    email: u.email,
    cpf: u.cpf || '',
    phone: u.telefone || '',
    role: u.role,
    accessLevel: u.polo_id ? 'polo_especifico' : 'geral',
    poloId: u.polo_id || '',
    permissions: u.metadata?.permissions || { mode: 'full', modules: [] },
    qualifications: u.metadata?.qualifications || [],
    hireDate: u.metadata?.hireDate || u.created_at || new Date().toISOString(),
    isActive: u.ativo,
    createdAt: u.created_at || new Date().toISOString(),
    updatedAt: u.updated_at || new Date().toISOString(),
  } as AdminUser;
};

export const staffManagementApi = {
  listUsers: async (filters: UserFiltros = {}): Promise<AdminUser[]> => {
    const params = new URLSearchParams();
    if (filters.role) params.append('role', filters.role);
    if (filters.polo_id) params.append('polo_id', filters.polo_id);
    if (filters.ativo !== undefined) params.append('ativo', String(filters.ativo));
    if (filters.search) params.append('search', filters.search);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    const data = await api.get<BackendUsuario[]>(`/usuarios${query}`);
    return data.map(mapToAdminUser);
  },

  getUserById: async (id: string): Promise<AdminUser> => {
    const data = await api.get<BackendUsuario>(`/usuarios/${id}`);
    return mapToAdminUser(data);
  },

  getUserByEmail: async (email: string): Promise<AdminUser | null> => {
    try {
      const data = await api.get<BackendUsuario>(`/usuarios/email/${email}`);
      return mapToAdminUser(data);
    } catch (error: any) {
      if (error.message && (error.message.includes('404') || error.message.includes('nÃ£o encontrado'))) {
        return null;
      }
      throw error;
    }
  },

  createUser: async (userData: CreateUserDto): Promise<AdminUser> => {
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
    return mapToAdminUser(data);
  },

  updateUser: async (id: string, userData: UpdateUserDto): Promise<AdminUser> => {
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
    
    if (userData.accessLevel === 'geral') {
      payload.polo_id = null;
    } else if (userData.poloId !== undefined) {
      payload.polo_id = userData.poloId;
    }

    const data = await api.put<BackendUsuario>(`/usuarios/${id}`, payload);
    return mapToAdminUser(data);
  },

  deleteUser: (id: string) => api.delete(`/usuarios/${id}`),

  listRoles: () => api.get<{ value: string; label: string }[]>('/usuarios/meta/roles'),

  listAccessLevels: () => api.get<{ value: string; label: string }[]>('/usuarios/meta/access-levels'),
};
