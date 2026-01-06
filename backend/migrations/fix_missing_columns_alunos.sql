-- Adicionar colunas de Responsáveis (caso não existam)
ALTER TABLE alunos
    ADD COLUMN IF NOT EXISTS nome_responsavel TEXT,
    ADD COLUMN IF NOT EXISTS cpf_responsavel TEXT,
    ADD COLUMN IF NOT EXISTS telefone_responsavel TEXT,
    ADD COLUMN IF NOT EXISTS email_responsavel TEXT,
    ADD COLUMN IF NOT EXISTS tipo_parentesco TEXT,
    ADD COLUMN IF NOT EXISTS nome_responsavel_2 TEXT,
    ADD COLUMN IF NOT EXISTS cpf_responsavel_2 TEXT,
    ADD COLUMN IF NOT EXISTS telefone_responsavel_2 TEXT,
    ADD COLUMN IF NOT EXISTS email_responsavel_2 TEXT,
    ADD COLUMN IF NOT EXISTS tipo_parentesco_2 TEXT;

-- Adicionar colunas de Saúde e Emergência (caso não existam)
ALTER TABLE alunos
    ADD COLUMN IF NOT EXISTS alergias TEXT,
    ADD COLUMN IF NOT EXISTS restricao_alimentar TEXT,
    ADD COLUMN IF NOT EXISTS medicacao_continua TEXT,
    ADD COLUMN IF NOT EXISTS doencas_cronicas TEXT,
    ADD COLUMN IF NOT EXISTS contato_emergencia_nome TEXT,
    ADD COLUMN IF NOT EXISTS contato_emergencia_telefone TEXT,
    ADD COLUMN IF NOT EXISTS convenio_medico TEXT,
    ADD COLUMN IF NOT EXISTS hospital_preferencia TEXT,
    ADD COLUMN IF NOT EXISTS autorizacao_medica BOOLEAN DEFAULT FALSE;

-- Garantir colunas de Identidade extras
ALTER TABLE alunos
    ADD COLUMN IF NOT EXISTS rg_orgao TEXT,
    ADD COLUMN IF NOT EXISTS rg_data_expedicao DATE;
