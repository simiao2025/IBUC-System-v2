import React from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { useAccessControl } from '@/features/auth/ui/AccessControl';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { canAccessModule } = useAccessControl();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 py-6">{children}</div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminLayout;
