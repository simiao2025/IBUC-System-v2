import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AdminUser, AccessLevel } from '../model/types';
import { UserService } from '../api/user.service';

interface AuthContextType {
  currentUser: User | null;
  authLoading: boolean;
  login: (email: string, password: string, role: 'admin' | 'student') => Promise<'admin' | 'student' | null>;
  logout: () => void;
  hasAccessToAllPolos: () => boolean;
  hasAccessToPolo: (poloId: string) => boolean;
  getCurrentUserAccessLevel: () => AccessLevel | null;
  getUserAllowedPolos: (allPoloIds: string[]) => string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const isAdminRoleValue = (role?: string): boolean => {
    if (!role) return false;
    return !['aluno', 'responsavel'].includes(role);
  };

  const hasGlobalAccessForRole = (role?: string): boolean => {
    if (!role) return false;
    return ['super_admin', 'admin_geral', 'coordenador_geral', 'diretor_geral', 'secretario_geral', 'tesoureiro_geral'].includes(role);
  };

  const extractToken = (payload: any): string | null => {
    if (!payload) return null;
    return payload.token || payload.access_token || payload.accessToken || payload.jwt || payload?.data?.token || null;
  };

  const extractUserPayload = (payload: any): any => {
    if (!payload) return null;
    return payload.user || payload.usuario || payload;
  };

  useEffect(() => {
    const restoreSession = async () => {
      const token = sessionStorage.getItem('auth_token');
      if (!token) {
        setCurrentUser(null);
        setAuthLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:3000/usuarios/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          sessionStorage.removeItem('auth_token');
          sessionStorage.removeItem('auth_user');
          setCurrentUser(null);
          setAuthLoading(false);
          return;
        }

        const user = await response.json();
        sessionStorage.setItem('auth_user', JSON.stringify(user));
        
        const isAdmin = isAdminRoleValue(user?.role);
        if (isAdmin) {
          setCurrentUser({
            id: user.id,
            email: user.email,
            role: 'admin',
            adminUser: {
              id: user.id,
              name: user.nome_completo || user.name || '',
              email: user.email,
              role: user.role,
              accessLevel: hasGlobalAccessForRole(user.role) ? 'geral' : user.polo_id ? 'polo_especifico' : 'geral',
              poloId: user.polo_id || undefined,
              permissions: user.metadata?.permissions,
            } as any as AdminUser,
          });
        } else {
          setCurrentUser({
            id: user.id,
            email: user.email || user.cpf || '',
            role: 'student',
            studentId: user.aluno_id || undefined,
          });
        }
      } catch (error) {
        console.error('AuthContext - Erro ao restaurar sessão:', error);
      } finally {
        setAuthLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (identifier: string, password: string, role: 'admin' | 'student'): Promise<'admin' | 'student' | null> => {
    try {
      let rawPayload;
      if (role === 'student') {
        rawPayload = await UserService.loginAluno({ cpf: identifier, password });
      } else {
        rawPayload = await UserService.login({ email: identifier, password });
      }

      const token = extractToken(rawPayload);
      if (token) sessionStorage.setItem('auth_token', token);

      const user = extractUserPayload(rawPayload);
      sessionStorage.setItem('auth_user', JSON.stringify(user));

      const isAdmin = isAdminRoleValue(user?.role);
      if (isAdmin) {
        setCurrentUser({
          id: user.id,
          email: user.email,
          role: 'admin',
          adminUser: {
            id: user.id,
            name: user.nome_completo || user.name || user.email.split('@')[0],
            email: user.email,
            role: user.role,
            accessLevel: hasGlobalAccessForRole(user.role) ? 'geral' : user.polo_id ? 'polo_especifico' : 'geral',
            poloId: user.polo_id || undefined,
            permissions: user.metadata?.permissions,
          } as any as AdminUser,
        });
        return 'admin';
      }

      setCurrentUser({
        id: user.id,
        email: user.email || identifier,
        role: 'student',
        studentId: user.aluno_id || undefined,
      });

      return 'student';
    } catch (error) {
      console.error('AuthContext - Erro ao autenticar:', error);
      return null;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_user');
  };

  const hasAccessToAllPolos = (): boolean => {
    if (!currentUser || currentUser.role !== 'admin') return false;
    if (!currentUser.adminUser) return true;
    return currentUser.adminUser.accessLevel === 'geral' &&
      ['coordenador_geral', 'diretor_geral', 'secretario_geral', 'tesoureiro_geral', 'super_admin', 'admin_geral'].includes(currentUser.adminUser.role);
  };

  const hasAccessToPolo = (poloId: string): boolean => {
    if (!currentUser || currentUser.role !== 'admin') return false;
    if (hasAccessToAllPolos()) return true;
    if (currentUser.adminUser?.accessLevel === 'polo_especifico') {
      return currentUser.adminUser.poloId === poloId;
    }
    return false;
  };

  const getCurrentUserAccessLevel = (): AccessLevel | null => {
    if (!currentUser || currentUser.role !== 'admin') return null;
    return currentUser.adminUser?.accessLevel || 'geral';
  };

  const getUserAllowedPolos = (allPoloIds: string[]): string[] => {
    if (!currentUser || currentUser.role !== 'admin') return [];
    if (hasAccessToAllPolos()) return allPoloIds;
    if (currentUser.adminUser?.accessLevel === 'polo_especifico' && currentUser.adminUser.poloId) {
      return [currentUser.adminUser.poloId];
    }
    return [];
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      authLoading,
      login,
      logout,
      hasAccessToAllPolos,
      hasAccessToPolo,
      getCurrentUserAccessLevel,
      getUserAllowedPolos
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
