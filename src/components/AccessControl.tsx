import React from 'react';
import { useApp } from '../context/AppContext';
import { Shield, Lock } from 'lucide-react';
import Card from './ui/Card';
import type { AdminRole, AccessLevel } from '../types';

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

  const canManageUsers = () => {
    if (!currentUser?.adminUser) return false;
    return ['coordenador_geral', 'diretor_geral'].includes(currentUser.adminUser.role);
  };

  const canManageStaff = () => {
    if (!currentUser?.adminUser) return false;
    return ['coordenador_geral', 'diretor_geral', 'coordenador_polo', 'diretor_polo'].includes(currentUser.adminUser.role);
  };

  const canManagePolos = () => {
    if (!currentUser?.adminUser) return false;
    return ['coordenador_geral', 'diretor_geral'].includes(currentUser.adminUser.role);
  };

  const canViewReports = () => {
    if (!currentUser?.adminUser) return false;
    return ['coordenador_geral', 'diretor_geral', 'coordenador_polo', 'diretor_polo'].includes(currentUser.adminUser.role);
  };

  const canManageEnrollments = () => {
    if (!currentUser?.adminUser) return false;
    return ['coordenador_geral', 'diretor_geral', 'coordenador_polo', 'diretor_polo', 'secretario'].includes(currentUser.adminUser.role);
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
    getFilteredPolos,
    hasAccessToAllPolos,
    hasAccessToPolo,
    getCurrentUserAccessLevel,
    getUserAllowedPolos
  };
};
