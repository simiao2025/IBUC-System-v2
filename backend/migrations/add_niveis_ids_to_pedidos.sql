-- Add niveis_destino_ids to pedidos_materiais
ALTER TABLE pedidos_materiais ADD COLUMN IF NOT EXISTS niveis_destino_ids UUID[];
