-- FASE 4 - PRÉ-MATRÍCULA PÚBLICA
-- Functions SECURITY DEFINER para operações administrativas

-- Function para criar pré-matrícula (uso público/sem autenticação)
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
    -- Normalizar CPF e email
    v_cpf_norm := regexp_replace(p_cpf, '[^0-9]', '', 'g');
    v_email_lower := lower(p_email);
    
    -- Verificar se já existe pré-matrícula ativa com mesmo CPF
    IF EXISTS (
        SELECT 1 FROM public.pre_matriculas 
        WHERE cpf_normalizado = v_cpf_norm 
        AND status IN ('enviado', 'em_analise', 'aprovado')
    ) THEN
        RAISE EXCEPTION 'Já existe uma pré-matrícula ativa para este CPF';
    END IF;
    
    -- Verificar se já existe pré-matrícula ativa com mesmo email
    IF EXISTS (
        SELECT 1 FROM public.pre_matriculas 
        WHERE email_lower = v_email_lower 
        AND status IN ('enviado', 'em_analise', 'aprovado')
    ) THEN
        RAISE EXCEPTION 'Já existe uma pré-matrícula ativa para este email';
    END IF;
    
    -- Validar idade mínima (2 anos para Nível I)
    IF p_nivel_desejado = 'Nivel I' THEN
        IF AGE(CURRENT_DATE, p_data_nascimento) < INTERVAL '2 years' THEN
            RAISE EXCEPTION 'Idade mínima de 2 anos exigida para o Nível I';
        END IF;
        
        IF AGE(CURRENT_DATE, p_data_nascimento) > INTERVAL '5 years' THEN
            RAISE EXCEPTION 'Idade máxima de 5 anos para o Nível I';
        END IF;
    END IF;
    
    -- Inserir pré-matrícula
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

-- Function para enviar pré-matrícula para análise
CREATE OR REPLACE FUNCTION public.enviar_pre_matricula(p_pre_matricula_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_polo_id UUID;
    v_status TEXT;
BEGIN
    -- Buscar informações da pré-matrícula
    SELECT polo_id, status INTO v_polo_id, v_status
    FROM public.pre_matriculas 
    WHERE id = p_pre_matricula_id;
    
    -- Verificar se existe
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Pré-matrícula não encontrada';
    END IF;
    
    -- Verificar permissão (admin global ou do polo)
    IF NOT can_manage_pre_matricula(v_polo_id) THEN
        RAISE EXCEPTION 'Sem permissão para gerenciar pré-matrículas deste polo';
    END IF;
    
    -- Verificar se status permite envio
    IF v_status NOT IN ('rascunho') THEN
        RAISE EXCEPTION 'Apenas rascunhos podem ser enviados para análise';
    END IF;
    
    -- Verificar se todos os documentos obrigatórios foram anexados
    IF NOT EXISTS (
        SELECT 1 FROM public.pre_matricula_documentos 
        WHERE pre_matricula_id = p_pre_matricula_id
        AND tipo_documento IN ('cpf_aluno', 'rg_aluno', 'certidao_nascimento', 'comprovante_residencia', 'foto_aluno')
        GROUP BY pre_matricula_id
        HAVING COUNT(DISTINCT tipo_documento) = 5
    ) THEN
        RAISE EXCEPTION 'Todos os documentos obrigatórios devem ser anexados antes do envio';
    END IF;
    
    -- Atualizar status
    UPDATE public.pre_matriculas 
    SET status = 'enviado',
        data_envio = NOW()
    WHERE id = p_pre_matricula_id;
    
    -- TODO: Enviar notificação por email
    
    RETURN TRUE;
END;
$$;

-- Function para aprovar pré-matrícula
CREATE OR REPLACE FUNCTION public.aprovar_pre_matricula(
    p_pre_matricula_id UUID,
    p_observacoes_admin TEXT DEFAULT NULL
)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_polo_id UUID;
    v_status TEXT;
BEGIN
    -- Buscar informações da pré-matrícula
    SELECT polo_id, status INTO v_polo_id, v_status
    FROM public.pre_matriculas 
    WHERE id = p_pre_matricula_id;
    
    -- Verificar se existe
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Pré-matrícula não encontrada';
    END IF;
    
    -- Verificar permissão
    IF NOT can_manage_pre_matricula(v_polo_id) THEN
        RAISE EXCEPTION 'Sem permissão para gerenciar pré-matrículas deste polo';
    END IF;
    
    -- Verificar se status permite aprovação
    IF v_status NOT IN ('enviado', 'em_analise') THEN
        RAISE EXCEPTION 'Apenas pré-matrículas enviadas ou em análise podem ser aprovadas';
    END IF;
    
    -- Atualizar status
    UPDATE public.pre_matriculas 
    SET status = 'aprovado',
        data_aprovacao = NOW(),
        analisado_por = auth.uid(),
        observacoes_internas = COALESCE(observacoes_internas, '') || 
                               CASE WHEN p_observacoes_admin IS NOT NULL 
                                    THEN CHR(10) || 'Aprovação: ' || p_observacoes_admin 
                                    ELSE '' END
    WHERE id = p_pre_matricula_id;
    
    -- TODO: Enviar notificação de aprovação
    
    RETURN TRUE;
END;
$$;

-- Function para rejeitar pré-matrícula
CREATE OR REPLACE FUNCTION public.rejeitar_pre_matricula(
    p_pre_matricula_id UUID,
    p_motivo_rejeicao TEXT,
    p_observacoes_admin TEXT DEFAULT NULL
)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_polo_id UUID;
    v_status TEXT;
BEGIN
    -- Validar motivo
    IF p_motivo_rejeicao IS NULL OR length(trim(p_motivo_rejeicao)) = 0 THEN
        RAISE EXCEPTION 'Motivo da rejeição é obrigatório';
    END IF;
    
    -- Buscar informações da pré-matrícula
    SELECT polo_id, status INTO v_polo_id, v_status
    FROM public.pre_matriculas 
    WHERE id = p_pre_matricula_id;
    
    -- Verificar se existe
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Pré-matrícula não encontrada';
    END IF;
    
    -- Verificar permissão
    IF NOT can_manage_pre_matricula(v_polo_id) THEN
        RAISE EXCEPTION 'Sem permissão para gerenciar pré-matrículas deste polo';
    END IF;
    
    -- Verificar se status permite rejeição
    IF v_status NOT IN ('enviado', 'em_analise') THEN
        RAISE EXCEPTION 'Apenas pré-matrículas enviadas ou em análise podem ser rejeitadas';
    END IF;
    
    -- Atualizar status
    UPDATE public.pre_matriculas 
    SET status = 'rejeitado',
        data_rejeicao = NOW(),
        analisado_por = auth.uid(),
        motivo_rejeicao = p_motivo_rejeicao,
        observacoes_internas = COALESCE(observacoes_internas, '') || 
                               CASE WHEN p_observacoes_admin IS NOT NULL 
                                    THEN CHR(10) || 'Rejeição: ' || p_observacoes_admin 
                                    ELSE '' END
    WHERE id = p_pre_matricula_id;
    
    -- TODO: Enviar notificação de rejeição
    
    RETURN TRUE;
END;
$$;

-- Function para solicitar documento adicional
CREATE OR REPLACE FUNCTION public.solicitar_documento(
    p_pre_matricula_id UUID,
    p_tipo_documento tipo_documento,
    p_observacao TEXT DEFAULT NULL
)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_polo_id UUID;
    v_status TEXT;
BEGIN
    -- Buscar informações da pré-matrícula
    SELECT polo_id, status INTO v_polo_id, v_status
    FROM public.pre_matriculas 
    WHERE id = p_pre_matricula_id;
    
    -- Verificar se existe
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Pré-matrícula não encontrada';
    END IF;
    
    -- Verificar permissão
    IF NOT can_manage_pre_matricula(v_polo_id) THEN
        RAISE EXCEPTION 'Sem permissão para gerenciar pré-matrículas deste polo';
    END IF;
    
    -- Verificar se status permite solicitação
    IF v_status NOT IN ('enviado', 'em_analise') THEN
        RAISE EXCEPTION 'Apenas pré-matrículas enviadas ou em análise podem receber solicitações';
    END IF;
    
    -- Adicionar observação interna
    UPDATE public.pre_matriculas 
    SET observacoes_internas = COALESCE(observacoes_internas, '') || 
                               CHR(10) || 'Solicitação de documento (' || p_tipo_documento || '): ' || 
                               COALESCE(p_observacao, 'Sem observações') || 
                               ' em ' || NOW()
    WHERE id = p_pre_matricula_id;
    
    -- TODO: Enviar notificação solicitando documento
    
    RETURN TRUE;
END;
$$;

-- Function para converter pré-matrícula em matrícula formal
CREATE OR REPLACE FUNCTION public.converter_para_matricula(
    p_pre_matricula_id UUID,
    p_turma_id UUID,
    p_observacoes TEXT DEFAULT NULL
)
RETURNS UUID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_polo_id UUID;
    v_status TEXT;
    v_aluno_id UUID;
    v_responsavel_id UUID;
    v_matricula_id UUID;
BEGIN
    -- Buscar informações da pré-matrícula
    SELECT polo_id, status INTO v_polo_id, v_status
    FROM public.pre_matriculas 
    WHERE id = p_pre_matricula_id;
    
    -- Verificar se existe
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Pré-matrícula não encontrada';
    END IF;
    
    -- Verificar permissão
    IF NOT can_manage_pre_matricula(v_polo_id) THEN
        RAISE EXCEPTION 'Sem permissão para gerenciar pré-matrículas deste polo';
    END IF;
    
    -- Verificar se status permite conversão
    IF v_status != 'aprovado' THEN
        RAISE EXCEPTION 'Apenas pré-matrículas aprovadas podem ser convertidas';
    END IF;
    
    -- TODO: Implementar lógica de conversão
    -- 1. Criar aluno
    -- 2. Criar responsável (se necessário)
    -- 3. Criar matrícula formal
    -- 4. Atualizar status da pré-matrícula para 'convertido'
    
    -- Atualizar status da pré-matrícula
    UPDATE public.pre_matriculas 
    SET status = 'convertido',
        data_conversao = NOW(),
        observacoes_internas = COALESCE(observacoes_internas, '') || 
                               CHR(10) || 'Convertido para matrícula formal em ' || NOW() ||
                               CASE WHEN p_observacoes IS NOT NULL 
                                    THEN CHR(10) || 'Observações: ' || p_observacoes 
                                    ELSE '' END
    WHERE id = p_pre_matricula_id;
    
    -- TODO: Retornar ID da matrícula criada
    RETURN NULL; -- Placeholder
END;
$$;

-- Function para listar pré-matrículas (para administradores)
CREATE OR REPLACE FUNCTION public.listar_pre_matriculas(
    p_polo_id UUID DEFAULT NULL,
    p_status status_pre_matricula DEFAULT NULL,
    p_nivel nivel_ensino DEFAULT NULL,
    p_ano_letivo INTEGER DEFAULT NULL,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    nome_completo TEXT,
    email TEXT,
    cpf TEXT,
    status status_pre_matricula,
    nivel_desejado nivel_ensino,
    ano_letivo INTEGER,
    data_envio TIMESTAMPTZ,
    data_nascimento DATE,
    polo_id UUID,
    created_at TIMESTAMPTZ
)
SECURITY DEFINER
SET search_path = public
LANGUAGE sql STABLE
AS $$
    SELECT 
        pm.id,
        pm.nome_completo,
        pm.email,
        pm.cpf,
        pm.status,
        pm.nivel_desejado,
        pm.ano_letivo,
        pm.data_envio,
        pm.data_nascimento,
        pm.polo_id,
        pm.created_at
    FROM public.pre_matriculas pm
    WHERE 
        -- Filtro de polo (admin global pode ver todos, outros só seu polo)
        (p_polo_id IS NULL OR pm.polo_id = p_polo_id)
        AND (
            is_admin_global() 
            OR pm.polo_id = (SELECT polo_id FROM public.usuarios WHERE id = auth.uid())
        )
        -- Filtros opcionais
        AND (p_status IS NULL OR pm.status = p_status)
        AND (p_nivel IS NULL OR pm.nivel_desejado = p_nivel)
        AND (p_ano_letivo IS NULL OR pm.ano_letivo = p_ano_letivo)
    ORDER BY pm.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
$$;

-- Function para obter estatísticas de pré-matrículas
CREATE OR REPLACE FUNCTION public.estatisticas_pre_matriculas(
    p_polo_id UUID DEFAULT NULL,
    p_ano_letivo INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)
)
RETURNS TABLE (
    status TEXT,
    quantidade BIGINT,
    percentual NUMERIC(5,2)
)
SECURITY DEFINER
SET search_path = public
LANGUAGE sql STABLE
AS $$
    WITH total AS (
        SELECT COUNT(*) as total_count
        FROM public.pre_matriculas pm
        WHERE 
            (p_polo_id IS NULL OR pm.polo_id = p_polo_id)
            AND pm.ano_letivo = p_ano_letivo
            AND (
                is_admin_global() 
                OR pm.polo_id = (SELECT polo_id FROM public.usuarios WHERE id = auth.uid())
            )
    )
    SELECT 
        pm.status::TEXT,
        COUNT(*) as quantidade,
        (COUNT(*) * 100.0 / (SELECT total_count FROM total)) as percentual
    FROM public.pre_matriculas pm, total
    WHERE 
        (p_polo_id IS NULL OR pm.polo_id = p_polo_id)
        AND pm.ano_letivo = p_ano_letivo
        AND (
            is_admin_global() 
            OR pm.polo_id = (SELECT polo_id FROM public.usuarios WHERE id = auth.uid())
        )
    GROUP BY pm.status
    ORDER BY quantidade DESC;
$$;

-- Grants para as functions
REVOKE EXECUTE ON FUNCTION public.criar_pre_matricula(...) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.criar_pre_matricula(...) TO anon;
GRANT EXECUTE ON FUNCTION public.criar_pre_matricula(...) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.enviar_pre_matricula(UUID) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.enviar_pre_matricula(UUID) TO service_role;

REVOKE EXECUTE ON FUNCTION public.aprovar_pre_matricula(UUID, TEXT) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.aprovar_pre_matricula(UUID, TEXT) TO service_role;

REVOKE EXECUTE ON FUNCTION public.rejeitar_pre_matricula(UUID, TEXT, TEXT) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rejeitar_pre_matricula(UUID, TEXT, TEXT) TO service_role;

REVOKE EXECUTE ON FUNCTION public.solicitar_documento(UUID, tipo_documento, TEXT) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.solicitar_documento(UUID, tipo_documento, TEXT) TO service_role;

REVOKE EXECUTE ON FUNCTION public.converter_para_matricula(UUID, UUID, TEXT) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.converter_para_matricula(UUID, UUID, TEXT) TO service_role;

REVOKE EXECUTE ON FUNCTION public.listar_pre_matriculas(UUID, status_pre_matricula, nivel_ensino, INTEGER, INTEGER, INTEGER) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.listar_pre_matriculas(UUID, status_pre_matricula, nivel_ensino, INTEGER, INTEGER, INTEGER) TO service_role;

REVOKE EXECUTE ON FUNCTION public.estatisticas_pre_matriculas(UUID, INTEGER) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.estatisticas_pre_matriculas(UUID, INTEGER) TO service_role;
