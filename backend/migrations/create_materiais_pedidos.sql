-- MIGRATION: Sistema de Pedidos de Materiais

-- 1. Tabela de Materiais (Catálogo)
CREATE TABLE IF NOT EXISTS materiais (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome TEXT NOT NULL,
    descricao TEXT,
    valor_padrao_cents INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de Pedidos de Materiais
CREATE TYPE pedido_material_status AS ENUM ('rascunho', 'cobrado', 'entregue', 'cancelado');

CREATE TABLE IF NOT EXISTS pedidos_materiais (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo_cobranca TEXT NOT NULL, -- 'Material do Aluno', 'Material do Professor', etc
    modulo_destino_id UUID REFERENCES modulos(id),
    solicitante_id UUID REFERENCES usuarios(id),
    total_cents INTEGER DEFAULT 0,
    status pedido_material_status DEFAULT 'rascunho',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Itens do Pedido
CREATE TABLE IF NOT EXISTS itens_pedido_material (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pedido_id UUID REFERENCES pedidos_materiais(id) ON DELETE CASCADE,
    material_id UUID REFERENCES materiais(id),
    quantidade INTEGER NOT NULL DEFAULT 1,
    valor_unitario_cents INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Adições na tabela de Mensalidades para suporte ao fluxo de pedidos e comprovantes
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mensalidades' AND column_name = 'pedido_material_id') THEN
        ALTER TABLE mensalidades ADD COLUMN pedido_material_id UUID REFERENCES pedidos_materiais(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mensalidades' AND column_name = 'protocolo_pagamento') THEN
        ALTER TABLE mensalidades ADD COLUMN protocolo_pagamento TEXT;
    END IF;

    -- Garantir que o status 'em_analise' exista (pode ser necessário atualizar o tipo ENUM se ele for fixo)
    -- Para Supabase, se for check constraint ou enum:
END $$;
