-- check and add columns if they don't exist
DO $$
BEGIN
    -- Add turma_id if appropriate
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pre_matriculas' AND column_name = 'turma_id') THEN
        ALTER TABLE public.pre_matriculas ADD COLUMN turma_id UUID REFERENCES public.turmas(id);
    END IF;

    -- Add modulo_id if appropriate
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pre_matriculas' AND column_name = 'modulo_id') THEN
        ALTER TABLE public.pre_matriculas ADD COLUMN modulo_id UUID REFERENCES public.modulos(id);
    END IF;
END $$;

-- Fix Foreign Keys (PostgREST needs explicit constraints)

-- polo_id (already exists but might miss FK)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'pre_matriculas_polo_id_fkey'
    ) THEN
        ALTER TABLE public.pre_matriculas 
        ADD CONSTRAINT pre_matriculas_polo_id_fkey 
        FOREIGN KEY (polo_id) 
        REFERENCES public.polos(id);
    END IF;
END $$;

-- nivel_id (already exists from 011 but let's ensure FK name is standard just in case)
-- 011 did: ADD COLUMN ... REFERENCES public.niveis(id), which creates a system generated name usually. 
-- We can leave it if it works, but let's be safe. PostgREST usually picks it up if it's a FK.

-- Ensure turma_id FK exists (if column existed before without FK)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'pre_matriculas_turma_id_fkey'
    ) THEN
        -- Only add if column exists (it should now)
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pre_matriculas' AND column_name = 'turma_id') THEN
             ALTER TABLE public.pre_matriculas 
             ADD CONSTRAINT pre_matriculas_turma_id_fkey 
             FOREIGN KEY (turma_id) 
             REFERENCES public.turmas(id);
        END IF;
    END IF;
END $$;

-- Ensure modulo_id FK exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'pre_matriculas_modulo_id_fkey'
    ) THEN
         IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pre_matriculas' AND column_name = 'modulo_id') THEN
             ALTER TABLE public.pre_matriculas 
             ADD CONSTRAINT pre_matriculas_modulo_id_fkey 
             FOREIGN KEY (modulo_id) 
             REFERENCES public.modulos(id);
         END IF;
    END IF;
END $$;
