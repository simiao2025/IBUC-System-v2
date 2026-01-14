-- Migration: Atualizar schema da tabela boletins para persistência acadêmica
-- Objetivo: Alinhar boletins com a lógica de certificados (vínculo com módulo e turma)

DO $$ 
BEGIN
    -- 1. Adicionar colunas se não existirem
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'boletins' AND COLUMN_NAME = 'modulo_id') THEN
        ALTER TABLE boletins ADD COLUMN modulo_id UUID REFERENCES modulos(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'boletins' AND COLUMN_NAME = 'turma_id') THEN
        ALTER TABLE boletins ADD COLUMN turma_id UUID REFERENCES turmas(id);
    END IF;

    -- 2. Adicionar UNIQUE constraint para evitar boletins duplicados para o mesmo módulo
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_boletim_aluno_modulo'
    ) THEN
        ALTER TABLE boletins
        ADD CONSTRAINT unique_boletim_aluno_modulo 
        UNIQUE (aluno_id, modulo_id);
        
        RAISE NOTICE 'UNIQUE constraint unique_boletim_aluno_modulo adicionado com sucesso';
    END IF;

END $$;

-- Verificar estrutura
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'boletins';
