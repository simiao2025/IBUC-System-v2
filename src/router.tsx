import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import StudentRegistration from './pages/StudentRegistration';
import Enrollment from './pages/Enrollment';
import StudentAccess from './pages/StudentAccess';
import AdminAccess from './pages/AdminAccess';
import AboutIBUC from './pages/AboutIBUC';
import AdminDashboard from './pages/admin/AdminDashboard';
import PoloManagement from './pages/admin/PoloManagement';
import UserManagement from './pages/admin/UserManagement';
import StaffManagement from './pages/admin/StaffManagement';
import DirectorateManagement from './pages/admin/DirectorateManagement';
import EnhancedPoloManagement from './pages/admin/EnhancedPoloManagement';
import SystemSettings from './pages/admin/SystemSettings';
import EducationalReports from './pages/admin/EducationalReports';
import StudentManagement from './pages/admin/StudentManagement';
import EnrollmentManagement from './pages/admin/EnrollmentManagement';
import AttendanceByStudent from './pages/admin/AttendanceByStudent';
import AttendanceByClass from './pages/admin/AttendanceByClass';
import DracmasLaunch from './pages/admin/DracmasLaunch';
import DracmasByStudent from './pages/admin/DracmasByStudent';
import DracmasByClass from './pages/admin/DracmasByClass';
import Materials from './pages/Materials';
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
import ModulesPageClone from './pages/ModulesPageClone';
import PreMatricula from './pages/PreMatricula';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ 
  children, 
  adminOnly = false 
}) => {
  const { currentUser } = useApp();
  
  if (!currentUser) {
    return <Navigate to={adminOnly ? "/admin" : "/acesso-aluno"} replace />;
  }
  
  if (adminOnly && currentUser.role !== 'admin') {
    return <Navigate to="/admin" replace />;
  }
  
  return <>{children}</>;
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout><Home /></Layout>,
  },
  {
    path: '/admin/dracmas/lancamento',
    element: (
      <Layout>
        <ProtectedRoute adminOnly>
          <DracmasLaunch />
        </ProtectedRoute>
      </Layout>
    ),
  },
  {
    path: '/admin/dracmas/aluno',
    element: (
      <Layout>
        <ProtectedRoute adminOnly>
          <DracmasByStudent />
        </ProtectedRoute>
      </Layout>
    ),
  },
  {
    path: '/admin/dracmas/turma',
    element: (
      <Layout>
        <ProtectedRoute adminOnly>
          <DracmasByClass />
        </ProtectedRoute>
      </Layout>
    ),
  },
  {
    path: '/admin/attendance/student',
    element: (
      <Layout>
        <ProtectedRoute adminOnly>
          <AttendanceByStudent />
        </ProtectedRoute>
      </Layout>
    ),
  },
  {
    path: '/admin/attendance/class',
    element: (
      <Layout>
        <ProtectedRoute adminOnly>
          <AttendanceByClass />
        </ProtectedRoute>
      </Layout>
    ),
  },
  {
    path: '/cadastro-aluno',
    element: <Layout><StudentRegistration /></Layout>,
  },
  {
    path: '/matricula',
    element: <Layout><Enrollment /></Layout>,
  },
  {
    path: '/pre-matricula',
    element: <Layout><PreMatricula /></Layout>,
  },
  {
    path: '/conheca-o-ibuc',
    element: <Layout><AboutIBUC /></Layout>,
  },
  {
    path: '/materiais',
    element: <Layout><Materials /></Layout>,
  },
  {
    path: '/modulo-01',
    element: <Layout><Module01 /></Layout>,
  },
  {
    path: '/modulo-02',
    element: <Layout><Module02 /></Layout>,
  },
  {
    path: '/modulo-03',
    element: <Layout><Module03 /></Layout>,
  },
  {
    path: '/modulo-04',
    element: <Layout><Module04 /></Layout>,
  },
  {
    path: '/modulo-05',
    element: <Layout><Module05 /></Layout>,
  },
  {
    path: '/modulo-06',
    element: <Layout><Module06 /></Layout>,
  },
  {
    path: '/modulo-07',
    element: <Layout><Module07 /></Layout>,
  },
  {
    path: '/modulo-08',
    element: <Layout><Module08 /></Layout>,
  },
  {
    path: '/modulo-09',
    element: <Layout><Module09 /></Layout>,
  },
  {
    path: '/modulo-10',
    element: <Layout><Module10 /></Layout>,
  },
  {
    path: '/modulos',
    element: <Layout><ModulesPageClone /></Layout>,
  },
  {
    path: '/modulos-clone',
    element: <Layout><ModulesPageClone /></Layout>,
  },
  {
    path: '/acesso-aluno',
    element: <Layout><StudentAccess /></Layout>,
  },
  {
    path: '/painel-aluno',
    element: (
      <Layout>
        <ProtectedRoute>
          <StudentAccess />
        </ProtectedRoute>
      </Layout>
    ),
  },
  {
    path: '/admin',
    element: <Layout><AdminAccess /></Layout>,
  },
  {
    path: '/admin/dashboard',
    element: (
      <Layout>
        <ProtectedRoute adminOnly>
          <AdminDashboard />
        </ProtectedRoute>
      </Layout>
    ),
  },
  {
    path: '/admin/polos',
    element: (
      <Layout>
        <ProtectedRoute adminOnly>
          <PoloManagement />
        </ProtectedRoute>
      </Layout>
    ),
  },
  {
    path: '/admin/users',
    element: (
      <Layout>
        <ProtectedRoute adminOnly>
          <UserManagement />
        </ProtectedRoute>
      </Layout>
    ),
  },
  {
    path: '/admin/staff',
    element: (
      <Layout>
        <ProtectedRoute adminOnly>
          <StaffManagement />
        </ProtectedRoute>
      </Layout>
    ),
  },
  {
    path: '/admin/directorate',
    element: (
      <Layout>
        <ProtectedRoute adminOnly>
          <DirectorateManagement />
        </ProtectedRoute>
      </Layout>
    ),
  },
  {
    path: '/admin/enhanced-polos',
    element: (
      <Layout>
        <ProtectedRoute adminOnly>
          <EnhancedPoloManagement />
        </ProtectedRoute>
      </Layout>
    ),
  },
  {
    path: '/admin/settings',
    element: (
      <Layout>
        <ProtectedRoute adminOnly>
          <SystemSettings />
        </ProtectedRoute>
      </Layout>
    ),
  },
  {
    path: '/admin/students',
    element: (
      <Layout>
        <ProtectedRoute adminOnly>
          <StudentManagement />
        </ProtectedRoute>
      </Layout>
    ),
  },
  {
    path: '/admin/enrollments',
    element: (
      <Layout>
        <ProtectedRoute adminOnly>
          <EnrollmentManagement />
        </ProtectedRoute>
      </Layout>
    ),
  },
  {
    path: '/admin/reports',
    element: (
      <Layout>
        <ProtectedRoute adminOnly>
          <EducationalReports />
        </ProtectedRoute>
      </Layout>
    ),
  },
]);
