-- Verificar o que foi persistido no banco
SELECT 
  id,
  aluno_id,
  turma_id,
  modulo_id,
  tipo,
  codigo_validacao,
  url_arquivo,
  data_emissao
FROM certificados
ORDER BY data_emissao DESC
LIMIT 5;
