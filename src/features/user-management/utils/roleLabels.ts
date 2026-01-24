import { AdminRole } from '@/entities/user/model/types';

export const ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: 'Super Administrador',
  admin_geral: 'Administrador Geral',
  
  // Diretoria Geral
  diretor_geral: 'Diretor Geral',
  vice_diretor_geral: 'Vice-Diretor Geral',
  coordenador_geral: 'Coordenador Geral',
  vice_coordenador_geral: 'Vice-Coordenador Geral',
  secretario_geral: 'Secretário Geral',
  primeiro_secretario_geral: '1º Secretário Geral',
  segundo_secretario_geral: '2º Secretário Geral',
  tesoureiro_geral: 'Tesoureiro Geral',
  primeiro_tesoureiro_geral: '1º Tesoureiro Geral',
  segundo_tesoureiro_geral: '2º Tesoureiro Geral',

  // Diretoria de Polo
  diretor_polo: 'Diretor de Polo',
  vice_diretor_polo: 'Vice-Diretor de Polo',
  coordenador_polo: 'Coordenador de Polo',
  vice_coordenador_polo: 'Vice-Coordenador de Polo',
  secretario_polo: 'Secretário de Polo',
  primeiro_secretario_polo: '1º Secretário de Polo',
  segundo_secretario_polo: '2º Secretário de Polo',
  tesoureiro_polo: 'Tesoureiro de Polo',
  primeiro_tesoureiro_polo: '1º Tesoureiro de Polo',
  segundo_tesoureiro_polo: '2º Tesoureiro de Polo',
  
  // Docência e Apoio
  professor: 'Professor',
  auxiliar: 'Auxiliar'
};

export const getRoleLabel = (role: string): string => {
  return ROLE_LABELS[role as AdminRole] || role;
};
