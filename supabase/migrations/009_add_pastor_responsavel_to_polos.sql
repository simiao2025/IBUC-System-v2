-- ============================================
-- IBUC System - Adiciona campo pastor_responsavel na tabela polos
-- ============================================

-- Adiciona a coluna pastor_responsavel à tabela polos
ALTER TABLE polos 
ADD COLUMN IF NOT EXISTS pastor_responsavel TEXT NOT NULL DEFAULT 'A definir';

-- Comentário para documentação
COMMENT ON COLUMN polos.pastor_responsavel IS 'Nome do pastor responsável pelo polo';

-- Atualiza a função de atualização de timestamp para incluir a nova coluna
-- (opcional, apenas se você quiser que o updated_at seja atualizado ao alterar pastor_responsavel)
-- Já deve estar coberto pelo trigger existente

-- ============================================
-- RLS (Row Level Security) - Atualiza políticas se necessário
-- ============================================
-- As políticas existentes já devem cobrir acesso à coluna pastor_responsavel,
-- pois ela faz parte da tabela polos que já tem RLS configurado

-- ============================================
-- Dados iniciais (opcional)
-- ============================================
-- Se necessário, atualize os registros existentes com um valor padrão
-- UPDATE polos SET pastor_responsavel = 'A definir' WHERE pastor_responsavel IS NULL;
-- Nota: A cláusula DEFAULT na coluna já garante um valor padrão para novos registros

-- ============================================
-- Verificação
-- ============================================
-- Verifique se a coluna foi adicionada corretamente
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'polos' AND column_name = 'pastor_responsavel') THEN
        RAISE NOTICE '✅ Coluna pastor_responsavel adicionada com sucesso à tabela polos';
    ELSE
        RAISE EXCEPTION '❌ Falha ao adicionar a coluna pastor_responsavel à tabela polos';
    END IF;
END $$;
