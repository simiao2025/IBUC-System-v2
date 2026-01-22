DO $$
BEGIN
    -- 1. Tentar remover a constraint explícita se ela existir (para garantir limpeza)
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_mensalidade') THEN
        ALTER TABLE pagamentos DROP CONSTRAINT fk_mensalidade;
    END IF;

    -- 2. Tentar remover a constraint gerada automaticamente (padrão do Postgres)
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pagamentos_mensalidade_id_fkey') THEN
        ALTER TABLE pagamentos DROP CONSTRAINT pagamentos_mensalidade_id_fkey;
    END IF;

    -- 3. Recriar UMA ÚNICA constraint com o nome correto esperado pelo backend
    ALTER TABLE pagamentos 
    ADD CONSTRAINT fk_mensalidade 
    FOREIGN KEY (mensalidade_id) 
    REFERENCES mensalidades(id) 
    ON DELETE CASCADE;
END $$;
