import React from 'react';
import { useApp } from '@/app/providers/AppContext';
import { Shield, Lock } from 'lucide-react';
import Card from '@/shared/ui/Card';
import type { AdminRole, AdminModuleKey, AdminPermissions } from '@/shared/types';

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

    // Super Admin e Admin Geral sempre têm acesso total
    if (['super_admin', 'admin_geral'].includes(currentUser.adminUser.role)) return true;

    const permissions = getUserPermissions();
    if (!permissions) return true; // fallback: mantém acesso total se não houver configuração explícita (legacy)

    if (permissions.mode === 'full') return true;
    
    // Check granular permissions
    const isExplicitlyAllowed = Array.isArray(permissions.modules) && permissions.modules.includes(moduleKey);
    
    // Fallback logic for dependent permissions
    if (!isExplicitlyAllowed) {
       // Pre-enrollments access implies enrollments access logic? 
       // No, original was: if pre-enrollments req, allow if enrollments present.
       if (moduleKey === 'pre-enrollments') {
         return Array.isArray(permissions.modules) && permissions.modules.includes('enrollments');
       }
       // Events/Security/Backup/Dracmas defaults to 'settings' if specific key missing?
       // This helps transitions if we want to be nice, but strict is better for "Block everything".
       // User said "liberar ou bloquear". Strict is safer.
    }

    return isExplicitlyAllowed;
  };

  const canManageUsers = () => canAccessModule('manage_users');
  const canManageStaff = () => canAccessModule('staff');
  const canManagePolos = () => canAccessModule('polos');
  const canViewReports = () => canAccessModule('reports');
  const canManageEnrollments = () => canAccessModule('enrollments');

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
