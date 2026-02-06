-- Migração para permitir exclusão de usuários preservando registros de cargos
-- Torna usuario_id anulável e muda a restrição para ON DELETE SET NULL

DO $$
BEGIN
    -- 1. Tabela: diretoria_geral
    -- Tornar usuario_id anulável
    ALTER TABLE IF EXISTS public.diretoria_geral ALTER COLUMN usuario_id DROP NOT NULL;
    
    -- Remover restrição restritiva existente
    ALTER TABLE IF EXISTS public.diretoria_geral DROP CONSTRAINT IF EXISTS fk_usuario;
    ALTER TABLE IF EXISTS public.diretoria_geral DROP CONSTRAINT IF EXISTS diretoria_geral_usuario_id_fkey;
    
    -- Adicionar nova restrição SET NULL
    ALTER TABLE IF EXISTS public.diretoria_geral 
        ADD CONSTRAINT fk_usuario_set_null 
        FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE SET NULL;

    -- 2. Tabela: diretoria_polo
    -- Tornar usuario_id anulável
    ALTER TABLE IF EXISTS public.diretoria_polo ALTER COLUMN usuario_id DROP NOT NULL;
    
    -- Remover restrição restritiva existente
    ALTER TABLE IF EXISTS public.diretoria_polo DROP CONSTRAINT IF EXISTS fk_usuario;
    ALTER TABLE IF EXISTS public.diretoria_polo DROP CONSTRAINT IF EXISTS diretoria_polo_usuario_id_fkey;
    
    -- Adicionar nova restrição SET NULL
    ALTER TABLE IF EXISTS public.diretoria_polo 
        ADD CONSTRAINT fk_usuario_set_null 
        FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE SET NULL;

    -- 3. Tabela: equipes_polos
    -- Esta tabela precisa de ajustes estruturais para corresponder ao código backend
    
    -- 3.1 Adicionar coluna usuario_id (se não existir)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'equipes_polos' AND column_name = 'usuario_id'
    ) THEN
        ALTER TABLE public.equipes_polos 
            ADD COLUMN usuario_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL;
    END IF;
    
    -- 3.2 Adicionar coluna cargo (renomeando funcao se necessário)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'equipes_polos' AND column_name = 'cargo'
    ) THEN
        -- Se funcao existe, renomear para cargo
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'equipes_polos' AND column_name = 'funcao'
        ) THEN
            ALTER TABLE public.equipes_polos RENAME COLUMN funcao TO cargo;
        ELSE
            -- Se não existe nenhuma, criar cargo
            ALTER TABLE public.equipes_polos ADD COLUMN cargo TEXT;
        END IF;
    END IF;
    
    -- 3.3 Adicionar coluna status (mapeando de ativo se necessário)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'equipes_polos' AND column_name = 'status'
    ) THEN
        -- Se ativo existe, renomear para status e ajustar tipo
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'equipes_polos' AND column_name = 'ativo'
        ) THEN
            -- Adicionar coluna status temporariamente
            ALTER TABLE public.equipes_polos ADD COLUMN status TEXT;
            -- Copiar valores de ativo para status
            UPDATE public.equipes_polos SET status = CASE WHEN ativo = true THEN 'ativo' ELSE 'inativo' END;
            -- Remover coluna ativo
            ALTER TABLE public.equipes_polos DROP COLUMN ativo;
        ELSE
            -- Se não existe nenhuma, criar status
            ALTER TABLE public.equipes_polos ADD COLUMN status TEXT DEFAULT 'ativo';
        END IF;
    END IF;
    
    -- 3.4 Adicionar coluna observacoes (se não existir)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'equipes_polos' AND column_name = 'observacoes'
    ) THEN
        ALTER TABLE public.equipes_polos ADD COLUMN observacoes TEXT;
    END IF;

END $$;