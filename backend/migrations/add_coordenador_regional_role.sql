-- ============================================
-- IBUC System - Cargo Coordenador Regional
-- ============================================

-- Nota: PostgreSQL não permite ALTER TYPE ADD VALUE em transação.
-- Este script usa blocos DO para garantir idempotência em ambiente Supabase/PostgreSQL.

-- 1. Adicionar ao enum role_usuario
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'coordenador_regional' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'role_usuario')) THEN 
        ALTER TYPE role_usuario ADD VALUE 'coordenador_regional'; 
    END IF; 
END $$;

-- 2. Adicionar ao enum tipo_cargo_diretoria
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'coordenador_regional' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'tipo_cargo_diretoria')) THEN 
        ALTER TYPE tipo_cargo_diretoria ADD VALUE 'coordenador_regional'; 
    END IF; 
END $$;

-- 3. Criar tabela de vínculo Regional <-> Polos
CREATE TABLE IF NOT EXISTS coordenadores_regionais_polos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    polo_id UUID NOT NULL REFERENCES polos(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(usuario_id, polo_id)
);

-- Index para performance nas consultas de filtro
CREATE INDEX IF NOT EXISTS idx_coord_regional_user ON coordenadores_regionais_polos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_coord_regional_polo ON coordenadores_regionais_polos(polo_id);

-- Comentários da tabela
COMMENT ON TABLE coordenadores_regionais_polos IS 'Associa um Coordenador Regional a múltiplos polos para gestão regional.';
