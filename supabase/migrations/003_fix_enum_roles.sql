-- ============================================
-- IBUC System - Correção do Enum role_usuario
-- Adiciona roles faltantes ao enum
-- ============================================

-- Adicionar novos valores ao enum role_usuario
-- Nota: PostgreSQL não permite ALTER TYPE ADD VALUE em transação
-- Execute cada comando separadamente se necessário

-- Adicionar diretor_geral (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'diretor_geral' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'role_usuario')
    ) THEN
        ALTER TYPE role_usuario ADD VALUE 'diretor_geral';
    END IF;
END $$;

-- Adicionar coordenador_geral (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'coordenador_geral' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'role_usuario')
    ) THEN
        ALTER TYPE role_usuario ADD VALUE 'coordenador_geral';
    END IF;
END $$;

-- Adicionar tesoureiro (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'tesoureiro' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'role_usuario')
    ) THEN
        ALTER TYPE role_usuario ADD VALUE 'tesoureiro';
    END IF;
END $$;

-- Adicionar auxiliar (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'auxiliar' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'role_usuario')
    ) THEN
        ALTER TYPE role_usuario ADD VALUE 'auxiliar';
    END IF;
END $$;

-- Verificar valores do enum
SELECT enumlabel as role
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'role_usuario')
ORDER BY enumsortorder;

