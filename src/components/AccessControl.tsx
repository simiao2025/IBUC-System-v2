import React from 'react';
import { useApp } from '../context/AppContext';
import { Shield, Lock } from 'lucide-react';
import Card from './ui/Card';
import type { AdminRole, AdminModuleKey, AdminPermissions } from '../types';

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
  const { currentUser, hasAccessToAllPolos, hasAccessToPolo } = useApp();

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
  const { currentUser, hasAccessToAllPolos, hasAccessToPolo, getCurrentUserAccessLevel, getUserAllowedPolos } = useApp();

  const getUserPermissions = (): AdminPermissions | undefined => {
    return currentUser?.adminUser?.permissions;
  };

  const canAccessModule = (moduleKey: AdminModuleKey): boolean => {
    if (!currentUser?.adminUser) return false;

    // Acesso ao Financeiro (dracmas/financeiro) restrito à Diretoria Geral
    if (moduleKey === 'dracmas' || moduleKey === 'dracmas_settings' || moduleKey === 'financeiro') {
      return ['super_admin', 'admin_geral', 'diretor_geral', 'coordenador_geral', 'secretario_geral', 'tesoureiro_geral'].includes(currentUser.adminUser.role);
    }

    if (moduleKey === 'polos') {
      return ['diretor_geral', 'super_admin', 'admin_geral'].includes(currentUser.adminUser.role);
    }

    // Administradores e coordenadores gerais têm acesso total aos demais módulos
    if (['super_admin', 'admin_geral', 'coordenador_geral', 'diretor_geral', 'secretario_geral'].includes(currentUser.adminUser.role)) return true;

    // Diretor/Coordenador de polo: acesso total (limitado ao polo via accessLevel/poloId)
    // Exceto Financeiro, que já foi tratado acima.
    if (['diretor_polo', 'coordenador_polo'].includes(currentUser.adminUser.role)) return true;

    const permissions = getUserPermissions();
    if (!permissions) return true; // fallback: mantém acesso total se não houver configuração

    if (permissions.mode === 'full') return true;
    
    const isExplicitlyAllowed = Array.isArray(permissions.modules) && permissions.modules.includes(moduleKey);
    
    // Fallback: se for pré-matrículas e não estiver explícito, permite se tiver acesso a matrículas
    if (!isExplicitlyAllowed && moduleKey === 'pre-enrollments') {
      return Array.isArray(permissions.modules) && permissions.modules.includes('enrollments');
    }

    return isExplicitlyAllowed;
  };

  const canManageUsers = () => {
    if (!currentUser?.adminUser) return false;
    if (canAccessModule('manage_users')) return true;
    return ['coordenador_geral', 'diretor_geral', 'diretor_polo', 'super_admin', 'admin_geral', 'secretario_geral'].includes(currentUser.adminUser.role);
  };

  const canManageStaff = () => {
    if (!currentUser?.adminUser) return false;
    return ['super_admin', 'admin_geral', 'coordenador_geral', 'diretor_geral', 'coordenador_polo', 'diretor_polo'].includes(currentUser.adminUser.role);
  };

  const canManagePolos = () => {
    if (!currentUser?.adminUser) return false;
    return ['diretor_geral', 'super_admin', 'admin_geral'].includes(currentUser.adminUser.role);
  };

  const canViewReports = () => {
    if (!currentUser?.adminUser) return false;
    return ['coordenador_geral', 'diretor_geral', 'coordenador_polo', 'diretor_polo', 'secretario_geral', 'secretario_polo', 'tesoureiro_geral', 'tesoureiro_polo', 'super_admin', 'admin_geral'].includes(currentUser.adminUser.role);
  };

  const canManageEnrollments = () => {
    if (!currentUser?.adminUser) return false;
    return ['coordenador_geral', 'diretor_geral', 'coordenador_polo', 'diretor_polo', 'secretario_geral', 'secretario_polo'].includes(currentUser.adminUser.role);
  };

  const getFilteredPolos = (allPolos: any[]) => {
    if (hasAccessToAllPolos()) {
      return allPolos;
    }
    
    const allowedPoloIds = getUserAllowedPolos();
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
