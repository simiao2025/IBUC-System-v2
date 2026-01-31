import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import ConfirmLink from './ui/ConfirmLink';
import Button from './ui/Button';

interface HeaderProps {
  onSidebarToggle?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSidebarToggle }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isStudentAppRoute = location.pathname.startsWith('/app');

  if (isStudentAppRoute) {
    return null;
  }

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Início', needsConfirm: false },
    { path: '/sobre', label: 'Sobre o IBUC', needsConfirm: false },
    { path: '/modulos', label: 'Módulos', needsConfirm: false },
    { path: '/pre-matricula', label: 'Pré-Matrícula', needsConfirm: false },
    { path: '/login', label: 'Área do Aluno', needsConfirm: false, isSpecial: true },
    { path: '/admin', label: 'Área Administrativa', needsConfirm: false, isSpecial: true },
  ];

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            {/* Mobile menu button / Admin Sidebar Toggle */}
            <div className="md:hidden mr-2">
              {(onSidebarToggle || !isAdminRoute) && (
                <button
                  onClick={() => {
                    if (onSidebarToggle) {
                      onSidebarToggle();
                    } else {
                      setIsMobileMenuOpen(!isMobileMenuOpen);
                    }
                  }}
                  className="p-2 rounded-md text-gray-700 hover:text-red-600 hover:bg-red-50"
                  aria-label="Menu"
                >
                  {(isMobileMenuOpen && !onSidebarToggle) ? <X size={24} /> : <Menu size={24} />}
                </button>
              )}
            </div>

            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
              <Link to="/" className="flex items-center space-x-3">
                <img
                  src="https://ibuc.com.br/wp-content/uploads/2023/05/logo-site.png"
                  alt="IBUC Logo"
                  className="h-10 w-auto"
                />
                <h1 className="text-xl font-bold text-red-600 hidden sm:block">IBUC - Palmas - TO</h1>
              </Link>
            </div>
          </div>

          {/* Desktop Navigation */}
          {!isAdminRoute && (
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                if (item.isSpecial) return null;

                const active = isActive(item.path);
                const className = `px-3 py-2 text-sm font-medium transition-colors rounded-md ${
                  active 
                    ? 'text-red-700 bg-red-50' 
                    : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
                }`;

                return (
                  <Link key={item.path} to={item.path} className={className}>
                    {item.label}
                  </Link>
                );
              })}
              
              <div className="flex items-center ml-4 space-x-2">
                <Button asChild variant="primary" size="sm" className="bg-red-600 hover:bg-red-700">
                  <Link to="/login">Área do Aluno</Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="border-red-600 text-red-600 hover:bg-red-50">
                  <Link to="/admin">Admin</Link>
                </Button>
              </div>
            </nav>
          )}
        </div>

        {/* Mobile Navigation - oculto em rotas administrativas */}
        {!isAdminRoute && isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <nav className="py-2">
              {navItems.map((item) => {
                let className = `block px-4 py-2 text-sm font-medium transition-colors `;
                if (item.isSpecial) {
                  className += isActive(item.path)
                    ? 'bg-red-700 text-white hover:bg-red-800'
                    : 'bg-red-600 text-white hover:bg-red-700';
                } else {
                  className += isActive(item.path)
                    ? 'bg-red-100 text-red-700'
                    : 'text-gray-700 hover:text-red-600 hover:bg-red-50';
                }

                return item.needsConfirm ? (
                  <ConfirmLink
                    key={item.path}
                    to={item.path}
                    className={className}
                    onClick={() => setIsMobileMenuOpen(false)}
                    message={`Você tem certeza que deseja navegar para ${item.label}?`}
                    title="Confirmar navegação"
                  >
                    <span>{item.label}</span>
                  </ConfirmLink>
                ) : (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={className}
                  >
                    <span>{item.label}</span>
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
