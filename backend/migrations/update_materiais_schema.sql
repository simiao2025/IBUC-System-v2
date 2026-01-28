-- MIGRATION: Update Materiais Table Schema
-- Desc: Adds modulo_id, nivel_id, descricao, unidade, valor_cents, and url_imagem columns to materiais table.

DO $$
BEGIN
    -- 1. Add modulo_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'materiais' AND column_name = 'modulo_id') THEN
        ALTER TABLE materiais ADD COLUMN modulo_id UUID REFERENCES modulos(id);
    END IF;

    -- 2. Add nivel_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'materiais' AND column_name = 'nivel_id') THEN
        ALTER TABLE materiais ADD COLUMN nivel_id UUID REFERENCES niveis(id);
    END IF;

    -- 3. Add descricao
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'materiais' AND column_name = 'descricao') THEN
        ALTER TABLE materiais ADD COLUMN descricao TEXT;
    END IF;

    -- 4. Add unidade
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'materiais' AND column_name = 'unidade') THEN
        ALTER TABLE materiais ADD COLUMN unidade TEXT DEFAULT 'Unidade';
    END IF;

    -- 5. Add valor_cents (price in cents to avoid floating point issues)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'materiais' AND column_name = 'valor_cents') THEN
        ALTER TABLE materiais ADD COLUMN valor_cents INTEGER DEFAULT 0;
    END IF;

    -- 6. Add url_imagem
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'materiais' AND column_name = 'url_imagem') THEN
        ALTER TABLE materiais ADD COLUMN url_imagem TEXT;
    END IF;

END $$;
