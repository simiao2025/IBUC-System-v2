-- ============================================
-- Script de Verificação de Migrations
-- Execute no SQL Editor do Supabase
-- ============================================

-- Este script verifica quais migrations já foram executadas
-- baseado nas tabelas e objetos que cada migration cria

SELECT 
    '═══════════════════════════════════════════════════════════════' as separador;

SELECT 
    'VERIFICAÇÃO DE MIGRATIONS - IBUC SYSTEM' as titulo;

SELECT 
    '═══════════════════════════════════════════════════════════════' as separador;

-- ============================================
-- Migration 000: check_and_create_types.sql
-- ============================================
SELECT 
    '1️⃣ Migration 000: check_and_create_types.sql' as migration;

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_type WHERE typname = 'role_usuario'
        ) THEN '✅ EXECUTADA - ENUMs criados'
        ELSE '❌ NÃO EXECUTADA - ENUMs não encontrados'
    END as status;

-- ============================================
-- Migration 001: initial_schema.sql
-- ============================================
SELECT 
    '2️⃣ Migration 001: initial_schema.sql' as migration;

-- Verifica tabelas principais criadas pela 001
WITH tabelas_esperadas AS (
    SELECT unnest(ARRAY[
        'polos', 'usuarios', 'alunos', 'responsaveis', 
        'turmas', 'matriculas', 'presencas', 'avaliacoes',
        'notas', 'conteudos', 'mensalidades', 'pagamentos',
        'documentos', 'consents', 'auditoria'
    ]) as tabela
),
tabelas_existentes AS (
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
)
SELECT 
    CASE 
        WHEN (
            SELECT COUNT(*) 
            FROM tabelas_esperadas te 
            WHERE EXISTS (
                SELECT 1 FROM tabelas_existentes tex 
                WHERE tex.table_name = te.tabela
            )
        ) >= 10 THEN '✅ EXECUTADA - 10+ tabelas principais encontradas'
        WHEN (
            SELECT COUNT(*) 
            FROM tabelas_esperadas te 
            WHERE EXISTS (
                SELECT 1 FROM tabelas_existentes tex 
                WHERE tex.table_name = te.tabela
            )
        ) > 0 THEN '⚠️ PARCIALMENTE EXECUTADA - Algumas tabelas faltando'
        ELSE '❌ NÃO EXECUTADA - Tabelas principais não encontradas'
    END as status;

-- Mostra quantas tabelas principais existem
SELECT 
    COUNT(*) as tabelas_principais_encontradas
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
AND table_name IN (
    'polos', 'usuarios', 'alunos', 'responsaveis', 
    'turmas', 'matriculas', 'presencas', 'avaliacoes',
    'notas', 'conteudos', 'mensalidades', 'pagamentos',
    'documentos', 'consents', 'auditoria'
);

-- ============================================
-- Migration 002: seed_data.sql
-- ============================================
SELECT 
    '3️⃣ Migration 002: seed_data.sql' as migration;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM niveis LIMIT 1) 
         AND EXISTS (SELECT 1 FROM modulos LIMIT 1)
         AND EXISTS (SELECT 1 FROM polos LIMIT 1)
        THEN '✅ EXECUTADA - Dados seed encontrados'
        ELSE '❌ NÃO EXECUTADA - Dados seed não encontrados'
    END as status;

-- Mostra contagem de dados seed
SELECT 
    (SELECT COUNT(*) FROM niveis) as total_niveis,
    (SELECT COUNT(*) FROM modulos) as total_modulos,
    (SELECT COUNT(*) FROM polos) as total_polos,
    (SELECT COUNT(*) FROM usuarios) as total_usuarios;

-- ============================================
-- Migration 003: fix_enum_roles.sql
-- ============================================
SELECT 
    '4️⃣ Migration 003: fix_enum_roles.sql' as migration;

-- Verifica se os roles corrigidos existem no ENUM
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_enum 
            WHERE enumlabel = 'diretor_geral' 
            AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'role_usuario')
        ) AND EXISTS (
            SELECT 1 FROM pg_enum 
            WHERE enumlabel = 'coordenador_geral' 
            AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'role_usuario')
        ) THEN '✅ EXECUTADA - Roles corrigidos encontrados'
        ELSE '❌ NÃO EXECUTADA - Roles corrigidos não encontrados'
    END as status;

-- ============================================
-- Migration 004: create_diretoria_tables.sql
-- ============================================
SELECT 
    '5️⃣ Migration 004: create_diretoria_tables.sql' as migration;

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'diretoria_geral'
        ) AND EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'diretoria_polo'
        ) THEN '✅ EXECUTADA - Tabelas de diretorias encontradas'
        ELSE '❌ NÃO EXECUTADA - Tabelas de diretorias não encontradas'
    END as status;

-- ============================================
-- Migration 005: seed_diretoria_data.sql
-- ============================================
SELECT 
    '6️⃣ Migration 005: seed_diretoria_data.sql' as migration;

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM diretoria_geral LIMIT 1
        ) OR EXISTS (
            SELECT 1 FROM diretoria_polo LIMIT 1
        ) THEN '✅ EXECUTADA - Dados de diretorias encontrados'
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'diretoria_geral'
        ) THEN '⚠️ TABELAS EXISTEM mas sem dados (opcional)'
        ELSE '❌ NÃO EXECUTADA - Tabelas de diretorias não existem'
    END as status;

-- ============================================
-- RESUMO GERAL
-- ============================================
SELECT 
    '═══════════════════════════════════════════════════════════════' as separador;

SELECT 
    '📊 RESUMO GERAL' as titulo;

SELECT 
    '═══════════════════════════════════════════════════════════════' as separador;

-- Total de tabelas
SELECT 
    COUNT(*) as total_tabelas_publicas
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';

-- Total de ENUMs
SELECT 
    COUNT(*) as total_enums
FROM pg_type 
WHERE typtype = 'e' 
AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- Lista todas as tabelas
SELECT 
    '📋 TABELAS EXISTENTES:' as info;

SELECT 
    table_name as tabela,
    (SELECT COUNT(*) 
     FROM information_schema.columns 
     WHERE table_schema = 'public' 
     AND table_name = t.table_name) as colunas
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ============================================
-- MIGRATIONS FALTANDO
-- ============================================
SELECT 
    '═══════════════════════════════════════════════════════════════' as separador;

SELECT 
    '⚠️ MIGRATIONS QUE PRECISAM SER EXECUTADAS:' as titulo;

SELECT 
    '═══════════════════════════════════════════════════════════════' as separador;

-- Migration 001
SELECT 
    CASE 
        WHEN NOT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'polos'
        ) THEN '❌ 001_initial_schema.sql - OBRIGATÓRIA'
        ELSE NULL
    END as falta;

-- Migration 002
SELECT 
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM niveis LIMIT 1) 
        THEN '❌ 002_seed_data.sql - OBRIGATÓRIA'
        ELSE NULL
    END as falta;

-- Migration 003
SELECT 
    CASE 
        WHEN NOT EXISTS (
            SELECT 1 FROM pg_enum 
            WHERE enumlabel = 'diretor_geral' 
            AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'role_usuario')
        ) THEN '❌ 003_fix_enum_roles.sql - OBRIGATÓRIA'
        ELSE NULL
    END as falta;

-- Migration 004
SELECT 
    CASE 
        WHEN NOT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'diretoria_geral'
        ) THEN '⚠️ 004_create_diretoria_tables.sql - RECOMENDADA'
        ELSE NULL
    END as falta;

-- Migration 005
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'diretoria_geral'
        ) AND NOT EXISTS (
            SELECT 1 FROM diretoria_geral LIMIT 1
        ) THEN '⚪ 005_seed_diretoria_data.sql - OPCIONAL'
        ELSE NULL
    END as falta;

SELECT 
    '═══════════════════════════════════════════════════════════════' as separador;

