import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserServiceV2, BackendUsuario } from './userService.v2';
import { api } from '../lib/api';

// Mock the API module
vi.mock('../lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('UserServiceV2', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockBackendUser: BackendUsuario = {
    id: '123',
    nome_completo: 'Test User',
    email: 'test@ibuc.com',
    cpf: '12345678901',
    telefone: '6399999999',
    role: 'professor',
    polo_id: 'polo-1',
    ativo: true,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  };

  describe('mapToAdminUser', () => {
    it('should correctly map backend user to frontend user', () => {
      const result = UserServiceV2.mapToAdminUser(mockBackendUser);
      expect(result.id).toBe('123');
      expect(result.name).toBe('Test User');
      expect(result.accessLevel).toBe('polo_especifico');
      expect(result.poloId).toBe('polo-1');
    });

    it('should handle missing name by using email prefix', () => {
      const userWithoutName = { ...mockBackendUser, nome_completo: '' };
      const result = UserServiceV2.mapToAdminUser(userWithoutName);
      expect(result.name).toBe('test');
    });

    it('should set accessLevel to geral if polo_id is missing', () => {
      const userWithoutPolo = { ...mockBackendUser, polo_id: null };
      const result = UserServiceV2.mapToAdminUser(userWithoutPolo);
      expect(result.accessLevel).toBe('geral');
    });
  });

  describe('listUsers', () => {
    it('should call api.get and map results', async () => {
      (api.get as any).mockResolvedValue([mockBackendUser]);
      const result = await UserServiceV2.listUsers({ role: 'professor' });
      
      expect(api.get).toHaveBeenCalledWith('/usuarios?role=professor');
      expect(result[0].id).toBe('123');
      expect(result[0].name).toBe('Test User');
    });
  });

  describe('getUserByEmail', () => {
    it('should return null on 404 error', async () => {
      const error: any = new Error('404 user not found');
      (api.get as any).mockRejectedValue(error);

      const result = await UserServiceV2.getUserByEmail('unknown@ibuc.com');
      expect(result).toBeNull();
    });
  });

  describe('createUser', () => {
    it('should send correct payload to backend', async () => {
      (api.post as any).mockResolvedValue(mockBackendUser);
      
      const newUser = {
        name: 'New User',
        email: 'new@ibuc.com',
        role: 'professor' as const,
        accessLevel: 'polo_especifico' as const,
        poloId: 'polo-1'
      };

      await UserServiceV2.createUser(newUser);

      expect(api.post).toHaveBeenCalledWith('/usuarios', expect.objectContaining({
        nome_completo: 'New User',
        polo_id: 'polo-1'
      }));
    });
  });
});
