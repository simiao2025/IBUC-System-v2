DO $$ BEGIN
  CREATE TYPE public.status_pre_matricula_prd AS ENUM (
    'em_analise',
    'ativo',
    'trancado',
    'concluido'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.pre_matriculas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  nome_completo TEXT NOT NULL,
  cpf TEXT NOT NULL,
  data_nascimento DATE NOT NULL,
  email_responsavel TEXT NOT NULL,
  telefone_responsavel TEXT NOT NULL,
  polo_id UUID NOT NULL,

  status public.status_pre_matricula_prd NOT NULL DEFAULT 'em_analise'
);

CREATE UNIQUE INDEX IF NOT EXISTS pre_matriculas_cpf_unique ON public.pre_matriculas (cpf);
CREATE UNIQUE INDEX IF NOT EXISTS pre_matriculas_email_unique ON public.pre_matriculas (email_responsavel);

CREATE OR REPLACE FUNCTION public.trigger_update_timestamp_pre_matriculas()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS pre_matriculas_updated_at ON public.pre_matriculas;
CREATE TRIGGER pre_matriculas_updated_at
  BEFORE UPDATE ON public.pre_matriculas
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_update_timestamp_pre_matriculas();
