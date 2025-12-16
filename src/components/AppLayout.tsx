import React from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="border-b bg-white">
        <nav className="max-w-6xl mx-auto px-4 py-3 flex gap-4 text-sm">
          <Link className="text-gray-700 hover:text-gray-900" to="/app/dashboard">
            Dashboard
          </Link>
          <Link className="text-gray-700 hover:text-gray-900" to="/app/modulos">
            Módulos
          </Link>
          <Link className="text-gray-700 hover:text-gray-900" to="/app/boletim">
            Boletim
          </Link>
          <Link className="text-gray-700 hover:text-gray-900" to="/app/frequencia">
            Frequência
          </Link>
          <Link className="text-gray-700 hover:text-gray-900" to="/app/financeiro">
            Financeiro
          </Link>
          <Link className="text-gray-700 hover:text-gray-900" to="/app/documentos">
            Documentos
          </Link>
        </nav>
      </div>
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-6">{children}</div>
      </main>
      <Footer />
    </div>
  );
};

export default AppLayout;
