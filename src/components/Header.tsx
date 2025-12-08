import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, Info, BookOpen, ClipboardList, GraduationCap, Shield } from 'lucide-react';
import ConfirmLink from './ui/ConfirmLink';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Início', needsConfirm: true, icon: Home },
    { path: '/conheca-o-ibuc', label: 'Conheça o IBUC', needsConfirm: false, icon: Info },
    { path: '/modulos', label: 'Módulos', needsConfirm: false, icon: BookOpen },
    // Pré-matrícula integrada ao Supabase e termo LGPD
    { path: '/pre-matricula', label: 'Matrícula', needsConfirm: true, icon: ClipboardList },
    { path: '/acesso-aluno', label: 'Área do Aluno', needsConfirm: false, icon: GraduationCap },
    { path: '/admin', label: 'Área Administrativa', needsConfirm: false, icon: Shield },
  ];

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <img
              src="https://ibuc.com.br/wp-content/uploads/2023/05/logo-site.png"
              alt="IBUC Logo"
              className="h-10 w-auto"
            />
            <div>
              <h1 className="text-xl font-bold text-red-600">IBUC</h1>
              <p className="text-xs text-gray-600">Palmas - TO</p>
            </div>
          </div>

          {/* Desktop Navigation - oculto em rotas administrativas */}
          {!isAdminRoute && (
            <nav className="hidden md:flex space-x-6">
              {navItems.map((item) => {
              const Icon = item.icon;
              const className = `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive(item.path)
                  ? 'bg-red-100 text-red-700'
                  : 'text-gray-700 hover:text-red-600 hover:bg-red-50'
              }`;

                return item.needsConfirm ? (
                  <ConfirmLink
                    key={item.path}
                    to={item.path}
                    className={className}
                    message={`Você tem certeza que deseja navegar para ${item.label}?`}
                    title="Confirmar navegação"
                  >
                    <span className="inline-flex items-center gap-2">
                      {Icon && <Icon className="h-4 w-4" />}
                      <span>{item.label}</span>
                    </span>
                  </ConfirmLink>
                ) : (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={className}
                  >
                    <span className="inline-flex items-center gap-2">
                      {Icon && <Icon className="h-4 w-4" />}
                      <span>{item.label}</span>
                    </span>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Mobile menu button - oculto em rotas administrativas */}
          {!isAdminRoute && (
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-gray-700 hover:text-red-600 hover:bg-red-50"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          )}
        </div>

        {/* Mobile Navigation - oculto em rotas administrativas */}
        {!isAdminRoute && isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <nav className="py-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const className = `block px-4 py-2 text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-red-100 text-red-700'
                    : 'text-gray-700 hover:text-red-600 hover:bg-red-50'
                }`;

                return item.needsConfirm ? (
                  <ConfirmLink
                    key={item.path}
                    to={item.path}
                    className={className}
                    onClick={() => setIsMobileMenuOpen(false)}
                    message={`Você tem certeza que deseja navegar para ${item.label}?`}
                    title="Confirmar navegação"
                  >
                    <span className="inline-flex items-center gap-2">
                      {Icon && <Icon className="h-4 w-4" />}
                      <span>{item.label}</span>
                    </span>
                  </ConfirmLink>
                ) : (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={className}
                  >
                    <span className="inline-flex items-center gap-2">
                      {Icon && <Icon className="h-4 w-4" />}
                      <span>{item.label}</span>
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
