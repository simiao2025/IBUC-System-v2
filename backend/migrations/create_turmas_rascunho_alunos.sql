-- Migration: Create Turmas Rascunho Alunos Table
-- Description: Creates a table to link students to draft classes before confirmation.

CREATE TABLE IF NOT EXISTS turmas_rascunho_alunos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    turma_rascunho_id UUID NOT NULL REFERENCES turmas(id) ON DELETE CASCADE,
    aluno_id UUID NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
    confirmado BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique link per student per draft class
    CONSTRAINT uq_turma_rascunho_aluno UNIQUE (turma_rascunho_id, aluno_id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_turmas_rascunho_alunos_turma ON turmas_rascunho_alunos(turma_rascunho_id);
CREATE INDEX IF NOT EXISTS idx_turmas_rascunho_alunos_aluno ON turmas_rascunho_alunos(aluno_id);

COMMENT ON TABLE turmas_rascunho_alunos IS 'Tabela de pré-vinculação de alunos a turmas rascunho para migração automática';
