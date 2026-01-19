export type AdminRole =
  | 'super_admin'
  | 'admin_geral'
  | 'diretor_geral'
  | 'vice_diretor_geral'
  | 'coordenador_geral'
  | 'vice_coordenador_geral'
  | 'secretario_geral'
  | 'primeiro_secretario_geral'
  | 'segundo_secretario_geral'
  | 'tesoureiro_geral'
  | 'primeiro_tesoureiro_geral'
  | 'segundo_tesoureiro_geral'
  | 'diretor_polo'
  | 'vice_diretor_polo'
  | 'coordenador_polo'
  | 'vice_coordenador_polo'
  | 'secretario_polo'
  | 'primeiro_secretario_polo'
  | 'segundo_secretario_polo'
  | 'tesoureiro_polo'
  | 'primeiro_tesoureiro_polo'
  | 'segundo_tesoureiro_polo'
  | 'professor'
  | 'auxiliar';

export type AccessLevel = 'geral' | 'polo_especifico';
export type PermissionMode = 'full' | 'limited';

export type AdminModuleKey =
  | 'settings'
  | 'polos'
  | 'staff'
  | 'students'
  | 'enrollments'
  | 'reports'
  | 'dracmas'
  | 'attendance'
  | 'pre-enrollments'
  | 'directorate'
  | 'manage_users'
  | 'security'
  | 'backup'
  | 'dracmas_settings'
  | 'financeiro';

export interface AdminPermissions {
  mode: PermissionMode;
  modules: AdminModuleKey[];
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  role: AdminRole;
  accessLevel: AccessLevel;
  poloId?: string;
  permissions?: AdminPermissions;
  isActive: boolean;
  qualifications?: string[];
  hireDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StaffMember {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  email: string;
  role: AdminRole;
  poloId: string;
  isActive: boolean;
  qualifications?: string[];
  hireDate: string;
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'student';
  studentId?: string;
  adminUser?: AdminUser;
}
