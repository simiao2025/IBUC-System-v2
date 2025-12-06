import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isLoginRoute = location.pathname.includes('acesso') || location.pathname === '/admin';

  return (
    <div className="min-h-screen flex flex-col">
      {!isLoginRoute && <Header />}
      <main className={`flex-1 ${isAdminRoute ? 'bg-gray-50' : ''}`}>
        {children}
      </main>
      {!isLoginRoute && <Footer />}
    </div>
  );
};

export default Layout;