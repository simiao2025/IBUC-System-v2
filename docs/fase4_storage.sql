-- FASE 4 - PRÉ-MATRÍCULA PÚBLICA
-- Sistema de upload de documentos (Storage buckets + metadata)

-- Criar bucket para documentos de pré-matrícula
-- Nota: Este comando deve ser executado via Supabase Dashboard ou CLI
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
-- VALUES ('pre-matricula-docs', 'pre-matricula-docs', false, 5242880, 
--         ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']);

-- Tabela para controle de uploads pendentes
CREATE TABLE IF NOT EXISTS public.pre_matricula_upload_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 hour'),
    
    -- Dados do upload
    pre_matricula_id UUID NOT NULL REFERENCES public.pre_matriculas(id),
    tipo_documento tipo_documento NOT NULL,
    nome_arquivo_original TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    tamanho_arquivo INTEGER NOT NULL,
    
    -- Token para upload seguro
    upload_token TEXT NOT NULL UNIQUE,
    
    -- Status do upload
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'uploading', 'completed', 'failed', 'expired')),
    storage_path TEXT, -- Caminho no storage quando completado
    checksum TEXT, -- SHA-256 quando completado
    error_message TEXT,
    
    -- Multi-tenancy
    polo_id UUID NOT NULL REFERENCES public.polos(id)
);

-- Índices para upload tokens
CREATE INDEX IF NOT EXISTS idx_upload_tokens_token ON public.pre_matricula_upload_tokens(upload_token);
CREATE INDEX IF NOT EXISTS idx_upload_tokens_pre_matricula ON public.pre_matricula_upload_tokens(pre_matricula_id);
CREATE INDEX IF NOT EXISTS idx_upload_tokens_status ON public.pre_matricula_upload_tokens(status);
CREATE INDEX IF NOT EXISTS idx_upload_tokens_expires ON public.pre_matricula_upload_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_upload_tokens_polo ON public.pre_matricula_upload_tokens(polo_id);

-- Function para gerar token de upload
CREATE OR REPLACE FUNCTION public.gerar_upload_token(
    p_pre_matricula_id UUID,
    p_tipo_documento tipo_documento,
    p_nome_arquivo_original TEXT,
    p_mime_type TEXT,
    p_tamanho_arquivo INTEGER
)
RETURNS TEXT
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_polo_id UUID;
    v_status TEXT;
    v_upload_token TEXT;
    v_existing_token TEXT;
BEGIN
    -- Buscar informações da pré-matrícula
    SELECT polo_id, status INTO v_polo_id, v_status
    FROM public.pre_matriculas 
    WHERE id = p_pre_matricula_id;
    
    -- Verificar se existe
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Pré-matrícula não encontrada';
    END IF;
    
    -- Verificar permissão (dono ou admin)
    IF NOT (
        -- Admin pode gerenciar qualquer pré-matrícula do seu polo
        can_manage_pre_matricula(v_polo_id)
        -- Dono pode gerenciar sua própria pré-matrícula
        OR EXISTS (
            SELECT 1 FROM public.pre_matriculas pm
            WHERE pm.id = p_pre_matricula_id
            AND (
                pm.email_lower = (SELECT email FROM public.usuarios WHERE id = auth.uid())
                OR pm.cpf_normalizado = (SELECT regexp_replace(cpf, '[^0-9]', '', 'g') FROM public.usuarios WHERE id = auth.uid())
            )
        )
    ) THEN
        RAISE EXCEPTION 'Sem permissão para gerar token de upload para esta pré-matrícula';
    END IF;
    
    -- Verificar se status permite upload
    IF v_status NOT IN ('rascunho', 'enviado', 'em_analise') THEN
        RAISE EXCEPTION 'Pré-matrícula não permite uploads no status atual';
    END IF;
    
    -- Verificar se já existe um upload pendente para mesmo tipo de documento
    SELECT upload_token INTO v_existing_token
    FROM public.pre_matricula_upload_tokens 
    WHERE pre_matricula_id = p_pre_matricula_id
      AND tipo_documento = p_tipo_documento
      AND status IN ('pending', 'uploading')
      AND expires_at > NOW();
    
    IF v_existing_token IS NOT NULL THEN
        RETURN v_existing_token; -- Retornar token existente
    END IF;
    
    -- Validar arquivo
    IF p_tamanho_arquivo > 5 * 1024 * 1024 THEN
        RAISE EXCEPTION 'Tamanho máximo de arquivo permitido é 5MB';
    END IF;
    
    IF p_mime_type NOT IN (
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp'
    ) THEN
        RAISE EXCEPTION 'Tipo de arquivo não permitido';
    END IF;
    
    -- Gerar token único
    v_upload_token := encode(gen_random_bytes(32), 'hex');
    
    -- Inserir token
    INSERT INTO public.pre_matricula_upload_tokens (
        pre_matricula_id,
        tipo_documento,
        nome_arquivo_original,
        mime_type,
        tamanho_arquivo,
        upload_token,
        polo_id
    ) VALUES (
        p_pre_matricula_id,
        p_tipo_documento,
        p_nome_arquivo_original,
        p_mime_type,
        p_tamanho_arquivo,
        v_upload_token,
        v_polo_id
    );
    
    RETURN v_upload_token;
END;
$$;

-- Function para completar upload
CREATE OR REPLACE FUNCTION public.completar_upload(
    p_upload_token TEXT,
    p_storage_path TEXT,
    p_checksum TEXT
)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_token_record RECORD;
    v_documento_id UUID;
BEGIN
    -- Buscar token
    SELECT * INTO v_token_record
    FROM public.pre_matricula_upload_tokens 
    WHERE upload_token = p_upload_token;
    
    -- Verificar se existe
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Token de upload não encontrado';
    END IF;
    
    -- Verificar se não expirou
    IF v_token_record.expires_at < NOW() THEN
        RAISE EXCEPTION 'Token de upload expirado';
    END IF;
    
    -- Verificar se status permite completar
    IF v_token_record.status NOT IN ('pending', 'uploading') THEN
        RAISE EXCEPTION 'Upload não pode ser completado no status atual';
    END IF;
    
    -- Validar checksum
    IF p_checksum IS NULL OR length(p_checksum) != 64 THEN
        RAISE EXCEPTION 'Checksum inválido';
    END IF;
    
    -- Verificar permissão
    IF NOT (
        can_manage_pre_matricula(v_token_record.polo_id)
        OR EXISTS (
            SELECT 1 FROM public.pre_matriculas pm
            WHERE pm.id = v_token_record.pre_matricula_id
            AND (
                pm.email_lower = (SELECT email FROM public.usuarios WHERE id = auth.uid())
                OR pm.cpf_normalizado = (SELECT regexp_replace(cpf, '[^0-9]', '', 'g') FROM public.usuarios WHERE id = auth.uid())
            )
        )
    ) THEN
        RAISE EXCEPTION 'Sem permissão para completar este upload';
    END IF;
    
    -- Inserir documento na tabela principal
    INSERT INTO public.pre_matricula_documentos (
        pre_matricula_id,
        tipo_documento,
        nome_arquivo,
        caminho_arquivo,
        tamanho_arquivo,
        mime_type,
        checksum,
        polo_id
    ) VALUES (
        v_token_record.pre_matricula_id,
        v_token_record.tipo_documento,
        v_token_record.nome_arquivo_original,
        p_storage_path,
        v_token_record.tamanho_arquivo,
        v_token_record.mime_type,
        p_checksum,
        v_token_record.polo_id
    ) RETURNING id INTO v_documento_id;
    
    -- Atualizar status do token
    UPDATE public.pre_matricula_upload_tokens 
    SET status = 'completed',
        storage_path = p_storage_path,
        checksum = p_checksum
    WHERE id = v_token_record.id;
    
    -- Log da operação
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
        v_token_record.pre_matricula_id,
        auth.uid(),
        current_setting('app.current_role', true),
        'documento_upload',
        NULL,
        v_token_record.tipo_documento || ': ' || v_token_record.nome_arquivo_original,
        'insert',
        'Documento ' || v_token_record.tipo_documento || ' enviado com sucesso',
        v_token_record.polo_id
    );
    
    RETURN TRUE;
END;
$$;

-- Function para cancelar upload
CREATE OR REPLACE FUNCTION public.cancelar_upload(
    p_upload_token TEXT,
    p_motivo TEXT DEFAULT NULL
)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_token_record RECORD;
BEGIN
    -- Buscar token
    SELECT * INTO v_token_record
    FROM public.pre_matricula_upload_tokens 
    WHERE upload_token = p_upload_token;
    
    -- Verificar se existe
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Token de upload não encontrado';
    END IF;
    
    -- Verificar permissão
    IF NOT (
        can_manage_pre_matricula(v_token_record.polo_id)
        OR EXISTS (
            SELECT 1 FROM public.pre_matriculas pm
            WHERE pm.id = v_token_record.pre_matricula_id
            AND (
                pm.email_lower = (SELECT email FROM public.usuarios WHERE id = auth.uid())
                OR pm.cpf_normalizado = (SELECT regexp_replace(cpf, '[^0-9]', '', 'g') FROM public.usuarios WHERE id = auth.uid())
            )
        )
    ) THEN
        RAISE EXCEPTION 'Sem permissão para cancelar este upload';
    END IF;
    
    -- Atualizar status
    UPDATE public.pre_matricula_upload_tokens 
    SET status = 'failed',
        error_message = p_motivo
    WHERE id = v_token_record.id;
    
    -- Log da operação
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
        v_token_record.pre_matricula_id,
        auth.uid(),
        current_setting('app.current_role', true),
        'documento_upload_cancelado',
        v_token_record.tipo_documento || ': ' || v_token_record.nome_arquivo_original,
        NULL,
        'delete',
        'Upload de documento cancelado: ' || COALESCE(p_motivo, 'Sem motivo especificado'),
        v_token_record.polo_id
    );
    
    RETURN TRUE;
END;
$$;

-- Function para limpar tokens expirados
CREATE OR REPLACE FUNCTION public.limpar_tokens_expirados()
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM public.pre_matricula_upload_tokens 
    WHERE expires_at < NOW()
    AND status IN ('pending', 'uploading');
    
    -- Log da limpeza
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
    ) SELECT 
        pre_matricula_id,
        NULL,
        'system',
        'upload_token_cleanup',
        'expired',
        NULL,
        'delete',
        'Token de upload expirado removido',
        polo_id
    FROM public.pre_matricula_upload_tokens 
    WHERE expires_at < NOW()
    AND status IN ('pending', 'uploading');
END;
$$;

-- Function para listar uploads de uma pré-matrícula
CREATE OR REPLACE FUNCTION public.listar_uploads_pre_matricula(
    p_pre_matricula_id UUID
)
RETURNS TABLE (
    id UUID,
    tipo_documento tipo_documento,
    nome_arquivo_original TEXT,
    mime_type TEXT,
    tamanho_arquivo INTEGER,
    status TEXT,
    created_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ
)
SECURITY DEFINER
SET search_path = public
LANGUAGE sql STABLE
AS $$
    SELECT 
        ut.id,
        ut.tipo_documento,
        ut.nome_arquivo_original,
        ut.mime_type,
        ut.tamanho_arquivo,
        ut.status,
        ut.created_at,
        ut.expires_at
    FROM public.pre_matricula_upload_tokens ut
    WHERE ut.pre_matricula_id = p_pre_matricula_id
    AND (
        -- Admin pode ver todos
        can_manage_pre_matricula(ut.polo_id)
        -- Dono pode ver os seus
        OR EXISTS (
            SELECT 1 FROM public.pre_matriculas pm
            WHERE pm.id = ut.pre_matricula_id
            AND (
                pm.email_lower = (SELECT email FROM public.usuarios WHERE id = auth.uid())
                OR pm.cpf_normalizado = (SELECT regexp_replace(cpf, '[^0-9]', '', 'g') FROM public.usuarios WHERE id = auth.uid())
            )
        )
    )
    ORDER BY ut.created_at DESC;
$$;

-- RLS para upload tokens
ALTER TABLE public.pre_matricula_upload_tokens ENABLE ROW LEVEL SECURITY;

-- Policies para upload tokens
CREATE POLICY "Dono pode gerenciar seus tokens"
ON public.pre_matricula_upload_tokens
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.pre_matriculas pm
        WHERE pm.id = pre_matricula_upload_tokens.pre_matricula_id
        AND (
            pm.email_lower = (SELECT email FROM public.usuarios WHERE id = auth.uid())
            OR pm.cpf_normalizado = (SELECT regexp_replace(cpf, '[^0-9]', '', 'g') FROM public.usuarios WHERE id = auth.uid())
        )
    )
);

CREATE POLICY "Administradores podem gerenciar tokens"
ON public.pre_matricula_upload_tokens
FOR ALL
TO authenticated
USING (
    can_manage_pre_matricula(polo_id)
);

-- Grants para functions
REVOKE EXECUTE ON FUNCTION public.gerar_upload_token(UUID, tipo_documento, TEXT, TEXT, INTEGER) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.gerar_upload_token(UUID, tipo_documento, TEXT, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.gerar_upload_token(UUID, tipo_documento, TEXT, TEXT, INTEGER) TO anon;

REVOKE EXECUTE ON FUNCTION public.completar_upload(TEXT, TEXT, TEXT) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.completar_upload(TEXT, TEXT, TEXT) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.cancelar_upload(TEXT, TEXT) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cancelar_upload(TEXT, TEXT) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.listar_uploads_pre_matricula(UUID) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.listar_uploads_pre_matricula(UUID) TO authenticated;

-- Grants para tabela
GRANT SELECT, INSERT, UPDATE ON public.pre_matricula_upload_tokens TO authenticated;
GRANT SELECT ON public.pre_matricula_upload_tokens TO anon;

-- Trigger para limpeza automática de tokens expirados
-- SELECT cron.schedule('cleanup-upload-tokens', '0 */6 * * *', 'SELECT public.limpar_tokens_expirados();');
