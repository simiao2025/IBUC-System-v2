-- ============================================
-- IBUC System - Correção adicional do Enum role_usuario
-- Adiciona roles faltantes ao enum
-- ============================================

-- Nota: PostgreSQL não permite ALTER TYPE ADD VALUE em transação.
-- Este script usa blocos DO separados (executados sequencialmente).

-- Adicionar secretario_geral (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'secretario_geral' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'role_usuario')
    ) THEN
        ALTER TYPE role_usuario ADD VALUE 'secretario_geral';
    END IF;
END $$;

-- Adicionar tesoureiro_geral (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'tesoureiro_geral' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'role_usuario')
    ) THEN
        ALTER TYPE role_usuario ADD VALUE 'tesoureiro_geral';
    END IF;
END $$;

-- Adicionar tesoureiro_polo (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'tesoureiro_polo' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'role_usuario')
    ) THEN
        ALTER TYPE role_usuario ADD VALUE 'tesoureiro_polo';
    END IF;
END $$;

-- Verificar valores do enum
SELECT enumlabel as role
FROM pg_enum
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'role_usuario')
ORDER BY enumsortorder;
