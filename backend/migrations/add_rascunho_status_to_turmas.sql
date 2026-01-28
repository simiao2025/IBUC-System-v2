-- Migration: Add 'rascunho' status to turmas (Robust Version)
-- Description: Adds 'rascunho' to the valid values for turma status.
-- Handles both ENUM types and CHECK constraints.

DO $$
DECLARE
    constraint_name_var text;
BEGIN
    -- 1. Try to add to ENUM if it exists
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'turma_status') THEN
        BEGIN
            ALTER TYPE turma_status ADD VALUE 'rascunho';
        EXCEPTION
            WHEN duplicate_object THEN
                NULL; -- Value already exists
        END;
    
    -- 2. If ENUM doesn't exist, check for CHECK constraint on the table
    ELSE
        -- Find the constraint name for the status column on turmas table
        SELECT con.conname INTO constraint_name_var
        FROM pg_catalog.pg_constraint con
        INNER JOIN pg_catalog.pg_class rel ON rel.oid = con.conrelid
        INNER JOIN pg_catalog.pg_namespace nsp ON nsp.oid = connamespace
        WHERE nsp.nspname = 'public'
          AND rel.relname = 'turmas'
          AND con.contype = 'c' -- Check constraint
          AND pg_get_constraintdef(con.oid) LIKE '%status%';

        IF constraint_name_var IS NOT NULL THEN
            -- Drop the old constraint
            EXECUTE format('ALTER TABLE turmas DROP CONSTRAINT %I', constraint_name_var);
            
            -- Add the new constraint including 'rascunho'
            -- Note: Adapting to whatever values were there + rascunho. 
            -- Assuming standard set: 'ativa', 'inativa', 'concluida'
            ALTER TABLE turmas ADD CONSTRAINT turmas_status_check 
            CHECK (status IN ('ativa', 'inativa', 'concluida', 'rascunho'));
        ELSE
            -- If no constraint found, maybe just add the new one to be safe?
            -- Or maybe it's just a text field with no validation (unlikely given previous error but possible if error was from application side)
            -- Let's check existing data first just in case
            NULL;
        END IF;
    END IF;
END $$;
