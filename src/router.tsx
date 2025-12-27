import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import PublicLayout from './components/PublicLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages
import StudentAccess from './pages/auth/StudentAccess';
import AdminAccess from './pages/auth/AdminAccess';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentManagement from './pages/admin/StudentManagement';
import AdminTurmas from './pages/admin/AdminTurmas';
import AdminFrequencia from './pages/admin/AdminFrequencia';
import AdminFinanceiro from './pages/admin/AdminFinanceiro';
import PoloManagement from './pages/admin/PoloManagement';
import DiretoriaManagement from './pages/admin/DiretoriaManagement';
import EducationalReports from './pages/admin/EducationalReports'; 
import SystemSettings from './pages/admin/SystemSettings';
import StaffManagement from './pages/admin/StaffManagement';

// Enrollment Pages
import PreMatricula from './pages/enrollment/PreMatricula';
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

export const router = createBrowserRouter([
  // Public Routes (with layout)
  { path: '/', element: <PublicLayout><Home /></PublicLayout> },
  { path: '/sobre', element: <PublicLayout><AboutIBUC /></PublicLayout> },
  { path: '/materiais', element: <PublicLayout><Materials /></PublicLayout> },
  
  // Auth Routes (with layout)
  { path: '/login', element: <PublicLayout><StudentAccess /></PublicLayout> },
  { path: '/acesso-aluno', element: <PublicLayout><StudentAccess /></PublicLayout> },
  { path: '/login-admin', element: <PublicLayout><AdminAccess /></PublicLayout> },

  // Enrollment Routes (with layout)
  { path: '/pre-matricula', element: <PublicLayout><PreMatricula /></PublicLayout> },
  { path: '/cadastro-aluno', element: <PublicLayout><StudentRegistration /></PublicLayout> },

  // Admin Routes (protected)
  { path: '/admin', element: <Navigate to="/admin/dashboard" replace /> },
  { 
    path: '/admin/dashboard', 
    element: <ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute> 
  },
  { 
    path: '/admin/alunos', 
    element: <ProtectedRoute requireAdmin><StudentManagement /></ProtectedRoute> 
  },
  { 
    path: '/admin/turmas', 
    element: <ProtectedRoute requireAdmin><AdminTurmas /></ProtectedRoute> 
  },
  { 
    path: '/admin/frequencia', 
    element: <ProtectedRoute requireAdmin><AdminFrequencia /></ProtectedRoute> 
  },
  { 
    path: '/admin/financeiro', 
    element: <ProtectedRoute requireAdmin><AdminFinanceiro /></ProtectedRoute> 
  },
  { 
    path: '/admin/polos', 
    element: <ProtectedRoute requireAdmin><PoloManagement /></ProtectedRoute> 
  },
  { 
    path: '/admin/diretoria', 
    element: <ProtectedRoute requireAdmin><DiretoriaManagement /></ProtectedRoute> 
  },
  { 
    path: '/admin/relatorios', 
    element: <ProtectedRoute requireAdmin><EducationalReports /></ProtectedRoute> 
  },
  { 
    path: '/admin/configuracoes', 
    element: <ProtectedRoute requireAdmin><SystemSettings /></ProtectedRoute> 
  },
  { 
    path: '/admin/equipe', 
    element: <ProtectedRoute requireAdmin><StaffManagement /></ProtectedRoute> 
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
