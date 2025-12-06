-- ============================================
-- IBUC System - Dados Seed
-- ============================================

-- Inserir Níveis
INSERT INTO niveis (nome, idade_min, idade_max, descricao, ordem) VALUES
('Nível I - 2 a 5 anos', 2, 5, 'Iniciação bíblica para crianças pequenas', 1),
('Nível II - 6 a 8 anos', 6, 8, 'Desenvolvimento bíblico para crianças', 2),
('Nível III - 9 a 11 anos', 9, 11, 'Aprofundamento bíblico para pré-adolescentes', 3),
('Nível IV - 12 a 16 anos', 12, 16, 'Estudo bíblico avançado para adolescentes', 4);

-- Inserir Módulos
INSERT INTO modulos (numero, titulo, descricao, duracao_sugestiva, objetivos, carga_horaria) VALUES
(1, 'Conhecendo a Bíblia', 'Introdução ao estudo da Bíblia, sua estrutura e importância', 20, 'Familiarizar o aluno com a Bíblia e seus livros', 20),
(2, 'História do Antigo Testamento', 'Estudo dos principais eventos e personagens do Antigo Testamento', 25, 'Compreender a história bíblica do Antigo Testamento', 25),
(3, 'História do Novo Testamento', 'Estudo dos principais eventos e personagens do Novo Testamento', 25, 'Compreender a história bíblica do Novo Testamento', 25),
(4, 'Vida de Jesus', 'Estudo detalhado da vida, ministério e ensinamentos de Jesus', 30, 'Conhecer profundamente a vida e obra de Jesus', 30),
(5, 'Doutrinas Básicas', 'Fundamentos da fé cristã e doutrinas essenciais', 20, 'Estabelecer fundamentos doutrinários sólidos', 20),
(6, 'Oração e Adoração', 'Ensinamentos sobre oração, adoração e vida devocional', 15, 'Desenvolver vida de oração e adoração', 15),
(7, 'Serviço e Ministério', 'Chamado ao serviço e diferentes formas de ministério', 20, 'Despertar para o serviço cristão', 20),
(8, 'Ética Cristã', 'Princípios éticos e morais baseados na Bíblia', 20, 'Formar caráter cristão e valores éticos', 20),
(9, 'Missões e Evangelismo', 'Chamado missionário e compartilhamento do evangelho', 20, 'Despertar para missões e evangelismo', 20),
(10, 'Liderança Cristã', 'Princípios de liderança baseados em exemplos bíblicos', 25, 'Desenvolver habilidades de liderança cristã', 25);

-- Inserir Polo de exemplo (será atualizado com dados reais)
INSERT INTO polos (nome, codigo, endereco, telefone, email, status) VALUES
('Igreja Central - Palmas', 'POLO-001', 
 '{"cep": "77000-000", "rua": "Rua das Flores", "numero": "100", "bairro": "Centro", "cidade": "Palmas", "estado": "TO"}',
 '(63) 3214-5678', 'contato@ibucpalmas.com.br', 'ativo');

-- Criar usuário super_admin de exemplo (senha deve ser hash em produção)
-- NOTA: Em produção, usar Supabase Auth para gerenciar usuários
INSERT INTO usuarios (email, nome_completo, role, ativo) VALUES
('admin@ibuc.com.br', 'Administrador Geral', 'super_admin', true);

-- Criar usuário admin_geral de exemplo
INSERT INTO usuarios (email, nome_completo, role, polo_id, ativo) 
SELECT 'admin.geral@ibuc.com.br', 'Administrador Geral', 'admin_geral', id, true
FROM polos WHERE codigo = 'POLO-001';

-- Criar diretor de exemplo
INSERT INTO usuarios (email, nome_completo, cpf, telefone, role, polo_id, ativo)
SELECT 'diretor@ibuc.com.br', 'Diretor do Polo', '123.456.789-00', '(63) 99999-1111', 'diretor_polo', id, true
FROM polos WHERE codigo = 'POLO-001';

-- Criar secretário de exemplo
INSERT INTO usuarios (email, nome_completo, cpf, telefone, role, polo_id, ativo)
SELECT 'secretario@ibuc.com.br', 'Secretário do Polo', '987.654.321-00', '(63) 99999-2222', 'secretario_polo', id, true
FROM polos WHERE codigo = 'POLO-001';

-- Criar professor de exemplo
INSERT INTO usuarios (email, nome_completo, cpf, telefone, role, polo_id, ativo)
SELECT 'professor@ibuc.com.br', 'Professor Exemplo', '111.222.333-44', '(63) 99999-3333', 'professor', id, true
FROM polos WHERE codigo = 'POLO-001';

-- Atualizar diretor_id do polo
UPDATE polos SET diretor_id = (
  SELECT id FROM usuarios WHERE email = 'diretor@ibuc.com.br'
) WHERE codigo = 'POLO-001';

-- Criar turma de exemplo
INSERT INTO turmas (nome, polo_id, nivel_id, modulo_atual_id, professor_id, capacidade, ano_letivo, turno, dias_semana, horario_inicio, horario_fim, local, status)
SELECT 
  'Turma Nível I - Manhã',
  p.id,
  n.id,
  m.id,
  u.id,
  20,
  2024,
  'manha',
  ARRAY[1, 3, 5], -- Segunda, Quarta, Sexta
  '08:00',
  '10:00',
  'Sala 1',
  'ativa'
FROM polos p
CROSS JOIN niveis n
CROSS JOIN modulos m
CROSS JOIN usuarios u
WHERE p.codigo = 'POLO-001'
  AND n.ordem = 1
  AND m.numero = 1
  AND u.email = 'professor@ibuc.com.br';

