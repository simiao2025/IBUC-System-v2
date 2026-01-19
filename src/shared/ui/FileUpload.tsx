import React, { useCallback, useState } from 'react';
import { uploadApi } from '@/shared/api';
const { uploadFile } = uploadApi;

// Função para gerar um ID de sessão único
const generateSessionId = (): string => {
  // Tenta usar o sessionStorage se disponível
  if (typeof window !== 'undefined' && window.sessionStorage) {
    let sessionId = sessionStorage.getItem('fileUploadSessionId');
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      sessionStorage.setItem('fileUploadSessionId', sessionId);
    }
    return sessionId;
  }
  // Fallback para geração sem sessionStorage
  return `temp-${Math.random().toString(36).substring(2, 15)}`;
};

type FileUploadProps = {
  folder: string;
  onUploadComplete: (fileUrl: string, originalName: string) => void;
  onFileSelected?: (file: File) => void;
  autoUpload?: boolean;
  accept?: string;
  maxSizeMB?: number;
  label?: string;
  sessionId?: string; // ID de sessão opcional
  metadata?: Record<string, unknown>;
};

export const FileUpload: React.FC<FileUploadProps> = ({
  folder,
  onUploadComplete,
  onFileSelected,
  autoUpload = true,
  accept = 'image/*,.pdf,.doc,.docx',
  maxSizeMB = 5,
  label = 'Arraste e solte seus arquivos aqui ou clique para selecionar',
  sessionId,
  metadata = {},
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const validateFile = useCallback((file: File): { valid: boolean; error?: string } => {
    const maxSize = maxSizeMB * 1024 * 1024; // Convert MB to bytes
    
    if (file.size > maxSize) {
      return { 
        valid: false, 
        error: `Arquivo muito grande. Tamanho máximo permitido: ${maxSizeMB}MB` 
      };
    }
    
    return { valid: true };
  }, [maxSizeMB]);

  // Função removida pois sua lógica foi incorporada nos handlers específicos

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      setIsUploading(true);
      setError(null);

      const files = e.dataTransfer.files;
      if (files.length === 0) {
        setIsUploading(false);
        return;
      }

      const file = files[0];
      const validation = validateFile(file);
      
      if (!validation.valid) {
        setError(validation.error || 'Erro de validação do arquivo');
        setIsUploading(false);
        return;
      }

      if (!autoUpload) {
        onFileSelected?.(file);
        setProgress(0);
        setSuccess('Arquivo selecionado com sucesso!');
        setError(null);
        setIsUploading(false);
        return;
      }

      try {
        setProgress(0);
        // Usa o sessionId fornecido ou gera um novo
        const uploadSessionId = sessionId || generateSessionId();
        const uploadFolder = `${folder}/${uploadSessionId}`;
        
        const { publicUrl } = await uploadFile({
          folder: uploadFolder,
          file,
          metadata: {
            ...metadata,
            uploadedBy: uploadSessionId,
          },
        });

        onUploadComplete(publicUrl, file.name);
        setProgress(100);
        setSuccess('Arquivo enviado com sucesso!');
        setError(null);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        setError(errorMessage);
        setSuccess(null);
      } finally {
        setIsUploading(false);
      }
    },
    [folder, sessionId, metadata, maxSizeMB, onUploadComplete, onFileSelected, autoUpload]
  );

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const validation = validateFile(file);
    
    if (!validation.valid) {
      setError(validation.error || null);
      return;
    }

    if (!autoUpload) {
      onFileSelected?.(file);
      setProgress(0);
      setSuccess('Arquivo selecionado com sucesso!');
      setError(null);
      return;
    }

    try {
      setProgress(0);
      // Usa o sessionId fornecido ou gera um novo
      const uploadSessionId = sessionId || generateSessionId();
      const uploadFolder = `${folder}/${uploadSessionId}`;
      
      const { publicUrl } = await uploadFile({
        folder: uploadFolder,
        file,
        metadata: {
          ...metadata,
          uploadedBy: uploadSessionId,
        },
      });

      onUploadComplete(publicUrl, file.name);
      setProgress(100);
      setSuccess('Arquivo enviado com sucesso!');
      setError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      setSuccess(null);
    }
  };

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept={accept}
          onChange={handleFileInput}
          disabled={isUploading}
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center justify-center space-y-2"
        >
          <svg
            className="w-12 h-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            ></path>
          </svg>
          <div className="text-sm text-gray-600">
            {isUploading ? (
              <span>Enviando arquivo... {progress}%</span>
            ) : (
              <span>{label}</span>
            )}
          </div>
          <div className="text-xs text-gray-500">
            Formatos suportados: JPG, PNG, PDF, DOC, DOCX (Max: {maxSizeMB}MB)
          </div>
          {error && (
            <div className="mt-2 text-sm text-red-600">{error}</div>
          )}
          {success && (
            <div className="mt-2 text-sm text-green-600">{success}</div>
          )}
        </label>
      </div>
      {isUploading && (
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
};
