-- Adiciona o status 'reposicao' ao ENUM status_presenca
-- NOTA: O PostgreSQL não permite remover valores de um ENUM facilmente, mas adicionar é simples.

ALTER TYPE status_presenca ADD VALUE IF NOT EXISTS 'reposicao';

COMMENT ON TYPE status_presenca IS 'presente: Aluno presente, falta: Aluno faltou, justificativa: Falta abonada, atraso: Presente com atraso, reposicao: Falta em processo de reposição (não reprova)';
