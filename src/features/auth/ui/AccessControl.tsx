import React from 'react';
import { useAuth } from '@/entities/user';
import { Shield, Lock } from 'lucide-react';
import { Card } from '@/shared/ui';
import type { AdminRole, AdminModuleKey, AdminPermissions } from '@/entities/user';

interface AccessControlProps {
  children: React.ReactNode;
  requiresGeneralAccess?: boolean;
  requiresPoloAccess?: string;
  allowedRoles?: AdminRole[];
  fallbackMessage?: string;
}

const AccessControl: React.FC<AccessControlProps> = ({
  children,
  requiresGeneralAccess = false,
  requiresPoloAccess,
  allowedRoles,
  fallbackMessage
}) => {
  const { currentUser, hasAccessToAllPolos, hasAccessToPolo } = useAuth();

  // Se não é admin, nega acesso
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md text-center">
          <Lock className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Acesso Negado</h2>
          <p className="text-gray-600">
            {fallbackMessage || 'Você não tem permissão para acessar esta funcionalidade.'}
          </p>
        </Card>
      </div>
    );
  }

  // Verifica se requer acesso geral
  if (requiresGeneralAccess && !hasAccessToAllPolos()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md text-center">
          <Shield className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Acesso Restrito</h2>
          <p className="text-gray-600">
            Esta funcionalidade requer acesso de coordenação geral ou direção geral.
          </p>
        </Card>
      </div>
    );
  }

  // Verifica se requer acesso a polo específico
  if (requiresPoloAccess && !hasAccessToPolo(requiresPoloAccess)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md text-center">
          <Shield className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Acesso Restrito</h2>
          <p className="text-gray-600">
            Você não tem permissão para acessar este polo específico.
          </p>
        </Card>
      </div>
    );
  }

  // Verifica roles permitidas
  if (allowedRoles && currentUser.adminUser) {
    if (!allowedRoles.includes(currentUser.adminUser.role)) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="max-w-md text-center">
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Função Insuficiente</h2>
            <p className="text-gray-600">
              Sua função não permite acessar esta funcionalidade.
            </p>
          </Card>
        </div>
      );
    }
  }

  // Se passou por todas as verificações, renderiza o conteúdo
  return <>{children}</>;
};

export default AccessControl;

// Hook para verificações de acesso em componentes
export const useAccessControl = () => {
  const { currentUser, hasAccessToAllPolos, hasAccessToPolo, getCurrentUserAccessLevel, getUserAllowedPolos } = useAuth();

  const getUserPermissions = (): AdminPermissions | undefined => {
    return currentUser?.adminUser?.permissions;
  };

  const canAccessModule = (moduleKey: AdminModuleKey): boolean => {
    if (!currentUser?.adminUser) return false;

    // 1. Super Admins e Admin Geral sempre têm acesso total
    if (['super_admin', 'admin_geral'].includes(currentUser.adminUser.role)) return true;

    // 2. Verifica permissões explícitas primeiro (se houver)
    const permissions = getUserPermissions();
    if (permissions) {
      if (permissions.mode === 'full') return true;
      
      const isExplicitlyAllowed = Array.isArray(permissions.modules) && permissions.modules.includes(moduleKey);
      
      // Se estiver explicitamente permitido nas permissões limitadas, concede acesso ignorando travas de cargo
      if (isExplicitlyAllowed) return true;

      // Fallback especial para pré-matrículas atrelado a matrículas
      if (moduleKey === 'pre-enrollments' && Array.isArray(permissions.modules) && permissions.modules.includes('enrollments')) {
        return true;
      }
      
      // Se o modo for limitado e não estiver na lista (e não for um cargo de gestão total), bloqueia aqui
      if (permissions.mode === 'limited') {
         // Cargos de gestão geral ainda mantêm acesso aos seus módulos padrão mesmo sem configuração explícita
         if (['security', 'backup', 'settings'].includes(moduleKey)) {
             return ['diretor_geral', 'coordenador_geral'].includes(currentUser.adminUser.role);
         }
         // Para os demais módulos em modo limitado, se não está na lista, o acesso é negado
         // exceto se for o módulo de usuários (para trocar senha)
         if (moduleKey === 'manage_users') return true; 

         // Se chegamos aqui em modo limitado e não é um dos acima, negamos para garantir restrição
         return false; 
      }
    }

    // 3. Travas de cargo (atua como fallback quando não há configuração de permissões ou para acesso padrão)
    
    // Acesso ao Financeiro (dracmas/financeiro) restrito à Diretoria Geral por padrão
    if (moduleKey === 'dracmas' || moduleKey === 'dracmas_settings' || moduleKey === 'financeiro') {
      return ['diretor_geral', 'coordenador_geral', 'secretario_geral', 'tesoureiro_geral'].includes(currentUser.adminUser.role);
    }

    if (moduleKey === 'polos') {
      return ['diretor_geral'].includes(currentUser.adminUser.role);
    }

    // Diretor/Coordenador de polo: acesso total aos demais módulos (limitado ao seu polo)
    if (['diretor_polo', 'coordenador_polo', 'secretario_polo', 'diretor_geral', 'coordenador_geral', 'secretario_geral'].includes(currentUser.adminUser.role)) return true;

    return false;
  };

  const canManageUsers = () => {
    if (!currentUser?.adminUser) return false;
    if (canAccessModule('manage_users')) return true;
    return ['coordenador_geral', 'diretor_geral', 'diretor_polo', 'super_admin', 'admin_geral', 'secretario_geral'].includes(currentUser.adminUser.role);
  };

  const canManageStaff = () => {
    if (!currentUser?.adminUser) return false;
    if (canAccessModule('staff')) return true;
    return ['super_admin', 'admin_geral', 'coordenador_geral', 'diretor_geral', 'coordenador_polo', 'diretor_polo'].includes(currentUser.adminUser.role);
  };

  const canManagePolos = () => {
    if (!currentUser?.adminUser) return false;
    if (canAccessModule('polos')) return true;
    return ['diretor_geral', 'super_admin', 'admin_geral'].includes(currentUser.adminUser.role);
  };

  const canViewReports = () => {
    if (!currentUser?.adminUser) return false;
    if (canAccessModule('reports')) return true;
    return ['coordenador_geral', 'diretor_geral', 'coordenador_polo', 'diretor_polo', 'secretario_geral', 'secretario_polo', 'tesoureiro_geral', 'tesoureiro_polo', 'super_admin', 'admin_geral'].includes(currentUser.adminUser.role);
  };

  const canManageEnrollments = () => {
    if (!currentUser?.adminUser) return false;
    if (canAccessModule('enrollments')) return true;
    return ['coordenador_geral', 'diretor_geral', 'coordenador_polo', 'diretor_polo', 'secretario_geral', 'secretario_polo'].includes(currentUser.adminUser.role);
  };

  const getFilteredPolos = (allPolos: any[]) => {
    if (hasAccessToAllPolos()) {
      return allPolos;
    }
    
    const allowedPoloIds = getUserAllowedPolos(allPolos.map(p => p.id));
    return allPolos.filter(polo => allowedPoloIds.includes(polo.id));
  };

  return {
    canManageUsers,
    canManageStaff,
    canManagePolos,
    canViewReports,
    canManageEnrollments,
    canAccessModule,
    getUserPermissions,
    getFilteredPolos,
    hasAccessToAllPolos,
    hasAccessToPolo,
    getCurrentUserAccessLevel,
    getUserAllowedPolos
  };
};
