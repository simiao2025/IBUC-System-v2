-- Remove a restrição de e-mail único nas pré-matrículas
-- Isso permite que o mesmo pai (responsável) cadastre vários filhos usando o mesmo e-mail.

DROP INDEX IF EXISTS public.pre_matriculas_email_unique;

-- O CPF do ALUNO deve continuar sendo único para evitar duplicidade de cadastros do mesmo aluno.
-- CREATE UNIQUE INDEX IF NOT EXISTS pre_matriculas_cpf_unique ON public.pre_matriculas (cpf);
