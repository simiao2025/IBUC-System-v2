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
  // Apenas esconde o cabeçalho na página de login
  const hideHeader = false; // Forçando o cabeçalho a ficar visível em todas as páginas

  // Estilização da barra de rolagem apenas para o ambiente administrativo
  React.useEffect(() => {
    const styleElement = document.createElement('style');
    
    if (isAdminRoute) {
      styleElement.textContent = `
        /* Estilo da barra de rolagem para navegadores WebKit */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
        
        /* Estilo da barra de rolagem para Firefox */
        * {
          scrollbar-width: thin;
          scrollbar-color: #888 #f1f1f1;
        }
      `;
      
      document.head.appendChild(styleElement);
    }
    
    return () => {
      if (document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
    };
  }, [isAdminRoute]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {!hideHeader && <Header />}
      <main className={`flex-1 ${isAdminRoute ? 'overflow-auto' : ''}`}>
        <div className={isAdminRoute ? 'p-4' : ''}>
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;