-- ============================================
-- IBUC System - Tabelas de Diretorias
-- Estrutura profissional e segura para gestão de diretorias
-- ============================================

-- ============================================
-- ENUMS ADICIONAIS
-- ============================================

-- Criar ENUMs apenas se não existirem
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_diretoria') THEN
        CREATE TYPE status_diretoria AS ENUM ('ativa', 'inativa', 'suspensa');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_cargo_diretoria') THEN
        CREATE TYPE tipo_cargo_diretoria AS ENUM ('diretor', 'vice_diretor', 'coordenador', 'vice_coordenador', 'secretario', 'tesoureiro');
    END IF;
END $$;

-- ============================================
-- TABELA: DIRETORIA_GERAL
-- ============================================

CREATE TABLE IF NOT EXISTS diretoria_geral (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
  cargo tipo_cargo_diretoria NOT NULL,
  nome_completo TEXT NOT NULL,
  cpf VARCHAR(14),
  rg VARCHAR(20),
  data_nascimento DATE,
  telefone VARCHAR(20),
  email VARCHAR(255) NOT NULL,
  endereco JSONB,
  foto_url TEXT,
  
  -- Dados profissionais
  formacao_academica TEXT,
  formacao_teologica TEXT,
  experiencia TEXT,
  tempo_servico INTEGER, -- em meses
  
  -- Período de gestão
  data_inicio DATE NOT NULL,
  data_fim DATE, -- NULL se ainda está ativo
  status status_diretoria DEFAULT 'ativa',
  
  -- Metadados
  observacoes TEXT,
  created_by UUID REFERENCES usuarios(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT fk_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES usuarios(id)
);

-- ============================================
-- TABELA: DIRETORIA_POLO
-- ============================================

CREATE TABLE IF NOT EXISTS diretoria_polo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  polo_id UUID NOT NULL REFERENCES polos(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
  cargo tipo_cargo_diretoria NOT NULL,
  nome_completo TEXT NOT NULL,
  cpf VARCHAR(14),
  rg VARCHAR(20),
  data_nascimento DATE,
  telefone VARCHAR(20),
  email VARCHAR(255) NOT NULL,
  endereco JSONB,
  foto_url TEXT,
  
  -- Dados profissionais
  formacao_academica TEXT,
  formacao_teologica TEXT,
  experiencia TEXT,
  tempo_servico INTEGER, -- em meses
  
  -- Período de gestão
  data_inicio DATE NOT NULL,
  data_fim DATE, -- NULL se ainda está ativo
  status status_diretoria DEFAULT 'ativa',
  
  -- Metadados
  observacoes TEXT,
  created_by UUID REFERENCES usuarios(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT fk_polo FOREIGN KEY (polo_id) REFERENCES polos(id),
  CONSTRAINT fk_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES usuarios(id)
);

-- ============================================
-- ÍNDICES
-- ============================================

-- Criar índices apenas se não existirem
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_diretoria_geral_usuario_id') THEN
        CREATE INDEX idx_diretoria_geral_usuario_id ON diretoria_geral(usuario_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_diretoria_geral_status') THEN
        CREATE INDEX idx_diretoria_geral_status ON diretoria_geral(status);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_diretoria_geral_cargo') THEN
        CREATE INDEX idx_diretoria_geral_cargo ON diretoria_geral(cargo);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_diretoria_geral_data_inicio') THEN
        CREATE INDEX idx_diretoria_geral_data_inicio ON diretoria_geral(data_inicio);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_diretoria_polo_polo_id') THEN
        CREATE INDEX idx_diretoria_polo_polo_id ON diretoria_polo(polo_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_diretoria_polo_usuario_id') THEN
        CREATE INDEX idx_diretoria_polo_usuario_id ON diretoria_polo(usuario_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_diretoria_polo_status') THEN
        CREATE INDEX idx_diretoria_polo_status ON diretoria_polo(status);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_diretoria_polo_cargo') THEN
        CREATE INDEX idx_diretoria_polo_cargo ON diretoria_polo(cargo);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_diretoria_polo_data_inicio') THEN
        CREATE INDEX idx_diretoria_polo_data_inicio ON diretoria_polo(data_inicio);
    END IF;
END $$;

-- Índice único para garantir apenas um diretor ativo por polo
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'unique_diretor_ativo_polo') THEN
        CREATE UNIQUE INDEX unique_diretor_ativo_polo 
          ON diretoria_polo(polo_id) 
          WHERE cargo = 'diretor' AND status = 'ativa' AND data_fim IS NULL;
    END IF;
END $$;

-- ============================================
-- TRIGGERS
-- ============================================

-- Atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS update_diretoria_geral_updated_at ON diretoria_geral;
CREATE TRIGGER update_diretoria_geral_updated_at 
  BEFORE UPDATE ON diretoria_geral
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_diretoria_polo_updated_at ON diretoria_polo;
CREATE TRIGGER update_diretoria_polo_updated_at 
  BEFORE UPDATE ON diretoria_polo
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para atualizar diretor_id na tabela polos quando diretor é criado/atualizado
CREATE OR REPLACE FUNCTION update_polo_diretor_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.cargo = 'diretor' AND NEW.status = 'ativa' AND NEW.data_fim IS NULL THEN
    UPDATE polos 
    SET diretor_id = NEW.usuario_id 
    WHERE id = NEW.polo_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_polo_diretor_on_diretoria_polo ON diretoria_polo;
CREATE TRIGGER update_polo_diretor_on_diretoria_polo
  AFTER INSERT OR UPDATE ON diretoria_polo
  FOR EACH ROW
  WHEN (NEW.cargo = 'diretor' AND NEW.status = 'ativa')
  EXECUTE FUNCTION update_polo_diretor_id();

-- ============================================
-- VIEWS
-- ============================================

-- View: Diretorias ativas
CREATE OR REPLACE VIEW vw_diretoria_ativa AS
SELECT 
  'geral' as tipo,
  dg.id,
  dg.usuario_id,
  NULL::UUID as polo_id,
  dg.cargo,
  dg.nome_completo,
  dg.email,
  dg.telefone,
  dg.data_inicio,
  dg.data_fim,
  dg.status,
  dg.created_at
FROM diretoria_geral dg
WHERE dg.status = 'ativa' AND dg.data_fim IS NULL

UNION ALL

SELECT 
  'polo' as tipo,
  dp.id,
  dp.usuario_id,
  dp.polo_id,
  dp.cargo,
  dp.nome_completo,
  dp.email,
  dp.telefone,
  dp.data_inicio,
  dp.data_fim,
  dp.status,
  dp.created_at
FROM diretoria_polo dp
WHERE dp.status = 'ativa' AND dp.data_fim IS NULL;

-- View: Histórico completo de diretorias
CREATE OR REPLACE VIEW vw_historico_diretoria AS
SELECT 
  'geral' as tipo,
  dg.id,
  dg.usuario_id,
  NULL::UUID as polo_id,
  NULL::TEXT as polo_nome,
  dg.cargo,
  dg.nome_completo,
  dg.email,
  dg.data_inicio,
  dg.data_fim,
  dg.status,
  dg.created_at
FROM diretoria_geral dg

UNION ALL

SELECT 
  'polo' as tipo,
  dp.id,
  dp.usuario_id,
  dp.polo_id,
  p.nome as polo_nome,
  dp.cargo,
  dp.nome_completo,
  dp.email,
  dp.data_inicio,
  dp.data_fim,
  dp.status,
  dp.created_at
FROM diretoria_polo dp
LEFT JOIN polos p ON p.id = dp.polo_id;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE diretoria_geral ENABLE ROW LEVEL SECURITY;
ALTER TABLE diretoria_polo ENABLE ROW LEVEL SECURITY;

-- Policies para DIRETORIA_GERAL
DROP POLICY IF EXISTS "Super admin pode ver todas as diretorias gerais" ON diretoria_geral;
CREATE POLICY "Super admin pode ver todas as diretorias gerais"
  ON diretoria_geral FOR SELECT
  USING (is_super_admin());

DROP POLICY IF EXISTS "Admin geral e diretor geral podem ver diretorias gerais" ON diretoria_geral;
CREATE POLICY "Admin geral e diretor geral podem ver diretorias gerais"
  ON diretoria_geral FOR SELECT
  USING (
    is_super_admin() OR
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid()::UUID 
      AND role IN ('admin_geral', 'diretor_geral')
    )
  );

DROP POLICY IF EXISTS "Super admin e admin geral podem inserir diretorias gerais" ON diretoria_geral;
CREATE POLICY "Super admin e admin geral podem inserir diretorias gerais"
  ON diretoria_geral FOR INSERT
  WITH CHECK (
    is_super_admin() OR
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid()::UUID 
      AND role = 'admin_geral'
    )
  );

DROP POLICY IF EXISTS "Super admin e admin geral podem atualizar diretorias gerais" ON diretoria_geral;
CREATE POLICY "Super admin e admin geral podem atualizar diretorias gerais"
  ON diretoria_geral FOR UPDATE
  USING (
    is_super_admin() OR
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid()::UUID 
      AND role = 'admin_geral'
    )
  );

-- Policies para DIRETORIA_POLO
DROP POLICY IF EXISTS "Super admin pode ver todas as diretorias de polos" ON diretoria_polo;
CREATE POLICY "Super admin pode ver todas as diretorias de polos"
  ON diretoria_polo FOR SELECT
  USING (is_super_admin());

DROP POLICY IF EXISTS "Usuários podem ver diretorias do seu polo" ON diretoria_polo;
CREATE POLICY "Usuários podem ver diretorias do seu polo"
  ON diretoria_polo FOR SELECT
  USING (
    is_super_admin() OR
    polo_id = get_user_polo_id() OR
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid()::UUID 
      AND role IN ('admin_geral', 'diretor_geral')
    )
  );

DROP POLICY IF EXISTS "Diretores e admin geral podem inserir diretorias de polos" ON diretoria_polo;
CREATE POLICY "Diretores e admin geral podem inserir diretorias de polos"
  ON diretoria_polo FOR INSERT
  WITH CHECK (
    is_super_admin() OR
    (polo_id = get_user_polo_id() AND EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid()::UUID 
      AND role IN ('diretor_polo', 'admin_geral')
    )) OR
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid()::UUID 
      AND role = 'admin_geral'
    )
  );

DROP POLICY IF EXISTS "Diretores e admin geral podem atualizar diretorias de polos" ON diretoria_polo;
CREATE POLICY "Diretores e admin geral podem atualizar diretorias de polos"
  ON diretoria_polo FOR UPDATE
  USING (
    is_super_admin() OR
    (polo_id = get_user_polo_id() AND EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid()::UUID 
      AND role IN ('diretor_polo', 'admin_geral')
    )) OR
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid()::UUID 
      AND role = 'admin_geral'
    )
  );

-- ============================================
-- COMENTÁRIOS
-- ============================================

COMMENT ON TABLE diretoria_geral IS 'Tabela dedicada para gestão de diretorias gerais do sistema';
COMMENT ON TABLE diretoria_polo IS 'Tabela dedicada para gestão de diretorias dos polos';
COMMENT ON VIEW vw_diretoria_ativa IS 'View com todas as diretorias ativas (geral e polos)';
COMMENT ON VIEW vw_historico_diretoria IS 'View com histórico completo de todas as diretorias';

