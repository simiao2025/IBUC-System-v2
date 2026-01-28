-- MIGRATION: Update Pedidos de Materiais for Individual Orders
-- Desc: Adds aluno_id and polo_id to pedidos_materiais and updates status enum.

-- 1. Add columns to pedidos_materiais
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pedidos_materiais' AND column_name = 'aluno_id') THEN
        ALTER TABLE pedidos_materiais ADD COLUMN aluno_id UUID REFERENCES alunos(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pedidos_materiais' AND column_name = 'polo_id') THEN
        ALTER TABLE pedidos_materiais ADD COLUMN polo_id UUID REFERENCES polos(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pedidos_materiais' AND column_name = 'aprovado_por_id') THEN
        ALTER TABLE pedidos_materiais ADD COLUMN aprovado_por_id UUID REFERENCES usuarios(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pedidos_materiais' AND column_name = 'data_aprovacao') THEN
        ALTER TABLE pedidos_materiais ADD COLUMN data_aprovacao TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- 2. Update pedido_material_status ENUM (Check if needs update)
-- Note: PostgreSQL doesn't allow ALTER TYPE ... ADD VALUE inside a transaction block easily.
-- This might need to be run separately if 'aprovado' is not present.
-- For standard Supabase/Postgres:
ALTER TYPE pedido_material_status ADD VALUE IF NOT EXISTS 'aprovado' AFTER 'rascunho';
ALTER TYPE pedido_material_status ADD VALUE IF NOT EXISTS 'recusado' AFTER 'aprovado';

-- 3. Trigger or logic should ensure that if aluno_id is set, polo_id matches aluno's polo.
-- (Implemented in application logic for now)
