-- Migration: Add total_dracmas to aluno_historico_modulos
-- Purpose: Store the final Dracmas balance when a module is closed.

ALTER TABLE aluno_historico_modulos 
ADD COLUMN IF NOT EXISTS total_dracmas INTEGER DEFAULT 0;
