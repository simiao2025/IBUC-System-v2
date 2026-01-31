import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header com botão hamburger */}
      <div className="sticky top-0 z-50 bg-white shadow-md">
        <div className="flex items-center h-16 px-4">
          {/* Botão Hamburger - visível apenas em mobile */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 mr-3"
            aria-label="Toggle menu"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo e título */}
          <div className="flex items-center space-x-3">
            <img
              src="https://ibuc.com.br/wp-content/uploads/2023/05/logo-site.png"
              alt="IBUC Logo"
              className="h-10 w-auto"
            />
            <div>
              <h1 className="text-lg font-bold text-red-600">Painel Administrativo</h1>
              <p className="text-xs text-gray-500">IBUC - Palmas, TO</p>
            </div>
          </div>

          {/* Header original (usuário, logout, etc) */}
          <div className="flex-1">
            <Header />
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 py-6">
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default AdminLayout;
