import React from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { useAccessControl } from './AccessControl';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { canAccessModule } = useAccessControl();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="border-b bg-white">
        <nav className="max-w-7xl mx-auto px-4 py-3 flex gap-4 text-sm overflow-x-auto">
          <Link className="text-gray-700 hover:text-gray-900" to="/admin/dashboard">
            Dashboard
          </Link>
          {canAccessModule('polos') && (
            <Link className="text-gray-700 hover:text-gray-900" to="/admin/polos">
              Polos
            </Link>
          )}
          <Link className="text-gray-700 hover:text-gray-900" to="/admin/turmas">
            Turmas
          </Link>
          {canAccessModule('students') && (
            <Link className="text-gray-700 hover:text-gray-900" to="/admin/alunos">
              Alunos
            </Link>
          )}
          {canAccessModule('enrollments') && (
            <Link className="text-gray-700 hover:text-gray-900" to="/admin/matriculas">
              Matrículas
            </Link>
          )}
          {canAccessModule('attendance') && (
            <Link className="text-gray-700 hover:text-gray-900" to="/admin/frequencia">
              Frequência
            </Link>
          )}
          {canAccessModule('dracmas') && (
            <Link className="text-gray-700 hover:text-gray-900" to="/admin/dracmas/lancamento">
              Drácmas
            </Link>
          )}
          <Link className="text-gray-700 hover:text-gray-900" to="/admin/financeiro">
            Financeiro
          </Link>
          {canAccessModule('reports') && (
            <Link className="text-gray-700 hover:text-gray-900" to="/admin/relatorios">
              Relatórios
            </Link>
          )}
          {canAccessModule('staff') && (
            <Link className="text-gray-700 hover:text-gray-900" to="/admin/usuarios">
              Usuários
            </Link>
          )}
          {canAccessModule('settings') && (
            <Link className="text-gray-700 hover:text-gray-900" to="/admin/configuracoes">
              Configurações
            </Link>
          )}
        </nav>
      </div>
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 py-6">{children}</div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminLayout;
