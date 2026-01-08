-- ============================================
-- IBUC System - Adição de Cargos Especializados
-- ============================================

-- Nota: PostgreSQL não permite ALTER TYPE ADD VALUE em transação.
-- Este script usa blocos DO separados.

-- NOVAS ROLES NO ENUM role_usuario
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'vice_diretor_geral' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'role_usuario')) THEN ALTER TYPE role_usuario ADD VALUE 'vice_diretor_geral'; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'vice_coordenador_geral' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'role_usuario')) THEN ALTER TYPE role_usuario ADD VALUE 'vice_coordenador_geral'; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'primeiro_secretario_geral' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'role_usuario')) THEN ALTER TYPE role_usuario ADD VALUE 'primeiro_secretario_geral'; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'segundo_secretario_geral' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'role_usuario')) THEN ALTER TYPE role_usuario ADD VALUE 'segundo_secretario_geral'; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'primeiro_tesoureiro_geral' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'role_usuario')) THEN ALTER TYPE role_usuario ADD VALUE 'primeiro_tesoureiro_geral'; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'segundo_tesoureiro_geral' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'role_usuario')) THEN ALTER TYPE role_usuario ADD VALUE 'segundo_tesoureiro_geral'; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'vice_diretor_polo' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'role_usuario')) THEN ALTER TYPE role_usuario ADD VALUE 'vice_diretor_polo'; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'vice_coordenador_polo' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'role_usuario')) THEN ALTER TYPE role_usuario ADD VALUE 'vice_coordenador_polo'; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'primeiro_secretario_polo' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'role_usuario')) THEN ALTER TYPE role_usuario ADD VALUE 'primeiro_secretario_polo'; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'segundo_secretario_polo' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'role_usuario')) THEN ALTER TYPE role_usuario ADD VALUE 'segundo_secretario_polo'; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'primeiro_tesoureiro_polo' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'role_usuario')) THEN ALTER TYPE role_usuario ADD VALUE 'primeiro_tesoureiro_polo'; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'segundo_tesoureiro_polo' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'role_usuario')) THEN ALTER TYPE role_usuario ADD VALUE 'segundo_tesoureiro_polo'; END IF; END $$;

-- NOVOS VALORES NO ENUM tipo_cargo_diretoria
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'primeiro_secretario' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'tipo_cargo_diretoria')) THEN ALTER TYPE tipo_cargo_diretoria ADD VALUE 'primeiro_secretario'; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'segundo_secretario' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'tipo_cargo_diretoria')) THEN ALTER TYPE tipo_cargo_diretoria ADD VALUE 'segundo_secretario'; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'primeiro_tesoureiro' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'tipo_cargo_diretoria')) THEN ALTER TYPE tipo_cargo_diretoria ADD VALUE 'primeiro_tesoureiro'; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'segundo_tesoureiro' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'tipo_cargo_diretoria')) THEN ALTER TYPE tipo_cargo_diretoria ADD VALUE 'segundo_tesoureiro'; END IF; END $$;
