-- ============================================
-- IBUC System - Expansão de Schema Unificado (Fase 4)
-- ============================================

-- 1. Expansão da tabela pre_matriculas
ALTER TABLE public.pre_matriculas
ADD COLUMN IF NOT EXISTS nome_social TEXT,
ADD COLUMN IF NOT EXISTS sexo sexo DEFAULT 'Outro',
ADD COLUMN IF NOT EXISTS naturalidade TEXT,
ADD COLUMN IF NOT EXISTS nacionalidade TEXT DEFAULT 'Brasileira',
ADD COLUMN IF NOT EXISTS rg VARCHAR(20),
ADD COLUMN IF NOT EXISTS endereco JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS saude JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS responsaveis JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS nivel_id UUID REFERENCES public.niveis(id),
ADD COLUMN IF NOT EXISTS escola_origem TEXT,
ADD COLUMN IF NOT EXISTS ano_escolar TEXT;

-- 2. Expansão da tabela alunos (para paridade com formulário Admin)
ALTER TABLE public.alunos
ADD COLUMN IF NOT EXISTS rg VARCHAR(20),
ADD COLUMN IF NOT EXISTS doencas_cronicas TEXT,
ADD COLUMN IF NOT EXISTS hospital_preferencia TEXT,
ADD COLUMN IF NOT EXISTS autorizacao_medica BOOLEAN DEFAULT false;

-- 3. Atualização do ENUM status_pre_matricula_prd (se necessário)
-- Nota: O status 'enviado' é usado as vezes no frontend, mas no banco estamos usando 'em_analise' como padrão.
-- Se precisarmos de mais estados, usaríamos ALTER TYPE, mas 'em_analise', 'ativo', 'trancado', 'concluido' cobrem o ciclo.

-- 4. Indices para performance
CREATE INDEX IF NOT EXISTS idx_pre_matriculas_polo_id ON public.pre_matriculas(polo_id);
CREATE INDEX IF NOT EXISTS idx_pre_matriculas_nivel_id ON public.pre_matriculas(nivel_id);
CREATE INDEX IF NOT EXISTS idx_pre_matriculas_status ON public.pre_matriculas(status);

COMMENT ON TABLE public.pre_matriculas IS 'Tabela expandida para capturar todos os dados da Fase 4 (Alinhamento Global)';
