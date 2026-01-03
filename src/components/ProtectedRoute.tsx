import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { currentUser, authLoading } = useApp();
  const location = useLocation();

  // Aguarda o carregamento da sessão antes de redirecionar
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <p className="mt-4 text-sm text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se requer admin, verifica se o usuário tem permissão de admin
  if (requireAdmin) {
    const isAdmin = currentUser?.role === 'admin';
    
    if (!isAdmin) {
      // Redireciona para login admin com o caminho de retorno
      return <Navigate to="/login-admin" state={{ from: location }} replace />;
    }
  }

  // Se requer qualquer tipo de autenticação
  if (!currentUser) {
    return <Navigate to="/acesso-aluno" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
