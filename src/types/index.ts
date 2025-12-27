export interface Student {
  id: string;
  name: string;
  name_social?: string;
  birthDate: string;
  cpf: string;
  rg?: string;
  gender: 'male' | 'female' | 'other';
  naturalidade?: string;
  nacionalidade?: string;
  address: {
    cep: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  phone: string;
  email: string;
  // Dados de saúde
  alergias?: string;
  medicamentos?: string;
  doencas_cronicas?: string;
  plano_saude?: string;
  hospital_preferencia?: string;
  autorizacao_medica?: boolean;
  // Dados escolares
  escola_origem?: string;
  ano_escolar?: string;
  // Metadata
  status: 'active' | 'inactive' | 'pending';
  registrationDate: string;
}

export interface Parent {
  fatherName: string;
  motherName: string;
  phone: string;
  email: string;
  fatherCpf: string;
  motherCpf: string;
}

export interface StudentData extends Student {
  parents: Parent;
}

export interface Enrollment {
  id: string;
  studentId: string;
  studentName: string;
  level: Level;
  polo: string;
  enrollmentDate: string;
  observations?: string;
}

export type Level = 'NIVEL_I' | 'NIVEL_II' | 'NIVEL_III' | 'NIVEL_IV';

export const LEVELS = {
  NIVEL_I: 'NÍVEL I - 2 a 5 anos',
  NIVEL_II: 'NÍVEL II - 6 a 8 anos',
  NIVEL_III: 'NÍVEL III - 9 a 11 anos',
  NIVEL_IV: 'NÍVEL IV - 12 a 16 anos',
} as const;

export interface Polo {
  id: string;
  name: string;
  address: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    cep: string;
    phone?: string;
    email?: string;
  };
  pastor: string;
  coordinator: {
    name: string;
    cpf: string;
  };
  director?: {
    name: string;
    cpf: string;
  };
  teachers: string[];
  assistants?: string[];
  secretary?: {
    name: string;
    cpf: string;
  };
  treasurer?: {
    name: string;
    cpf: string;
  };
  cafeteriaWorkers?: string[];
  availableLevels: Level[];
  isActive: boolean;
  createdAt: string;
  staff: StaffMember[];
}

// Tipos para funções administrativas
export type AdminRole =
  | 'super_admin'
  | 'admin_geral'
  | 'coordenador_geral'
  | 'diretor_geral'
  | 'coordenador_polo'
  | 'diretor_polo'
  | 'professor'
  | 'auxiliar'
  | 'secretario'
  | 'tesoureiro';

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
  | 'directorate';

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
  poloId?: string; // Para usuários com acesso específico a um polo
  permissions?: AdminPermissions; // Preferencialmente persistido em usuarios.metadata.permissions
  isActive: boolean;
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

// Re-exportar tipos do database
export * from './database';