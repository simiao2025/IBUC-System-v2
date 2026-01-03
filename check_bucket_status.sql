-- ============================================
-- Script Simplificado - Verificação Rápida do Bucket
-- Execute este primeiro para diagnóstico rápido
-- ============================================

-- 1. Verificar se o bucket existe
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'documentos') 
        THEN '✓ Bucket "documentos" EXISTE'
        ELSE '✗ Bucket "documentos" NÃO EXISTE - precisa ser criado'
    END as status_bucket;

-- 2. Se existir, mostrar configuração atual
SELECT 
    id as bucket_id,
    name as nome,
    CASE WHEN public THEN 'Público' ELSE 'Privado' END as visibilidade,
    file_size_limit / 1048576 as limite_mb,
    allowed_mime_types as tipos_permitidos
FROM storage.buckets 
WHERE id = 'documentos';

-- 3. Verificar políticas de acesso
SELECT 
    COUNT(*) as total_politicas,
    STRING_AGG(DISTINCT cmd::text, ', ') as comandos_permitidos
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND (
    policyname LIKE '%documentos%' 
    OR qual::text LIKE '%documentos%'
  );

-- 4. Listar todas as políticas relacionadas ao bucket documentos
SELECT 
    policyname as nome_politica,
    cmd as comando,
    CASE 
        WHEN roles = '{public}' THEN 'Público'
        WHEN roles = '{authenticated}' THEN 'Autenticado'
        ELSE roles::text
    END as quem_pode_usar
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND (
    policyname LIKE '%documentos%' 
    OR qual::text LIKE '%documentos%'
  )
ORDER BY cmd;
