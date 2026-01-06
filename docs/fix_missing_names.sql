-- Script para atualizar nomes completos vazios na tabela usuarios
-- Execute este script para corrigir usuários que estão exibindo email ao invés do nome

-- 1. Verificar usuários com nome_completo vazio ou nulo
SELECT 
    id,
    email,
    cpf,
    nome_completo,
    role
FROM usuarios
WHERE nome_completo IS NULL OR nome_completo = '' OR TRIM(nome_completo) = '';

-- 2. Atualizar manualmente os nomes (EXEMPLO - ajuste conforme necessário)
-- Substitua 'Nome Completo do Usuário' pelo nome real de cada pessoa

-- Exemplo para o usuário simiaoacjunior@hotmail.com:
-- UPDATE usuarios 
-- SET nome_completo = 'Simião Acjunior' 
-- WHERE email = 'simiaoacjunior@hotmail.com';

-- 3. Após atualizar, verificar novamente
-- SELECT id, email, nome_completo FROM usuarios WHERE email = 'simiaoacjunior@hotmail.com';
