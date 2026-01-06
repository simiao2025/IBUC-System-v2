-- FASE 4 - PRÉ-MATRÍCULA PÚBLICA
-- Sistema de notificações (email templates + triggers)

-- Tabela para controle de notificações
CREATE TABLE IF NOT EXISTS public.notificacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ,
    
    -- Destinatário
    email_destinatario TEXT NOT NULL,
    nome_destinatario TEXT NOT NULL,
    
    -- Tipo de notificação
    tipo_notificacao TEXT NOT NULL,
    template TEXT NOT NULL,
    
    -- Dados do template (JSON)
    dados_template JSONB NOT NULL DEFAULT '{}',
    
    -- Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
    
    -- Controle de tentativas
    tentativas INTEGER DEFAULT 0,
    max_tentativas INTEGER DEFAULT 3,
    proxima_tentativa TIMESTAMPTZ DEFAULT NOW(),
    
    -- Erros
    erro_mensagem TEXT,
    
    -- Relacionamento
    pre_matricula_id UUID REFERENCES public.pre_matriculas(id),
    
    -- Multi-tenancy
    polo_id UUID NOT NULL REFERENCES public.polos(id)
);

-- Índices para notificações
CREATE INDEX IF NOT EXISTS idx_notificacoes_status ON public.notificacoes(status);
CREATE INDEX IF NOT EXISTS idx_notificacoes_proxima_tentativa ON public.notificacoes(proxima_tentativa) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_notificacoes_tipo ON public.notificacoes(tipo_notificacao);
CREATE INDEX IF NOT EXISTS idx_notificacoes_pre_matricula ON public.notificacoes(pre_matricula_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_polo ON public.notificacoes(polo_id);

-- Tabela de templates de email
CREATE TABLE IF NOT EXISTS public.email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Identificação
    nome TEXT NOT NULL UNIQUE,
    tipo_notificacao TEXT NOT NULL,
    
    -- Conteúdo
    assunto TEXT NOT NULL,
    corpo_html TEXT NOT NULL,
    corpo_texto TEXT NOT NULL,
    
    -- Variáveis do template (ex: {{nome}}, {{status}}, etc)
    variaveis JSONB DEFAULT '{}',
    
    -- Status
    ativo BOOLEAN DEFAULT TRUE,
    
    -- Multi-tenancy
    polo_id UUID REFERENCES public.polos(id) -- NULL para templates globais
);

-- Índices para templates
CREATE INDEX IF NOT EXISTS idx_email_templates_tipo ON public.email_templates(tipo_notificacao);
CREATE INDEX IF NOT EXISTS idx_email_templates_ativo ON public.email_templates(ativo);
CREATE INDEX IF NOT EXISTS idx_email_templates_polo ON public.email_templates(polo_id);

-- Inserir templates básicos
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
     <p>Qualquer dúvida, entre em contato conosco.</p>
     <br>
     <p>Atenciosamente,<br>Equipe IBUC</p>',
    'Pré-matrícula recebida!
     
     Olá, {{nome_responsavel}}!
     
     Recebemos sua pré-matrícula para {{nome_aluno}} com sucesso.
     
     Protocolo: {{protocolo}}
     Status atual: {{status}}
     
     Sua solicitação está em análise e entraremos em contato em breve.
     
     Qualquer dúvida, entre em contato conosco.
     
     Atenciosamente,
     Equipe IBUC',
    '{"nome_responsavel": "text", "nome_aluno": "text", "protocolo": "text", "status": "text"}'
),
(
    'solicitacao_documento',
    'documento_pendente',
    'IBUC - Documento solicitado para pré-matrícula',
    '<h2>Documento solicitado</h2>
     <p>Olá, {{nome_responsavel}}!</p>
     <p>Para continuar com a análise da pré-matrícula de <strong>{{nome_aluno}}</strong>, precisamos que você envie o seguinte documento:</p>
     <p><strong>{{tipo_documento}}</strong></p>
     <p>{{observacao}}</p>
     <p>Acesse o sistema para fazer o upload do documento.</p>
     <br>
     <p>Atenciosamente,<br>Equipe IBUC</p>',
    'Documento solicitado
     
     Olá, {{nome_responsavel}}!
     
     Para continuar com a análise da pré-matrícula de {{nome_aluno}}, precisamos que você envie o seguinte documento:
     
     {{tipo_documento}}
     {{observacao}}
     
     Acesse o sistema para fazer o upload do documento.
     
     Atenciosamente,
     Equipe IBUC',
    '{"nome_responsavel": "text", "nome_aluno": "text", "tipo_documento": "text", "observacao": "text"}'
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
     <p>{{observacoes_adicionais}}</p>
     <br>
     <p>Atenciosamente,<br>Equipe IBUC</p>',
    'Parabéns! Pré-matrícula aprovada!
     
     Olá, {{nome_responsavel}}!
     
     Temos boas notícias! A pré-matrícula de {{nome_aluno}} foi aprovada.
     
     Próximos passos:
     - Aguarde nosso contato para formalizar a matrícula
     - Prepare os documentos originais para entrega
     - Esteja atento às datas de início das aulas
     
     {{observacoes_adicionais}}
     
     Atenciosamente,
     Equipe IBUC',
    '{"nome_responsavel": "text", "nome_aluno": "text", "observacoes_adicionais": "text"}'
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
),
(
    'convocacao_matricula',
    'convocacao',
    'IBUC - Convocação para matrícula',
    '<h2>Convocação para matrícula</h2>
     <p>Olá, {{nome_responsavel}}!</p>
     <p>Você está sendo convocado para formalizar a matrícula de <strong>{{nome_aluno}}</strong>.</p>
     <p><strong>Data:</strong> {{data_matricula}}</p>
     <p><strong>Horário:</strong> {{horario_matricula}}</p>
     <p><strong>Local:</strong> {{local_matricula}}</p>
     <p><strong>Documentos necessários:</strong></p>
     <ul>{{lista_documentos}}</ul>
     <p>{{observacoes}}</p>
     <br>
     <p>Atenciosamente,<br>Equipe IBUC</p>',
    'Convocação para matrícula
     
     Olá, {{nome_responsavel}}!
     
     Você está sendo convocado para formalizar a matrícula de {{nome_aluno}}.
     
     Data: {{data_matricula}}
     Horário: {{horario_matricula}}
     Local: {{local_matricula}}
     
     Documentos necessários:
     {{lista_documentos}}
     
     {{observacoes}}
     
     Atenciosamente,
     Equipe IBUC',
    '{"nome_responsavel": "text", "nome_aluno": "text", "data_matricula": "text", "horario_matricula": "text", "local_matricula": "text", "lista_documentos": "text", "observacoes": "text"}'
)
ON CONFLICT (nome) DO NOTHING;

-- Function para criar notificação
CREATE OR REPLACE FUNCTION public.criar_notificacao(
    p_pre_matricula_id UUID,
    p_tipo_notificacao TEXT,
    p_dados_template JSONB DEFAULT '{}'
)
RETURNS UUID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_pre_matricula RECORD;
    v_template RECORD;
    v_notificacao_id UUID;
    v_polo_id UUID;
BEGIN
    -- Buscar dados da pré-matrícula
    SELECT * INTO v_pre_matricula
    FROM public.pre_matriculas 
    WHERE id = p_pre_matricula_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Pré-matrícula não encontrada';
    END IF;
    
    v_polo_id := v_pre_matricula.polo_id;
    
    -- Buscar template (primeiro do polo, depois global)
    SELECT * INTO v_template
    FROM public.email_templates 
    WHERE tipo_notificacao = p_tipo_notificacao
      AND ativo = true
      AND (polo_id = v_polo_id OR polo_id IS NULL)
    ORDER BY polo_id DESC NULLS LAST
    LIMIT 1;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Template de notificação não encontrado para tipo: %', p_tipo_notificacao;
    END IF;
    
    -- Inserir notificação
    INSERT INTO public.notificacoes (
        email_destinatario,
        nome_destinatario,
        tipo_notificacao,
        template,
        dados_template,
        pre_matricula_id,
        polo_id
    ) VALUES (
        v_pre_matricula.email,
        v_pre_matricula.nome_completo,
        p_tipo_notificacao,
        v_template.nome,
        p_dados_template,
        p_pre_matricula_id,
        v_polo_id
    ) RETURNING id INTO v_notificacao_id;
    
    RETURN v_notificacao_id;
END;
$$;

-- Function para enviar notificação (integrar com serviço de email)
CREATE OR REPLACE FUNCTION public.enviar_notificacao(
    p_notificacao_id UUID
)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_notificacao RECORD;
    v_template RECORD;
    v_assunto TEXT;
    v_corpo_html TEXT;
    v_corpo_texto TEXT;
    v_dados JSONB;
BEGIN
    -- Buscar notificação
    SELECT * INTO v_notificacao
    FROM public.notificacoes 
    WHERE id = p_notificacao_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Notificação não encontrada';
    END IF;
    
    -- Verificar se pode enviar
    IF v_notificacao.status != 'pending' THEN
        RAISE EXCEPTION 'Notificação não está pendente';
    END IF;
    
    IF v_notificacao.tentativas >= v_notificacao.max_tentativas THEN
        UPDATE public.notificacoes 
        SET status = 'failed',
            erro_mensagem = 'Número máximo de tentativas excedido'
        WHERE id = p_notificacao_id;
        RETURN FALSE;
    END IF;
    
    -- Buscar template
    SELECT * INTO v_template
    FROM public.email_templates 
    WHERE nome = v_notificacao.template;
    
    IF NOT FOUND THEN
        UPDATE public.notificacoes 
        SET status = 'failed',
            erro_mensagem = 'Template não encontrado'
        WHERE id = p_notificacao_id;
        RETURN FALSE;
    END IF;
    
    -- Preparar dados para substituição
    v_dados := COALESCE(v_notificacao.dados_template, '{}');
    
    -- Substituir variáveis (simplificado - em produção usar template engine)
    v_assunto := v_template.assunto;
    v_corpo_html := v_template.corpo_html;
    v_corpo_texto := v_template.corpo_texto;
    
    -- TODO: Implementar substituição real de variáveis usando regex ou template engine
    
    -- TODO: Integrar com serviço de email (SendGrid, SES, etc.)
    -- Exemplo: SELECT * FROM send_email(v_notificacao.email_destinatario, v_assunto, v_corpo_html, v_corpo_texto);
    
    -- Simular envio bem-sucedido
    UPDATE public.notificacoes 
    SET status = 'sent',
        sent_at = NOW(),
        tentativas = tentativas + 1
    WHERE id = p_notificacao_id;
    
    RETURN TRUE;
END;
$$;

-- Function para processar notificações pendentes
CREATE OR REPLACE FUNCTION public.processar_notificacoes_pendentes()
RETURNS INTEGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_count INTEGER := 0;
    v_notificacao RECORD;
BEGIN
    -- Buscar notificações pendentes
    FOR v_notificacao IN 
        SELECT id 
        FROM public.notificacoes 
        WHERE status = 'pending' 
          AND proxima_tentativa <= NOW()
        ORDER BY proxima_tentativa
        LIMIT 100
    LOOP
        IF enviar_notificacao(v_notificacao.id) THEN
            v_count := v_count + 1;
        END IF;
    END LOOP;
    
    RETURN v_count;
END;
$$;

-- Triggers automáticos para notificações

-- Trigger para notificar envio de pré-matrícula
CREATE OR REPLACE FUNCTION public.notificar_envio_pre_matricula()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'enviado' AND OLD.status != 'enviado' THEN
        PERFORM criar_notificacao(
            NEW.id,
            'confirmacao_envio',
            jsonb_build_object(
                'nome_responsavel', NEW.nome_completo,
                'nome_aluno', NEW.nome_completo,
                'protocolo', NEW.id::TEXT,
                'status', 'Enviado para análise'
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pre_matriculas_notificar_envio
    AFTER UPDATE ON public.pre_matriculas
    FOR EACH ROW
    EXECUTE FUNCTION public.notificar_envio_pre_matricula();

-- Trigger para notificar aprovação
CREATE OR REPLACE FUNCTION public.notificar_aprovacao()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'aprovado' AND OLD.status != 'aprovado' THEN
        PERFORM criar_notificacao(
            NEW.id,
            'aprovacao',
            jsonb_build_object(
                'nome_responsavel', NEW.nome_completo,
                'nome_aluno', NEW.nome_completo,
                'observacoes_adicionais', COALESCE(NEW.observacoes_internas, '')
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pre_matriculas_notificar_aprovacao
    AFTER UPDATE ON public.pre_matriculas
    FOR EACH ROW
    EXECUTE FUNCTION public.notificar_aprovacao();

-- Trigger para notificar rejeição
CREATE OR REPLACE FUNCTION public.notificar_rejeicao()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'rejeitado' AND OLD.status != 'rejeitado' THEN
        PERFORM criar_notificacao(
            NEW.id,
            'rejeicao',
            jsonb_build_object(
                'nome_responsavel', NEW.nome_completo,
                'nome_aluno', NEW.nome_completo,
                'motivo_rejeicao', COALESCE(NEW.motivo_rejeicao, 'Não informado')
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pre_matriculas_notificar_rejeicao
    AFTER UPDATE ON public.pre_matriculas
    FOR EACH ROW
    EXECUTE FUNCTION public.notificar_rejeicao();

-- RLS para notificações
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Policies para notificações
CREATE POLICY "Administradores podem gerenciar notificações"
ON public.notificacoes
FOR ALL
TO authenticated
USING (
    can_manage_pre_matricula(polo_id)
);

-- Policies para templates
CREATE POLICY "Administradores podem gerenciar templates"
ON public.email_templates
FOR ALL
TO authenticated
USING (
    polo_id IS NULL OR can_manage_pre_matricula(polo_id)
);

-- Grants
GRANT SELECT, INSERT, UPDATE ON public.notificacoes TO authenticated;
GRANT SELECT ON public.email_templates TO authenticated;

REVOKE EXECUTE ON FUNCTION public grapes_notificacao(UUID, TEXT, JSONB) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.criar_notificacao(UUID, TEXT, JSONB) TO service_role;

REVOKE EXECUTE ON FUNCTION public.enviar_notificacao(UUID) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.enviar_notificacao(UUID) TO service_role;

REVOKE EXECUTE ON FUNCTION public.processar_notificacoes_pendentes() FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.processar_notificacoes_pendentes() TO service_role;

-- Agendamento para processar notificações
-- SELECT cron.schedule('process-notificacoes', ' ara cada 5 minutos', 'SELECT public.processar_notificacoes_pendentes();');
