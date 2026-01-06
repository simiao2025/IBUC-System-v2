-- Script para verificar os dados da pré-matrícula existente
-- Execute no Supabase SQL Editor

-- Ver todas as colunas da tabela pre_matriculas
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'pre_matriculas'
ORDER BY ordinal_position;

-- Ver os dados da pré-matrícula mais recente
SELECT 
    id,
    nome_completo,
    cpf,
    data_nascimento,
    sexo,
    endereco,
    nome_responsavel,
    cpf_responsavel,
    email_responsavel,
    telefone_responsavel,
    tipo_parentesco,
    polo_id,
    nivel_id,
    observacoes,
    status,
    created_at
FROM pre_matriculas
ORDER BY created_at DESC
LIMIT 5;
