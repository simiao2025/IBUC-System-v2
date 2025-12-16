-- Permitir salvar cargos da diretoria geral sem vincular a um usuário imediatamente
-- (o vínculo/cadastro será feito manualmente posteriormente em Gerenciamento de Usuários)

ALTER TABLE IF EXISTS diretoria_geral
  ALTER COLUMN usuario_id DROP NOT NULL;
