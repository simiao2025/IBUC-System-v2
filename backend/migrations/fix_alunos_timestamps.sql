-- Adicionar coluna updated_at na tabela alunos para compatibilidade com triggers
ALTER TABLE alunos 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Opcional: Manter sincronizado com data_atualizacao se necessário, 
-- mas o trigger vai cuidar do updated_at daqui pra frente.
UPDATE alunos SET updated_at = data_atualizacao WHERE data_atualizacao IS NOT NULL;
