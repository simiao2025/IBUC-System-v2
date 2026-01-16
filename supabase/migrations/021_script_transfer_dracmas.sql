-- Script para transferir dracmas de UMA TURMA ESPECÍFICA de transacoes para resgate
-- ATENÇÃO: Isso irá mover (copiar e deletar) registros desta turma.
-- Use com cautela.

BEGIN;

-- 1. Copiar dados para dracmas_resgate
INSERT INTO dracmas_resgate (
  original_id,
  aluno_id,
  turma_id,
  quantidade,
  tipo,
  descricao,
  data,
  registrado_por,
  created_at,
  resgatado_por,
  data_resgate
)
SELECT 
  id,
  aluno_id,
  turma_id,
  quantidade,
  tipo,
  descricao,
  data,
  registrado_por,
  created_at,
  NULL, -- Ou defina o ID do usuário que realizou a ação
  NOW()
FROM dracmas_transacoes
WHERE turma_id = '95558cb4-19b5-4b31-a8d1-3738b86af0bb'; -- Filtro correto aqui

-- 2. Deletar dados de dracmas_transacoes (Efetivar a transferência)
DELETE FROM dracmas_transacoes
WHERE turma_id = '95558cb4-19b5-4b31-a8d1-3738b86af0bb'; -- Mesmo filtro aqui

COMMIT;
