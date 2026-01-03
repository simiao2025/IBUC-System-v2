-- ============================================
-- IBUC System - Eventos (Geral e por Polo)
-- ============================================

-- Tabela de eventos
CREATE TABLE IF NOT EXISTS public.eventos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  descricao text NULL,
  local text NULL,
  data_inicio date NOT NULL,
  data_fim date NULL,
  polo_id uuid NULL,
  criado_por uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT fk_eventos_polo FOREIGN KEY (polo_id) REFERENCES public.polos(id) ON DELETE CASCADE,
  CONSTRAINT fk_eventos_criado_por FOREIGN KEY (criado_por) REFERENCES public.usuarios(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_eventos_data_inicio ON public.eventos(data_inicio);
CREATE INDEX IF NOT EXISTS idx_eventos_polo_id ON public.eventos(polo_id);

-- Trigger updated_at
DROP TRIGGER IF EXISTS update_eventos_updated_at ON public.eventos;
CREATE TRIGGER update_eventos_updated_at
  BEFORE UPDATE ON public.eventos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "eventos_select_authenticated" ON public.eventos;
CREATE POLICY "eventos_select_authenticated"
  ON public.eventos
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "eventos_service_role_all" ON public.eventos;
CREATE POLICY "eventos_service_role_all"
  ON public.eventos
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
