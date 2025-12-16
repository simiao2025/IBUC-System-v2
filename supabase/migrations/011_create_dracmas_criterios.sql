CREATE TABLE IF NOT EXISTS public.dracmas_criterios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  quantidade_padrao INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.dracmas_criterios (codigo, nome, descricao, ativo, quantidade_padrao)
VALUES
  ('presenca', 'Presença', 'Drácmas por presença registrada', true, 1),
  ('assiduidade', 'Assiduidade', 'Drácmas por assiduidade', true, 1),
  ('participacao', 'Participação', 'Drácmas por participação em aula', true, 1),
  ('pergunta', 'Pergunta Respondida', 'Drácmas por responder perguntas', true, 1),
  ('tarefa', 'Tarefa', 'Drácmas por tarefas/atividades', true, 1),
  ('outro', 'Outro', 'Outros critérios', true, 1)
ON CONFLICT (codigo) DO NOTHING;

CREATE OR REPLACE FUNCTION public.trigger_update_timestamp_dracmas_criterios()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS dracmas_criterios_updated_at ON public.dracmas_criterios;
CREATE TRIGGER dracmas_criterios_updated_at
  BEFORE UPDATE ON public.dracmas_criterios
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_update_timestamp_dracmas_criterios();
