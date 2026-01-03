-- MIGRATION: Synchronize Alunos and PreMatriculas Schema
-- Remove Nome Social, Add Health and Guardian Columns

-- 1. Update Sexo Type
-- WARNING: This might fail if 'Outro' is being used. 
-- We'll try to convert existing 'Outro' to 'M' or 'F' based on some logic or just set to NULL if allowed.
-- For safety, we first update the column values.
UPDATE alunos SET sexo = 'M' WHERE sexo NOT IN ('M', 'F');
UPDATE pre_matriculas SET sexo = 'M' WHERE sexo NOT IN ('M', 'F');

-- 2. Modify Tables
DO $$
BEGIN
    -- ALUNOS Table
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alunos' AND column_name = 'nome_social') THEN
        ALTER TABLE alunos DROP COLUMN nome_social;
    END IF;

    -- PRE_MATRICULAS Table
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pre_matriculas' AND column_name = 'nome_social') THEN
        ALTER TABLE pre_matriculas DROP COLUMN nome_social;
    END IF;

    -- ADD Missing Health Columns to pre_matriculas (if they don't exist)
    -- Some might be in the 'saude' JSONB but we want explicit columns for synchronization
    ALTER TABLE pre_matriculas 
        ADD COLUMN IF NOT EXISTS alergias TEXT,
        ADD COLUMN IF NOT EXISTS restricao_alimentar TEXT,
        ADD COLUMN IF NOT EXISTS medicacao_continua TEXT,
        ADD COLUMN IF NOT EXISTS doencas_cronicas TEXT,
        ADD COLUMN IF NOT EXISTS contato_emergencia_nome TEXT,
        ADD COLUMN IF NOT EXISTS contato_emergencia_telefone TEXT,
        ADD COLUMN IF NOT EXISTS convenio_medico TEXT,
        ADD COLUMN IF NOT EXISTS hospital_preferencia TEXT,
        ADD COLUMN IF NOT EXISTS autorizacao_medica BOOLEAN DEFAULT FALSE;

    -- ADD Second Guardian Columns to pre_matriculas
    ALTER TABLE pre_matriculas
        ADD COLUMN IF NOT EXISTS nome_responsavel_2 TEXT,
        ADD COLUMN IF NOT EXISTS cpf_responsavel_2 TEXT,
        ADD COLUMN IF NOT EXISTS telefone_responsavel_2 TEXT,
        ADD COLUMN IF NOT EXISTS email_responsavel_2 TEXT,
        ADD COLUMN IF NOT EXISTS tipo_parentesco_2 TEXT;

    -- ADD Identity Columns to pre_matriculas (matching alunos)
    ALTER TABLE pre_matriculas
        ADD COLUMN IF NOT EXISTS naturalidade TEXT,
        ADD COLUMN IF NOT EXISTS nacionalidade TEXT DEFAULT 'Brasileira',
        ADD COLUMN IF NOT EXISTS rg TEXT,
        ADD COLUMN IF NOT EXISTS rg_orgao TEXT,
        ADD COLUMN IF NOT EXISTS rg_data_expedicao DATE;

END $$;

-- 3. Sync ALUNOS table to have the same structure for easy mapping
ALTER TABLE alunos
    ADD COLUMN IF NOT EXISTS rg_orgao TEXT,
    ADD COLUMN IF NOT EXISTS rg_data_expedicao DATE,
    -- Guardian 1 (Sincronizado com pre_matriculas)
    ADD COLUMN IF NOT EXISTS nome_responsavel TEXT,
    ADD COLUMN IF NOT EXISTS cpf_responsavel TEXT,
    ADD COLUMN IF NOT EXISTS telefone_responsavel TEXT,
    ADD COLUMN IF NOT EXISTS email_responsavel TEXT,
    ADD COLUMN IF NOT EXISTS tipo_parentesco TEXT,
    -- Guardian 2
    ADD COLUMN IF NOT EXISTS nome_responsavel_2 TEXT,
    ADD COLUMN IF NOT EXISTS cpf_responsavel_2 TEXT,
    ADD COLUMN IF NOT EXISTS telefone_responsavel_2 TEXT,
    ADD COLUMN IF NOT EXISTS email_responsavel_2 TEXT,
    ADD COLUMN IF NOT EXISTS tipo_parentesco_2 TEXT;
