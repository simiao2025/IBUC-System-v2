import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ClassManagementPage from './ClassManagementPage';

// Mock dependencies
vi.mock('../ClassManagement', () => ({
  ClassManagement: () => <div data-testid="class-management-feature">Class Management Feature</div>
}));

describe('ClassManagementPage', () => {
  it('renders the ClassManagement feature', () => {
    render(<ClassManagementPage />);
    expect(screen.getByTestId('class-management-feature')).toBeInTheDocument();
  });

  it('renders with correct layout wrapper', () => {
    const { container } = render(<ClassManagementPage />);
    expect(container.firstChild).toHaveClass('min-h-screen bg-gray-50');
  });
});
