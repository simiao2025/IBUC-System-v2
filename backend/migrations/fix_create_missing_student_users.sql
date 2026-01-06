-- Migration para criar usuários para alunos que possuem matrícula mas não possuem usuário na tabela 'usuarios'
-- Isso corrige o estado inconsistente causado pelo crash anterior do backend

DO $$
DECLARE
    aluno_record RECORD;
    new_user_id UUID;
    default_password_hash TEXT := '$2b$10$/nv0jZwY.9h0BQhqNojVnefpyizLBIhZFYLE/2.kqaUso9nWpsLSG'; -- Hash para 'senha123'
BEGIN
    -- Loop por alunos que não têm usuario_id definido OU cujo usuario_id não existe na tabela usuarios
    FOR aluno_record IN 
        SELECT a.* 
        FROM alunos a
        LEFT JOIN usuarios u ON a.usuario_id = u.id
        WHERE u.id IS NULL
    LOOP
        -- Tenta encontrar se já existe um usuário com este CPF para evitar duplicação
        SELECT id INTO new_user_id FROM usuarios WHERE cpf = aluno_record.cpf;

        -- Se não existe usuário, cria um novo
        IF new_user_id IS NULL THEN
            INSERT INTO usuarios (
                email,
                nome_completo,
                cpf,
                role,
                password_hash,
                polo_id,
                ativo,
                metadata
            ) VALUES (
                -- Se não tiver email, gera um email fictício baseado no CPF para permitir o login
                COALESCE(aluno_record.email_responsavel, REGEXP_REPLACE(aluno_record.cpf, '\D', '', 'g') || '@aluno.ibuc.sistema'),
                aluno_record.nome,
                REGEXP_REPLACE(aluno_record.cpf, '\D', '', 'g'), -- Garante apenas números
                'aluno',
                default_password_hash,
                aluno_record.polo_id,
                TRUE,
                '{"created_via": "migration_fix_missing_users"}'::jsonb
            )
            RETURNING id INTO new_user_id;
            
            RAISE NOTICE 'Usuário criado para o aluno % (CPF: %)', aluno_record.nome, aluno_record.cpf;
        ELSE
            RAISE NOTICE 'Usuário já existia para o aluno % (CPF: %), apenas vinculando.', aluno_record.nome, aluno_record.cpf;
        END IF;

        -- Atualiza o registro do aluno com o ID do usuário (novo ou existente)
        UPDATE alunos 
        SET usuario_id = new_user_id,
            updated_at = NOW()
        WHERE id = aluno_record.id;
        
    END LOOP;
END $$;
