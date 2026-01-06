-- Migration V2 para criar usuários para alunos que não possuem usuário na tabela 'usuarios'
-- CORREÇÃO: Força o uso do email gerado (CPF@aluno.ibuc.sistema) para evitar conflito com emails de responsáveis já cadastrados

DO $$
DECLARE
    aluno_record RECORD;
    new_user_id UUID;
    default_password_hash TEXT := '$2b$10$/nv0jZwY.9h0BQhqNojVnefpyizLBIhZFYLE/2.kqaUso9nWpsLSG'; -- Hash para 'senha123'
    clean_cpf TEXT;
    generated_email TEXT;
BEGIN
    RAISE NOTICE 'Iniciando correção de usuários de alunos...';

    -- Loop por alunos que não têm usuario_id definido OU cujo usuario_id não existe na tabela usuarios
    FOR aluno_record IN 
        SELECT a.* 
        FROM alunos a
        LEFT JOIN usuarios u ON a.usuario_id = u.id
        WHERE u.id IS NULL
    LOOP
        -- Limpa o CPF (apenas números)
        clean_cpf := REGEXP_REPLACE(aluno_record.cpf, '\D', '', 'g');
        
        -- Gera email padrão do aluno
        generated_email := clean_cpf || '@aluno.ibuc.sistema';

        -- Se CPF vazio, pula
        IF clean_cpf IS NULL OR clean_cpf = '' THEN
            RAISE NOTICE 'ALERTA: Aluno % (ID: %) não possui CPF, pulando.', aluno_record.nome, aluno_record.id;
            CONTINUE;
        END IF;

        -- Tenta encontrar se já existe um usuário com este CPF para evitar duplicação
        SELECT id INTO new_user_id FROM usuarios WHERE cpf = clean_cpf;

        -- Se não existe usuário, cria um novo
        IF new_user_id IS NULL THEN
            -- Verifica se o EMAIL gerado já existe (caso extremo)
            PERFORM id FROM usuarios WHERE email = generated_email;
            IF FOUND THEN
                RAISE NOTICE 'ALERTA: Email % já existe, tentando usar CPF como prefixo alternativo.', generated_email;
                generated_email := clean_cpf || '.aluno@ibuc.sistema';
            END IF;

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
                generated_email, -- SEMPRE usa o email gerado para evitar conflito com responsável
                aluno_record.nome,
                clean_cpf,
                'aluno',
                default_password_hash,
                aluno_record.polo_id,
                TRUE,
                jsonb_build_object('created_via', 'fix_v2', 'original_email', aluno_record.email_responsavel)
            )
            RETURNING id INTO new_user_id;
            
            RAISE NOTICE 'SUCESSO: Usuário criado para o aluno % (CPF: %, Email: %)', aluno_record.nome, clean_cpf, generated_email;
        ELSE
            RAISE NOTICE 'INFO: Usuário já existia para CPF %, apenas vinculando ao aluno.', clean_cpf;
        END IF;

        -- Atualiza o registro do aluno com o ID do usuário (novo ou existente)
        UPDATE alunos 
        SET usuario_id = new_user_id,
            updated_at = NOW()
        WHERE id = aluno_record.id;
        
    END LOOP;
    
    RAISE NOTICE 'Correção finalizada.';
END $$;
