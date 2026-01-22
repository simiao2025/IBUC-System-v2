CREATE TABLE IF NOT EXISTS configuracoes_financeiras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chave_pix TEXT NOT NULL,
    beneficiario_nome TEXT NOT NULL,
    beneficiario_cidade TEXT NOT NULL,
    valor_mensalidade_padrao INTEGER DEFAULT 7000, -- em centavos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir registro padrão se não existir
INSERT INTO configuracoes_financeiras (chave_pix, beneficiario_nome, beneficiario_cidade)
SELECT '12345678900', 'Instituto Bíblico', 'São Paulo'
WHERE NOT EXISTS (SELECT 1 FROM configuracoes_financeiras);
