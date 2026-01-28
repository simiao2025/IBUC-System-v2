-- Migration: Add Draft Control Fields to Turmas
-- Description: Adds columns to track draft status and origin class.

ALTER TABLE turmas
    ADD COLUMN IF NOT EXISTS turma_origem_id UUID REFERENCES turmas(id),
    ADD COLUMN IF NOT EXISTS aguardando_ativacao BOOLEAN DEFAULT false;

COMMENT ON COLUMN turmas.turma_origem_id IS 'ID da turma anterior (para turmas rascunho)';
COMMENT ON COLUMN turmas.aguardando_ativacao IS 'Flag para turmas rascunho pendentes de ativação';
