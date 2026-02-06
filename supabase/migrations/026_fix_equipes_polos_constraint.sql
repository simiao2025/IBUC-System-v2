-- Migration para corrigir a constraint CHECK da tabela equipes_polos
-- Permite os valores: professor, auxiliar, coordenador_regional

DO $$
BEGIN
    -- 1. Tentar remover a constraint com o nome antigo (que está causando o erro)
    ALTER TABLE IF EXISTS public.equipes_polos DROP CONSTRAINT IF EXISTS equipes_polos_funcao_check;
    
    -- 2. Tentar remover possível constraint com nome novo (para garantir limpeza)
    ALTER TABLE IF EXISTS public.equipes_polos DROP CONSTRAINT IF EXISTS equipes_polos_cargo_check;

    -- 3. Adicionar a nova constraint com os valores atualizados
    -- Verifica se a coluna cargo existe (deve existir após migration 023)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'equipes_polos' AND column_name = 'cargo') THEN
        ALTER TABLE public.equipes_polos 
        ADD CONSTRAINT equipes_polos_cargo_check 
        CHECK (cargo IN ('professor', 'auxiliar', 'coordenador_regional'));
    END IF;

END $$;
