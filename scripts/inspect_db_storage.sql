-- ========================================================
-- IBUC System v2 - Script de Inspeção de Banco e Storage
-- ========================================================

-- 1. Listar todas as tabelas do schema public
-- Útil para verificar a estrutura do banco de dados
SELECT 
    table_name AS "Nome da Tabela",
    (SELECT count(*) FROM information_schema.columns WHERE table_name = t.table_name) AS "Total de Colunas"
FROM 
    information_schema.tables t
WHERE 
    table_schema = 'public' 
    AND table_type = 'BASE TABLE'
ORDER BY 
    table_name;

-- 2. Listar todos os buckets do Supabase Storage
-- Útil para verificar onde os arquivos estão sendo armazenados
SELECT 
    id AS "Bucket ID",
    name AS "Nome do Bucket",
    public AS "É Público?",
    file_size_limit AS "Limite de Tamanho",
    allowed_mime_types AS "Mimes Permitidos",
    created_at AS "Data de Criação"
FROM 
    storage.buckets
ORDER BY 
    name;

-- 3. Resumo de utilização de Storage (Opcional - Requer permissões)
-- Mostra a contagem de objetos por bucket
SELECT 
    b.name AS "Bucket",
    count(o.id) AS "Total de Arquivos",
    round(sum(coalesce((o.metadata->>'size')::numeric, 0)) / 1024 / 1024, 2) AS "Tamanho Total (MB)"
FROM 
    storage.buckets b
LEFT JOIN 
    storage.objects o ON b.id = o.bucket_id
GROUP BY 
    b.name;
