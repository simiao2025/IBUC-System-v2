-- ============================================
-- Add licao_id to presencas table
-- ============================================

-- 1. Add column
ALTER TABLE public.presencas 
ADD COLUMN IF NOT EXISTS licao_id UUID REFERENCES public.licoes(id) ON DELETE SET NULL;

-- 2. Update unique constraint
-- Existing constraint is on (aluno_id, turma_id, data)
-- We remove it and add a new one that includes licao_id to allow multiple lessons per day
-- Or we keep it but allow licao_id as extra info? 
-- If we want to allow 2 lessons on the same day, we need to include licao_id in the unique constraint.

ALTER TABLE public.presencas DROP CONSTRAINT IF EXISTS presencas_aluno_id_turma_id_data_key;

-- If licao_id is NULL (e.g. for legacy records or missing info), we still want uniqueness on (aluno_id, turma_id, data).
-- PostgreSQL unique constraints handle NULLs by allowing multiple NULLs. 
-- To enforce "one entry per (aluno, turma, data, licao)" where licao can be null, we might need a partial index or just include it.

-- Since licao_id can be null, the standard UNIQUE constraint on (aluno_id, turma_id, data, licao_id) 
-- will NOT prevent duplicates if licao_id is NULL.
-- But for our purpose, including it is better than not.

ALTER TABLE public.presencas 
ADD CONSTRAINT presencas_unique_entry 
UNIQUE (aluno_id, turma_id, data, licao_id);

-- Optional: Index for better performance
CREATE INDEX IF NOT EXISTS idx_presencas_licao_id ON public.presencas(licao_id);
