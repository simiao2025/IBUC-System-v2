-- Script de verificação do banco de dados IBUC System
-- Execute este script no SQL Editor do Supabase para verificar se tudo está correto

-- ============================================
-- 1. Verificar Tabelas
-- ============================================
SELECT 
    'Tabelas criadas' as verificacao,
    COUNT(*) as total
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';

-- Listar todas as tabelas
SELECT 
    'Lista de tabelas' as verificacao,
    table_name
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ============================================
-- 2. Verificar RLS Habilitado
-- ============================================
SELECT 
    'RLS habilitado' as verificacao,
    tablename,
    rowsecurity as rls_habilitado
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- ============================================
-- 3. Verificar Políticas RLS
-- ============================================
SELECT 
    'Políticas RLS' as verificacao,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as command
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================
-- 4. Verificar Dados Seed
-- ============================================
SELECT 'Níveis' as tabela, COUNT(*) as total FROM niveis;
SELECT 'Módulos' as tabela, COUNT(*) as total FROM modulos;
SELECT 'Polos' as tabela, COUNT(*) as total FROM polos;
SELECT 'Usuários' as tabela, COUNT(*) as total FROM usuarios;

-- ============================================
-- 5. Verificar Views
-- ============================================
SELECT 
    'Views criadas' as verificacao,
    table_name
FROM information_schema.views 
WHERE table_schema = 'public'
ORDER BY table_name;

-- ============================================
-- 6. Verificar Funções
-- ============================================
SELECT 
    'Funções criadas' as verificacao,
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- ============================================
-- 7. Verificar Triggers
-- ============================================
SELECT 
    'Triggers criados' as verificacao,
    trigger_name,
    event_object_table as tabela,
    action_timing,
    event_manipulation
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- ============================================
-- 8. Verificar Índices
-- ============================================
SELECT 
    'Índices criados' as verificacao,
    tablename,
    indexname
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- ============================================
-- 9. Testar Funções Auxiliares
-- ============================================
-- NOTA: Estas funções só funcionam com um usuário autenticado
-- SELECT is_super_admin() as eh_super_admin;
-- SELECT get_user_polo_id() as polo_id_usuario;

-- ============================================
-- 10. Verificar Constraints
-- ============================================
SELECT 
    'Constraints' as verificacao,
    table_name,
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_schema = 'public'
ORDER BY table_name, constraint_type;

-- ============================================
-- RESUMO FINAL
-- ============================================
SELECT 
    '✅ Verificação completa!' as status,
    'Execute cada seção acima para verificar o banco de dados' as instrucao;

