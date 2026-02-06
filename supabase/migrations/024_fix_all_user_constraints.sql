-- Migração adicional para corrigir TODAS as restrições de foreign key que bloqueiam exclusão de usuários
-- Esta migração complementa a 023 e corrige as constraints que estavam sem ON DELETE explícito

DO $$
BEGIN
    -- Tabela: turmas
    -- professor_id e coordenador_id
    ALTER TABLE IF EXISTS public.turmas DROP CONSTRAINT IF EXISTS fk_professor;
    ALTER TABLE IF EXISTS public.turmas DROP CONSTRAINT IF EXISTS turmas_professor_id_fkey;
    ALTER TABLE IF EXISTS public.turmas 
        ADD CONSTRAINT fk_professor_set_null 
        FOREIGN KEY (professor_id) REFERENCES public.usuarios(id) ON DELETE SET NULL;
    
    ALTER TABLE IF EXISTS public.turmas DROP CONSTRAINT IF EXISTS fk_coordenador;
    ALTER TABLE IF EXISTS public.turmas DROP CONSTRAINT IF EXISTS turmas_coordenador_id_fkey;
    ALTER TABLE IF EXISTS public.turmas 
        ADD CONSTRAINT fk_coordenador_set_null 
        FOREIGN KEY (coordenador_id) REFERENCES public.usuarios(id) ON DELETE SET NULL;

    -- Tabela: matriculas
    -- created_by e approved_by
    ALTER TABLE IF EXISTS public.matriculas DROP CONSTRAINT IF EXISTS matriculas_created_by_fkey;
    ALTER TABLE IF EXISTS public.matriculas 
        ADD CONSTRAINT fk_created_by_set_null 
        FOREIGN KEY (created_by) REFERENCES public.usuarios(id) ON DELETE SET NULL;
    
    ALTER TABLE IF EXISTS public.matriculas DROP CONSTRAINT IF EXISTS matriculas_approved_by_fkey;
    ALTER TABLE IF EXISTS public.matriculas 
        ADD CONSTRAINT fk_approved_by_set_null 
        FOREIGN KEY (approved_by) REFERENCES public.usuarios(id) ON DELETE SET NULL;

    -- Tabela: presencas
    -- lancado_por
    ALTER TABLE IF EXISTS public.presencas DROP CONSTRAINT IF EXISTS presencas_lancado_por_fkey;
    ALTER TABLE IF EXISTS public.presencas 
        ADD CONSTRAINT fk_lancado_por_set_null 
        FOREIGN KEY (lancado_por) REFERENCES public.usuarios(id) ON DELETE SET NULL;
    
    -- Tornar lancado_por anulável
    ALTER TABLE IF EXISTS public.presencas ALTER COLUMN lancado_por DROP NOT NULL;

    -- Tabela: notas
    -- lancado_por
    ALTER TABLE IF EXISTS public.notas DROP CONSTRAINT IF EXISTS notas_lancado_por_fkey;
    ALTER TABLE IF EXISTS public.notas 
        ADD CONSTRAINT fk_notas_lancado_por_set_null 
        FOREIGN KEY (lancado_por) REFERENCES public.usuarios(id) ON DELETE SET NULL;
    
    -- Tornar lancado_por anulável
    ALTER TABLE IF EXISTS public.notas ALTER COLUMN lancado_por DROP NOT NULL;

    -- Tabela: boletins
    -- gerado_por
    ALTER TABLE IF EXISTS public.boletins DROP CONSTRAINT IF EXISTS boletins_gerado_por_fkey;
    ALTER TABLE IF EXISTS public.boletins 
        ADD CONSTRAINT fk_gerado_por_set_null 
        FOREIGN KEY (gerado_por) REFERENCES public.usuarios(id) ON DELETE SET NULL;

    -- Tabela: documentos
    -- uploaded_by e validado_por
    ALTER TABLE IF EXISTS public.documentos DROP CONSTRAINT IF EXISTS documentos_uploaded_by_fkey;
    ALTER TABLE IF EXISTS public.documentos 
        ADD CONSTRAINT fk_uploaded_by_set_null 
        FOREIGN KEY (uploaded_by) REFERENCES public.usuarios(id) ON DELETE SET NULL;
    
    ALTER TABLE IF EXISTS public.documentos DROP CONSTRAINT IF EXISTS documentos_validado_por_fkey;
    ALTER TABLE IF EXISTS public.documentos 
        ADD CONSTRAINT fk_validado_por_set_null 
        FOREIGN KEY (validado_por) REFERENCES public.usuarios(id) ON DELETE SET NULL;

    -- Tabela: pagamentos
    -- recebido_por
    ALTER TABLE IF EXISTS public.pagamentos DROP CONSTRAINT IF EXISTS pagamentos_recebido_por_fkey;
    ALTER TABLE IF EXISTS public.pagamentos 
        ADD CONSTRAINT fk_recebido_por_set_null 
        FOREIGN KEY (recebido_por) REFERENCES public.usuarios(id) ON DELETE SET NULL;

    -- Tabela: audit_logs
    -- user_id
    ALTER TABLE IF EXISTS public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;
    ALTER TABLE IF EXISTS public.audit_logs 
        ADD CONSTRAINT fk_audit_user_set_null 
        FOREIGN KEY (user_id) REFERENCES public.usuarios(id) ON DELETE SET NULL;

    -- Tabela: diretoria_geral
    -- created_by
    ALTER TABLE IF EXISTS public.diretoria_geral DROP CONSTRAINT IF EXISTS fk_created_by;
    ALTER TABLE IF EXISTS public.diretoria_geral DROP CONSTRAINT IF EXISTS diretoria_geral_created_by_fkey;
    ALTER TABLE IF EXISTS public.diretoria_geral 
        ADD CONSTRAINT fk_diretoria_geral_created_by_set_null 
        FOREIGN KEY (created_by) REFERENCES public.usuarios(id) ON DELETE SET NULL;

    -- Tabela: diretoria_polo
    -- created_by
    ALTER TABLE IF EXISTS public.diretoria_polo DROP CONSTRAINT IF EXISTS fk_created_by;
    ALTER TABLE IF EXISTS public.diretoria_polo DROP CONSTRAINT IF EXISTS diretoria_polo_created_by_fkey;
    ALTER TABLE IF EXISTS public.diretoria_polo 
        ADD CONSTRAINT fk_diretoria_polo_created_by_set_null 
        FOREIGN KEY (created_by) REFERENCES public.usuarios(id) ON DELETE SET NULL;

END $$;
