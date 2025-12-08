import React, { useCallback, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from './Button';

type FileUploadProps = {
  folder: string;
  onUploadComplete: (fileUrl: string, originalName: string) => void;
  accept?: string;
  maxSizeMB?: number;
  label?: string;
};

export const FileUpload: React.FC<FileUploadProps> = ({
  folder,
  onUploadComplete,
  accept = 'image/*,.pdf,.doc,.docx',
  maxSizeMB = 5,
  label = 'Arraste e solte seus arquivos aqui ou clique para selecionar',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    const maxSize = maxSizeMB * 1024 * 1024; // Convert MB to bytes
    
    if (file.size > maxSize) {
      return { 
        valid: false, 
        error: `Arquivo muito grande. Tamanho máximo permitido: ${maxSizeMB}MB` 
      };
    }
    
    return { valid: true };
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setError(null);
    setProgress(0);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}-${Date.now()}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('matriculas')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('matriculas')
        .getPublicUrl(filePath);

      onUploadComplete(publicUrl, file.name);
      setProgress(100);
      return publicUrl;
    } catch (err: any) {
      console.error('Erro ao fazer upload do arquivo:', err);
      setError(err.message || 'Erro ao fazer upload do arquivo');
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length === 0) return;

      const file = files[0];
      const validation = validateFile(file);
      
      if (!validation.valid) {
        setError(validation.error);
        return;
      }

      try {
        await uploadFile(file);
      } catch (err) {
        // Error is already handled in uploadFile
      }
    },
    [folder, onUploadComplete, maxSizeMB]
  );

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const validation = validateFile(file);
    
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    try {
      await uploadFile(file);
    } catch (err) {
      // Error is already handled in uploadFile
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
