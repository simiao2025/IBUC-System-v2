-- Script de Diagnóstico para verificar o estado da aluna Manuela
-- Execute este script para ver se a aluna existe e se tem vínculo com usuário

SELECT 
    a.id AS aluno_id,
    a.nome AS nome_aluno,
    a.cpf AS cpf_aluno,
    a.usuario_id,
    u.id AS usuario_encontrado_id,
    u.email AS email_usuario,
    u.role AS role_usuario 
FROM 
    alunos a
LEFT JOIN 
    usuarios u ON a.usuario_id = u.id
WHERE 
    a.nome ILIKE '%Manuela%' OR a.cpf LIKE '%96187190149%';

-- Verificar se existe algum usuário com este CPF, mesmo sem vínculo
SELECT * FROM usuarios WHERE cpf LIKE '%96187190149%';
