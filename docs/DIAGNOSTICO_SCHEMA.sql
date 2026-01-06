-- =================================================================
-- IBUC System - Script de Diagnóstico Final (Resiliente)
-- Este script NÃO dará erro mesmo que as tabelas não existam.
-- =================================================================

-- 1. Verificar Existência de Tabelas e Contagem (Versão Segura)
SELECT 
    table_name as "Tabela",
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = t.table_name AND table_schema = 'public') 
        THEN 'EXISTE' 
        ELSE 'FALTANDO' 
    END as "Status"
FROM (
    VALUES 
        ('polos'), 
        ('usuarios'), 
        ('alunos'), 
        ('niveis'), 
        ('modulos'),
        ('turmas'),
        ('matriculas'),
        ('pre_matriculas'),
        ('diretoria_geral'),
        ('diretoria_polo')
) as t(table_name);

-- 2. Listar TODAS as tabelas que REALMENTE existem no banco
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 3. Verificar ENUMs (Tipos de dados)
SELECT t.typname as "Tipo ENUM", string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) as "Valores"
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
JOIN pg_namespace n ON n.oid = t.typnamespace 
WHERE n.nspname = 'public'
GROUP BY t.typname;

-- 4. Verificar Extensões
SELECT name, installed_version 
FROM pg_available_extensions 
WHERE installed_version IS NOT NULL 
AND name IN ('uuid-ossp', 'pgcrypto');
