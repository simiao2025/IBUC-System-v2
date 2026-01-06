-- ============================================
-- Script de Verificação e Configuração do Bucket de Documentos
-- Execute este script no Supabase SQL Editor
-- ============================================

-- 1. VERIFICAR SE O BUCKET 'documentos' EXISTE
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types,
    created_at
FROM storage.buckets 
WHERE id = 'documentos';

-- Se o resultado acima estiver vazio, o bucket não existe e precisa ser criado
-- Se existir, pule para a seção 3 (Políticas)

-- ============================================
-- 2. CRIAR O BUCKET 'documentos' (se não existir)
-- ============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documentos',
  'documentos',
  false, -- Bucket privado (requer autenticação)
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];

-- ============================================
-- 3. VERIFICAR POLÍTICAS EXISTENTES
-- ============================================

SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE '%documentos%' OR policyname LIKE '%pre-matricula%';

-- ============================================
-- 4. REMOVER POLÍTICAS ANTIGAS (se necessário)
-- ============================================

-- Descomente as linhas abaixo se precisar remover políticas antigas
-- DROP POLICY IF EXISTS "Permitir upload de documentos de pré-matrícula" ON storage.objects;
-- DROP POLICY IF EXISTS "Permitir leitura de documentos de pré-matrícula" ON storage.objects;
-- DROP POLICY IF EXISTS "Permitir atualização de documentos de pré-matrícula" ON storage.objects;
-- DROP POLICY IF EXISTS "Permitir exclusão de documentos de pré-matrícula" ON storage.objects;

-- ============================================
-- 5. CRIAR POLÍTICAS DE ACESSO
-- ============================================

-- Política para permitir upload (INSERT) - Usuários autenticados e anônimos
CREATE POLICY IF NOT EXISTS "Permitir upload de documentos"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'documentos'
);

-- Política para permitir leitura (SELECT) - Usuários autenticados
CREATE POLICY IF NOT EXISTS "Permitir leitura de documentos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'documentos'
);

-- Política para permitir atualização (UPDATE) - Usuários autenticados
CREATE POLICY IF NOT EXISTS "Permitir atualização de documentos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documentos'
)
WITH CHECK (
  bucket_id = 'documentos'
);

-- Política para permitir exclusão (DELETE) - Usuários autenticados
CREATE POLICY IF NOT EXISTS "Permitir exclusão de documentos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'documentos'
);

-- ============================================
-- 6. VERIFICAÇÃO FINAL
-- ============================================

-- Verificar se o bucket foi criado/atualizado
SELECT 
    'Bucket criado/atualizado:' as status,
    id,
    name,
    public,
    file_size_limit / 1048576 as "limite_mb",
    allowed_mime_types
FROM storage.buckets 
WHERE id = 'documentos';

-- Verificar políticas criadas
SELECT 
    'Políticas criadas:' as status,
    policyname,
    cmd as comando
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND bucket_id = 'documentos'
ORDER BY cmd;

-- ============================================
-- 7. TESTE DE PERMISSÕES (OPCIONAL)
-- ============================================

-- Para testar se as políticas estão funcionando, você pode tentar:
-- 1. Fazer upload de um arquivo via interface do Supabase Storage
-- 2. Verificar se o arquivo aparece na pasta correta
-- 3. Tentar acessar a URL pública do arquivo

-- Listar arquivos no bucket (se houver)
SELECT 
    name,
    metadata,
    created_at
FROM storage.objects
WHERE bucket_id = 'documentos'
ORDER BY created_at DESC
LIMIT 10;
