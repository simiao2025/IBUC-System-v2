import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MatriculaService, MatriculaAPI } from './matricula.service';
import type { Matricula } from '../../types/database';

// Mock do ApiClient
vi.mock('../../lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    upload: vi.fn()
  }
}));

import { api } from '../../lib/api';

describe('MatriculaService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listarMatriculas', () => {
    it('deve listar matriculas com sucesso', async () => {
      const mockMatriculas: Partial<Matricula>[] = [
        { id: '1', status: 'pendente' },
        { id: '2', status: 'ativa' }
      ];
      
      vi.mocked(api.get).mockResolvedValue(mockMatriculas);

      const result = await MatriculaService.listarMatriculas();

      expect(api.get).toHaveBeenCalledWith('/matriculas');
      expect(result).toEqual(mockMatriculas);
    });

    it('deve aplicar filtros de polo e status', async () => {
      vi.mocked(api.get).mockResolvedValue([]);

      await MatriculaService.listarMatriculas('polo-123', 'ativa' as any);

      expect(api.get).toHaveBeenCalledWith('/matriculas?polo_id=polo-123&status=ativa');
    });
  });

  describe('buscarMatriculaPorProtocolo', () => {
    it('deve retornar uma matricula ao buscar por protocolo', async () => {
      const mockMatricula = { id: '1', protocolo: 'PROT-123' };
      vi.mocked(api.get).mockResolvedValue(mockMatricula);

      const result = await MatriculaService.buscarMatriculaPorProtocolo('PROT-123');

      expect(api.get).toHaveBeenCalledWith('/matriculas/protocolo/PROT-123');
      expect(result).toEqual(mockMatricula);
    });

    it('deve retornar null se a matricula nao for encontrada', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('Matrícula não encontrada'));

      const result = await MatriculaService.buscarMatriculaPorProtocolo('INVALID');

      expect(result).toBeNull();
    });
  });

  describe('atualizarStatusMatricula', () => {
    it('deve chamar o endpoint de aprovar ao definir status como ativa', async () => {
      const mockMatricula = { id: '1', status: 'ativa' };
      vi.mocked(api.put).mockResolvedValue(mockMatricula);

      const result = await MatriculaService.atualizarStatusMatricula('1', 'ativa' as any, 'admin-id');

      expect(api.put).toHaveBeenCalledWith('/matriculas/1/aprovar', { approved_by: 'admin-id' });
      expect(result).toEqual(mockMatricula);
    });

    it('deve chamar o endpoint de recusar ao definir status como recusada', async () => {
      const mockMatricula = { id: '1', status: 'recusada' };
      vi.mocked(api.put).mockResolvedValue(mockMatricula);

      const result = await MatriculaService.atualizarStatusMatricula('1', 'recusada' as any, 'admin-id', 'documentos invalidos');

      expect(api.put).toHaveBeenCalledWith('/matriculas/1/recusar', { motivo: 'documentos invalidos', user_id: 'admin-id' });
      expect(result).toEqual(mockMatricula);
    });
  });
});
