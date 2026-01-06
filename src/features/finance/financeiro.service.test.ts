import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FinanceiroService } from './financeiro.service';

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

describe('FinanceiroService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('gerarCobrancasLote', () => {
    it('deve chamar o endpoint correto com os dados fornecidos', async () => {
      const mockData = {
        turma_id: 'turma-1',
        titulo: 'Mensalidade',
        valor_cents: 10000,
        vencimento: '2025-01-10'
      };
      
      vi.mocked(api.post).mockResolvedValue({ success: true });

      await FinanceiroService.gerarCobrancasLote(mockData);

      expect(api.post).toHaveBeenCalledWith('/mensalidades/lote', mockData);
    });
  });

  describe('listarCobrancas', () => {
    it('deve listar cobrancas sem filtros', async () => {
      vi.mocked(api.get).mockResolvedValue([]);

      await FinanceiroService.listarCobrancas();

      expect(api.get).toHaveBeenCalledWith('/mensalidades');
    });

    it('deve listar cobrancas com filtros', async () => {
      vi.mocked(api.get).mockResolvedValue([]);
      const filtros = {
        turma_id: 'turma-1',
        status: 'pendente'
      };

      await FinanceiroService.listarCobrancas(filtros);

      expect(api.get).toHaveBeenCalledWith('/mensalidades?turma_id=turma-1&status=pendente');
    });
  });

  describe('confirmarPagamento', () => {
    it('deve chamar o endpoint de confirmacao', async () => {
      vi.mocked(api.post).mockResolvedValue({ success: true });

      await FinanceiroService.confirmarPagamento('cobranca-id', 'http://comprovante.url');

      expect(api.post).toHaveBeenCalledWith('/mensalidades/cobranca-id/confirmar', { 
        comprovante_url: 'http://comprovante.url' 
      });
    });
  });
});
