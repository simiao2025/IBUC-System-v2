-- =========================================================================
-- Script SIMPLES de Verificação - Configurações Financeiras PIX
-- =========================================================================
-- Primeiro vamos descobrir o estado atual do banco
-- =========================================================================

-- PASSO 1: Verificar se a tabela existe
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'configuracoes_financeiras'
        ) 
        THEN '✅ Tabela configuracoes_financeiras EXISTE'
        ELSE '❌ Tabela configuracoes_financeiras NÃO EXISTE'
    END as status_tabela;

-- PASSO 2: Ver TODAS as colunas que existem na tabela (se existir)
SELECT 
    column_name as nome_coluna,
    data_type as tipo,
    is_nullable as permite_null,
    column_default as valor_padrao
FROM information_schema.columns
WHERE table_name = 'configuracoes_financeiras'
ORDER BY ordinal_position;

-- PASSO 3: Ver quantos registros existem
SELECT 
    'Total de registros:' as info,
    COUNT(*) as quantidade
FROM configuracoes_financeiras;

-- PASSO 4: Ver TODOS os dados (primeiros 5 registros)
SELECT * FROM configuracoes_financeiras LIMIT 5;
