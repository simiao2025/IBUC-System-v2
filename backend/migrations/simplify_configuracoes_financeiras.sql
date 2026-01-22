-- Remove a coluna valor_mensalidade_padrao se ela existir
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'configuracoes_financeiras' AND column_name = 'valor_mensalidade_padrao') THEN
        ALTER TABLE configuracoes_financeiras DROP COLUMN valor_mensalidade_padrao;
    END IF;
END $$;
