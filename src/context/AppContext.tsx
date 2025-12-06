import React, { createContext, useContext, useState, ReactNode } from 'react';
import { StudentData, Enrollment, Polo, User, AdminUser, AccessLevel } from '../types';

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
  polos: Polo[];
  addPolo: (polo: Polo) => void;
  updatePolo: (id: string, polo: Polo) => void;
  deletePolo: (id: string) => void;
  
  // Authentication
  currentUser: User | null;
  login: (email: string, password: string, role: 'admin' | 'student') => boolean;
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
const mockPolos: Polo[] = [
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

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentStudent, setCurrentStudent] = useState<Partial<StudentData> | null>(null);
  const [students, setStudents] = useState<StudentData[]>(mockStudents);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [polos, setPolos] = useState<Polo[]>(mockPolos);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const addStudent = (student: StudentData) => {
    setStudents(prev => [...prev, student]);
  };

  const addEnrollment = (enrollment: Enrollment) => {
    setEnrollments(prev => [...prev, enrollment]);
  };

  const addPolo = (polo: Polo) => {
    setPolos(prev => [...prev, polo]);
  };

  const updatePolo = (id: string, updatedPolo: Polo) => {
    setPolos(prev => prev.map(polo => polo.id === id ? updatedPolo : polo));
  };

  const deletePolo = (id: string) => {
    setPolos(prev => prev.filter(polo => polo.id !== id));
  };

  const login = (email: string, password: string, role: 'admin' | 'student'): boolean => {
    // Mock authentication
    if (role === 'admin' && email === 'admin@ibuc.com.br' && password === 'admin123') {
      setCurrentUser({ id: '1', email, role: 'admin' });
      return true;
    }
    // For students, check if CPF exists and mock password validation
    if (role === 'student') {
      const student = students.find(s => s.cpf === email);
      if (student && password === 'senha123') {
        setCurrentUser({ id: '2', email, role: 'student', studentId: student.id });
        return true;
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
