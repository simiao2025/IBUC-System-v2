-- MIGRATION: Add Payment Validation Fields
-- Desc: Adds fields for payment validation by primeiro_tesoureiro_polo

DO $$
BEGIN
    -- 1. Add validado_por_id (who validated the payment)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pedidos_materiais' AND column_name = 'validado_por_id') THEN
        ALTER TABLE pedidos_materiais ADD COLUMN validado_por_id UUID REFERENCES usuarios(id);
    END IF;

    -- 2. Add data_validacao (when was validated)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pedidos_materiais' AND column_name = 'data_validacao') THEN
        ALTER TABLE pedidos_materiais ADD COLUMN data_validacao TIMESTAMP WITH TIME ZONE;
    END IF;

    -- 3. Add observacoes_validacao (validation notes/comments)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pedidos_materiais' AND column_name = 'observacoes_validacao') THEN
        ALTER TABLE pedidos_materiais ADD COLUMN observacoes_validacao TEXT;
    END IF;

    -- 4. Add url_comprovante (receipt/proof URL)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pedidos_materiais' AND column_name = 'url_comprovante') THEN
        ALTER TABLE pedidos_materiais ADD COLUMN url_comprovante TEXT;
    END IF;

    -- 5. Add motivo_rejeicao (rejection reason, if rejected)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pedidos_materiais' AND column_name = 'motivo_rejeicao') THEN
        ALTER TABLE pedidos_materiais ADD COLUMN motivo_rejeicao TEXT;
    END IF;
END $$;

-- 6. Add new status values to ENUM
-- Note: These may already exist, IF NOT EXISTS prevents errors
ALTER TYPE pedido_material_status ADD VALUE IF NOT EXISTS 'pendente_validacao' AFTER 'aprovado';
ALTER TYPE pedido_material_status ADD VALUE IF NOT EXISTS 'pago' AFTER 'pendente_validacao';
ALTER TYPE pedido_material_status ADD VALUE IF NOT EXISTS 'pagamento_rejeitado' AFTER 'pago';

-- 7. Create index for faster queries by status
CREATE INDEX IF NOT EXISTS idx_pedidos_materiais_status ON pedidos_materiais(status);
CREATE INDEX IF NOT EXISTS idx_pedidos_materiais_polo_status ON pedidos_materiais(polo_id, status);
