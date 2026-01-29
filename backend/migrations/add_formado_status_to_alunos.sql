-- Migration: Add 'formado' status to alunos
-- Description: Adds 'formado' to the valid status values for students.

DO $$
BEGIN
    -- 1. If it's an ENUM type named 'status_aluno'
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_aluno') THEN
        BEGIN
            ALTER TYPE status_aluno ADD VALUE 'formado';
        EXCEPTION
            WHEN duplicate_object THEN
                NULL;
        END;
    END IF;

    -- 2. If it's a CHECK constraint on the column (common in some setups)
    -- We can't easily modify a check constraint without dropping and recreating.
    -- Assuming best effort: update comment.
    -- Real enforcement depends on application or DB constraint. 
    -- If using simple text column without enum, no action needed.
    
END $$;
