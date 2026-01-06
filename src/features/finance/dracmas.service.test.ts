import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DracmasService, DracmasAPI } from './dracmas.service';

// Mock do ApiClient
vi.mock('../../lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}));

import { api } from '../../lib/api';

describe('DracmasService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('lancarLote', () => {
    it('deve chamar o endpoint de lancamento em lote', async () => {
      const mockData = {
        turma_id: 'turma-1',
        data: '2025-01-01',
        tipo: 'BONUS',
        transacoes: [{ aluno_id: '1', quantidade: 10 }],
        registrado_por: 'admin'
      };
      
      vi.mocked(api.post).mockResolvedValue({ success: true });

      await DracmasService.lancarLote(mockData);

      expect(api.post).toHaveBeenCalledWith('/dracmas/lancar-lote', mockData);
    });
  });

  describe('getSaldo', () => {
    it('deve buscar o saldo do aluno', async () => {
      const mockSaldo = { saldo: 100 };
      vi.mocked(api.get).mockResolvedValue(mockSaldo);

      const result = await DracmasService.getSaldo('aluno-1');

      expect(api.get).toHaveBeenCalledWith('/dracmas/saldo?aluno_id=aluno-1');
      expect(result).toEqual(mockSaldo);
    });
  });

  describe('listarCriterios', () => {
    it('deve listar os criterios de dracmas', async () => {
      const mockCriterios = [{ codigo: 'C1', nome: 'Criterio 1' }];
      vi.mocked(api.get).mockResolvedValue(mockCriterios);

      const result = await DracmasService.listarCriterios();

      expect(api.get).toHaveBeenCalledWith('/dracmas/criterios');
      expect(result).toEqual(mockCriterios);
    });
  });
});
