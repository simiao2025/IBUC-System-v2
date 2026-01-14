-- Migration: Adicionar UNIQUE constraint na tabela certificados
-- Objetivo: Garantir que não haja certificados duplicados para a mesma combinação
-- de aluno + módulo + tipo, mesmo em casos de race conditions

-- Verificar se o constraint já existe
DO $$
BEGIN
    -- Adicionar UNIQUE constraint se não existir
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_certificado_aluno_modulo_tipo'
    ) THEN
        ALTER TABLE certificados
        ADD CONSTRAINT unique_certificado_aluno_modulo_tipo 
        UNIQUE (aluno_id, modulo_id, tipo);
        
        RAISE NOTICE 'UNIQUE constraint adicionado com sucesso';
    ELSE
        RAISE NOTICE 'UNIQUE constraint já existe';
    END IF;
END $$;

-- Verificar constraint criado
SELECT 
    conname as constraint_name,
    contype as constraint_type
FROM pg_constraint
WHERE conrelid = 'certificados'::regclass
  AND conname = 'unique_certificado_aluno_modulo_tipo';
