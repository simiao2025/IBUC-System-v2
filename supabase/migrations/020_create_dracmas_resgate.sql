-- Migration: Create Dracmas Resgate table
/*
 * Purpose: Store historical records of Dracmas that have been "rescued" (used/withdrawn) by students.
 * Context: When a teacher or admin triggers a "Resgate", rows move from dracmas_transacoes to here.
 */

CREATE TABLE IF NOT EXISTS dracmas_resgate (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  original_id UUID, -- Optional: ID of the original transaction in dracmas_transacoes
  aluno_id UUID NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  turma_id UUID NOT NULL REFERENCES turmas(id) ON DELETE CASCADE,
  quantidade INTEGER NOT NULL,
  tipo VARCHAR(50),
  descricao TEXT,
  data DATE NOT NULL, -- Original date of the earning
  registrado_por UUID REFERENCES usuarios(id),
  created_at TIMESTAMP WITH TIME ZONE, -- Original creation timestamp
  
  -- Rescue metadata
  resgatado_por UUID REFERENCES usuarios(id),
  data_resgate TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_dracmas_resgate_aluno_id ON dracmas_resgate(aluno_id);
CREATE INDEX IF NOT EXISTS idx_dracmas_resgate_turma_id ON dracmas_resgate(turma_id);
CREATE INDEX IF NOT EXISTS idx_dracmas_resgate_data_resgate ON dracmas_resgate(data_resgate);
