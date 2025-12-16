-- FASE 4 - PRÉ-MATRÍCULA PÚBLICA
-- SQL Consolidado para execução em ordem correta
-- Execute este arquivo completo para implementar toda a funcionalidade

-- =================================================================
-- 1. ENUMS E TIPOS
-- =================================================================

-- Enums para pré-matrícula
DO $$ BEGIN
    CREATE TYPE public.status_pre_matricula AS ENUM (
        'rascunho',
        'enviado', 
        'em_analise',
        'aprovado',
        'rejeitado',
        'cancelado',
        'convertido'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE public.nivel_ensino AS ENUM (
        'Nivel I'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE public.tipo_documento AS ENUM (
        'cpf_aluno',
        'rg_aluno',
        'certidao_nascimento',
        'comprovante_residencia',
        'foto_aluno',
        'cpf_responsavel',
        'rg_responsavel',
        'comprovante_renda',
        'laudo_medico',
        'declaracao_escolar_anterior',
        'certificado_vacina'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE public.sexo AS ENUM (
        'M',
        'F'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- =================================================================
-- 2. TABELAS PRINCIPAIS
-- =================================================================

-- Tabela principal de pré-matrículas
CREATE TABLE IF NOT EXISTS public.pre_matriculas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Dados do aluno
    nome_completo TEXT NOT NULL CHECK (length(trim(nome_completo)) >= 3),
    data_nascimento DATE NOT NULL CHECK (data_nascimento <= CURRENT_DATE),
    cpf TEXT NOT NULL CHECK (regexp_replace(cpf, '[^0-9]', '', 'g') ~ '^[0-9]{11}$'),
    rg TEXT NOT NULL,
    orgao_expedidor TEXT NOT NULL,
    data_expedicao DATE NOT NULL,
    sexo sexo NOT NULL,
    telefone TEXT NOT NULL CHECK (regexp_replace(telefone, '[^0-9]', '', 'g') ~ '^[0-9]{10,11}$'),
    email TEXT NOT NULL CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    naturalidade TEXT NOT NULL,
    nacionalidade TEXT NOT NULL DEFAULT 'Brasileira',
    
    -- Endereço
    cep TEXT NOT NULL CHECK (regexp_replace(cep, '[^0-9]', '', 'g') ~ '^[0-9]{8}$'),
    logradouro TEXT NOT NULL,
    numero TEXT NOT NULL,
    complemento TEXT,
    bairro TEXT NOT NULL,
    municipio TEXT NOT NULL,
    estado TEXT NOT NULL CHECK (length(estado) = 2),
    
    -- Dados escolares
    nivel_desejado nivel_ensino NOT NULL DEFAULT 'Nivel I',
    ano_letivo INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
    escola_origem TEXT,
    possui_deficiencia BOOLEAN NOT NULL DEFAULT FALSE,
    tipo_deficiencia TEXT,
    necessidade_atendimento_especial BOOLEAN DEFAULT FALSE,
    
    -- Informações adicionais
    como_conheceu_ibuc TEXT,
    observacoes TEXT CHECK (length(observacoes) <= 500),
    
    -- Controle do processo
    status status_pre_matricula NOT NULL DEFAULT 'rascunho',
    data_envio TIMESTAMPTZ,
    data_analise TIMESTAMPTZ,
    data_aprovacao TIMESTAMPTZ,
    data_rejeicao TIMESTAMPTZ,
    data_conversao TIMESTAMPTZ,
    
    -- Responsável pela análise
    analisado_por UUID REFERENCES public.usuarios(id),
    
    -- Justificativas
    motivo_rejeicao TEXT,
    observacoes_internas TEXT,
    
    -- Controle de prioridade
    prioridade BOOLEAN DEFAULT FALSE,
    data_entrada_lista_espera TIMESTAMPTZ,
    
    -- Multi-tenancy
    polo_id UUID NOT NULL REFERENCES public.polos(id),
    
    -- Controle de duplicidade
    cpf_normalizado TEXT GENERATED ALWAYS AS (regexp_replace(cpf, '[^0-9]', '', 'g')) STORED,
    email_lower TEXT GENERATED ALWAYS AS (lower(email)) STORED
);

-- Tabela de documentos da pré-matrícula
CREATE TABLE IF NOT EXISTS public.pre_matricula_documentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    pre_matricula_id UUID NOT NULL REFERENCES public.pre_matriculas(id) ON DELETE CASCADE,
    
    tipo_documento tipo_documento NOT NULL,
    nome_arquivo TEXT NOT NULL,
    caminho_arquivo TEXT NOT NULL,
    tamanho_arquivo INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    checksum TEXT NOT NULL,
    
    status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
    data_validacao TIMESTAMPTZ,
    validado_por UUID REFERENCES public.usuarios(id),
    motivo_rejeicao TEXT,
    
    polo_id UUID NOT NULL REFERENCES public.polos(id)
);

-- Tabela de histórico de alterações
CREATE TABLE IF NOT EXISTS public.pre_matricula_historico (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    pre_matricula_id UUID NOT NULL REFERENCES public.pre_matriculas(id) ON DELETE CASCADE,
    
    usuario_id UUID REFERENCES public.usuarios(id),
    role_usuario TEXT,
    
    campo_alterado TEXT NOT NULL,
    valor_anterior TEXT,
    valor_novo TEXT,
    tipo_alteracao TEXT NOT NULL CHECK (tipo_alteracao IN ('insert', 'update', 'delete', 'status_change')),
    descricao TEXT NOT NULL,
    
    polo_id UUID NOT NULL REFERENCES public.polos(id)
);

-- Tabela para controle de uploads
CREATE TABLE IF NOT EXISTS public.pre_matricula_upload_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 hour'),
    
    pre_matricula_id UUID NOT NULL REFERENCES public.pre_matriculas(id),
    tipo_documento tipo_documento NOT NULL,
    nome_arquivo_original TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    tamanho_arquivo INTEGER NOT NULL,
    
    upload_token TEXT NOT NULL UNIQUE,
    
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'uploading', 'completed', 'failed', 'expired')),
    storage_path TEXT,
    checksum TEXT,
    error_message TEXT,
    
    polo_id UUID NOT NULL REFERENCES public.polos(id)
);

-- Tabelas de notificações
CREATE TABLE IF NOT EXISTS public.notificacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ,
    
    email_destinatario TEXT NOT NULL,
    nome_destinatario TEXT NOT NULL,
    
    tipo_notificacao TEXT NOT NULL,
    template TEXT NOT NULL,
    
    dados_template JSONB NOT NULL DEFAULT '{}',
    
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
    
    tentativas INTEGER DEFAULT 0,
    max_tentativas INTEGER DEFAULT 3,
    proxima_tentativa TIMESTAMPTZ DEFAULT NOW(),
    
    erro_mensagem TEXT,
    
    pre_matricula_id UUID REFERENCES public.pre_matriculas(id),
    
    polo_id UUID NOT NULL REFERENCES public.polos(id)
);

CREATE TABLE IF NOT EXISTS public.email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    nome TEXT NOT NULL UNIQUE,
    tipo_notificacao TEXT NOT NULL,
    
    assunto TEXT NOT NULL,
    corpo_html TEXT NOT NULL,
    corpo_texto TEXT NOT NULL,
    
    variaveis JSONB DEFAULT '{}',
    
    ativo BOOLEAN DEFAULT TRUE,
    
    polo_id UUID REFERENCES public.polos(id)
);

-- =================================================================
-- 3. ÍNDICES
-- =================================================================

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_pre_matriculas_status ON public.pre_matriculas(status);
CREATE INDEX IF NOT EXISTS idx_pre_matriculas_polo ON public.pre_matriculas(polo_id);
CREATE INDEX IF NOT EXISTS idx_pre_matriculas_cpf_norm ON public.pre_matriculas(cpf_normalizado);
CREATE INDEX IF NOT EXISTS idx_pre_matriculas_email_lower ON public.pre_matriculas(email_lower);
CREATE INDEX IF NOT EXISTS idx_pre_matriculas_data_envio ON public.pre_matriculas(data_envio);
CREATE INDEX IF NOT EXISTS idx_pre_matriculas_nivel_ano ON public.pre_matriculas(nivel_desejado, ano_letivo);
CREATE INDEX IF NOT EXISTS idx_pre_matriculas_prioridade ON public.pre_matriculas(prioridade, data_envio);

-- Índices únicos
CREATE UNIQUE INDEX IF NOT EXISTS pre_matriculas_cpf_unique 
ON public.pre_matriculas(cpf_normalizado) 
WHERE status IN ('enviado', 'em_analise', 'aprovado');

CREATE UNIQUE INDEX IF NOT EXISTS pre_matriculas_email_unique 
ON public.pre_matriculas(email_lower) 
WHERE status IN ('enviado', 'em_analise', 'aprovado');

-- Índices para documentos
CREATE INDEX IF NOT EXISTS idx_pre_matricula_docs_pre_matricula ON public.pre_matricula_documentos(pre_matricula_id);
CREATE INDEX IF NOT EXISTS idx_pre_matricula_docs_tipo ON public.pre_matricula_documentos(tipo_documento);
CREATE INDEX IF NOT EXISTS idx_pre_matricula_docs_status ON public.pre_matricula_documentos(status);
CREATE INDEX IF NOT EXISTS idx_pre_matricula_docs_polo ON public.pre_matricula_documentos(polo_id);

-- Índices para histórico
CREATE INDEX IF NOT EXISTS idx_pre_matricula_hist_pre_matricula ON public.pre_matricula_historico(pre_matricula_id);
CREATE INDEX IF NOT EXISTS idx_pre_matricula_hist_data ON public.pre_matricula_historico(created_at);
CREATE INDEX IF NOT EXISTS idx_pre_matricula_hist_usuario ON public.pre_matricula_historico(usuario_id);
CREATE INDEX IF NOT EXISTS idx_pre_matricula_hist_polo ON public.pre_matricula_historico(polo_id);

-- Índices para upload tokens
CREATE INDEX IF NOT EXISTS idx_upload_tokens_token ON public.pre_matricula_upload_tokens(upload_token);
CREATE INDEX IF NOT EXISTS idx_upload_tokens_pre_matricula ON public.pre_matricula_upload_tokens(pre_matricula_id);
CREATE INDEX IF NOT EXISTS idx_upload_tokens_status ON public.pre_matricula_upload_tokens(status);
CREATE INDEX IF NOT EXISTS idx_upload_tokens_expires ON public.pre_matricula_upload_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_upload_tokens_polo ON public.pre_matricula_upload_tokens(polo_id);

-- Índices para notificações
CREATE INDEX IF NOT EXISTS idx_notificacoes_status ON public.notificacoes(status);
CREATE INDEX IF NOT EXISTS idx_notificacoes_proxima_tentativa ON public.notificacoes(proxima_tentativa) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_notificacoes_tipo ON public.notificacoes(tipo_notificacao);
CREATE INDEX IF NOT EXISTS idx_notificacoes_pre_matricula ON public.notificacoes(pre_matricula_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_polo ON public.notificacoes(polo_id);

-- Índices para templates
CREATE INDEX IF NOT EXISTS idx_email_templates_tipo ON public.email_templates(tipo_notificacao);
CREATE INDEX IF NOT EXISTS idx_email_templates_ativo ON public.email_templates(ativo);
CREATE INDEX IF NOT EXISTS idx_email_templates_polo ON public.email_templates(polo_id);

-- =================================================================
-- 4. FUNCTIONS HELPER
-- =================================================================

-- Function para timestamp
CREATE OR REPLACE FUNCTION public.trigger_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Functions de verificação de permissão
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE sql STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.usuarios 
        WHERE id = auth.uid() 
          AND ativo = true 
          AND role = 'super_admin'
    );
$$;

CREATE OR REPLACE FUNCTION public.is_admin_global()
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE sql STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.usuarios 
        WHERE id = auth.uid() 
          AND ativo = true 
          AND role IN ('super_admin', 'admin_geral', 'diretor_geral', 'coordenador_geral')
    );
$$;

CREATE OR REPLACE FUNCTION public.can_manage_pre_matricula(polo_id_param UUID)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE sql STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.usuarios 
        WHERE id = auth.uid() 
          AND ativo = true 
          AND (
            role IN ('super_admin', 'admin_geral', 'diretor_geral', 'coordenador_geral')
            OR (polo_id = polo_id_param AND role IN ('diretor_polo', 'coordenador_polo', 'secretario_polo'))
          )
    );
$$;

-- =================================================================
-- 5. TRIGGERS
-- =================================================================

-- Trigger para updated_at
CREATE TRIGGER pre_matriculas_updated_at
    BEFORE UPDATE ON public.pre_matriculas
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_update_timestamp();

CREATE TRIGGER pre_matricula_documentos_updated_at
    BEFORE UPDATE ON public.pre_matricula_documentos
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_update_timestamp();

-- Trigger para validação de idade
CREATE OR REPLACE FUNCTION public.validate_idade_minima()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.nivel_desejado = 'Nivel I' THEN
        IF AGE(CURRENT_DATE, NEW.data_nascimento) < INTERVAL '2 years' THEN
            RAISE EXCEPTION 'Idade mínima de 2 anos exigida para o Nível I';
        END IF;
        
        IF AGE(CURRENT_DATE, NEW.data_nascimento) > INTERVAL '5 years' THEN
            RAISE EXCEPTION 'Idade máxima de 5 anos para o Nível I';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pre_matriculas_validate_idade
    BEFORE INSERT OR UPDATE ON public.pre_matriculas
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_idade_minima();

-- Trigger para validação de CPF único
CREATE OR REPLACE FUNCTION public.validate_cpf_unique()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM NEW.status THEN
        IF NEW.status IN ('enviado', 'em_analise', 'aprovado') THEN
            IF EXISTS (
                SELECT 1 FROM public.pre_matriculas 
                WHERE cpf_normalizado = NEW.cpf_normalizado 
                AND id != NEW.id
                AND status IN ('enviado', 'em_analise', 'aprovado')
            ) THEN
                RAISE EXCEPTION 'CPF já possui uma pré-matrícula ativa no sistema';
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pre_matriculas_validate_cpf_unique
    BEFORE INSERT OR UPDATE ON public.pre_matriculas
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_cpf_unique();

-- Trigger para validação de email único
CREATE OR REPLACE FUNCTION public.validate_email_unique()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM NEW.status THEN
        IF NEW.status IN ('enviado', 'em_analise', 'aprovado') THEN
            IF EXISTS (
                SELECT 1 FROM public.pre_matriculas 
                WHERE email_lower = NEW.email_lower 
                AND id != NEW.id
                AND status IN ('enviado', 'em_analise', 'aprovado')
            ) THEN
                RAISE EXCEPTION 'Email já possui uma pré-matrícula ativa no sistema';
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pre_matriculas_validate_email_unique
    BEFORE INSERT OR UPDATE ON public.pre_matriculas
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_email_unique();

-- Trigger para validação de transição de status
CREATE OR REPLACE FUNCTION public.validate_status_transition()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status = NEW.status THEN
        RETURN NEW;
    END IF;
    
    CASE OLD.status
        WHEN 'rascunho' THEN
            IF NEW.status NOT IN ('enviado', 'cancelado') THEN
                RAISE EXCEPTION 'De rascunho só pode ir para enviado ou cancelado';
            END IF;
        WHEN 'enviado' THEN
            IF NEW.status NOT IN ('em_analise', 'rejeitado', 'cancelado') THEN
                RAISE EXCEPTION 'De enviado só pode ir para em_analise, rejeitado ou cancelado';
            END IF;
        WHEN 'em_analise' THEN
            IF NEW.status NOT IN ('aprovado', 'rejeitado', 'cancelado') THEN
                RAISE EXCEPTION 'De em_analise só pode ir para aprovado, rejeitado ou cancelado';
            END IF;
        WHEN 'aprovado' THEN
            IF NEW.status NOT IN ('convertido', 'cancelado') THEN
                RAISE EXCEPTION 'De aprovado só pode ir para convertido ou cancelado';
            END IF;
        WHEN 'rejeitado' THEN
            IF NEW.status != 'cancelado' THEN
                RAISE EXCEPTION 'De rejeitado só pode ir para cancelado';
            END IF;
        WHEN 'cancelado' THEN
            RAISE EXCEPTION 'Status cancelado não pode ser alterado';
        WHEN 'convertido' THEN
            RAISE EXCEPTION 'Status convertido não pode ser alterado';
    END CASE;
    
    CASE NEW.status
        WHEN 'enviado' THEN
            NEW.data_envio := COALESCE(NEW.data_envio, NOW());
        WHEN 'em_analise' THEN
            NEW.data_analise := COALESCE(NEW.data_analise, NOW());
        WHEN 'aprovado' THEN
            NEW.data_aprovacao := COALESCE(NEW.data_aprovacao, NOW());
            NEW.analisado_por := COALESCE(NEW.analisado_por, auth.uid());
        WHEN 'rejeitado' THEN
            NEW.data_rejeicao := COALESCE(NEW.data_rejeicao, NOW());
            NEW.analisado_por := COALESCE(NEW.analisado_por, auth.uid());
        WHEN 'convertido' THEN
            NEW.data_conversao := COALESCE(NEW.data_conversao, NOW());
    END CASE;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pre_matriculas_validate_status_transition
    BEFORE UPDATE ON public.pre_matriculas
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_status_transition();

-- =================================================================
-- 6. FUNCTIONS PRINCIPAIS
-- =================================================================

-- Function para criar pré-matrícula
CREATE OR REPLACE FUNCTION public.criar_pre_matricula(
    p_nome_completo TEXT,
    p_data_nascimento DATE,
    p_cpf TEXT,
    p_rg TEXT,
    p_orgao_expedidor TEXT,
    p_data_expedicao DATE,
    p_sexo sexo,
    p_telefone TEXT,
    p_email TEXT,
    p_naturalidade TEXT,
    p_nacionalidade TEXT DEFAULT 'Brasileira',
    p_cep TEXT,
    p_logradouro TEXT,
    p_numero TEXT,
    p_complemento TEXT DEFAULT NULL,
    p_bairro TEXT,
    p_municipio TEXT,
    p_estado TEXT,
    p_nivel_desejado nivel_ensino DEFAULT 'Nivel I',
    p_ano_letivo INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
    p_escola_origem TEXT DEFAULT NULL,
    p_possui_deficiencia BOOLEAN DEFAULT FALSE,
    p_tipo_deficiencia TEXT DEFAULT NULL,
    p_necessidade_atendimento_especial BOOLEAN DEFAULT FALSE,
    p_como_conheceu_ibuc TEXT DEFAULT NULL,
    p_observacoes TEXT DEFAULT NULL,
    p_polo_id UUID
)
RETURNS UUID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_pre_matricula_id UUID;
    v_cpf_norm TEXT;
    v_email_lower TEXT;
BEGIN
    v_cpf_norm := regexp_replace(p_cpf, '[^0-9]', '', 'g');
    v_email_lower := lower(p_email);
    
    IF EXISTS (
        SELECT 1 FROM public.pre_matriculas 
        WHERE cpf_normalizado = v_cpf_norm 
        AND status IN ('enviado', 'em_analise', 'aprovado')
    ) THEN
        RAISE EXCEPTION 'Já existe uma pré-matrícula ativa para este CPF';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM public.pre_matriculas 
        WHERE email_lower = v_email_lower 
        AND status IN ('enviado', 'em_analise', 'aprovado')
    ) THEN
        RAISE EXCEPTION 'Já existe uma pré-matrícula ativa para este email';
    END IF;
    
    IF p_nivel_desejado = 'Nivel I' THEN
        IF AGE(CURRENT_DATE, p_data_nascimento) < INTERVAL '2 years' THEN
            RAISE EXCEPTION 'Idade mínima de 2 anos exigida para o Nível I';
        END IF;
        
        IF AGE(CURRENT_DATE, p_data_nascimento) > INTERVAL '5 years' THEN
            RAISE EXCEPTION 'Idade máxima de 5 anos para o Nível I';
        END IF;
    END IF;
    
    INSERT INTO public.pre_matriculas (
        nome_completo,
        data_nascimento,
        cpf,
        rg,
        orgao_expedidor,
        data_expedicao,
        sexo,
        telefone,
        email,
        naturalidade,
        nacionalidade,
        cep,
        logradouro,
        numero,
        complemento,
        bairro,
        municipio,
        estado,
        nivel_desejado,
        ano_letivo,
        escola_origem,
        possui_deficiencia,
        tipo_deficiencia,
        necessidade_atendimento_especial,
        como_conheceu_ibuc,
        observacoes,
        polo_id,
        status
    ) VALUES (
        p_nome_completo,
        p_data_nascimento,
        p_cpf,
        p_rg,
        p_orgao_expedidor,
        p_data_expedicao,
        p_sexo,
        p_telefone,
        p_email,
灰
       adium
        p_naturalidade,
        p_nacionalidade,
        p_cep,
        p_logradouro,
        p_numero,
        p_complemento,
        p_bairro,
        p_municipio,
        p_estado,
        p_nivel_desejado,
        p_ano_letivo,
        p_escola_origem,
        p_possui_deficiencia,
        p_tipo_deficiencia,
        p_necessidade_atendimento_especial,
        p_como_conheceu_ibuc,
        p_observacoes,
        p_polo_id,
        'rascunho'
    ) RETURNING id INTO v_pre_matricula_id;
    
    RETURN v_pre_matricula_id;
END;
$$;

-- =================================================================
-- 7. RLS E POLICIES
-- =================================================================

-- Habilitar RLS
ALTER TABLE public.pre_matriculas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pre_matricula_documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pre_matricula_historico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pre_matricula_upload_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Policies básicas
CREATE POLICY "Publicos podem visualizar pré-matrículas públicas"
ON public.pre_matriculas
FOR SELECT
TO anon
USING (status = 'aprovado' AND polo_id IS NOT NULL)
WITH CHECK (false);

CREATE POLICY "Dono pode gerenciar sua pré-matrícula"
ON public.pre_matriculas
FOR ALL
TO authenticated
USING (
    email_lower = (SELECT COALESCE((SELECT email FROM public.usuarios WHERE id = auth.uid()), ''))
    OR cpf_normalizado = (SELECT COALESCE((SELECT regexp_replace(cpf, '[^0-9]', '', 'g') FROM public.usuarios WHERE id = auth.uid()), ''))
)
WITH CHECK (
    status = 'rascunho'
    OR (
        email_lower = (SELECT COALESCE((SELECT email FROM public.usuarios WHERE id = auth.uid()), ''))
        OR cpf_normalizado = (SELECT COALESCE((SELECT regexp_replace(cpf, '[^0-9]', '', 'g') FROM public.usuarios WHERE id = auth.uid()), ''))
    )
);

CREATE POLICY "Administradores podem gerenciar pré-matrículas"
ON public.pre_matriculas
FOR ALL
TO authenticated
USING (can_manage_pre_matricula(polo_id))
WITH CHECK (can_manage_pre_matricula(polo_id));

-- =================================================================
-- 8. GRANTS
-- =================================================================

-- Grants básicos
GRANT SELECT, INSERT, UPDATE ON public.pre_matriculas TO authenticated;
GRANT SELECT ON public.pre_matriculas TO anon;

GRANT SELECT, INSERT, UPDATE ON public.pre_matricula_documentos TO authenticated;

GRANT SELECT ON public.pre_matricula_historico TO authenticated;
GRANT SELECT ON public.pre_matricula_historico TO anon;

GRANT SELECT, INSERT, UPDATE ON public.pre_matricula_upload_tokens TO authenticated;
GRANT SELECT ON public.pre_matricula_upload_tokens TO anon;

GRANT SELECT, INSERT, UPDATE ON public.notificacoes TO authenticated;
GRANT SELECT ON public.email_templates TO authenticated;

-- Grants para functions
REVOKE EXECUTE ON FUNCTION public.criar_pre_matricula(
    p_nome_completo TEXT,
    p_data_nascimento DATE,
    p_cpf TEXT,
    p_rg TEXT,
    p_orgao_expedidor TEXT,
    p_data_expedicao DATE,
    p_sexo sexo,
    p_telefone TEXT,
    p_email TEXT,
    p_naturalidade TEXT,
    p_nacionalidade TEXT,
    p_cep TEXT,
    p_logradouro TEXT,
    p_numero TEXT,
    p_complemento TEXT,
    p_bairro TEXT,
    p_municipio TEXT,
    p_estado TEXT,
    p_nivel_desejado nivel_ensino,
    p_ano_letivo INTEGER,
    p_escola_origem TEXT,
    p_possui_deficiencia BOOLEAN,
    p_tipo_deficiencia TEXT,
    p_necessidade_atendimento_especial BOOLEAN,
    p_como_conheceu_ibuc TEXT,
    p_observacoes TEXT,
    p_polo_id UUID
) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.criar_pre_matricula(
    p_nome_completo TEXT,
    p_data_nascimento DATE,
    p_cpf TEXT,
    p_rg TEXT,
    p_orgao_expedidor TEXT,
    p_data_expedicao DATE,
    p_sexo sexo,
    p_telefone TEXT,
    p_email TEXT,
    p_naturalidade TEXT,
    p_nacionalidade TEXT,
    p_cep TEXT,
    p_logradouro TEXT,
    p_numero TEXT,
    p_complemento TEXT,
    p_bairro TEXT,
    p_municipio TEXT,
    p_estado TEXT,
    p_nivel_desejado nivel_ensino,
    p_ano_letivo INTEGER,
    p_escola_origem TEXT,
    p_possui_deficiencia BOOLEAN,
    p_tipo_deficiencia TEXT,
    p_necessidade_atendimento_especial BOOLEAN,
    p_como_conheceu_ibuc TEXT,
    p_observacoes TEXT,
    p_polo_id UUID
) TO anon;
GRANT EXECUTE ON FUNCTION public.criar_pre_matricula(
    p_nome_completo TEXT,
    p_data_nascimento DATE,
    p_cpf TEXT,
    p_rg TEXT,
    p_orgao_expedidor TEXT,
    p_data_expedicao DATE,
    p_sexo sexo,
    p_telefone TEXT,
    p_email TEXT,
    p_naturalidade TEXT,
    p_nacionalidade TEXT,
    p_cep TEXT,
    p_logradouro TEXT,
    p_numero TEXT,
    p_complemento TEXT,
    p_bairro TEXT,
    p_municipio TEXT,
    p_estado TEXT,
    p_nivel_desejado nivel_ensino,
    p_ano_letivo INTEGER,
    p_escola_origem TEXT,
    p_possui_deficiencia BOOLEAN,
    p_tipo_deficiencia TEXT,
    p_necessidade_atendimento_especial BOOLEAN,
    p_como_conheceu_ibuc TEXT,
    p_observacoes TEXT,
    p_polo_id UUID
) TO authenticated;

GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_global() TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_pre_matricula(UUID) TO authenticated;

-- =================================================================
-- 9. EMAIL TEMPLATES
-- =================================================================

INSERT INTO public.email_templates (nome, tipo_notificacao, assunto, corpo_html, corpo_texto, variaveis) VALUES
(
    'confirmacao_envio_pre_matricula',
    'confirmacao_envio',
    'IBUC - Pré-matrícula recebida com sucesso!',
    '<h2>Pré-matrícula recebida!</h2>
     <p>Olá, {{nome_responsavel}}!</p>
     <p>Recebemos sua pré-matrícula para <strong>{{nome_aluno}}</strong> com sucesso.</p>
     <p><strong>Protocolo:</strong> {{protocolo}}</p>
     <p><strong>Status atual:</strong> {{status}}</p>
     <p>Sua solicitação está em análise e entraremos em contato em breve.</p>
     <br>
     <p>Atenciosamente,<br>Equipe IBUC</p>',
    'Pré-matrícula recebida!
     
     Olá, {{nome_responsavel}}!
     
     Recebemos sua pré-matrícula para {{nome_aluno}} com sucesso.
     
     Protocolo: {{protocolo}}
     Status atual: {{status}}
     
     Sua solicitação está em análise e entraremos em contato em breve.
     
     Atenciosamente,
     Equipe IBUC',
    '{"nome_responsavel": "text", "nome_aluno": "text", "protocolo": "text", "status": "text"}'
),
(
    'pre_matricula_aprovada',
    'aprovacao',
    'IBUC - Pré-matrícula aprovada!',
    '<h2>Parabéns! Pré-matrícula aprovada!</h2>
     <p>Olá, {{nome_responsavel}}!</p>
     <p>Temos boas notícias! A pré-matrícula de <strong>{{nome_aluno}}</strong> foi aprovada.</p>
     <p><strong>Próximos passos:</strong></p>
     <ul>
         <li>Aguarde nosso contato para formalizar a matrícula</li>
         <li>Prepare os documentos originais para entrega</li>
         <li>Esteja atento às datas de início das aulas</li>
     </ul>
     <br>
     <p>Atenciosamente,<br>Equipe IBUC</p>',
    'Parabéns! Pré-matrícula aprovada!
     
     Olá, {{nome_responsavel}}!
     
     Temos boas notícias! A pré-matrícula de {{nome_aluno}} foi aprovada.
     
     Próximos passos:
     - Aguarde nosso contato para formalizar a matrícula
     - Prepare os documentos originais para entrega
     - Esteja atento às datas de início das aulas
     
     Atenciosamente,
     Equipe IBUC',
    '{"nome_responsavel": "text", "nome_aluno": "text"}'
),
(
    'pre_matricula_rejeitada',
    'rejeicao',
    'IBUC - Sobre sua pré-matrícula',
    '<h2>Sobre sua pré-matrícula</h2>
     <p>Olá, {{nome_responsavel}}!</p>
     <p>Após análise, informamos que a pré-matrícula de <strong>{{nome_aluno}}</strong> não foi aprovada neste momento.</p>
     <p><strong>Motivo:</strong> {{motivo_rejeicao}}</p>
     <p>Caso tenha dúvidas ou queira mais informações, entre em contato conosco.</p>
     <br>
     <p>Atenciosamente,<br>Equipe IBUC</p>',
    'Sobre sua pré-matrícula
     
     Olá, {{nome_responsavel}}!
     
     Após análise, informamos que a pré-matrícula de {{nome_aluno}} não foi aprovada neste momento.
     
     Motivo: {{motivo_rejeicao}}
     
     Caso tenha dúvidas ou queira mais informações, entre em contato conosco.
     
     Atenciosamente,
     Equipe IBUC',
    '{"nome_responsavel": "text", "nome_aluno": "text", "motivo_rejeicao": "text"}'
)
ON CONFLICT (nome) DO NOTHING;

-- =================================================================
-- 10. STORAGE BUCKET (MANUAL)
-- =================================================================

-- NOTA: Criar bucket manualmente via Supabase Dashboard:
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
-- VALUES ('pre-matricula-docs', 'pre-matricula-docs', false, 5242880, 
--         ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']);

-- =================================================================
-- FIM DO SQL CONSOLIDADO
-- =================================================================
