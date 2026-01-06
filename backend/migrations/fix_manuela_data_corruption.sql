-- Script de Correção Específico para a aluna Manuela
-- Remove o vínculo incorreto com o usuário do diretor e cria umnovo usuário correto

DO $$
DECLARE
    aluno_id UUID;
    clean_cpf TEXT := '96187190149';
    new_user_id UUID;
    default_password_hash TEXT := '$2b$10$/nv0jZwY.9h0BQhqNojVnefpyizLBIhZFYLE/2.kqaUso9nWpsLSG'; -- Hash para 'senha123'
    generated_email TEXT;
BEGIN
    -- 1. Identificar o ID da aluna Manuela
    SELECT id INTO aluno_id FROM alunos WHERE cpf LIKE '%' || clean_cpf || '%' LIMIT 1;
    
    IF aluno_id IS NULL THEN
        RAISE NOTICE 'Aluna com CPF % não encontrada.', clean_cpf;
        RETURN;
    END IF;

    RAISE NOTICE 'Aluna encontrada: ID %', aluno_id;

    -- 2. Limpar o usuario_id incorreto (que aponta para o diretor)
    UPDATE alunos SET usuario_id = NULL WHERE id = aluno_id;
    RAISE NOTICE 'Vínculo incorreto removido.';

    -- 3. Verificar se já existe um usuário correto (órfão) para este CPF
    SELECT id INTO new_user_id FROM usuarios WHERE cpf = clean_cpf;

    -- 4. Se não existe, cria
    IF new_user_id IS NULL THEN
        generated_email := clean_cpf || '@aluno.ibuc.sistema';
        
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
            generated_email,
            'Manuela Mendes Alves', -- Nome fixo ou poderia buscar do select anterior
            clean_cpf,
            'aluno',
            default_password_hash,
            (SELECT polo_id FROM alunos WHERE id = aluno_id),
            TRUE,
            '{"created_via": "fix_manuela_corruption"}'::jsonb
        )
        RETURNING id INTO new_user_id;

        RAISE NOTICE 'Novo usuário criado com ID: %', new_user_id;
    ELSE
        RAISE NOTICE 'Usuário correto já existia (ID: %), será vinculado.', new_user_id;
    END IF;

    -- 5. Vincular o usuário correto à aluna
    UPDATE alunos SET usuario_id = new_user_id, updated_at = NOW() WHERE id = aluno_id;
    RAISE NOTICE 'Correção concluída com sucesso para Manuela.';

END $$;
