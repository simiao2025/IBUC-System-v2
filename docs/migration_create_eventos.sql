-- Create Eventos Table
CREATE TABLE IF NOT EXISTS public.eventos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  local TEXT,
  data_inicio TIMESTAMPTZ NOT NULL,
  data_fim TIMESTAMPTZ,
  polo_id UUID REFERENCES public.polos(id),
  criado_por UUID REFERENCES public.usuarios(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;

-- Policy for SELECT (Visibility)
-- 1. General Events (polo_id IS NULL) are visible to everyone authenticated.
-- 2. Polo Events (polo_id IS NOT NULL) are visible to:
--    a. Users capable of seeing everything (Super Admin, Admin Geral, Diretoria Geral, Coordenacao Geral)
--    b. Users belonging to the SAME polo (via user_metadata -> polo_id)
CREATE POLICY "Visualizar Eventos" ON public.eventos
  FOR SELECT USING (
    auth.role() = 'authenticated' AND (
      -- Evento Geral (para todos)
      polo_id IS NULL
      OR
      -- Usuário da Diretoria Geral (Acesso total)
      (auth.jwt() -> 'user_metadata' ->> 'role' IN ('super_admin', 'admin_geral', 'diretor_geral', 'coordenador_geral'))
      OR
      -- Usuário/Aluno do mesmo Polo
      (auth.jwt() -> 'user_metadata' ->> 'polo_id' = polo_id::text)
    )
  );

-- Policy for INSERT/UPDATE/DELETE (Management)
-- Only allowed for Directors/Coordinators of Polo and General Directorate
CREATE POLICY "Gerenciar Eventos" ON public.eventos
  FOR ALL USING (
    auth.role() = 'authenticated' AND (
      -- Diretoria Geral
      (auth.jwt() -> 'user_metadata' ->> 'role' IN ('super_admin', 'admin_geral', 'diretor_geral', 'coordenador_geral'))
      OR
      -- Diretoria do Polo (restrito ao seu próprio polo se o evento tiver polo_id)
      (
        auth.jwt() -> 'user_metadata' ->> 'role' IN ('diretor_polo', 'coordenador_polo') AND 
        (polo_id IS NULL OR auth.jwt() -> 'user_metadata' ->> 'polo_id' = polo_id::text)
      )
    )
  );
