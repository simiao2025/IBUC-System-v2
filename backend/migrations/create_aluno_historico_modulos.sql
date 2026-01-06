-- Migration: Create Historical Module Data table
/*
 * Purpose: Store historical/manual records of completed modules.
 * Context: Used primarily for "Exceptional Cases" like importing Module 1 (2025) which predates the system.
 */

CREATE TABLE IF NOT EXISTS aluno_historico_modulos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  aluno_id UUID NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  modulo_numero INTEGER NOT NULL, -- Storing number (1, 2) is safer for history than ID if modules change
  ano_conclusao INTEGER NOT NULL,
  situacao VARCHAR(20) NOT NULL CHECK (situacao IN ('aprovado', 'reprovado', 'dispensado')),
  observacoes TEXT,
  criado_por UUID REFERENCES usuarios(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookup when generating reports
CREATE INDEX IF NOT EXISTS idx_historico_aluno ON aluno_historico_modulos(aluno_id);
