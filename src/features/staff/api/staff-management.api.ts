import { api } from '@/shared/api';
import type { AdminUser, AdminRole, AccessLevel } from '@/types';

export interface StaffFilters {
    role?: AdminRole;
    search?: string;
    polo_id?: string;
}

export const staffManagementApi = {
    listUsers: (filters?: StaffFilters) => {
        const searchParams = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value) searchParams.append(key, value);
            });
        }
        const query = searchParams.toString();
        return api.get<AdminUser[]>(`/usuarios/admin${query ? `?${query}` : ''}`);
    },
    getUserById: (id: string) => api.get<AdminUser>(`/usuarios/admin/${id}`),
    getUserByEmail: (email: string) => api.get<AdminUser>(`/usuarios/admin/email/${email}`),
    createUser: (data: Partial<AdminUser> & { password?: string }) => api.post<AdminUser>('/usuarios/admin', data),
    updateUser: (id: string, data: Partial<AdminUser>) => api.put<AdminUser>(`/usuarios/admin/${id}`, data),
    deleteUser: (id: string) => api.delete<void>(`/usuarios/admin/${id}`),
    listRoles: () => api.get<{ value: string; label: string }[]>('/usuarios/admin/roles'),
    listAccessLevels: () => api.get<{ value: string; label: string }[]>('/usuarios/admin/access-levels'),
};
