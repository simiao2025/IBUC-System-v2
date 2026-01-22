-- =========================================================================
-- Script de Verificação e Correção - Configurações Financeiras PIX
-- =========================================================================
-- Este script verifica e corrige a tabela configuracoes_financeiras
-- garantindo que está pronta para o sistema de pagamento PIX.
-- =========================================================================

-- PARTE 1: VERIFICAÇÃO
-- =========================================================================

-- 1.1 - Verificar se a tabela existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'configuracoes_financeiras'
    ) THEN
        RAISE NOTICE '❌ ERRO: Tabela configuracoes_financeiras NÃO existe!';
        RAISE NOTICE '   Execute a migration: create_configuracoes_financeiras.sql';
    ELSE
        RAISE NOTICE '✅ Tabela configuracoes_financeiras existe';
    END IF;
END $$;

-- 1.2 - Verificar estrutura da tabela
SELECT 
    '✅ Estrutura da tabela:' as status,
    column_name as campo,
    data_type as tipo,
    is_nullable as permite_null
FROM information_schema.columns
WHERE table_name = 'configuracoes_financeiras'
ORDER BY ordinal_position;

-- 1.3 - Verificar se há registros
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '❌ ERRO: Nenhum registro encontrado!'
        WHEN COUNT(*) = 1 THEN '✅ 1 registro encontrado'
        ELSE '⚠️ ATENÇÃO: ' || COUNT(*)::TEXT || ' registros encontrados (esperado: 1)'
    END as status,
    COUNT(*) as total_registros
FROM configuracoes_financeiras;

-- 1.4 - Verificar conteúdo dos registros
SELECT 
    id,
    CASE 
        WHEN chave_pix IS NULL OR chave_pix = '' THEN '❌ VAZIO'
        ELSE '✅ ' || chave_pix
    END as chave_pix_status,
    CASE 
        WHEN beneficiario_nome IS NULL OR beneficiario_nome = '' THEN '❌ VAZIO'
        ELSE '✅ ' || beneficiario_nome
    END as beneficiario_nome_status,
    CASE 
        WHEN beneficiario_cidade IS NULL OR beneficiario_cidade = '' THEN '❌ VAZIO'
        ELSE '✅ ' || beneficiario_cidade
    END as beneficiario_cidade_status,
    created_at,
    updated_at
FROM configuracoes_financeiras;


-- PARTE 2: CORREÇÃO AUTOMÁTICA
-- =========================================================================

-- 2.1 - Criar tabela se não existir
CREATE TABLE IF NOT EXISTS configuracoes_financeiras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chave_pix TEXT NOT NULL DEFAULT '',
    beneficiario_nome TEXT NOT NULL DEFAULT '',
    beneficiario_cidade TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.2 - Inserir registro padrão se a tabela estiver vazia
INSERT INTO configuracoes_financeiras (chave_pix, beneficiario_nome, beneficiario_cidade)
SELECT '12345678900', 'Instituto Bíblico', 'São Paulo'
WHERE NOT EXISTS (SELECT 1 FROM configuracoes_financeiras);

-- 2.3 - Corrigir campos vazios ou NULL no registro existente
UPDATE configuracoes_financeiras
SET 
    chave_pix = CASE 
        WHEN chave_pix IS NULL OR chave_pix = '' THEN '12345678900'
        ELSE chave_pix
    END,
    beneficiario_nome = CASE 
        WHEN beneficiario_nome IS NULL OR beneficiario_nome = '' THEN 'Instituto Bíblico'
        ELSE beneficiario_nome
    END,
    beneficiario_cidade = CASE 
        WHEN beneficiario_cidade IS NULL OR beneficiario_cidade = '' THEN 'São Paulo'
        ELSE beneficiario_cidade
    END,
    updated_at = NOW()
WHERE 
    chave_pix IS NULL OR chave_pix = '' OR
    beneficiario_nome IS NULL OR beneficiario_nome = '' OR
    beneficiario_cidade IS NULL OR beneficiario_cidade = '';


-- PARTE 3: VERIFICAÇÃO FINAL
-- =========================================================================

SELECT 
    '========================================' as separador;
SELECT 
    '📊 RELATÓRIO FINAL' as titulo;
SELECT 
    '========================================' as separador;

-- 3.1 - Mostrar configuração atual
SELECT 
    '✅ Configuração atual:' as status,
    chave_pix,
    beneficiario_nome,
    beneficiario_cidade,
    created_at,
    updated_at
FROM configuracoes_financeiras
LIMIT 1;

-- 3.2 - Validação completa
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '❌ ERRO: Nenhuma configuração!'
        WHEN COUNT(*) > 1 THEN '⚠️ ATENÇÃO: Múltiplas configurações encontradas!'
        WHEN chave_pix IS NULL OR chave_pix = '' THEN '❌ ERRO: Chave PIX vazia!'
        WHEN beneficiario_nome IS NULL OR beneficiario_nome = '' THEN '❌ ERRO: Nome do beneficiário vazio!'
        WHEN beneficiario_cidade IS NULL OR beneficiario_cidade = '' THEN '❌ ERRO: Cidade vazia!'
        ELSE '✅ TUDO OK! Sistema PIX pronto para uso!'
    END as validacao_final
FROM configuracoes_financeiras;

-- 3.3 - Instruções finais
SELECT 
    '========================================' as separador;
SELECT 
    '📝 PRÓXIMOS PASSOS:' as titulo;
SELECT 
    '========================================' as separador;

DO $$
DECLARE
    config_count INTEGER;
    tem_pix_padrao BOOLEAN;
BEGIN
    SELECT COUNT(*) INTO config_count FROM configuracoes_financeiras;
    
    IF config_count = 0 THEN
        RAISE NOTICE '❌ ERRO CRÍTICO: Não foi possível criar/encontrar configuração!';
        RAISE NOTICE '   Entre em contato com o suporte técnico.';
    ELSE
        SELECT (chave_pix = '12345678900') INTO tem_pix_padrao 
        FROM configuracoes_financeiras LIMIT 1;
        
        IF tem_pix_padrao THEN
            RAISE NOTICE '⚠️ ATENÇÃO: Usando configuração PADRÃO/TESTE!';
            RAISE NOTICE '   ';
            RAISE NOTICE '   Para configurar com dados REAIS:';
            RAISE NOTICE '   1. Acesse: Admin → Financeiro → Configuração';
            RAISE NOTICE '   2. Preencha a chave PIX real (CPF, CNPJ, Email ou Telefone)';
            RAISE NOTICE '   3. Preencha o nome do beneficiário';
            RAISE NOTICE '   4. Preencha a cidade';
            RAISE NOTICE '   5. Clique em "Salvar Configurações"';
        ELSE
            RAISE NOTICE '✅ Sistema configurado com dados personalizados!';
            RAISE NOTICE '   O PIX está pronto para uso.';
        END IF;
    END IF;
END $$;
