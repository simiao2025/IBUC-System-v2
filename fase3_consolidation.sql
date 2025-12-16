-- FASE 3 - CONSOLIDAÇÃO FINAL
-- Verificações e validações pós-implementação

-- 1. Verificar integridade de diretoria (executar manualmente no Supabase Studio)
/*
SELECT 
    'diretoria_geral' as tabela,
    dg.usuario_id,
    u.email,
    dg.cargo,
    CASE WHEN u.id IS NULL THEN 'ORPHAN' ELSE 'OK' END as status
FROM public.diretoria_geral dg 
LEFT JOIN public.usuarios u ON dg.usuario_id = u.id 
ORDER BY dg.usuario_id;

SELECT 
    'diretoria_polo' as tabela,
    dp.usuario_id,
    u.email,
    dp.cargo,
    dp.polo_id,
    CASE WHEN u.id IS NULL THEN 'ORPHAN' ELSE 'OK' END as status
FROM public.diretoria_polo dp 
LEFT JOIN public.usuarios u ON dp.usuario_id = u.id 
ORDER BY dp.polo_id, dp.usuario_id;
*/

-- 2. Verificar policies com roles={public} que precisam ajuste
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE roles = '{public}'
  AND schemaname = 'public'
ORDER BY tablename, policyname;

-- 3. Verificar usuários recriados com CPF
SELECT id, email, nome_completo, cpf, role, ativo, polo_id 
FROM public.usuarios 
WHERE role IN ('super_admin', 'admin_geral')
ORDER BY role;

-- 4. Verificar constraints de CPF implementadas
SELECT 
    table_name,
    column_name,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('usuarios', 'alunos', 'responsaveis')
  AND column_name = 'cpf'
ORDER BY table_name;

-- 5. Verificar índices únicos de CPF
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('usuarios', 'alunos', 'responsaveis')
  AND indexname LIKE '%cpf_norm_unique%'
ORDER BY tablename, indexname;

-- 6. Verificar enum status_matricula atualizado
SELECT unnest(enumlabel) as status_value
FROM pg_enum 
WHERE enumtypid = (
    SELECT oid FROM pg_type WHERE typname = 'status_matricula'
)
ORDER BY status_value;

-- 7. Verificar índice de matrícula ativa única
SELECT indexname, tablename, indexdef
FROM pg_indexes 
WHERE tablename = 'matriculas'
  AND indexname = 'matriculas_uma_ativa_por_aluno';

-- 8. Verificar functions SECURITY DEFINER restritas
SELECT 
    proname,
    prosecdef,
    prosrc::text as source
FROM pg_proc 
WHERE prosecdef = true
  AND pronamespace = 'public'::regnamespace
ORDER BY proname;

-- 9. Verificar grants em functions críticas
SELECT 
    routine_name,
    grantee,
    privilege_type
FROM information_schema.role_routine_grants 
WHERE routine_name IN ('criar_polo', 'atualizar_polo')
  AND routine_schema = 'public'
ORDER BY routine_name, grantee;
