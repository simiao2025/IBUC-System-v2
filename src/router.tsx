import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import PublicLayout from './components/PublicLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages
import StudentAccess from './pages/auth/StudentAccess';
import AdminAccess from './pages/auth/AdminAccess';

// Lazy Load Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const StudentManagement = lazy(() => import('./features/students/StudentManagement'));
const TurmaManagement = lazy(() => import('./pages/admin/TurmaManagement'));
const FrequenciaManagement = lazy(() => import('./features/attendance/FrequenciaManagement'));
const FinanceiroManagement = lazy(() => import('./features/finance/FinanceiroManagement'));
const PoloManagement = lazy(() => import('./pages/admin/PoloManagement'));
const DiretoriaManagement = lazy(() => import('./pages/admin/DiretoriaManagement'));
const EducationalReportManagement = lazy(() => import('./pages/admin/EducationalReportManagement'));
const SystemSettings = lazy(() => import('./pages/admin/SystemSettings'));
const StaffManagement = lazy(() => import('./pages/admin/StaffManagement'));
const PreMatriculaManagement = lazy(() => import('./features/enrollments/PreMatriculaManagement'));
const AttendanceByClassManagement = lazy(() => import('./features/attendance/AttendanceByClassManagement'));
const AttendanceByStudentManagement = lazy(() => import('./features/students/AttendanceByStudentManagement'));
const PresencaFormManagement = lazy(() => import('./features/attendance/PresencaFormManagement'));
const DracmasLaunchManagement = lazy(() => import('./features/finance/DracmasLaunchManagement'));
const DracmasByClassManagement = lazy(() => import('./features/finance/DracmasByClassManagement'));
const DracmasByStudentManagement = lazy(() => import('./features/students/DracmasByStudentManagement'));
const MatriculaDocumentManagement = lazy(() => import('./features/enrollments/MatriculaDocumentManagement'));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

const withSuspense = (Component: React.ReactNode) => (
  <Suspense fallback={<LoadingFallback />}>
    {Component}
  </Suspense>
);



// Enrollment Pages
import StudentRegistration from './pages/enrollment/StudentRegistration';

// App Pages (Student Area)
import AppDashboard from './pages/app/AppDashboard';
import AppBoletim from './pages/app/AppBoletim';
import AppFrequencia from './pages/app/AppFrequencia';
import AppFinanceiro from './pages/app/AppFinanceiro';
import AppDocumentos from './pages/app/AppDocumentos';
import AppModulos from './pages/app/AppModulos';

// Public Pages
import Home from './pages/public/Home';
import AboutIBUC from './pages/public/AboutIBUC';
import Materials from './pages/public/Materials';
import ModulesPage from './pages/modules/ModulesPage';
import Module01 from './pages/modules/Module01';
import Module02 from './pages/modules/Module02';
import Module03 from './pages/modules/Module03';
import Module04 from './pages/modules/Module04';
import Module05 from './pages/modules/Module05';
import Module06 from './pages/modules/Module06';
import Module07 from './pages/modules/Module07';
import Module08 from './pages/modules/Module08';
import Module09 from './pages/modules/Module09';
import Module10 from './pages/modules/Module10';

export const router = createBrowserRouter([
  // Public Routes (with layout)
  { path: '/', element: <PublicLayout><Home /></PublicLayout> },
  { path: '/sobre', element: <PublicLayout><AboutIBUC /></PublicLayout> },
  { path: '/modulos', element: <PublicLayout><ModulesPage /></PublicLayout> },
  { path: '/modulo-01', element: <PublicLayout><Module01 /></PublicLayout> },
  { path: '/modulo-02', element: <PublicLayout><Module02 /></PublicLayout> },
  { path: '/modulo-03', element: <PublicLayout><Module03 /></PublicLayout> },
  { path: '/modulo-04', element: <PublicLayout><Module04 /></PublicLayout> },
  { path: '/modulo-05', element: <PublicLayout><Module05 /></PublicLayout> },
  { path: '/modulo-06', element: <PublicLayout><Module06 /></PublicLayout> },
  { path: '/modulo-07', element: <PublicLayout><Module07 /></PublicLayout> },
  { path: '/modulo-08', element: <PublicLayout><Module08 /></PublicLayout> },
  { path: '/modulo-09', element: <PublicLayout><Module09 /></PublicLayout> },
  { path: '/modulo-10', element: <PublicLayout><Module10 /></PublicLayout> },
  { path: '/materiais', element: <PublicLayout><Materials /></PublicLayout> },
  
  // Auth Routes (with layout)
  { path: '/login', element: <PublicLayout><StudentAccess /></PublicLayout> },
  { path: '/acesso-aluno', element: <PublicLayout><StudentAccess /></PublicLayout> },
  { path: '/login-admin', element: <PublicLayout><AdminAccess /></PublicLayout> },

  // Enrollment Routes (with layout)
  { path: '/pre-matricula', element: <PublicLayout><StudentRegistration /></PublicLayout> },

  // Admin Routes (protected)
  { path: '/admin', element: <Navigate to="/admin/dashboard" replace /> },
  { 
    path: '/admin/dashboard', 
    element: <ProtectedRoute requireAdmin>{withSuspense(<AdminDashboard />)}</ProtectedRoute> 
  },
  { 
    path: '/admin/alunos', 
    element: <ProtectedRoute requireAdmin>{withSuspense(<StudentManagement />)}</ProtectedRoute> 
  },
  { 
    path: '/admin/alunos/novo', 
    element: <ProtectedRoute requireAdmin><StudentRegistration isAdminView={true} /></ProtectedRoute> 
  },
  { 
    path: '/admin/relatorios/frequencia-turma', 
    element: <ProtectedRoute requireAdmin>{withSuspense(<AttendanceByClassManagement />)}</ProtectedRoute> 
  },
  { 
    path: '/admin/relatorios/frequencia-aluno', 
    element: <ProtectedRoute requireAdmin>{withSuspense(<AttendanceByStudentManagement />)}</ProtectedRoute> 
  },
  { 
    path: '/admin/frequencia/lancamento', 
    element: <ProtectedRoute requireAdmin>{withSuspense(<PresencaFormManagement />)}</ProtectedRoute> 
  },
  { 
    path: '/admin/financeiro/dracmas-lancamento', 
    element: <ProtectedRoute requireAdmin>{withSuspense(<DracmasLaunchManagement />)}</ProtectedRoute> 
  },
  { 
    path: '/admin/relatorios/dracmas-turma', 
    element: <ProtectedRoute requireAdmin>{withSuspense(<DracmasByClassManagement />)}</ProtectedRoute> 
  },
  { 
    path: '/admin/relatorios/dracmas-aluno', 
    element: <ProtectedRoute requireAdmin>{withSuspense(<DracmasByStudentManagement />)}</ProtectedRoute> 
  },
  { 
    path: '/admin/matriculas/documentos', 
    element: <ProtectedRoute requireAdmin>{withSuspense(<MatriculaDocumentManagement />)}</ProtectedRoute> 
  },
  { 
    path: '/admin/turmas', 
    element: <ProtectedRoute requireAdmin>{withSuspense(<TurmaManagement />)}</ProtectedRoute> 
  },
  { 
    path: '/admin/frequencia', 
    element: <ProtectedRoute requireAdmin>{withSuspense(<FrequenciaManagement />)}</ProtectedRoute> 
  },
  { 
    path: '/admin/financeiro', 
    element: <ProtectedRoute requireAdmin>{withSuspense(<FinanceiroManagement />)}</ProtectedRoute> 
  },
  { 
    path: '/admin/polos', 
    element: <ProtectedRoute requireAdmin>{withSuspense(<PoloManagement />)}</ProtectedRoute> 
  },
  { 
    path: '/admin/diretoria', 
    element: <ProtectedRoute requireAdmin>{withSuspense(<DiretoriaManagement />)}</ProtectedRoute> 
  },
  { 
    path: '/admin/relatorios', 
    element: <ProtectedRoute requireAdmin>{withSuspense(<EducationalReportManagement />)}</ProtectedRoute> 
  },
  { 
    path: '/admin/configuracoes', 
    element: <ProtectedRoute requireAdmin>{withSuspense(<SystemSettings />)}</ProtectedRoute> 
  },
  { 
    path: '/admin/equipe', 
    element: <ProtectedRoute requireAdmin>{withSuspense(<StaffManagement />)}</ProtectedRoute> 
  },
  { 
    path: '/admin/pre-matriculas', 
    element: <ProtectedRoute requireAdmin>{withSuspense(<PreMatriculaManagement />)}</ProtectedRoute> 
  },


  // Student App Routes
  { path: '/app', element: <Navigate to="/app/dashboard" replace /> },
  { path: '/app/dashboard', element: <AppDashboard /> },
  { path: '/app/boletim', element: <AppBoletim /> },
  { path: '/app/frequencia', element: <AppFrequencia /> },
  { path: '/app/financeiro', element: <AppFinanceiro /> },
  { path: '/app/documentos', element: <AppDocumentos /> },
  { path: '/app/modulos', element: <AppModulos /> },

  // Catch all
  { path: '*', element: <Navigate to="/" replace /> },
]);
