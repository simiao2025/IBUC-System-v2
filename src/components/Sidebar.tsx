import React from 'react';
import { NavLink } from 'react-router-dom';
import { X, LayoutDashboard } from 'lucide-react';
import { ADMIN_NAV_ITEMS } from '@/shared/config/navigation';
import { useAccessControl } from '@/features/auth/ui/AccessControl';
import { Icon3D } from './ui/Icon3D';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { canAccessModule, canManagePolos, canManageStaff, canViewReports } = useAccessControl();

  const filteredItems = ADMIN_NAV_ITEMS.filter(item => {
    switch (item.module) {
      case 'settings':
        if (item.href === '/admin/modulos') {
          return canAccessModule('settings') || canAccessModule('enrollments');
        }
        return canAccessModule('settings') || canAccessModule('manage_users') || canAccessModule('settings_events') || canAccessModule('dracmas_settings') || canAccessModule('security') || canAccessModule('backup');
      case 'directorate':
        return canAccessModule('directorate');
      case 'polos':
        return canManagePolos();
      case 'students':
        return canAccessModule('students');
      case 'staff':
        return canManageStaff();
      case 'enrollments':
        return canAccessModule('enrollments');
      case 'attendance':
        return canAccessModule('attendance');
      case 'financeiro':
        return canAccessModule('financeiro') || canAccessModule('finance_control') || canAccessModule('finance_materials') || canAccessModule('finance_config');
      case 'materials':
        return canAccessModule('materials') || canAccessModule('materials_catalog') || canAccessModule('materials_orders');
      case 'reports':
        return canViewReports();
      case 'pre-enrollments':
        return canAccessModule('pre-enrollments');
      default:
        return false;
    }
  });

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-white border-r border-gray-200 
          flex flex-col h-full overflow-y-auto
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header da Sidebar com botão fechar (apenas mobile) */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between lg:block">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Módulos do Sistema
          </h2>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md text-gray-500 hover:bg-gray-200"
            aria-label="Fechar menu"
          >
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <NavLink
            to="/admin/dashboard"
            onClick={() => onClose()}
            className={({ isActive }) =>
              `flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-150 ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <LayoutDashboard className="mr-3 h-5 w-5" />
            Dashboard
          </NavLink>
          
          <div className="my-4 border-t border-gray-100 pt-4">
            <p className="px-4 mb-2 text-[10px] font-bold text-gray-400 uppercase">Ações Rápidas</p>
            {filteredItems.map((item) => {
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  onClick={() => onClose()}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-150 ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`
                  }
                >
                  <div className="mr-3">
                    <Icon3D 
                      name={item.iconName} 
                      fallbackIcon={item.fallbackIcon}
                      size="sm"
                      className="w-5 h-5 opacity-80"
                    />
                  </div>
                  {item.title}
                </NavLink>
              );
            })}
          </div>
        </nav>
        
        <div className="p-4 border-t border-gray-100 text-[10px] text-gray-400 text-center">
          IBUC v2.0 © 2025
        </div>
      </div>
    </>
  );
};

export default Sidebar;
