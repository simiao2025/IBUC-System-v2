import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext';
import PublicLayout from './components/PublicLayout';
import AppLayout from './components/AppLayout';
import AdminLayout from './components/AdminLayout';
import Home from './pages/Home';
import AboutIBUC from './pages/AboutIBUC';
import Login from './pages/Login';
import RecoverPassword from './pages/RecoverPassword';
import AdminDashboard from './pages/admin/AdminDashboard';
import PoloManagement from './pages/admin/PoloManagement';
import SystemSettings from './pages/admin/SystemSettings';
import EducationalReports from './pages/admin/EducationalReports';
import StudentManagement from './pages/admin/StudentManagement';
import EnrollmentManagement from './pages/admin/EnrollmentManagement';
import Materials from './pages/Materials';
import PreMatricula from './pages/PreMatricula';
import AppDashboard from './pages/app/AppDashboard';
import AppModulos from './pages/app/AppModulos';
import AppBoletim from './pages/app/AppBoletim';
import AppFrequencia from './pages/app/AppFrequencia';
import AppFinanceiro from './pages/app/AppFinanceiro';
import AppDocumentos from './pages/app/AppDocumentos';
import AdminTurmas from './pages/admin/AdminTurmas';
import AdminFrequencia from './pages/admin/AdminFrequencia';
import AdminFinanceiro from './pages/admin/AdminFinanceiro';
import UserManagement from './pages/admin/UserManagement';
import DracmasLaunch from './pages/admin/DracmasLaunch';
import DracmasByStudent from './pages/admin/DracmasByStudent';
import DracmasByClass from './pages/admin/DracmasByClass';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({
  children,
  adminOnly = false,
}) => {
  const { currentUser, authLoading } = useApp();
  
  if (authLoading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Carregando...
      </div>
    );
  }

  const hasStoredSession = Boolean(
    localStorage.getItem('auth_token') || localStorage.getItem('auth_user'),
  );
  
  if (!currentUser) {
    if (hasStoredSession) {
      return (
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          Carregando...
        </div>
      );
    }
    return <Navigate to="/login" replace />;
  }
  
  if (adminOnly && currentUser.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout><Home /></PublicLayout>,
  },
  {
    path: '/pre-matricula',
    element: <PublicLayout><PreMatricula /></PublicLayout>,
  },
  {
    path: '/sobre',
    element: <PublicLayout><AboutIBUC /></PublicLayout>,
  },
  {
    path: '/materiais',
    element: <PublicLayout><Materials /></PublicLayout>,
  },
  {
    path: '/login',
    element: <PublicLayout><Login /></PublicLayout>,
  },
  {
    path: '/recuperar-senha',
    element: <PublicLayout><RecoverPassword /></PublicLayout>,
  },
  {
    path: '/app/dashboard',
    element: (
      <AppLayout>
        <ProtectedRoute>
          <AppDashboard />
        </ProtectedRoute>
      </AppLayout>
    ),
  },
  {
    path: '/app/modulos',
    element: (
      <AppLayout>
        <ProtectedRoute>
          <AppModulos />
        </ProtectedRoute>
      </AppLayout>
    ),
  },
  {
    path: '/app/boletim',
    element: (
      <AppLayout>
        <ProtectedRoute>
          <AppBoletim />
        </ProtectedRoute>
      </AppLayout>
    ),
  },
  {
    path: '/app/frequencia',
    element: (
      <AppLayout>
        <ProtectedRoute>
          <AppFrequencia />
        </ProtectedRoute>
      </AppLayout>
    ),
  },
  {
    path: '/app/financeiro',
    element: (
      <AppLayout>
        <ProtectedRoute>
          <AppFinanceiro />
        </ProtectedRoute>
      </AppLayout>
    ),
  },
  {
    path: '/app/documentos',
    element: (
      <AppLayout>
        <ProtectedRoute>
          <AppDocumentos />
        </ProtectedRoute>
      </AppLayout>
    ),
  },
  {
    path: '/admin/dashboard',
    element: (
      <AdminLayout>
        <ProtectedRoute adminOnly>
          <AdminDashboard />
        </ProtectedRoute>
      </AdminLayout>
    ),
  },
  {
    path: '/admin/polos',
    element: (
      <AdminLayout>
        <ProtectedRoute adminOnly>
          <PoloManagement />
        </ProtectedRoute>
      </AdminLayout>
    ),
  },
  {
    path: '/admin/turmas',
    element: (
      <AdminLayout>
        <ProtectedRoute adminOnly>
          <AdminTurmas />
        </ProtectedRoute>
      </AdminLayout>
    ),
  },
  {
    path: '/admin/alunos',
    element: (
      <AdminLayout>
        <ProtectedRoute adminOnly>
          <StudentManagement />
        </ProtectedRoute>
      </AdminLayout>
    ),
  },
  {
    path: '/admin/matriculas',
    element: (
      <AdminLayout>
        <ProtectedRoute adminOnly>
          <EnrollmentManagement />
        </ProtectedRoute>
      </AdminLayout>
    ),
  },
  {
    path: '/admin/frequencia',
    element: (
      <AdminLayout>
        <ProtectedRoute adminOnly>
          <AdminFrequencia />
        </ProtectedRoute>
      </AdminLayout>
    ),
  },
  {
    path: '/admin/dracmas/lancamento',
    element: (
      <AdminLayout>
        <ProtectedRoute adminOnly>
          <DracmasLaunch />
        </ProtectedRoute>
      </AdminLayout>
    ),
  },
  {
    path: '/admin/dracmas/por-aluno',
    element: (
      <AdminLayout>
        <ProtectedRoute adminOnly>
          <DracmasByStudent />
        </ProtectedRoute>
      </AdminLayout>
    ),
  },
  {
    path: '/admin/dracmas/por-turma',
    element: (
      <AdminLayout>
        <ProtectedRoute adminOnly>
          <DracmasByClass />
        </ProtectedRoute>
      </AdminLayout>
    ),
  },
  {
    path: '/admin/financeiro',
    element: (
      <AdminLayout>
        <ProtectedRoute adminOnly>
          <AdminFinanceiro />
        </ProtectedRoute>
      </AdminLayout>
    ),
  },
  {
    path: '/admin/relatorios',
    element: (
      <AdminLayout>
        <ProtectedRoute adminOnly>
          <EducationalReports />
        </ProtectedRoute>
      </AdminLayout>
    ),
  },
  {
    path: '/admin/usuarios',
    element: (
      <AdminLayout>
        <ProtectedRoute adminOnly>
          <UserManagement />
        </ProtectedRoute>
      </AdminLayout>
    ),
  },
  {
    path: '/admin/configuracoes',
    element: (
      <AdminLayout>
        <ProtectedRoute adminOnly>
          <SystemSettings />
        </ProtectedRoute>
      </AdminLayout>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
