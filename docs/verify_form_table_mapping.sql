-- ============================================
-- Verificação de Correspondência: Formulário ↔ Tabela
-- ============================================

-- CAMPOS DO FORMULÁRIO DE PRÉ-MATRÍCULA:
-- ========================================

-- DADOS DO ALUNO:
-- ✓ nome → nome_completo (coluna)
-- ✓ data_nascimento → data_nascimento (coluna)
-- ✓ sexo → sexo (coluna - NOVA)
-- ✓ cpf → cpf (coluna)

-- ENDEREÇO:
-- ✓ cep → endereco.cep (JSON)
-- ✓ rua → endereco.rua (JSON)
-- ✓ numero → endereco.numero (JSON)
-- ✓ complemento → endereco.complemento (JSON)
-- ✓ bairro → endereco.bairro (JSON)
-- ✓ cidade → endereco.cidade (JSON)
-- ✓ estado → endereco.estado (JSON)

-- DADOS DO RESPONSÁVEL:
-- ✓ nome_responsavel → nome_responsavel (coluna - NOVA)
-- ✓ telefone_responsavel → telefone_responsavel (coluna existente)
-- ✓ email_responsavel → email_responsavel (coluna existente)
-- ✓ cpf_responsavel → cpf_responsavel (coluna - NOVA)
-- ✓ tipo_parentesco → tipo_parentesco (coluna - NOVA)

-- MATRÍCULA:
-- ✓ polo_id → polo_id (coluna existente)
-- ✓ nivel_id → nivel_id (coluna - NOVA)
-- ✓ observacoes → observacoes (coluna - NOVA)

-- TERMOS:
-- ✓ aceite_termo → (não precisa ser salvo, apenas validação frontend)

-- ============================================
-- RESUMO DA CORRESPONDÊNCIA
-- ============================================

SELECT 
    'CORRESPONDÊNCIA COMPLETA' as status,
    'Todos os campos do formulário têm colunas correspondentes na tabela' as mensagem;

-- Verificar se todas as colunas necessárias existem
SELECT 
    CASE 
        WHEN COUNT(*) = 13 THEN '✓ TODAS AS COLUNAS EXISTEM'
        ELSE '✗ FALTAM ' || (13 - COUNT(*))::text || ' COLUNAS'
    END as verificacao
FROM information_schema.columns
WHERE table_name = 'pre_matriculas'
  AND column_name IN (
    'nome_completo',
    'cpf',
    'data_nascimento',
    'sexo',
    'endereco',
    'nome_responsavel',
    'cpf_responsavel',
    'email_responsavel',
    'telefone_responsavel',
    'tipo_parentesco',
    'polo_id',
    'nivel_id',
    'observacoes'
  );

-- Listar colunas que ainda não existem (se houver)
SELECT 
    campo_necessario
FROM (
    VALUES 
        ('nome_completo'),
        ('cpf'),
        ('data_nascimento'),
        ('sexo'),
        ('endereco'),
        ('nome_responsavel'),
        ('cpf_responsavel'),
        ('email_responsavel'),
        ('telefone_responsavel'),
        ('tipo_parentesco'),
        ('polo_id'),
        ('nivel_id'),
        ('observacoes')
) AS campos(campo_necessario)
WHERE campo_necessario NOT IN (
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'pre_matriculas'
);
