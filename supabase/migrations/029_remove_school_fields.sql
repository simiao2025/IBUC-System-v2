-- Remove columns escola_origem and ano_escolar from pre_matriculas if they exist
ALTER TABLE public.pre_matriculas 
DROP COLUMN IF EXISTS escola_origem,
DROP COLUMN IF EXISTS ano_escolar;
