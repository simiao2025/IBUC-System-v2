-- FASE 4 - PRÉ-MATRÍCULA PÚBLICA
-- Schema SQL para implementação da funcionalidade de pré-matrícula

-- Enums para pré-matrícula
CREATE TYPE IF NOT EXISTS public.status_pre_matricula AS ENUM (
    'rascunho',
    'enviado', 
    'em_analise',
    'aprovado',
    'rejeitado',
    'cancelado',
    'convertido'
);

CREATE TYPE IF NOT EXISTS public.nivel_ensino AS ENUM (
    'Nivel I'
);

CREATE TYPE IF NOT EXISTS public.tipo_documento AS ENUM (
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

CREATE TYPE IF NOT EXISTS public.sexo AS ENUM (
    'M',
    'F'
);

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
    caminho_arquivo TEXT NOT NULL, -- Path no storage
    tamanho_arquivo INTEGER NOT NULL, -- bytes
    mime_type TEXT NOT NULL,
    checksum TEXT NOT NULL, -- SHA-256 para integridade
    
    -- Status do documento
    status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
    data_validacao TIMESTAMPTZ,
    validado_por UUID REFERENCES public.usuarios(id),
    motivo_rejeicao TEXT,
    
    -- Multi-tenancy
    polo_id UUID NOT NULL REFERENCES public.polos(id)
);

-- Tabela de histórico de alterações (audit trail)
CREATE TABLE IF NOT EXISTS public.pre_matricula_historico (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    pre_matricula_id UUID NOT NULL REFERENCES public.pre_matriculas(id) ON DELETE CASCADE,
    
    -- Quem fez a alteração
    usuario_id UUID REFERENCES public.usuarios(id),
    role_usuario TEXT, -- Para histórico caso usuário seja deletado
    
    -- Detalhes da alteração
    campo_alterado TEXT NOT NULL,
    valor_anterior TEXT,
    valor_novo TEXT,
    tipo_alteracao TEXT NOT NULL CHECK (tipo_alteracao IN ('insert', 'update', 'delete', 'status_change')),
    descricao TEXT NOT NULL,
    
    -- Multi-tenancy
    polo_id UUID NOT NULL REFERENCES public.polos(id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_pre_matriculas_status ON public.pre_matriculas(status);
CREATE INDEX IF NOT EXISTS idx_pre_matriculas_polo ON public.pre_matriculas(polo_id);
CREATE INDEX IF NOT EXISTS idx_pre_matriculas_cpf_norm ON public.pre_matriculas(cpf_normalizado);
CREATE INDEX IF NOT EXISTS idx_pre_matriculas_email_lower ON public.pre_matriculas(email_lower);
CREATE INDEX IF NOT EXISTS idx_pre_matriculas_data_envio ON public.pre_matriculas(data_envio);
CREATE INDEX IF NOT EXISTS idx_pre_matriculas_nivel_ano ON public.pre_matriculas(nivel_desejado, ano_letivo);
CREATE INDEX IF NOT EXISTS idx_pre_matriculas_prioridade ON public.pre_matriculas(prioridade, data_envio);

-- Índices únicos para evitar duplicidade
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

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.trigger_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger nas tabelas
CREATE TRIGGER pre_matriculas_updated_at
    BEFORE UPDATE ON public.pre_matriculas
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_update_timestamp();

CREATE TRIGGER pre_matricula_documentos_updated_at
    BEFORE UPDATE ON public.pre_matricula_documentos
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_update_timestamp();

-- Trigger para validação de idade mínima (2 anos para Nível I)
CREATE OR REPLACE FUNCTION public.validate_idade_minima()
RETURNS TRIGGER AS $$
BEGIN
    -- Validar idade mínima de 2 anos para Nível I
    IF NEW.nivel_desejado = 'Nivel I' THEN
        IF AGE(CURRENT_DATE, NEW.data_nascimento) < INTERVAL '2 years' THEN
            RAISE EXCEPTION 'Idade mínima de 2 anos exigida para o Nível I';
        END IF;
        
        -- Validar idade máxima de 5 anos para Nível I
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

-- Trigger para histórico de alterações
CREATE OR REPLACE FUNCTION public.log_pre_matricula_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.pre_matricula_historico (
            pre_matricula_id,
            usuario_id,
            role_usuario,
            campo_alterado,
            valor_anterior,
            valor_novo,
            tipo_alteracao,
            descricao,
            polo_id
        ) VALUES (
            NEW.id,
            auth.uid(),
            current_setting('app.current_role', true),
            'status',
            NULL,
            NEW.status::TEXT,
            'insert',
            'Pré-matrícula criada',
            NEW.polo_id
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Logar mudança de status
        IF OLD.status IS DISTINCT FROM NEW.status THEN
            INSERT INTO public.pre_matricula_historico (
                pre_matricula_id,
                usuario_id,
                role_usuario,
                campo_alterado,
                valor_anterior,
                valor_novo,
                tipo_alteracao,
                descricao,
                polo_id
            ) VALUES (
                NEW.id,
                auth.uid(),
                current_setting('app.current_role', true),
                'status',
                OLD.status::TEXT,
                NEW.status::TEXT,
                'status_change',
                'Status alterado de ' || OLD.status::TEXT || ' para ' || NEW.status::TEXT,
                NEW.polo_id
            );
        END IF;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO public.pre_matricula_historico (
            pre_matricula_id,
            usuario_id,
            role_usuario,
            campo_alterado,
            valor_anterior,
            valor_novo,
            tipo_alteracao,
            descricao,
            polo_id
        ) VALUES (
            OLD.id,
            auth.uid(),
            current_setting('app.current_role', true),
            'ALL',
            NULL,
            NULL,
            'delete',
            'Pré-matrícula deletada',
            OLD.polo_id
        );
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pre_matriculas_log_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.pre_matriculas
    FOR EACH ROW
    EXECUTE FUNCTION public.log_pre_matricula_changes();

-- Habilitar RLS nas tabelas
ALTER TABLE public.pre_matriculas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pre_matricula_documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pre_matricula_historico ENABLE ROW LEVEL SECURITY;

-- Grants básicos
GRANT SELECT, INSERT, UPDATE ON public.pre_matriculas TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.pre_matricula_documentos TO authenticated;
GRANT SELECT ON public.pre_matricula_historico TO authenticated;

GRANT SELECT ON public.pre_matriculas TO anon;
GRANT SELECT ON public.pre_matricula_historico TO anon;
