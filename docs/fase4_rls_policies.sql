-- FASE 4 - PRÉ-MATRÍCULA PÚBLICA
-- RLS Policies para controle de acesso multi-tenant

-- Helper functions para RLS
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

CREATE OR REPLACE FUNCTION public.is_polo_user(polo_id_param UUID)
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
          AND polo_id = polo_id_param
    );
$$;

CREATE OR REPLACE FUNCTION public.can_manage_pre_matricula(polo_id_param UUID)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE sql STABLE
AS $$
    -- Super admin e admin global podem gerenciar todos os polos
    -- Outros usuários só podem gerenciar seu próprio polo
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

-- RLS Policies para pre_matriculas
-- CREATE POLICY para público (leitura limitada)
CREATE POLICY "Publicos podem visualizar pré-matrículas públicas"
ON public.pre_matriculas
FOR SELECT
TO anon
USING (
    -- Apenas dados públicos, sem informações sensíveis
    status = 'aprovado'
    AND polo_id IS NOT NULL
)
WITH CHECK (false);

-- CREATE POLICY para autenticados (leitura limitada)
CREATE POLICY "Autenticados podem visualizar pré-matrículas públicas"
ON public.pre_matriculas
FOR SELECT
TO authenticated
USING (
    -- Apenas dados públicos, sem informações sensíveis
    status = 'aprovado'
    AND polo_id IS NOT NULL
);

-- CREATE POLICY para dono da pré-matrícula
CREATE POLICY "Dono pode gerenciar sua pré-matrícula"
ON public.pre_matriculas
FOR ALL
TO authenticated
USING (
    -- Identificar pelo email ou CPF (já que não há usuário autenticado para pré-matrícula pública)
    -- Esta policy será usada quando o responsável criar uma conta depois
    email_lower = (
        SELECT COALESCE(
            (SELECT email FROM public.usuarios WHERE id = auth.uid()),
            ''
        )
    )
    OR cpf_normalizado = (
        SELECT COALESCE(
            (SELECT regexp_replace(cpf, '[^0-9]', '', 'g') FROM public.usuarios WHERE id = auth.uid()),
            ''
        )
    )
)
WITH CHECK (
    -- Permitir inserção de rascunhos sem autenticação
    status = 'rascunho'
    OR (
        email_lower = (
            SELECT COALESCE(
                (SELECT email FROM public.usuarios WHERE id = auth.uid()),
                ''
            )
        )
        OR cpf_normalizado = (
            SELECT COALESCE(
                (SELECT regexp_replace(cpf, '[^0-9]', '', 'g') FROM public.usuarios WHERE id = auth.uid()),
                ''
            )
        )
    )
);

-- CREATE POLICY para administradores
CREATE POLICY "Administradores podem gerenciar pré-matrículas"
ON public.pre_matriculas
FOR ALL
TO authenticated
USING (
    can_manage_pre_matricula(polo_id)
)
WITH CHECK (
    can_manage_pre_matricula(polo_id)
);

-- RLS Policies para pre_matricula_documentos
-- CREATE POLICY para público (nenhum acesso)
CREATE POLICY "Sem acesso público a documentos"
ON public.pre_matricula_documentos
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- CREATE POLICY para dono dos documentos
CREATE POLICY "Dono pode gerenciar seus documentos"
ON public.pre_matricula_documentos
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 
        FROM public.pre_matriculas pm
        WHERE pm.id = pre_matricula_documentos.pre_matricula_id
        AND (
            pm.email_lower = (
                SELECT COALESCE(
                    (SELECT email FROM public.usuarios WHERE id = auth.uid()),
                    ''
                )
            )
            OR pm.cpf_normalizado = (
                SELECT COALESCE(
                    (SELECT regexp_replace(cpf, '[^0-9]', '', 'g') FROM public.usuarios WHERE id = auth.uid()),
                    ''
                )
            )
        )
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 
        FROM public.pre_matriculas pm
        WHERE pm.id = pre_matricula_documentos.pre_matricula_id
        AND can_manage_pre_matricula(pm.polo_id)
    )
);

-- CREATE POLICY para administradores
CREATE POLICY "Administradores podem gerenciar documentos"
ON public.pre_matricula_documentos
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 
        FROM public.pre_matriculas pm
        WHERE pm.id = pre_matricula_documentos.pre_matricula_id
        AND can_manage_pre_matricula(pm.polo_id)
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 
        FROM public.pre_matriculas pm
        WHERE pm.id = pre_matricula_documentos.pre_matricula_id
        AND can_manage_pre_matricula(pm.polo_id)
    )
);

-- RLS Policies para pre_matricula_historico
-- CREATE POLICY para público (leitura limitada)
CREATE POLICY "Publicos podem visualizar histórico público"
ON public.pre_matricula_historico
FOR SELECT
TO anon
USING (
    EXISTS (
        SELECT 1 
        FROM public.pre_matriculas pm
        WHERE pm.id = pre_matricula_historico.pre_matricula_id
        AND pm.status = 'aprovado'
    )
    AND campo_alterado = 'status'
);

-- CREATE POLICY para autenticados (leitura limitada)
CREATE POLICY "Autenticados podem visualizar histórico público"
ON public.pre_matricula_historico
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 
        FROM public.pre_matriculas pm
        WHERE pm.id = pre_matricula_historico.pre_matricula_id
        AND pm.status = 'aprovado'
    )
    AND campo_alterado = 'status'
);

-- CREATE POLICY para dono da pré-matrícula
CREATE POLICY "Dono pode visualizar seu histórico"
ON public.pre_matricula_historico
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 
        FROM public.pre_matriculas pm
        WHERE pm.id = pre_matricula_historico.pre_matricula_id
        AND (
            pm.email_lower = (
                SELECT COALESCE(
                    (SELECT email FROM public.usuarios WHERE id = auth.uid()),
                    ''
                )
            )
            OR pm.cpf_normalizado = (
                SELECT COALESCE(
                    (SELECT regexp_replace(cpf, '[^0-9]', '', 'g') FROM public.usuarios WHERE id = auth.uid()),
                    ''
                )
            )
        )
    )
);

-- CREATE POLICY para administradores
CREATE POLICY "Administradores podem gerenciar histórico"
ON public.pre_matricula_historico
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 
        FROM public.pre_matriculas pm
        WHERE pm.id = pre_matricula_historico.pre_matricula_id
        AND can_manage_pre_matricula(pm.polo_id)
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 
        FROM public.pre_matriculas pm
        WHERE pm.id = pre_matricula_historico.pre_matricula_id
        AND can_manage_pre_matricula(pm.polo_id)
    )
);

-- Grants adicionais para functions
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_global() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_polo_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_pre_matricula(UUID) TO authenticated;
