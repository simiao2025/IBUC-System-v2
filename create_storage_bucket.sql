-- Script para criar o bucket de armazenamento de documentos de matrícula no Supabase Storage
-- Execute este script no Supabase SQL Editor

-- 1. Criar o bucket 'matriculas' se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'matriculas',
  'matriculas',
  false, -- Bucket privado (requer autenticação)
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Criar política para permitir upload de documentos (authenticated users)
CREATE POLICY "Permitir upload de documentos de pré-matrícula"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'matriculas' AND
  (storage.foldername(name))[1] = 'pre-matriculas'
);

-- 3. Criar política para permitir leitura de documentos (authenticated users)
CREATE POLICY "Permitir leitura de documentos de pré-matrícula"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'matriculas' AND
  (storage.foldername(name))[1] = 'pre-matriculas'
);

-- 4. Criar política para permitir atualização de documentos (authenticated users)
CREATE POLICY "Permitir atualização de documentos de pré-matrícula"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'matriculas' AND
  (storage.foldername(name))[1] = 'pre-matriculas'
)
WITH CHECK (
  bucket_id = 'matriculas' AND
  (storage.foldername(name))[1] = 'pre-matriculas'
);

-- 5. Criar política para permitir exclusão de documentos (authenticated users)
CREATE POLICY "Permitir exclusão de documentos de pré-matrícula"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'matriculas' AND
  (storage.foldername(name))[1] = 'pre-matriculas'
);

-- 6. Verificar se o bucket foi criado
SELECT * FROM storage.buckets WHERE id = 'matriculas';
