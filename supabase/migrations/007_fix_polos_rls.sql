-- ============================================
-- IBUC System - Correção RLS para Polos
-- Cria funções RPC para inserir/atualizar polos
-- que funcionam com autenticação customizada
-- ============================================

-- Função para inserir polo (com verificação de permissão via user_id)
CREATE OR REPLACE FUNCTION criar_polo(
  p_nome TEXT,
  p_codigo TEXT,
  p_cnpj TEXT DEFAULT NULL,
  p_endereco JSONB,
  p_telefone TEXT DEFAULT NULL,
  p_whatsapp TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  p_site TEXT DEFAULT NULL,
  p_status status_polo DEFAULT 'ativo',
  p_metadata JSONB DEFAULT NULL,
  p_user_id UUID DEFAULT NULL
)
RETURNS polos AS $$
DECLARE
  v_user_role TEXT;
  v_result polos;
BEGIN
  -- Verificar permissões do usuário
  IF p_user_id IS NOT NULL THEN
    SELECT role INTO v_user_role
    FROM usuarios
    WHERE id = p_user_id AND ativo = true;
    
    IF v_user_role IS NULL THEN
      RAISE EXCEPTION 'Usuário não encontrado ou inativo';
    END IF;
    
    IF v_user_role NOT IN ('super_admin', 'admin_geral') THEN
      RAISE EXCEPTION 'Usuário não tem permissão para criar polos. Apenas super_admin e admin_geral podem criar.';
    END IF;
  ELSE
    -- Se não passar user_id, permite apenas em desenvolvimento (sem RLS ativo)
    -- Em produção, isso deve ser bloqueado
    RAISE WARNING 'Criação de polo sem user_id - apenas para desenvolvimento';
  END IF;

  -- Inserir polo
  INSERT INTO polos (
    nome,
    codigo,
    cnpj,
    endereco,
    telefone,
    whatsapp,
    email,
    site,
    status,
    metadata
  ) VALUES (
    p_nome,
    p_codigo,
    p_cnpj,
    p_endereco,
    p_telefone,
    p_whatsapp,
    p_email,
    p_site,
    p_status,
    p_metadata
  )
  RETURNING * INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para atualizar polo (com verificação de permissão via user_id)
CREATE OR REPLACE FUNCTION atualizar_polo(
  p_id UUID,
  p_nome TEXT DEFAULT NULL,
  p_codigo TEXT DEFAULT NULL,
  p_cnpj TEXT DEFAULT NULL,
  p_endereco JSONB DEFAULT NULL,
  p_telefone TEXT DEFAULT NULL,
  p_whatsapp TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  p_site TEXT DEFAULT NULL,
  p_status status_polo DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL,
  p_user_id UUID DEFAULT NULL
)
RETURNS polos AS $$
DECLARE
  v_user_role TEXT;
  v_user_polo_id UUID;
  v_result polos;
BEGIN
  -- Verificar permissões do usuário
  IF p_user_id IS NOT NULL THEN
    SELECT role, polo_id INTO v_user_role, v_user_polo_id
    FROM usuarios
    WHERE id = p_user_id AND ativo = true;
    
    IF v_user_role IS NULL THEN
      RAISE EXCEPTION 'Usuário não encontrado ou inativo';
    END IF;
    
    -- Super admin e admin_geral podem atualizar qualquer polo
    -- Diretor do polo pode atualizar apenas seu próprio polo
    IF v_user_role NOT IN ('super_admin', 'admin_geral') THEN
      IF v_user_role = 'diretor_polo' AND v_user_polo_id != p_id THEN
        RAISE EXCEPTION 'Usuário não tem permissão para atualizar este polo';
      END IF;
      
      IF v_user_role NOT IN ('diretor_polo') THEN
        RAISE EXCEPTION 'Usuário não tem permissão para atualizar polos';
      END IF;
    END IF;
  ELSE
    RAISE WARNING 'Atualização de polo sem user_id - apenas para desenvolvimento';
  END IF;

  -- Atualizar polo apenas com campos fornecidos
  UPDATE polos
  SET
    nome = COALESCE(p_nome, nome),
    codigo = COALESCE(p_codigo, codigo),
    cnpj = COALESCE(p_cnpj, cnpj),
    endereco = COALESCE(p_endereco, endereco),
    telefone = COALESCE(p_telefone, telefone),
    whatsapp = COALESCE(p_whatsapp, whatsapp),
    email = COALESCE(p_email, email),
    site = COALESCE(p_site, site),
    status = COALESCE(p_status, status),
    metadata = COALESCE(p_metadata, metadata),
    updated_at = NOW()
  WHERE id = p_id
  RETURNING * INTO v_result;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Polo não encontrado';
  END IF;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Adicionar políticas de UPDATE para polos
DROP POLICY IF EXISTS "Super admin e admin_geral podem atualizar polos" ON polos;
CREATE POLICY "Super admin e admin_geral podem atualizar polos"
  ON polos FOR UPDATE
  USING (
    is_super_admin() OR
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid()::UUID AND role = 'admin_geral')
  )
  WITH CHECK (
    is_super_admin() OR
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid()::UUID AND role = 'admin_geral')
  );

-- Adicionar política para diretor do polo atualizar seu próprio polo
DROP POLICY IF EXISTS "Diretor pode atualizar seu próprio polo" ON polos;
CREATE POLICY "Diretor pode atualizar seu próprio polo"
  ON polos FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid()::UUID 
      AND role = 'diretor_polo'
      AND polo_id = polos.id
      AND ativo = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid()::UUID 
      AND role = 'diretor_polo'
      AND polo_id = polos.id
      AND ativo = true
    )
  );

-- Comentários explicativos
COMMENT ON FUNCTION criar_polo IS 'Cria um novo polo verificando permissões do usuário. Usa SECURITY DEFINER para bypassar RLS.';
COMMENT ON FUNCTION atualizar_polo IS 'Atualiza um polo existente verificando permissões do usuário. Usa SECURITY DEFINER para bypassar RLS.';

