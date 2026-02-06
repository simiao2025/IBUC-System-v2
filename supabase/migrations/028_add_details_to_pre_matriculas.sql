-- Adicionar colunas faltantes para o fluxo de pré-matrícula online
ALTER TABLE pre_matriculas 
ADD COLUMN IF NOT EXISTS autorizacao_imagem BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS turma_id UUID REFERENCES turmas(id);

-- Adicionar coluna faltante na tabela de alunos para garantir persistência após aprovação
ALTER TABLE alunos
ADD COLUMN IF NOT EXISTS autorizacao_imagem BOOLEAN DEFAULT FALSE;

-- Opcional: Index no turma_id se for muito consultado
CREATE INDEX IF NOT EXISTS idx_pre_matriculas_turma_id ON pre_matriculas(turma_id);
