-- Script para verificar a existência e estrutura da tabela certificados
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a tabela existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'certificados'
) as tabela_existe;

-- 2. Se existe, mostrar o schema completo
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'certificados'
ORDER BY ordinal_position;

-- 3. Verificar constraints e índices
SELECT
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'certificados';

-- 4. Verificar índices
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'certificados';

-- 5. Verificar políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'certificados';

-- 6. Contar registros existentes
SELECT COUNT(*) as total_certificados FROM certificados;
