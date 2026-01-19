import { AdminUser } from '@/types';

export interface UserFiltros {
  role?: string;
  polo_id?: string;
  ativo?: boolean;
  search?: string;
}

export type CreateUserDto = Partial<AdminUser> & { password?: string };
export type UpdateUserDto = Partial<AdminUser>;
