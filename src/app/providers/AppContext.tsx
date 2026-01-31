import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { api, API_BASE_URL } from '@/shared/api/api';
import { StudentData, Enrollment, Polo as UiPolo, User, AdminUser, AccessLevel, Level } from '@/types';
import type { Polo as DbPolo, PreMatricula } from '@/types/database';
import { PoloService } from '@/services/polo.service';
import { UserServiceV2 } from '@/services/userService.v2';
import { PreMatriculasAPI } from '@/features/enrollments/matricula.service';
import FeedbackDialog, { FeedbackType } from '@/components/ui/FeedbackDialog';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

interface AppContextType {
  // Student registration
  currentStudent: Partial<StudentData> | null;
  setCurrentStudent: (student: Partial<StudentData> | null) => void;

  // Students database
  students: StudentData[];
  addStudent: (student: StudentData) => void;

  // Enrollments
  enrollments: Enrollment[];
  addEnrollment: (enrollment: Enrollment) => void;

  // Pre-enrollments
  preMatriculas: PreMatricula[];
  refreshDashboardData: () => Promise<void>;

  // Polos
  polos: UiPolo[];
  addPolo: (polo: UiPolo) => void;
  updatePolo: (id: string, polo: UiPolo) => void;
  deletePolo: (id: string) => void;

  // Authentication
  currentUser: User | null;
  authLoading: boolean;
  login: (email: string, password: string, role: 'admin' | 'student') => Promise<'admin' | 'student' | null>;
  logout: () => void;

  // Admin access control
  hasAccessToAllPolos: () => boolean;
  hasAccessToPolo: (poloId: string) => boolean;
  getCurrentUserAccessLevel: () => AccessLevel | null;
  getUserAllowedPolos: () => string[];

  // Form state management
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (hasChanges: boolean) => void;

  // Global Feedback & Confirmation
  showFeedback: (type: FeedbackType, title: string, message: string, confirmText?: string) => void;
  showConfirm: (title: string, message: string, onConfirm: () => void, confirmText?: string, cancelText?: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Mock data removido - usar dados reais do banco
const mockPolos: UiPolo[] = [];

// Mock students data removido - usar dados reais do banco
const mockStudents: StudentData[] = [];

const DEFAULT_LEVELS: Level[] = ['NIVEL_I', 'NIVEL_II', 'NIVEL_III', 'NIVEL_IV'];

const mapDbPoloToUiPolo = (polo: DbPolo): UiPolo => ({
  id: polo.id,
  name: polo.nome,
  address: {
    street: polo.endereco.rua,
    number: polo.endereco.numero,
    neighborhood: polo.endereco.bairro,
    city: polo.endereco.cidade,
    state: polo.endereco.estado,
    cep: polo.endereco.cep,
  },
  pastor: '',
  coordinator: {
    name: '',
    cpf: '',
  },
  director: undefined,
  teachers: [],
  assistants: [],
  secretary: undefined,
  treasurer: undefined,
  cafeteriaWorkers: [],
  availableLevels: DEFAULT_LEVELS,
  isActive: polo.status === 'ativo',
  createdAt: polo.created_at,
  staff: [],
});

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentStudent, setCurrentStudent] = useState<Partial<StudentData> | null>(null);
  const [students, setStudents] = useState<StudentData[]>(mockStudents);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [preMatriculas, setPreMatriculas] = useState<PreMatricula[]>([]);
  const [polos, setPolos] = useState<UiPolo[]>(mockPolos);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Feedback Dialog State
  const [feedback, setFeedback] = useState<{
    isOpen: boolean;
    type: FeedbackType;
    title: string;
    message: string;
    confirmText?: string;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  // Confirmation Dialog State
  const [confirm, setConfirm] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { }
  });

  const extractToken = (payload: any): string | null => {
    if (!payload) return null;
    return (
      payload.token ||
      payload.access_token ||
      payload.accessToken ||
      payload.jwt ||
      payload?.data?.token ||
      payload?.data?.access_token ||
      null
    );
  };

  const extractUserPayload = (payload: any): any => {
    if (!payload) return null;
    return payload.user || payload.usuario || payload;
  };

  const isAdminRoleValue = (role?: string): boolean => {
    if (!role) return false;
    return !['aluno', 'responsavel'].includes(role);
  };

  const hasGlobalAccessForRole = (role?: string): boolean => {
    if (!role) return false;
    return ['super_admin', 'admin_geral', 'coordenador_geral', 'diretor_geral', 'secretario_geral', 'tesoureiro_geral'].includes(role);
  };

  useEffect(() => {
    api.setErrorHandler((error: Error) => {
      showFeedback('error', 'Erro na API', error.message);
    });
  }, []);

  useEffect(() => {
    const carregarPolosReais = async () => {
      try {
        const polosReais = await PoloService.listarPolos();
        if (Array.isArray(polosReais) && polosReais.length > 0) {
          const polosConvertidos = polosReais.map(mapDbPoloToUiPolo);
          setPolos(polosConvertidos);
        }
      } catch (error) {
        console.error('AppContext - erro ao carregar polos reais, mantendo mockPolos:', error);
      }
    };

    carregarPolosReais();
  }, []);

  useEffect(() => {
    const restoreSession = async () => {
      const token = sessionStorage.getItem('auth_token');
      const cachedUserRaw = sessionStorage.getItem('auth_user');

      if (!token) {
        sessionStorage.removeItem('auth_user');
        setCurrentUser(null);
        setAuthLoading(false);
        return;
      }

      if (cachedUserRaw) {
        // Do not set currentUser yet. Wait for validation.
        // We can use the cached user only if the backend is unreachable but we want to allow offline access (which is risky for admin apps).
        // For security, we should validate first.
      }

      try {
        // Usar API_BASE_URL do arquivo de configuração compartilhado
        const response = await fetch(`${API_BASE_URL}/usuarios/me`, {
          cache: 'no-store',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 304) {
          setAuthLoading(false);
          return;
        }

        if (!response.ok) {
          // Token inválido/expirado/erro: limpar sessão
          console.warn('Sessão inválida ou expirada, limpando dados locais.');
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
              regionalPoloIds: user.regionalPoloIds || [],
              permissions: user.metadata?.permissions,
            } as AdminUser,
          });
          setAuthLoading(false);
          return;
        }

        setCurrentUser({
          id: user.id,
          email: user.email || user.cpf || '',
          role: 'student',
          studentId: user.aluno_id || undefined,
        });
        setAuthLoading(false);
      } catch (error) {
        console.error('Erro ao restaurar sessão:', error);
        // Erro de rede/back-end fora do ar: mantém cache/token para não derrubar a sessão
        setAuthLoading(false);
      }
    };

    restoreSession();
  }, []);

  const addStudent = (student: StudentData) => {
    setStudents(prev => [...prev, student]);
  };

  const addEnrollment = (enrollment: Enrollment) => {
    setEnrollments(prev => [...prev, enrollment]);
  };

  const addPolo = (polo: UiPolo) => {
    setPolos(prev => [...prev, polo]);
  };

  const updatePolo = (id: string, updatedPolo: UiPolo) => {
    setPolos(prev => prev.map(polo => polo.id === id ? updatedPolo : polo));
  };

  const deletePolo = (id: string) => {
    setPolos(prev => prev.filter(polo => polo.id !== id));
  };

  const login = async (identifier: string, password: string, role: 'admin' | 'student'): Promise<'admin' | 'student' | null> => {
    try {
      let rawPayload;
      if (role === 'student') {
        rawPayload = await UserServiceV2.loginAluno({ cpf: identifier, password });
      } else {
        rawPayload = await UserServiceV2.login({ email: identifier, password });
      }

      const token = extractToken(rawPayload);
      if (token) {
        sessionStorage.setItem('auth_token', token);
      }

      const user = extractUserPayload(rawPayload);
      sessionStorage.setItem('auth_user', JSON.stringify(user));

      // Add delay to show loading animation
      await new Promise(resolve => setTimeout(resolve, 1500));

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
            regionalPoloIds: user.regionalPoloIds || [],
            permissions: user.metadata?.permissions,
          } as AdminUser,
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
      console.error('Erro ao autenticar:', error);
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
    if (!currentUser.adminUser) return true; // Admin padrão tem acesso geral

    return currentUser.adminUser.accessLevel === 'geral' &&
      ['coordenador_geral', 'diretor_geral', 'secretario_geral', 'tesoureiro_geral', 'super_admin', 'admin_geral'].includes(currentUser.adminUser.role);
  };

  const hasAccessToPolo = (poloId: string): boolean => {
    if (!currentUser || currentUser.role !== 'admin') return false;

    // Se tem acesso geral, pode acessar qualquer polo
    if (hasAccessToAllPolos()) return true;

    // Se tem acesso específico, só pode acessar seu polo
    if (currentUser.adminUser?.accessLevel === 'polo_especifico') {
      return currentUser.adminUser.poloId === poloId;
    }

    // Se é coordenador regional, pode acessar polos de sua região
    if (currentUser.adminUser?.role === 'coordenador_regional') {
      return currentUser.adminUser.regionalPoloIds?.includes(poloId) || false;
    }

    return false;
  };

  const getCurrentUserAccessLevel = (): AccessLevel | null => {
    if (!currentUser || currentUser.role !== 'admin') return null;
    return currentUser.adminUser?.accessLevel || 'geral';
  };

  const getUserAllowedPolos = (): string[] => {
    if (!currentUser || currentUser.role !== 'admin') return [];

    if (hasAccessToAllPolos()) {
      return polos.map(polo => polo.id);
    }

    if (currentUser.adminUser?.accessLevel === 'polo_especifico' && currentUser.adminUser.poloId) {
      return [currentUser.adminUser.poloId];
    }

    if (currentUser.adminUser?.role === 'coordenador_regional') {
      return currentUser.adminUser.regionalPoloIds || [];
    }

    return [];
  };

  const showFeedback = (type: FeedbackType, title: string, message: string, confirmText?: string) => {
    setFeedback({ isOpen: true, type, title, message, confirmText });
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void, confirmText?: string, cancelText?: string) => {
    setConfirm({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirm(prev => ({ ...prev, isOpen: false }));
      },
      confirmText,
      cancelText
    });
  };

  const refreshDashboardData = useCallback(async () => {
    if (!currentUser || currentUser.role !== 'admin') return;

    try {
      const isAdminRestricted = currentUser.adminUser?.accessLevel === 'polo_especifico';
      const poloId = isAdminRestricted ? currentUser.adminUser?.poloId : undefined;

      // Carregar dados em paralelo
      const [alunosData, matriculasData, preMatriculasData] = await Promise.all([
        import('@/entities/aluno/api/aluno.service').then(m => m.AlunosAPI.listar({ polo_id: poloId })),
        import('@/entities/enrollment/api/enrollment.service').then(m => m.MatriculaAPI.listar({ polo_id: poloId })),
        PreMatriculasAPI.listar({ polo_id: poloId })
      ]);

      // Mapear Alunos (DB) -> StudentData (UI)
      const mappedStudents: StudentData[] = (alunosData as any[]).map(aluno => ({
        id: aluno.id,
        name: aluno.nome,
        birthDate: aluno.data_nascimento,
        cpf: aluno.cpf || '',
        gender: aluno.sexo === 'M' ? 'male' : 'female',
        address: {
          street: aluno.endereco?.rua || '',
          number: aluno.endereco?.numero || '',
          neighborhood: aluno.endereco?.bairro || '',
          city: aluno.endereco?.cidade || '',
          state: aluno.endereco?.estado || '',
          cep: aluno.endereco?.cep || ''
        },
        phone: aluno.telefone_responsavel || '',
        email: aluno.email_responsavel || '',
        status: aluno.status === 'ativo' ? 'active' : 'inactive',
        registrationDate: aluno.data_criacao || new Date().toISOString(),
        parents: {
          fatherName: '', // Não mapeado diretamente no StudentData simples
          motherName: aluno.nome_responsavel || '',
          phone: aluno.telefone_responsavel || '',
          email: aluno.email_responsavel || '',
          fatherCpf: '',
          motherCpf: aluno.cpf_responsavel || ''
        }
      }));

      // Mapear Matrículas (DB) -> Enrollment (UI)
      // Precisamos do nome do aluno, então usamos o array de alunos carregado
      const mappedEnrollments: Enrollment[] = (matriculasData as any[]).map(mat => {
        const aluno = (alunosData as any[]).find(a => a.id === mat.aluno_id);
        return {
          id: mat.id,
          studentId: mat.aluno_id,
          studentName: aluno?.nome || 'Aluno Desconhecido',
          level: 'NIVEL_I', // Placeholder, ideal seria buscar da turma/aluno
          polo: mat.polo_id,
          enrollmentDate: mat.created_at || new Date().toISOString(),
          observations: mat.status
        };
      });

      setStudents(mappedStudents);
      setEnrollments(mappedEnrollments);
      setPreMatriculas(preMatriculasData as PreMatricula[]);

    } catch (error) {
      console.error('AppContext - Erro ao carregar dados do dashboard:', error);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      refreshDashboardData();
    } else {
      setPreMatriculas([]);
      setStudents([]);
      setEnrollments([]);
    }
  }, [currentUser, refreshDashboardData]);

  return (
    <AppContext.Provider value={{
      currentStudent,
      setCurrentStudent,
      students,
      addStudent,
      enrollments,
      addEnrollment,
      preMatriculas,
      refreshDashboardData,
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
      getUserAllowedPolos,
      hasUnsavedChanges,
      setHasUnsavedChanges,
      showFeedback,
      showConfirm
    }}>
      {children}

      {/* Diálogos Globais */}
      <FeedbackDialog
        isOpen={feedback.isOpen}
        type={feedback.type}
        title={feedback.title}
        message={feedback.message}
        confirmText={feedback.confirmText}
        onClose={() => setFeedback(prev => ({ ...prev, isOpen: false }))}
      />

      <ConfirmDialog
        isOpen={confirm.isOpen}
        title={confirm.title}
        message={confirm.message}
        confirmText={confirm.confirmText}
        cancelText={confirm.cancelText}
        onConfirm={confirm.onConfirm}
        onCancel={() => setConfirm(prev => ({ ...prev, isOpen: false }))}
      />
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
