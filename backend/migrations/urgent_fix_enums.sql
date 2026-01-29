-- ============================================
-- IBUC System - Correção de ENUMs (Urgente)
-- ============================================
-- Descrição: Adiciona 'rascunho' ao status de turmas e 'formado' ao status de alunos.
-- Estes valores são necessários para o funcionamento correto do Dashboard e Encerramento em Lote.

-- 1. Adicionar 'rascunho' ao status_turma
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'rascunho' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'status_turma')) THEN 
        ALTER TYPE status_turma ADD VALUE 'rascunho'; 
    END IF; 
END $$;

-- 2. Adicionar 'formado' ao status_aluno
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'formado' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'status_aluno')) THEN 
        ALTER TYPE status_aluno ADD VALUE 'formado'; 
    END IF; 
END $$;

-- 3. Garantir que as colunas na tabela 'turmas' aceitem os novos valores ou tenham os campos de controle
-- (Caso as migrations de campos extras não tenham sido rodadas integralmente)
ALTER TABLE IF EXISTS turmas ADD COLUMN IF NOT EXISTS turma_origem_id UUID REFERENCES turmas(id);
ALTER TABLE IF EXISTS turmas ADD COLUMN IF NOT EXISTS aguardando_ativacao BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN turmas.status IS 'Status da turma: ativa, inativa, concluida, rascunho';
COMMENT ON COLUMN alunos.status IS 'Status do aluno: pendente, ativo, inativo, concluido, formado';
