-- Migração para criar tabela de histórico de transferências de alunos entre polos
-- Permite rastrear quando, quem e por que um aluno mudou de polo

CREATE TABLE IF NOT EXISTS public.transferencias_alunos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  aluno_id UUID NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  polo_origem_id UUID NOT NULL REFERENCES public.polos(id) ON DELETE RESTRICT,
  polo_destino_id UUID NOT NULL REFERENCES public.polos(id) ON DELETE RESTRICT,
  turma_origem_id UUID REFERENCES public.turmas(id) ON DELETE SET NULL,
  realizado_por UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  motivo TEXT NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT fk_aluno FOREIGN KEY (aluno_id) REFERENCES public.alunos(id),
  CONSTRAINT fk_polo_origem FOREIGN KEY (polo_origem_id) REFERENCES public.polos(id),
  CONSTRAINT fk_polo_destino FOREIGN KEY (polo_destino_id) REFERENCES public.polos(id),
  CONSTRAINT fk_turma_origem FOREIGN KEY (turma_origem_id) REFERENCES public.turmas(id),
  CONSTRAINT fk_realizado_por FOREIGN KEY (realizado_por) REFERENCES public.usuarios(id),
  CONSTRAINT check_polos_diferentes CHECK (polo_origem_id != polo_destino_id)
);

-- Índices para otimizar consultas
CREATE INDEX IF NOT EXISTS idx_transferencias_aluno_id ON public.transferencias_alunos(aluno_id);
CREATE INDEX IF NOT EXISTS idx_transferencias_polo_origem ON public.transferencias_alunos(polo_origem_id);
CREATE INDEX IF NOT EXISTS idx_transferencias_polo_destino ON public.transferencias_alunos(polo_destino_id);
CREATE INDEX IF NOT EXISTS idx_transferencias_created_at ON public.transferencias_alunos(created_at);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.transferencias_alunos ENABLE ROW LEVEL SECURITY;

-- Policies para transferencias_alunos
DROP POLICY IF EXISTS "Super admin pode ver todas as transferências" ON public.transferencias_alunos;
CREATE POLICY "Super admin pode ver todas as transferências"
  ON public.transferencias_alunos FOR SELECT
  USING (is_super_admin());

DROP POLICY IF EXISTS "Usuários podem ver transferências do seu polo" ON public.transferencias_alunos;
CREATE POLICY "Usuários podem ver transferências do seu polo"
  ON public.transferencias_alunos FOR SELECT
  USING (
    is_super_admin() OR
    polo_origem_id = get_user_polo_id() OR
    polo_destino_id = get_user_polo_id() OR
    EXISTS (
      SELECT 1 FROM public.usuarios 
      WHERE id = auth.uid()::UUID 
      AND role IN ('admin_geral', 'diretor_geral')
    )
  );

DROP POLICY IF EXISTS "Diretores e admin podem inserir transferências" ON public.transferencias_alunos;
CREATE POLICY "Diretores e admin podem inserir transferências"
  ON public.transferencias_alunos FOR INSERT
  WITH CHECK (
    is_super_admin() OR
    EXISTS (
      SELECT 1 FROM public.usuarios 
      WHERE id = auth.uid()::UUID 
      AND role IN ('admin_geral', 'diretor_geral', 'diretor_polo', 'secretario_polo')
    )
  );

-- Comentários para documentação
COMMENT ON TABLE public.transferencias_alunos IS 'Histórico de transferências de alunos entre polos';
COMMENT ON COLUMN public.transferencias_alunos.aluno_id IS 'ID do aluno que foi transferido';
COMMENT ON COLUMN public.transferencias_alunos.polo_origem_id IS 'Polo de onde o aluno saiu';
COMMENT ON COLUMN public.transferencias_alunos.polo_destino_id IS 'Polo para onde o aluno foi transferido';
COMMENT ON COLUMN public.transferencias_alunos.turma_origem_id IS 'Turma que o aluno estava antes da transferência';
COMMENT ON COLUMN public.transferencias_alunos.realizado_por IS 'Usuário que realizou a transferência';
COMMENT ON COLUMN public.transferencias_alunos.motivo IS 'Motivo da transferência (ex: mudança de endereço)';
