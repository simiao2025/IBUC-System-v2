-- Verificar integridade das tabelas de diretoria após recriação de usuários

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
