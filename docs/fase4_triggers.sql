-- FASE 4 - PRÉ-MATRÍCULA PÚBLICA
-- Triggers adicionais para validações de negócio

-- Trigger para validação de CPF único (já existem índices, mas trigger garante consistência)
CREATE OR REPLACE FUNCTION public.validate_cpf_unique()
RETURNS TRIGGER AS $$
BEGIN
    -- Verificar duplicidade de CPF apenas para pré-matrículas ativas
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
    -- Verificar duplicidade de email apenas para pré-matrículas ativas
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
    -- Se não houver mudança de status, permitir
    IF OLD.status = NEW.status THEN
        RETURN NEW;
    END IF;
    
    -- Validação das transições permitidas
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
            
        ELSE
            RAISE EXCEPTION 'Status desconhecido: %', OLD.status;
    END CASE;
    
    -- Definir datas automáticas baseadas no status
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

-- Trigger para validação de documentos obrigatórios antes do envio
CREATE OR REPLACE FUNCTION public.validate_required_documents()
RETURNS TRIGGER AS $$
BEGIN
    -- Se status está mudando para 'enviado', verificar documentos obrigatórios
    IF NEW.status = 'enviado' AND OLD.status != 'enviado' THEN
        -- Verificar documentos obrigatórios do aluno
        IF NOT EXISTS (
            SELECT 1 FROM public.pre_matricula_documentos 
            WHERE pre_matricula_id = NEW.id
            AND tipo_documento IN ('cpf_aluno', 'rg_aluno', 'certidao_nascimento', 'comprovante_residencia', 'foto_aluno')
            GROUP BY pre_matricula_id
            HAVING COUNT(DISTINCT tipo_documento) = 5
        ) THEN
            RAISE EXCEPTION 'Todos os documentos obrigatórios do aluno devem ser anexados antes do envio';
        END IF;
        
        -- Verificar se aluno é menor de 18 anos e precisa documentos do responsável
        IF AGE(CURRENT_DATE, NEW.data_nascimento) < INTERVAL '18 years' THEN
            IF NOT EXISTS (
                SELECT 1 FROM public.pre_matricula_documentos 
                WHERE pre_matricula_id = NEW.id
                AND tipo_documento IN ('cpf_responsavel', 'rg_responsavel')
                GROUP BY pre_matricula_id
                HAVING COUNT(DISTINCT tipo_documento) = 2
            ) THEN
                RAISE EXCEPTION 'Documentos do responsável são obrigatórios para menores de 18 anos';
            END IF;
        END IF;
        
        -- Verificar se possui deficiência e precisa de laudo
        IF NEW.possui_deficiencia = TRUE THEN
            IF NOT EXISTS (
                SELECT 1 FROM public.pre_matricula_documentos 
                WHERE pre_matricula_id = NEW.id
                AND tipo_documento = 'laudo_medico'
            ) THEN
                RAISE EXCEPTION 'Laudo médico é obrigatório quando possui deficiência';
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pre_matriculas_validate_required_documents
    BEFORE UPDATE ON public.pre_matriculas
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_required_documents();

-- Trigger para validação de tamanho e tipo de arquivo
CREATE OR REPLACE FUNCTION public.validate_document_upload()
RETURNS TRIGGER AS $$
BEGIN
    -- Validar tamanho máximo (5MB)
    IF NEW.tamanho_arquivo > 5 * 1024 * 1024 THEN
        RAISE EXCEPTION 'Tamanho máximo de arquivo permitido é 5MB';
    END IF;
    
    -- Validar MIME types permitidos
    IF NEW.mime_type NOT IN (
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp'
    ) THEN
        RAISE EXCEPTION 'Tipo de arquivo não permitido. Apenas PDF, JPG, PNG ou WebP';
    END IF;
    
    -- Validar nome do arquivo
    IF NEW.nome_arquivo IS NULL OR length(trim(NEW.nome_arquivo)) = 0 THEN
        RAISE EXCEPTION 'Nome do arquivo é obrigatório';
    END IF;
    
    -- Validar caminho do arquivo
    IF NEW.caminho_arquivo IS NULL OR length(trim(NEW.caminho_arquivo)) = 0 THEN
        RAISE EXCEPTION 'Caminho do arquivo é obrigatório';
    END IF;
    
    -- Validar checksum
    IF NEW.checksum IS NULL OR length(trim(NEW.checksum)) != 64 THEN
        RAISE EXCEPTION 'Checksum SHA-256 é obrigatório e deve ter 64 caracteres';
    END IF;
    
    -- Verificar duplicidade de documento para mesma pré-matrícula
    IF EXISTS (
        SELECT 1 FROM public.pre_matricula_documentos 
        WHERE pre_matricula_id = NEW.pre_matricula_id
        AND tipo_documento = NEW.tipo_documento
        AND id != NEW.id
    ) THEN
        RAISE EXCEPTION 'Já existe um documento deste tipo para esta pré-matrícula';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pre_matricula_documentos_validate_upload
    BEFORE INSERT OR UPDATE ON public.pre_matricula_documentos
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_document_upload();

-- Trigger para atualizar polo_id nos documentos baseado na pré-matrícula
CREATE OR REPLACE FUNCTION public.sync_documento_polo_id()
RETURNS TRIGGER AS $$
BEGIN
    -- Sincronizar polo_id com a pré-matrícula
    SELECT polo_id INTO NEW.polo_id
    FROM public.pre_matriculas 
    WHERE id = NEW.pre_matricula_id;
    
    IF NEW.polo_id IS NULL THEN
        RAISE EXCEPTION 'Pré-matrícula não encontrada ou polo_id inválido';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pre_matricula_documentos_sync_polo_id
    BEFORE INSERT OR UPDATE ON public.pre_matricula_documentos
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_documento_polo_id();

-- Trigger para log de alterações de documentos
CREATE OR REPLACE FUNCTION public.log_documento_changes()
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
            NEW.pre_matricula_id,
            auth.uid(),
            current_setting('app.current_role', true),
            'documento_' || NEW.tipo_documento,
            NULL,
            NEW.nome_arquivo,
            'insert',
            'Documento ' || NEW.tipo_documento || ' adicionado: ' || NEW.nome_arquivo,
            NEW.polo_id
        );
        RETURN NEW;
        
    ELSIF TG_OP = 'UPDATE' THEN
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
                NEW.pre_matricula_id,
                auth.uid(),
                current_setting('app.current_role', true),
                'documento_status_' || NEW.tipo_documento,
                OLD.status,
                NEW.status,
                'update',
                'Status do documento ' || NEW.tipo_documento || ' alterado de ' || OLD.status || ' para ' || NEW.status,
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
            OLD.pre_matricula_id,
            auth.uid(),
            current_setting('app.current_role', true),
            'documento_' || OLD.tipo_documento,
            OLD.nome_arquivo,
            NULL,
            'delete',
            'Documento ' || OLD.tipo_documento << ' removido: ' || OLD.nome_arquivo,
            OLD.polo_id
        );
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pre_matricula_documentos_log_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.pre_matricula_documentos
    FOR EACH ROW
    EXECUTE FUNCTION public.log_documento_changes();

-- Trigger para limpeza automática de rascunhos antigos (mais de 30 dias)
CREATE OR REPLACE FUNCTION public.cleanup_old_drafts()
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM public.pre_matricula_documentos 
    WHERE pre_matricula_id IN (
        SELECT id FROM public.pre_matriculas 
        WHERE status = 'rascunho' 
        AND created_at < NOW() - INTERVAL '30 days'
    );
    
    DELETE FROM public.pre_matricula_historico 
    WHERE pre_matricula_id IN (
        SELECT id FROM public.pre_matriculas 
        WHERE status = 'rascunho' 
        AND created_at < NOW() - INTERVAL '30 days'
    );
    
    DELETE FROM public.pre_matriculas 
    WHERE status = 'rascunho' 
    AND created_at < NOW() - INTERVAL '30 days';
    
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
        id,
        NULL,
        'system',
        'cleanup',
        'old_draft',
        NULL,
        'delete',
        'Rascunho antigo removido automaticamente',
        polo_id
    FROM public.pre_matriculas 
    WHERE status = 'rascunho' 
    AND created_at < NOW() - INTERVAL '30 days';
END;
$$;

-- Criar agendamento para limpeza (requer pg_cron extension)
-- SELECT cron.schedule('cleanup-pre-matricula-drafts', '0 2 * * *', 'SELECT public.cleanup_old_drafts();');
