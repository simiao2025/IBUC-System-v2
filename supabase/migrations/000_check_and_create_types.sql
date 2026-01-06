-- ============================================
-- IBUC System - Verificação e Criação de ENUMs
-- Executa antes de 001_initial_schema.sql se necessário
-- ============================================

-- Função auxiliar para criar ENUM apenas se não existir
CREATE OR REPLACE FUNCTION create_enum_if_not_exists(enum_name text, enum_values text[])
RETURNS void AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = enum_name) THEN
        EXECUTE format('CREATE TYPE %I AS ENUM (%s)', enum_name, array_to_string(enum_values, ', '));
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Criar ENUMs apenas se não existirem
DO $$
BEGIN
    -- status_polo
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_polo') THEN
        CREATE TYPE status_polo AS ENUM ('ativo', 'inativo');
    END IF;

    -- role_usuario
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role_usuario') THEN
        CREATE TYPE role_usuario AS ENUM (
            'super_admin',
            'admin_geral',
            'diretor_geral',
            'coordenador_geral',
            'diretor_polo',
            'coordenador_polo',
            'secretario_polo',
            'tesoureiro',
            'professor',
            'auxiliar',
            'responsavel',
            'aluno'
        );
    END IF;

    -- status_aluno
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_aluno') THEN
        CREATE TYPE status_aluno AS ENUM ('pendente', 'ativo', 'inativo', 'concluido');
    END IF;

    -- sexo
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sexo') THEN
        CREATE TYPE sexo AS ENUM ('M', 'F', 'Outro');
    END IF;

    -- tipo_parentesco
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_parentesco') THEN
        CREATE TYPE tipo_parentesco AS ENUM ('pai', 'mae', 'tutor', 'outro');
    END IF;

    -- turno
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'turno') THEN
        CREATE TYPE turno AS ENUM ('manha', 'tarde', 'noite');
    END IF;

    -- status_turma
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_turma') THEN
        CREATE TYPE status_turma AS ENUM ('ativa', 'inativa', 'concluida');
    END IF;

    -- status_matricula
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_matricula') THEN
        CREATE TYPE status_matricula AS ENUM ('pendente', 'em_analise', 'ativa', 'recusada', 'cancelada');
    END IF;

    -- tipo_matricula
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_matricula') THEN
        CREATE TYPE tipo_matricula AS ENUM ('online', 'presencial');
    END IF;

    -- status_presenca
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_presenca') THEN
        CREATE TYPE status_presenca AS ENUM ('presente', 'falta', 'justificativa', 'atraso');
    END IF;

    -- tipo_conteudo
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_conteudo') THEN
        CREATE TYPE tipo_conteudo AS ENUM ('pdf', 'video', 'atividade', 'link');
    END IF;

    -- status_mensalidade
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_mensalidade') THEN
        CREATE TYPE status_mensalidade AS ENUM ('pendente', 'pago', 'vencido');
    END IF;

    -- metodo_pagamento
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'metodo_pagamento') THEN
        CREATE TYPE metodo_pagamento AS ENUM ('pix', 'boleto', 'cartao', 'presencial');
    END IF;

    -- status_pagamento
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_pagamento') THEN
        CREATE TYPE status_pagamento AS ENUM ('pending', 'success', 'failed');
    END IF;

    -- tipo_notificacao
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_notificacao') THEN
        CREATE TYPE tipo_notificacao AS ENUM ('sistema', 'aviso_polo', 'aviso_turma');
    END IF;

    -- tipo_consentimento
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_consentimento') THEN
        CREATE TYPE tipo_consentimento AS ENUM ('uso_imagem', 'tratamento_dados', 'comunicacao', 'outros');
    END IF;

    -- tipo_documento
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_documento') THEN
        CREATE TYPE tipo_documento AS ENUM ('certidao', 'rg', 'cpf', 'comprovante_residencia', 'laudo', 'outro');
    END IF;

    -- owner_type
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'owner_type') THEN
        CREATE TYPE owner_type AS ENUM ('aluno', 'responsavel', 'usuario');
    END IF;
END $$;

-- Remover função auxiliar (não é mais necessária)
DROP FUNCTION IF EXISTS create_enum_if_not_exists(text, text[]);

