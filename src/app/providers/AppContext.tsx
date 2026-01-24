import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/shared/api';
import { StudentData } from '@/entities/student/model/types';
import { PoloLegacy as UiPolo } from '@/entities/polo/model/types';
import { AuthProvider, useAuth } from '@/entities/user';
import { UIProvider, useUI } from '@/shared/lib/providers/UIProvider';
import { PoloProvider, usePolos } from '@/entities/polo';

interface AppContextType {
  // Student registration (UI State)
  currentStudent: Partial<StudentData> | null;
  setCurrentStudent: (student: Partial<StudentData> | null) => void;

  // Legacy access to sub-providers (proxies for convenience)
  polos: UiPolo[];
  addPolo: (polo: UiPolo) => void;
  updatePolo: (id: string, polo: UiPolo) => void;
  deletePolo: (id: string) => void;

  currentUser: any;
  authLoading: boolean;
  login: any;
  logout: any;
  hasAccessToAllPolos: any;
  hasAccessToPolo: any;
  getCurrentUserAccessLevel: any;
  getUserAllowedPolos: any;

  showFeedback: any;
  showConfirm: any;

  // Form state management
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <UIProvider>
      <AuthProvider>
        <PoloProvider>
          <AppProviderInternal>{children}</AppProviderInternal>
        </PoloProvider>
      </AuthProvider>
    </UIProvider>
  );
};

const AppProviderInternal: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser, authLoading, login, logout, hasAccessToAllPolos, hasAccessToPolo, getCurrentUserAccessLevel, getUserAllowedPolos } = useAuth();
  const { showFeedback, showConfirm } = useUI();
  const { polos, addPolo, updatePolo, deletePolo } = usePolos();

  const [currentStudent, setCurrentStudent] = useState<Partial<StudentData> | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    api.setErrorHandler((error: Error) => {
      showFeedback('error', 'Erro na API', error.message);
    });
  }, [showFeedback]);

  const contextValue: AppContextType = {
    currentStudent,
    setCurrentStudent,
    polos,
    addPolo,
    updatePolo,
    deletePolo,
    currentUser,
    authLoading,
    login,
    logout,
    hasAccessToAllPolos,
    hasAccessToPolo,
    getCurrentUserAccessLevel,
    getUserAllowedPolos: () => getUserAllowedPolos(polos.map(p => p.id)),
    hasUnsavedChanges,
    setHasUnsavedChanges,
    showFeedback,
    showConfirm
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
