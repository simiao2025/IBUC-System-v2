import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { StudentData, Enrollment, Polo as UiPolo, User, AdminUser, AccessLevel, Level } from '../types';
import type { Polo as DbPolo } from '../types/database';
import { PoloService } from '../services/polo.service';

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
  
  // Polos
  polos: UiPolo[];
  addPolo: (polo: UiPolo) => void;
  updatePolo: (id: string, polo: UiPolo) => void;
  deletePolo: (id: string) => void;
  
  // Authentication
  currentUser: User | null;
  login: (email: string, password: string, role: 'admin' | 'student') => Promise<boolean>;
  logout: () => void;

  // Admin access control
  hasAccessToAllPolos: () => boolean;
  hasAccessToPolo: (poloId: string) => boolean;
  getCurrentUserAccessLevel: () => AccessLevel | null;
  getUserAllowedPolos: () => string[];

  // Form state management
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Mock data
const mockPolos: UiPolo[] = [
  {
    id: '1',
    name: 'Igreja Central - Palmas',
    address: {
      street: 'Rua das Flores',
      number: '100',
      neighborhood: 'Centro',
      city: 'Palmas',
      state: 'TO',
      cep: '77000-000'
    },
    pastor: 'Pastor João Silva',
    coordinator: {
      name: 'Maria Santos',
      cpf: '123.456.789-00'
    },
    director: {
      name: 'Ana Costa',
      cpf: '111.222.333-44'
    },
    teachers: ['Pedro Lima', 'Carlos Oliveira'],
    assistants: ['Lucia Ferreira'],
    secretary: {
      name: 'Rosa Silva',
      cpf: '555.666.777-88'
    },
    treasurer: {
      name: 'João Santos',
      cpf: '999.888.777-66'
    },
    cafeteriaWorkers: ['Marta Lima'],
    availableLevels: ['NIVEL_I', 'NIVEL_II', 'NIVEL_III', 'NIVEL_IV'],
    isActive: true,
    createdAt: '2024-01-01',
    staff: []
  },
  {
    id: '2',
    name: 'Igreja Norte - Palmas',
    address: {
      street: 'Avenida Norte',
      number: '250',
      neighborhood: 'Plano Diretor Norte',
      city: 'Palmas',
      state: 'TO',
      cep: '77001-000'
    },
    pastor: 'Pastor Carlos Mendes',
    coordinator: {
      name: 'José Rodrigues',
      cpf: '987.654.321-00'
    },
    teachers: ['Sandra Silva', 'Roberto Santos'],
    availableLevels: ['NIVEL_I', 'NIVEL_II', 'NIVEL_III'],
    isActive: true,
    createdAt: '2024-01-15',
    staff: []
  }
];

// Mock students data
const mockStudents: StudentData[] = [
  {
    id: '1',
    name: 'Ana Silva Santos',
    birthDate: '2010-05-15',
    cpf: '123.456.789-00',
    gender: 'female',
    address: {
      cep: '77000-000',
      street: 'Rua das Flores',
      number: '123',
      neighborhood: 'Centro',
      city: 'Palmas',
      state: 'TO'
    },
    phone: '(63) 99999-1111',
    email: 'ana.santos@email.com',
    parents: {
      fatherName: 'João Santos',
      motherName: 'Maria Santos',
      phone: '(63) 98888-2222',
      email: 'pais.santos@email.com',
      fatherCpf: '111.222.333-44',
      motherCpf: '555.666.777-88'
    }
  },
  {
    id: '2',
    name: 'Pedro Lima Costa',
    birthDate: '2012-08-22',
    cpf: '987.654.321-00',
    gender: 'male',
    address: {
      cep: '77001-000',
      street: 'Avenida Norte',
      number: '456',
      neighborhood: 'Plano Diretor Norte',
      city: 'Palmas',
      state: 'TO'
    },
    phone: '(63) 99999-3333',
    email: 'pedro.costa@email.com',
    parents: {
      fatherName: 'Carlos Costa',
      motherName: 'Lucia Costa',
      phone: '(63) 98888-4444',
      email: 'pais.costa@email.com',
      fatherCpf: '222.333.444-55',
      motherCpf: '666.777.888-99'
    }
  }
];

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
  const [polos, setPolos] = useState<UiPolo[]>(mockPolos);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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

  const login = async (email: string, password: string, role: 'admin' | 'student'): Promise<boolean> => {
    if (role === 'admin') {
      try {
        const response = await fetch('http://localhost:3000/usuarios/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          return false;
        }

        const user = await response.json();

        setCurrentUser({
          id: user.id,
          email: user.email,
          role: 'admin',
          adminUser: {
            role: user.role,
            accessLevel: user.polo_id ? 'polo_especifico' : 'geral',
            poloId: user.polo_id || undefined,
          } as AdminUser,
        });

        return true;
      } catch (error) {
        console.error('Erro ao autenticar admin:', error);
        return false;
      }
    }

    // Login real de aluno via CPF + senha
    if (role === 'student') {
      try {
        const response = await fetch('http://localhost:3000/usuarios/login-aluno', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cpf: email, password }),
        });

        if (!response.ok) {
          return false;
        }

        const user = await response.json();

        setCurrentUser({
          id: user.id,
          email: user.email || user.cpf || email,
          role: 'student',
          studentId: user.aluno_id || undefined,
        });

        return true;
      } catch (error) {
        console.error('Erro ao autenticar aluno:', error);
        return false;
      }
    }

    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const hasAccessToAllPolos = (): boolean => {
    if (!currentUser || currentUser.role !== 'admin') return false;
    if (!currentUser.adminUser) return true; // Admin padrão tem acesso geral

    return currentUser.adminUser.accessLevel === 'geral' &&
           ['coordenador_geral', 'diretor_geral'].includes(currentUser.adminUser.role);
  };

  const hasAccessToPolo = (poloId: string): boolean => {
    if (!currentUser || currentUser.role !== 'admin') return false;

    // Se tem acesso geral, pode acessar qualquer polo
    if (hasAccessToAllPolos()) return true;

    // Se tem acesso específico, só pode acessar seu polo
    if (currentUser.adminUser?.accessLevel === 'polo_especifico') {
      return currentUser.adminUser.poloId === poloId;
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

    return [];
  };

  return (
    <AppContext.Provider value={{
      currentStudent,
      setCurrentStudent,
      students,
      addStudent,
      enrollments,
      addEnrollment,
      polos,
      addPolo,
      updatePolo,
      deletePolo,
      currentUser,
      login,
      logout,
      hasAccessToAllPolos,
      hasAccessToPolo,
      getCurrentUserAccessLevel,
      getUserAllowedPolos,
      hasUnsavedChanges,
      setHasUnsavedChanges
    }}>
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
