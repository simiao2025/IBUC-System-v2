-- ============================================
-- Script SIMPLIFICADO de Verificação de Migrations
-- Versão mais fácil de ler - Tudo em uma tabela
-- ============================================

SELECT 
    'Migration' as item,
    'Status' as status,
    'Obrigatória?' as obrigatoria,
    'Ação' as acao
UNION ALL
SELECT 
    '000_check_and_create_types.sql' as item,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role_usuario')
        THEN '✅ EXECUTADA'
        ELSE '❌ NÃO EXECUTADA'
    END as status,
    'Não' as obrigatoria,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role_usuario')
        THEN 'OK'
        ELSE 'Opcional - pode pular'
    END as acao
UNION ALL
SELECT 
    '001_initial_schema.sql' as item,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'polos')
        THEN '✅ EXECUTADA'
        ELSE '❌ NÃO EXECUTADA'
    END as status,
    '✅ SIM' as obrigatoria,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'polos')
        THEN 'OK'
        ELSE '⚠️ EXECUTAR AGORA!'
    END as acao
UNION ALL
SELECT 
    '002_seed_data.sql' as item,
    CASE 
        WHEN EXISTS (SELECT 1 FROM niveis LIMIT 1)
        THEN '✅ EXECUTADA'
        ELSE '❌ NÃO EXECUTADA'
    END as status,
    '✅ SIM' as obrigatoria,
    CASE 
        WHEN EXISTS (SELECT 1 FROM niveis LIMIT 1)
        THEN 'OK'
        ELSE '⚠️ EXECUTAR AGORA!'
    END as acao
UNION ALL
SELECT 
    '003_fix_enum_roles.sql' as item,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_enum 
            WHERE enumlabel = 'diretor_geral' 
            AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'role_usuario')
        )
        THEN '✅ EXECUTADA'
        ELSE '❌ NÃO EXECUTADA'
    END as status,
    '✅ SIM' as obrigatoria,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_enum 
            WHERE enumlabel = 'diretor_geral' 
            AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'role_usuario')
        )
        THEN 'OK'
        ELSE '⚠️ EXECUTAR AGORA!'
    END as acao
UNION ALL
SELECT 
    '004_create_diretoria_tables.sql' as item,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'diretoria_geral')
        THEN '✅ EXECUTADA'
        ELSE '❌ NÃO EXECUTADA'
    END as status,
    'Não' as obrigatoria,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'diretoria_geral')
        THEN 'OK'
        ELSE 'Recomendada (pode executar depois)'
    END as acao
UNION ALL
SELECT 
    '005_seed_diretoria_data.sql' as item,
    CASE 
        WHEN EXISTS (SELECT 1 FROM diretoria_geral LIMIT 1)
        THEN '✅ EXECUTADA'
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'diretoria_geral')
        THEN '⚠️ Tabela existe mas sem dados'
        ELSE '❌ NÃO EXECUTADA'
    END as status,
    'Não' as obrigatoria,
    CASE 
        WHEN EXISTS (SELECT 1 FROM diretoria_geral LIMIT 1)
        THEN 'OK'
        ELSE 'Opcional (dados de exemplo)'
    END as acao;

-- ============================================
-- RESUMO RÁPIDO
-- ============================================

SELECT '' as separador;

SELECT 
    '═══════════════════════════════════════════════════════════════' as resumo;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'polos')
         AND EXISTS (SELECT 1 FROM niveis LIMIT 1)
         AND EXISTS (
            SELECT 1 FROM pg_enum 
            WHERE enumlabel = 'diretor_geral' 
            AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'role_usuario')
        )
        THEN '✅ PRONTO PARA TESTE REAL! Todas as migrations obrigatórias foram executadas.'
        ELSE '❌ NÃO ESTÁ PRONTO. Execute as migrations obrigatórias (001, 002, 003) primeiro.'
    END as resumo;

SELECT 
    '═══════════════════════════════════════════════════════════════' as resumo;

-- Estatísticas
SELECT 
    '📊 ESTATÍSTICAS:' as info;

SELECT 
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE') as total_tabelas,
    (SELECT COUNT(*) FROM niveis) as total_niveis,
    (SELECT COUNT(*) FROM modulos) as total_modulos,
    (SELECT COUNT(*) FROM polos) as total_polos;

