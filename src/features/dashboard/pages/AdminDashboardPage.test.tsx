
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import AdminDashboard from './AdminDashboardPage';

// Mock dependências do contexto e hooks
vi.mock('@/context/AppContext', () => ({
  useApp: () => ({
    students: [],
    enrollments: [],
    polos: [],
    currentUser: { adminUser: { role: 'super_admin' } },
    preMatriculas: []
  })
}));

vi.mock('@/features/auth/ui/AccessControl', () => ({
  useAccessControl: () => ({
    canManageStaff: () => true,
    canManagePolos: () => true,
    canViewReports: () => true,
    canAccessModule: () => true,
    getFilteredPolos: () => []
  })
}));

vi.mock('@/hooks/useNavigationConfirm', () => ({
  useNavigationConfirm: () => ({
    isDialogOpen: false,
    confirmNavigation: vi.fn(),
    handleConfirm: vi.fn(),
    handleCancel: vi.fn(),
  })
}));

describe('AdminDashboardPage', () => {
  it('should render without crashing', () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );
    expect(screen.getByText(/Painel Administrativo/i)).toBeInTheDocument();
  });
});
