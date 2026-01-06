-- Verificação Rápida de Status das Migrations
-- Baseado nos dados que você já tem

-- Verifica Migration 001 (23 tabelas = ✅)
SELECT 
    'Migration 001 (initial_schema)' as migration,
    CASE 
        WHEN (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE') >= 21
        THEN '✅ EXECUTADA'
        ELSE '❌ NÃO EXECUTADA'
    END as status;

-- Verifica Migration 002 (8 níveis, 10 módulos, 1 polo = ✅)
SELECT 
    'Migration 002 (seed_data)' as migration,
    CASE 
        WHEN EXISTS (SELECT 1 FROM niveis LIMIT 1)
         AND EXISTS (SELECT 1 FROM modulos LIMIT 1)
         AND EXISTS (SELECT 1 FROM polos LIMIT 1)
        THEN '✅ EXECUTADA'
        ELSE '❌ NÃO EXECUTADA'
    END as status;

-- Verifica Migration 003 (roles corrigidos)
SELECT 
    'Migration 003 (fix_enum_roles)' as migration,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_enum 
            WHERE enumlabel = 'diretor_geral' 
            AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'role_usuario')
        ) AND EXISTS (
            SELECT 1 FROM pg_enum 
            WHERE enumlabel = 'coordenador_geral' 
            AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'role_usuario')
        )
        THEN '✅ EXECUTADA'
        ELSE '❌ NÃO EXECUTADA'
    END as status;

-- Verifica Migration 004 (tabelas de diretorias)
SELECT 
    'Migration 004 (diretoria_tables)' as migration,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'diretoria_geral')
        THEN '✅ EXECUTADA'
        ELSE '❌ NÃO EXECUTADA (recomendada)'
    END as status;

-- RESUMO FINAL
SELECT 
    '═══════════════════════════════════════════════════════════════' as separador;

SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE') >= 21
         AND EXISTS (SELECT 1 FROM niveis LIMIT 1)
         AND EXISTS (
            SELECT 1 FROM pg_enum 
            WHERE enumlabel = 'diretor_geral' 
            AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'role_usuario')
        )
        THEN '✅ PRONTO PARA TESTE REAL! Todas as migrations obrigatórias foram executadas.'
        ELSE '⚠️ Verifique as migrations obrigatórias acima.'
    END as status_final;






