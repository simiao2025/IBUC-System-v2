import { describe, it, expect, vi } from 'vitest';
import { EquipePoloService } from './equipePolo.service';
import { api } from '@/shared/api/api';

vi.mock('@/shared/api/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('EquipePoloService', () => {
  it('should list members by polo', async () => {
    const mockMembers = [{ id: '1', nome: 'Professor Teste' }];
    vi.mocked(api.get).mockResolvedValue(mockMembers);

    const result = await EquipePoloService.listByPolo('polo-123');

    expect(api.get).toHaveBeenCalledWith('/equipes-polos?polo_id=polo-123');
    expect(result).toEqual(mockMembers);
  });

  it('should create a new member', async () => {
    const newMember = { 
      polo_id: 'polo-123', 
      nome: 'Novo Professor', 
      email: 'prof@test.com', 
      cpf: '123', 
      cargo: 'professor' as const 
    };
    vi.mocked(api.post).mockResolvedValue({ id: '2', ...newMember });

    const result = await EquipePoloService.create(newMember);

    expect(api.post).toHaveBeenCalledWith('/equipes-polos', newMember);
    expect(result.id).toBe('2');
  });
});
