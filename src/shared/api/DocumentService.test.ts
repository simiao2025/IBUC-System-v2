import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DocumentAPI, DocumentService } from './DocumentService';
import { api } from './ApiClient';
import { supabase } from '../../lib/supabase';

// Mock dependencies
vi.mock('./ApiClient', () => ({
  api: {
    get: vi.fn(),
    upload: vi.fn(),
  },
}));

vi.mock('../../lib/supabase', () => ({
  supabase: {
    storage: {
      from: vi.fn(),
    },
    from: vi.fn(),
  },
}));

describe('DocumentService (FSD Shared Layer)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('DocumentAPI (REST)', () => {
    it('listByEnrollment should call correct endpoint', async () => {
      vi.mocked(api.get).mockResolvedValue([]);
      await DocumentAPI.listByEnrollment('enroll-123');
      expect(api.get).toHaveBeenCalledWith('/documentos/matriculas/enroll-123');
    });

    it('listByStudent should call correct endpoint', async () => {
      vi.mocked(api.get).mockResolvedValue({ aluno_id: '1', arquivos: [] });
      await DocumentAPI.listByStudent('student-123');
      expect(api.get).toHaveBeenCalledWith('/documentos/alunos/student-123');
    });

    it('uploadByStudent should handle query params for type', async () => {
      const formData = new FormData();
      await DocumentAPI.uploadByStudent('student-123', formData, 'rg');
      expect(api.upload).toHaveBeenCalledWith('/documentos/alunos/student-123?tipo=rg', formData);
    });

    it('uploadMultipleByStudent should append all files to FormData', async () => {
      const files = [new File([''], 'f1.txt'), new File([''], 'f2.txt')];
      await DocumentAPI.uploadMultipleByStudent('student-123', files);
      
      const lastCall = vi.mocked(api.upload).mock.calls[0];
      const formData = lastCall[1] as FormData;
      expect(formData.getAll('files')).toHaveLength(2);
      expect(lastCall[0]).toBe('/documentos/alunos/student-123');
    });
  });

  describe('DocumentService (Supabase)', () => {
    const mockStorage = {
      upload: vi.fn(),
      getPublicUrl: vi.fn(),
      remove: vi.fn(),
      createSignedUrl: vi.fn(),
    };

    const mockDbQuery = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
    };

    beforeEach(() => {
      vi.mocked(supabase.storage.from).mockReturnValue(mockStorage as any);
      vi.mocked(supabase.from).mockReturnValue(mockDbQuery as any);
    });

    it('uploadToStorage should generate path, upload to storage, and insert to DB', async () => {
      const file = new File(['test'], 'doc.pdf');
      mockStorage.upload.mockResolvedValue({ data: {}, error: null });
      mockStorage.getPublicUrl.mockReturnValue({ data: { publicUrl: 'http://test.com/doc.pdf' } });
      mockDbQuery.single.mockResolvedValue({ data: { id: 'doc-1' }, error: null });

      const result = await DocumentService.uploadToStorage(
        file,
        'my-folder',
        'aluno',
        'owner-1',
        'rg'
      );

      expect(supabase.storage.from).toHaveBeenCalledWith('matriculas');
      expect(mockStorage.upload).toHaveBeenCalledWith(
        expect.stringContaining('my-folder/'),
        file,
        expect.any(Object)
      );
      expect(mockDbQuery.insert).toHaveBeenCalledWith(expect.objectContaining({
        tipo_documento: 'rg',
        url: 'http://test.com/doc.pdf'
      }));
      expect(result.id).toBe('doc-1');
    });

    it('removeDocument should delete both from storage and DB', async () => {
      mockDbQuery.single.mockResolvedValue({ 
        data: { id: 'd1', url: 'http://test.com/file.jpg' }, 
        error: null 
      });
      mockStorage.remove.mockResolvedValue({ data: {}, error: null });
      mockDbQuery.eq.mockReturnThis();

      await DocumentService.removeDocument('d1');

      expect(mockStorage.remove).toHaveBeenCalledWith(['file.jpg']);
      expect(mockDbQuery.delete).toHaveBeenCalled();
    });

    it('updateValidation should update DB with validation data', async () => {
      mockDbQuery.single.mockResolvedValue({ data: { id: 'd1', validado: true }, error: null });
      
      await DocumentService.updateValidation('d1', true, 'admin-1');

      expect(mockDbQuery.update).toHaveBeenCalledWith(expect.objectContaining({
        validado: true,
        validado_por: 'admin-1'
      }));
    });
  });
});
