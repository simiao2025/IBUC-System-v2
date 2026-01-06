-- ============================================
-- Migração: Adicionar colunas faltantes na tabela pre_matriculas
-- Execute este script no Supabase SQL Editor
-- ============================================

-- 1. VERIFICAR ESTRUTURA ATUAL
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'pre_matriculas'
ORDER BY ordinal_position;

-- ============================================
-- 2. ADICIONAR COLUNAS FALTANTES
-- ============================================

-- Nome do responsável
ALTER TABLE pre_matriculas 
ADD COLUMN IF NOT EXISTS nome_responsavel TEXT;

-- CPF do responsável
ALTER TABLE pre_matriculas 
ADD COLUMN IF NOT EXISTS cpf_responsavel TEXT;

-- Tipo de parentesco (pai, mae, tutor, outro)
ALTER TABLE pre_matriculas 
ADD COLUMN IF NOT EXISTS tipo_parentesco TEXT 
CHECK (tipo_parentesco IN ('pai', 'mae', 'tutor', 'outro'));

-- Observações adicionais
ALTER TABLE pre_matriculas 
ADD COLUMN IF NOT EXISTS observacoes TEXT;

-- Sexo do aluno (se não existir)
ALTER TABLE pre_matriculas 
ADD COLUMN IF NOT EXISTS sexo TEXT 
CHECK (sexo IN ('M', 'F', 'Outro'));

-- RG do aluno (se não existir)
ALTER TABLE pre_matriculas 
ADD COLUMN IF NOT EXISTS rg TEXT;

-- Nome social (se não existir)
ALTER TABLE pre_matriculas 
ADD COLUMN IF NOT EXISTS nome_social TEXT;

-- Naturalidade (se não existir)
ALTER TABLE pre_matriculas 
ADD COLUMN IF NOT EXISTS naturalidade TEXT;

-- Nacionalidade (se não existir)
ALTER TABLE pre_matriculas 
ADD COLUMN IF NOT EXISTS nacionalidade TEXT DEFAULT 'Brasileira';

-- Escola de origem (se não existir)
ALTER TABLE pre_matriculas 
ADD COLUMN IF NOT EXISTS escola_origem TEXT;

-- Ano escolar (se não existir)
ALTER TABLE pre_matriculas 
ADD COLUMN IF NOT EXISTS ano_escolar TEXT;

-- Nível desejado (se não existir)
ALTER TABLE pre_matriculas 
ADD COLUMN IF NOT EXISTS nivel_id UUID REFERENCES niveis(id);

-- ============================================
-- 3. VERIFICAR COLUNAS JSON EXISTENTES
-- ============================================

-- Verificar se as colunas JSON existem (endereco, saude, responsaveis)
DO $$
BEGIN
    -- Adicionar coluna endereco se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pre_matriculas' AND column_name = 'endereco'
    ) THEN
        ALTER TABLE pre_matriculas ADD COLUMN endereco JSONB;
    END IF;

    -- Adicionar coluna saude se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pre_matriculas' AND column_name = 'saude'
    ) THEN
        ALTER TABLE pre_matriculas ADD COLUMN saude JSONB;
    END IF;

    -- Adicionar coluna responsaveis se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pre_matriculas' AND column_name = 'responsaveis'
    ) THEN
        ALTER TABLE pre_matriculas ADD COLUMN responsaveis JSONB;
    END IF;
END $$;

-- ============================================
-- 4. ADICIONAR COMENTÁRIOS NAS COLUNAS
-- ============================================

COMMENT ON COLUMN pre_matriculas.nome_responsavel IS 'Nome completo do responsável legal';
COMMENT ON COLUMN pre_matriculas.cpf_responsavel IS 'CPF do responsável legal';
COMMENT ON COLUMN pre_matriculas.tipo_parentesco IS 'Tipo de parentesco: pai, mae, tutor, outro';
COMMENT ON COLUMN pre_matriculas.observacoes IS 'Observações adicionais sobre a pré-matrícula';
COMMENT ON COLUMN pre_matriculas.sexo IS 'Sexo do aluno: M, F, Outro';
COMMENT ON COLUMN pre_matriculas.endereco IS 'Dados de endereço em formato JSON: {cep, rua, numero, complemento, bairro, cidade, estado}';
COMMENT ON COLUMN pre_matriculas.saude IS 'Dados de saúde em formato JSON: {alergias, medicamentos, doencas_cronicas, plano_saude, hospital_preferencia, autorizacao_medica}';

-- ============================================
-- 5. VERIFICAÇÃO FINAL
-- ============================================

-- Listar todas as colunas após migração
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    COALESCE(col_description((table_schema||'.'||table_name)::regclass::oid, ordinal_position), '') as description
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'pre_matriculas'
ORDER BY ordinal_position;

-- Contar registros existentes
SELECT 
    COUNT(*) as total_registros,
    COUNT(nome_responsavel) as com_nome_responsavel,
    COUNT(endereco) as com_endereco,
    COUNT(observacoes) as com_observacoes
FROM pre_matriculas;
