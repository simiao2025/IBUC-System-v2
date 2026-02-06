-- Adicionar tipo ENUM para pre_matriculas
CREATE TYPE pre_matricula_tipo AS ENUM ('novo', 'transferencia');

-- Adicionar colunas na tabela pre_matriculas
ALTER TABLE pre_matriculas 
ADD COLUMN tipo pre_matricula_tipo DEFAULT 'novo',
ADD COLUMN aluno_origem_id UUID REFERENCES alunos(id),
ADD COLUMN dados_materiais JSONB DEFAULT '{}'::jsonb;

-- Criar índice para facilitar busca por tipo
CREATE INDEX idx_pre_matriculas_tipo ON pre_matriculas(tipo);
