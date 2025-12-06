-- ============================================
-- IBUC System - Schema Inicial
-- Multi-tenant com RLS (Row Level Security)
-- ============================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE status_polo AS ENUM ('ativo', 'inativo');
CREATE TYPE role_usuario AS ENUM (
  'super_admin',
  'admin_geral',
  'diretor_geral',
  'coordenador_geral',
  'diretor_polo',
  'coordenador_polo',
  'secretario_polo',
  'tesoureiro',
  'professor',
  'auxiliar',
  'responsavel',
  'aluno'
);
CREATE TYPE status_aluno AS ENUM ('pendente', 'ativo', 'inativo', 'concluido');
CREATE TYPE sexo AS ENUM ('M', 'F', 'Outro');
CREATE TYPE tipo_parentesco AS ENUM ('pai', 'mae', 'tutor', 'outro');
CREATE TYPE turno AS ENUM ('manha', 'tarde', 'noite');
CREATE TYPE status_turma AS ENUM ('ativa', 'inativa', 'concluida');
CREATE TYPE status_matricula AS ENUM ('pendente', 'em_analise', 'ativa', 'recusada', 'cancelada');
CREATE TYPE tipo_matricula AS ENUM ('online', 'presencial');
CREATE TYPE status_presenca AS ENUM ('presente', 'falta', 'justificativa', 'atraso');
CREATE TYPE tipo_conteudo AS ENUM ('pdf', 'video', 'atividade', 'link');
CREATE TYPE status_mensalidade AS ENUM ('pendente', 'pago', 'vencido');
CREATE TYPE metodo_pagamento AS ENUM ('pix', 'boleto', 'cartao', 'presencial');
CREATE TYPE status_pagamento AS ENUM ('pending', 'success', 'failed');
CREATE TYPE tipo_notificacao AS ENUM ('sistema', 'aviso_polo', 'aviso_turma');
CREATE TYPE tipo_consentimento AS ENUM ('uso_imagem', 'tratamento_dados', 'comunicacao', 'outros');
CREATE TYPE tipo_documento AS ENUM ('certidao', 'rg', 'cpf', 'comprovante_residencia', 'laudo', 'outro');
CREATE TYPE owner_type AS ENUM ('aluno', 'responsavel', 'usuario');

-- ============================================
-- TABELAS PRINCIPAIS
-- ============================================

-- 1. POLOS
CREATE TABLE polos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  cnpj VARCHAR(18),
  endereco JSONB NOT NULL, -- {cep, rua, numero, complemento, bairro, cidade, estado}
  telefone VARCHAR(20),
  whatsapp VARCHAR(20),
  email VARCHAR(255),
  site VARCHAR(255),
  horarios_funcionamento JSONB,
  capacidade_maxima INTEGER,
  logo_url TEXT,
  diretor_id UUID,
  status status_polo DEFAULT 'ativo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. USUARIOS
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT, -- Para usuários não-Supabase Auth
  nome_completo TEXT NOT NULL,
  cpf VARCHAR(14),
  telefone VARCHAR(20),
  role role_usuario NOT NULL,
  polo_id UUID REFERENCES polos(id) ON DELETE SET NULL,
  ativo BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_polo FOREIGN KEY (polo_id) REFERENCES polos(id)
);

-- 3. NIVELS
CREATE TABLE niveis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  idade_min INTEGER NOT NULL,
  idade_max INTEGER NOT NULL,
  descricao TEXT,
  ordem INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. MODULOS
CREATE TABLE modulos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero INTEGER NOT NULL CHECK (numero >= 1 AND numero <= 10),
  titulo TEXT NOT NULL,
  descricao TEXT,
  duracao_sugestiva INTEGER, -- em horas
  requisitos TEXT,
  objetivos TEXT,
  carga_horaria INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(numero)
);

-- 5. TURMAS
CREATE TABLE turmas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  polo_id UUID NOT NULL REFERENCES polos(id) ON DELETE CASCADE,
  nivel_id UUID NOT NULL REFERENCES niveis(id),
  modulo_atual_id UUID REFERENCES modulos(id),
  professor_id UUID REFERENCES usuarios(id),
  coordenador_id UUID REFERENCES usuarios(id),
  capacidade INTEGER NOT NULL CHECK (capacidade > 0),
  ano_letivo INTEGER NOT NULL,
  turno turno NOT NULL,
  dias_semana INTEGER[], -- [1,2,3,4,5] para segunda a sexta
  horario_inicio TIME,
  horario_fim TIME,
  local TEXT,
  status status_turma DEFAULT 'ativa',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_polo FOREIGN KEY (polo_id) REFERENCES polos(id),
  CONSTRAINT fk_professor FOREIGN KEY (professor_id) REFERENCES usuarios(id),
  CONSTRAINT fk_coordenador FOREIGN KEY (coordenador_id) REFERENCES usuarios(id)
);

-- 6. RESPONSAVEIS
CREATE TABLE responsaveis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  cpf VARCHAR(14),
  rg VARCHAR(20),
  data_nascimento DATE,
  telefone1 VARCHAR(20) NOT NULL,
  telefone2 VARCHAR(20),
  email VARCHAR(255),
  endereco JSONB,
  tipo_parentesco tipo_parentesco NOT NULL,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. ALUNOS
CREATE TABLE alunos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  nome_social TEXT,
  data_nascimento DATE NOT NULL,
  sexo sexo NOT NULL,
  nacionalidade TEXT DEFAULT 'Brasileira',
  naturalidade TEXT,
  cpf VARCHAR(14),
  certidao_numero VARCHAR(50),
  endereco JSONB NOT NULL,
  foto_url TEXT,
  polo_id UUID NOT NULL REFERENCES polos(id) ON DELETE CASCADE,
  turma_id UUID REFERENCES turmas(id) ON DELETE SET NULL,
  nivel_atual_id UUID NOT NULL REFERENCES niveis(id),
  status status_aluno DEFAULT 'pendente',
  observacoes TEXT,
  -- Dados de saúde
  alergias TEXT,
  restricao_alimentar TEXT,
  medicacao_continua TEXT,
  contato_emergencia_nome TEXT,
  contato_emergencia_telefone VARCHAR(20),
  convenio_medico TEXT,
  observacoes_medicas TEXT,
  -- Dados escolares
  escola_atual TEXT,
  serie TEXT,
  dificuldades_aprendizagem BOOLEAN DEFAULT false,
  descricao_dificuldades TEXT,
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_polo FOREIGN KEY (polo_id) REFERENCES polos(id),
  CONSTRAINT fk_turma FOREIGN KEY (turma_id) REFERENCES turmas(id),
  CONSTRAINT fk_nivel FOREIGN KEY (nivel_atual_id) REFERENCES niveis(id)
);

-- 8. ALUNO_RESPONSAVEL (N:N)
CREATE TABLE aluno_responsavel (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  aluno_id UUID NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  responsavel_id UUID NOT NULL REFERENCES responsaveis(id) ON DELETE CASCADE,
  autorizado_retirada BOOLEAN DEFAULT true,
  observacao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(aluno_id, responsavel_id)
);

-- 9. MATRICULAS
CREATE TABLE matriculas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  aluno_id UUID NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  turma_id UUID REFERENCES turmas(id) ON DELETE SET NULL,
  polo_id UUID NOT NULL REFERENCES polos(id) ON DELETE CASCADE,
  data_matricula TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tipo tipo_matricula NOT NULL,
  status status_matricula DEFAULT 'pendente',
  origem VARCHAR(50), -- 'site', 'presencial'
  protocolo VARCHAR(50) UNIQUE NOT NULL,
  created_by UUID REFERENCES usuarios(id),
  approved_by UUID REFERENCES usuarios(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  motivo_recusa TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_polo FOREIGN KEY (polo_id) REFERENCES polos(id),
  CONSTRAINT fk_aluno FOREIGN KEY (aluno_id) REFERENCES alunos(id),
  CONSTRAINT fk_turma FOREIGN KEY (turma_id) REFERENCES turmas(id)
);

-- 10. LICOES
CREATE TABLE licoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  modulo_id UUID NOT NULL REFERENCES modulos(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  ordem INTEGER NOT NULL,
  video_url TEXT,
  material_pdf_url TEXT,
  liberacao_data DATE,
  duracao_minutos INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_modulo FOREIGN KEY (modulo_id) REFERENCES modulos(id)
);

-- 11. CONTEUDOS
CREATE TABLE conteudos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  licao_id UUID NOT NULL REFERENCES licoes(id) ON DELETE CASCADE,
  tipo tipo_conteudo NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  url TEXT,
  anexos JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_licao FOREIGN KEY (licao_id) REFERENCES licoes(id)
);

-- 12. PRESENCAS
CREATE TABLE presencas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  aluno_id UUID NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  turma_id UUID NOT NULL REFERENCES turmas(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  status status_presenca NOT NULL,
  lancado_por UUID NOT NULL REFERENCES usuarios(id),
  observacao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(aluno_id, turma_id, data),
  CONSTRAINT fk_aluno FOREIGN KEY (aluno_id) REFERENCES alunos(id),
  CONSTRAINT fk_turma FOREIGN KEY (turma_id) REFERENCES turmas(id)
);

-- 13. AVALIACOES
CREATE TABLE avaliacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  turma_id UUID NOT NULL REFERENCES turmas(id) ON DELETE CASCADE,
  modulo_id UUID REFERENCES modulos(id),
  titulo TEXT NOT NULL,
  descricao TEXT,
  data_avaliacao DATE NOT NULL,
  peso DECIMAL(5,2) DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_turma FOREIGN KEY (turma_id) REFERENCES turmas(id)
);

-- 14. NOTAS
CREATE TABLE notas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  avaliacao_id UUID NOT NULL REFERENCES avaliacoes(id) ON DELETE CASCADE,
  aluno_id UUID NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  nota DECIMAL(5,2) NOT NULL CHECK (nota >= 0 AND nota <= 10),
  comentario TEXT,
  lancado_por UUID NOT NULL REFERENCES usuarios(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(avaliacao_id, aluno_id),
  CONSTRAINT fk_avaliacao FOREIGN KEY (avaliacao_id) REFERENCES avaliacoes(id),
  CONSTRAINT fk_aluno FOREIGN KEY (aluno_id) REFERENCES alunos(id)
);

-- 15. BOLETINS
CREATE TABLE boletins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  aluno_id UUID NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  periodo TEXT NOT NULL,
  nota_final DECIMAL(5,2),
  situacao VARCHAR(20), -- 'aprovado', 'recuperacao', 'reprovado'
  observacoes TEXT,
  gerado_por UUID REFERENCES usuarios(id),
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  pdf_url TEXT,
  CONSTRAINT fk_aluno FOREIGN KEY (aluno_id) REFERENCES alunos(id)
);

-- 16. DOCUMENTOS
CREATE TABLE documentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_type owner_type NOT NULL,
  owner_id UUID NOT NULL,
  tipo_documento tipo_documento NOT NULL,
  url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  validade DATE,
  uploaded_by UUID REFERENCES usuarios(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  validado BOOLEAN DEFAULT false,
  validado_por UUID REFERENCES usuarios(id),
  validado_em TIMESTAMP WITH TIME ZONE
);

-- 17. MENSALIDADES
CREATE TABLE mensalidades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  aluno_id UUID NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  polo_id UUID NOT NULL REFERENCES polos(id) ON DELETE CASCADE,
  valor_cents INTEGER NOT NULL,
  vencimento DATE NOT NULL,
  status status_mensalidade DEFAULT 'pendente',
  desconto_cents INTEGER DEFAULT 0,
  juros_cents INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  pago_em TIMESTAMP WITH TIME ZONE,
  comprovante_url TEXT,
  CONSTRAINT fk_aluno FOREIGN KEY (aluno_id) REFERENCES alunos(id),
  CONSTRAINT fk_polo FOREIGN KEY (polo_id) REFERENCES polos(id)
);

-- 18. PAGAMENTOS
CREATE TABLE pagamentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mensalidade_id UUID NOT NULL REFERENCES mensalidades(id) ON DELETE CASCADE,
  metodo metodo_pagamento NOT NULL,
  transacao_id_gateway TEXT,
  valor_cents INTEGER NOT NULL,
  status_gateway status_pagamento DEFAULT 'pending',
  recebido_por UUID REFERENCES usuarios(id),
  data_recebimento TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  comprovante_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_mensalidade FOREIGN KEY (mensalidade_id) REFERENCES mensalidades(id)
);

-- 19. NOTIFICACOES
CREATE TABLE notificacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  tipo tipo_notificacao NOT NULL,
  target_id UUID, -- pode ser polo_id, turma_id, aluno_id, etc
  enviado BOOLEAN DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 20. CONSENTS (LGPD)
CREATE TABLE consents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_type owner_type NOT NULL,
  subject_id UUID NOT NULL,
  consent_type tipo_consentimento NOT NULL,
  version TEXT NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_ip INET,
  accepted_user_agent TEXT,
  revoked_at TIMESTAMP WITH TIME ZONE
);

-- 21. AUDIT_LOGS
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete', 'view'
  payload JSONB,
  user_id UUID REFERENCES usuarios(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES
-- ============================================

CREATE INDEX idx_polos_codigo ON polos(codigo);
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_polo_id ON usuarios(polo_id);
CREATE INDEX idx_usuarios_role ON usuarios(role);
CREATE INDEX idx_alunos_polo_id ON alunos(polo_id);
CREATE INDEX idx_alunos_turma_id ON alunos(turma_id);
CREATE INDEX idx_alunos_status ON alunos(status);
CREATE INDEX idx_matriculas_polo_id ON matriculas(polo_id);
CREATE INDEX idx_matriculas_status ON matriculas(status);
CREATE INDEX idx_matriculas_protocolo ON matriculas(protocolo);
CREATE INDEX idx_presencas_aluno_id ON presencas(aluno_id);
CREATE INDEX idx_presencas_turma_id ON presencas(turma_id);
CREATE INDEX idx_presencas_data ON presencas(data);
CREATE INDEX idx_mensalidades_aluno_id ON mensalidades(aluno_id);
CREATE INDEX idx_mensalidades_status ON mensalidades(status);
CREATE INDEX idx_mensalidades_vencimento ON mensalidades(vencimento);
CREATE INDEX idx_documentos_owner ON documentos(owner_type, owner_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity, entity_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================
-- TRIGGERS
-- ============================================

-- Atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_polos_updated_at BEFORE UPDATE ON polos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_responsaveis_updated_at BEFORE UPDATE ON responsaveis
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alunos_updated_at BEFORE UPDATE ON alunos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Gerar protocolo único para matrícula
CREATE OR REPLACE FUNCTION generate_matricula_protocolo()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.protocolo IS NULL OR NEW.protocolo = '' THEN
    NEW.protocolo := 'IBUC-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTRING(NEW.id::TEXT, 1, 8);
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER generate_protocolo BEFORE INSERT ON matriculas
  FOR EACH ROW EXECUTE FUNCTION generate_matricula_protocolo();

-- Atualizar status de mensalidade quando pagamento é confirmado
CREATE OR REPLACE FUNCTION update_mensalidade_on_payment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status_gateway = 'success' THEN
    UPDATE mensalidades
    SET status = 'pago',
        pago_em = NEW.data_recebimento,
        comprovante_url = COALESCE(NEW.comprovante_url, comprovante_url)
    WHERE id = NEW.mensalidade_id;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_mensalidade_status AFTER INSERT OR UPDATE ON pagamentos
  FOR EACH ROW EXECUTE FUNCTION update_mensalidade_on_payment();

-- ============================================
-- VIEWS
-- ============================================

-- View: Progresso do aluno por módulos
CREATE OR REPLACE VIEW vw_aluno_progresso AS
SELECT 
  a.id AS aluno_id,
  a.nome AS aluno_nome,
  a.polo_id,
  m.id AS modulo_id,
  m.numero AS modulo_numero,
  m.titulo AS modulo_titulo,
  COUNT(DISTINCT l.id) AS total_licoes,
  COUNT(DISTINCT CASE WHEN pr.id IS NOT NULL THEN l.id END) AS licoes_concluidas,
  CASE 
    WHEN COUNT(DISTINCT l.id) > 0 
    THEN ROUND((COUNT(DISTINCT CASE WHEN pr.id IS NOT NULL THEN l.id END)::DECIMAL / COUNT(DISTINCT l.id)) * 100, 2)
    ELSE 0 
  END AS percentual_conclusao
FROM alunos a
CROSS JOIN modulos m
LEFT JOIN licoes l ON l.modulo_id = m.id
LEFT JOIN presencas pr ON pr.aluno_id = a.id AND pr.status = 'presente'
GROUP BY a.id, a.nome, a.polo_id, m.id, m.numero, m.titulo;

-- View: Resumo financeiro por aluno
CREATE OR REPLACE VIEW vw_resumo_financeiro_aluno AS
SELECT 
  a.id AS aluno_id,
  a.nome AS aluno_nome,
  a.polo_id,
  COUNT(m.id) AS total_mensalidades,
  COUNT(CASE WHEN m.status = 'pago' THEN 1 END) AS mensalidades_pagas,
  COUNT(CASE WHEN m.status = 'pendente' THEN 1 END) AS mensalidades_pendentes,
  COUNT(CASE WHEN m.status = 'vencido' THEN 1 END) AS mensalidades_vencidas,
  SUM(m.valor_cents) AS total_devido_cents,
  SUM(CASE WHEN m.status = 'pago' THEN m.valor_cents ELSE 0 END) AS total_pago_cents,
  SUM(CASE WHEN m.status = 'pendente' OR m.status = 'vencido' THEN m.valor_cents ELSE 0 END) AS total_pendente_cents
FROM alunos a
LEFT JOIN mensalidades m ON m.aluno_id = a.id
GROUP BY a.id, a.nome, a.polo_id;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE polos ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE responsaveis ENABLE ROW LEVEL SECURITY;
ALTER TABLE aluno_responsavel ENABLE ROW LEVEL SECURITY;
ALTER TABLE turmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE matriculas ENABLE ROW LEVEL SECURITY;
ALTER TABLE presencas ENABLE ROW LEVEL SECURITY;
ALTER TABLE avaliacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notas ENABLE ROW LEVEL SECURITY;
ALTER TABLE boletins ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensalidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Função auxiliar para obter polo_id do usuário atual
CREATE OR REPLACE FUNCTION get_user_polo_id()
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT polo_id FROM usuarios WHERE id = auth.uid()::UUID);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função auxiliar para verificar se é super_admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM usuarios 
    WHERE id = auth.uid()::UUID 
    AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policies para POLOS
CREATE POLICY "Super admin pode ver todos os polos"
  ON polos FOR SELECT
  USING (is_super_admin());

CREATE POLICY "Usuários podem ver polos do seu tenant"
  ON polos FOR SELECT
  USING (
    is_super_admin() OR
    id = get_user_polo_id() OR
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid()::UUID AND role IN ('admin_geral', 'diretor_geral'))
  );

CREATE POLICY "Super admin e admin_geral podem inserir polos"
  ON polos FOR INSERT
  WITH CHECK (
    is_super_admin() OR
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid()::UUID AND role = 'admin_geral')
  );

-- Policies para ALUNOS
CREATE POLICY "Super admin pode ver todos os alunos"
  ON alunos FOR SELECT
  USING (is_super_admin());

CREATE POLICY "Usuários podem ver alunos do seu polo"
  ON alunos FOR SELECT
  USING (
    is_super_admin() OR
    polo_id = get_user_polo_id() OR
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid()::UUID 
      AND (role IN ('admin_geral', 'diretor_geral') OR (role IN ('diretor_polo', 'coordenador_polo', 'secretario_polo', 'professor') AND polo_id = alunos.polo_id))
    )
  );

CREATE POLICY "Secretários e diretores podem inserir alunos no seu polo"
  ON alunos FOR INSERT
  WITH CHECK (
    is_super_admin() OR
    (polo_id = get_user_polo_id() AND EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid()::UUID 
      AND role IN ('diretor_polo', 'secretario_polo', 'admin_geral')
    ))
  );

CREATE POLICY "Secretários e diretores podem atualizar alunos do seu polo"
  ON alunos FOR UPDATE
  USING (
    is_super_admin() OR
    (polo_id = get_user_polo_id() AND EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid()::UUID 
      AND role IN ('diretor_polo', 'secretario_polo', 'admin_geral')
    ))
  );

-- Policies para MATRICULAS
CREATE POLICY "Usuários podem ver matrículas do seu polo"
  ON matriculas FOR SELECT
  USING (
    is_super_admin() OR
    polo_id = get_user_polo_id() OR
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid()::UUID 
      AND (role IN ('admin_geral', 'diretor_geral') OR (role IN ('diretor_polo', 'coordenador_polo', 'secretario_polo') AND polo_id = matriculas.polo_id))
    )
  );

CREATE POLICY "Secretários podem criar matrículas no seu polo"
  ON matriculas FOR INSERT
  WITH CHECK (
    is_super_admin() OR
    (polo_id = get_user_polo_id() AND EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid()::UUID 
      AND role IN ('diretor_polo', 'secretario_polo', 'admin_geral')
    ))
  );

-- Policies para PRESENCAS
CREATE POLICY "Professores podem ver presenças das suas turmas"
  ON presencas FOR SELECT
  USING (
    is_super_admin() OR
    EXISTS (
      SELECT 1 FROM turmas t
      JOIN usuarios u ON u.id = auth.uid()::UUID
      WHERE t.id = presencas.turma_id
      AND (t.professor_id = u.id OR u.role IN ('diretor_polo', 'coordenador_polo', 'admin_geral'))
      AND (u.polo_id = (SELECT polo_id FROM alunos WHERE id = presencas.aluno_id) OR u.role IN ('admin_geral', 'diretor_geral'))
    )
  );

CREATE POLICY "Professores podem inserir presenças nas suas turmas"
  ON presencas FOR INSERT
  WITH CHECK (
    is_super_admin() OR
    EXISTS (
      SELECT 1 FROM turmas t
      JOIN usuarios u ON u.id = auth.uid()::UUID
      WHERE t.id = presencas.turma_id
      AND (t.professor_id = u.id OR u.role IN ('diretor_polo', 'coordenador_polo', 'admin_geral'))
    )
  );

-- Policies para MENSALIDADES
CREATE POLICY "Usuários podem ver mensalidades do seu polo"
  ON mensalidades FOR SELECT
  USING (
    is_super_admin() OR
    polo_id = get_user_polo_id() OR
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid()::UUID 
      AND (role IN ('admin_geral', 'diretor_geral') OR (role IN ('diretor_polo', 'secretario_polo', 'tesoureiro') AND polo_id = mensalidades.polo_id))
    )
  );

-- Policies para DOCUMENTOS
CREATE POLICY "Usuários podem ver documentos relacionados ao seu polo"
  ON documentos FOR SELECT
  USING (
    is_super_admin() OR
    EXISTS (
      SELECT 1 FROM alunos a
      JOIN usuarios u ON u.id = auth.uid()::UUID
      WHERE documentos.owner_type = 'aluno'
      AND documentos.owner_id = a.id
      AND (a.polo_id = u.polo_id OR u.role IN ('admin_geral', 'diretor_geral'))
    ) OR
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE documentos.owner_type = 'usuario'
      AND documentos.owner_id = u.id
      AND (u.polo_id = (SELECT polo_id FROM usuarios WHERE id = auth.uid()::UUID) OR EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid()::UUID AND role IN ('admin_geral', 'diretor_geral')))
    )
  );

-- ============================================
-- COMENTÁRIOS
-- ============================================

COMMENT ON TABLE polos IS 'Tabela de polos (congregações) - tenant principal';
COMMENT ON TABLE usuarios IS 'Usuários do sistema com diferentes roles e permissões';
COMMENT ON TABLE alunos IS 'Alunos cadastrados no sistema, vinculados a um polo';
COMMENT ON TABLE matriculas IS 'Matrículas de alunos, podem ser online (pré-matrícula) ou presencial';
COMMENT ON TABLE presencas IS 'Registro de presença dos alunos nas aulas';
COMMENT ON TABLE mensalidades IS 'Mensalidades dos alunos';
COMMENT ON TABLE documentos IS 'Documentos dos alunos, responsáveis e usuários';
COMMENT ON TABLE consents IS 'Consentimentos LGPD armazenados com versão e metadados';

