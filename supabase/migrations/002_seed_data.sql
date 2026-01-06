-- ============================================
-- IBUC System - Dados Seed
-- ============================================

-- Inserir Níveis (idempotente)
INSERT INTO niveis (nome, idade_min, idade_max, descricao, ordem) 
SELECT * FROM (VALUES
('Nível I - 2 a 5 anos', 2, 5, 'Iniciação bíblica para crianças pequenas', 1),
('Nível II - 6 a 8 anos', 6, 8, 'Desenvolvimento bíblico para crianças', 2),
('Nível III - 9 a 11 anos', 9, 11, 'Aprofundamento bíblico para pré-adolescentes', 3),
  ('Nível IV - 12 a 16 anos', 12, 16, 'Estudo bíblico avançado para adolescentes', 4)
) AS v(nome, idade_min, idade_max, descricao, ordem)
WHERE NOT EXISTS (SELECT 1 FROM niveis WHERE ordem = v.ordem);

-- Inserir Módulos (idempotente)
INSERT INTO modulos (numero, titulo, descricao, duracao_sugestiva, objetivos, carga_horaria) 
SELECT * FROM (VALUES
  (1, 'Entendendo a Bíblia', 'Introdução ao estudo da Bíblia, sua estrutura, idiomas e objetivo principal', 18, 'Familiarizar o aluno com a Bíblia, sua estrutura e propósito, com foco em Jesus como centro', 18),
  (2, 'Descobrindo o Pentateuco', 'Estudo dos cinco primeiros livros da Bíblia: Gênesis, Êxodo, Levítico, Números e Deuteronômio', 18, 'Compreender a base da lei e da história do povo de Israel', 18),
  (3, 'Explorando as Terras Bíblicas', 'Geografia, clima, flora e fauna das terras mencionadas na Bíblia', 18, 'Conhecer o contexto geográfico e histórico das narrativas bíblicas', 18),
  (4, 'Vivenciando a História', 'Estudo dos livros históricos do Antigo Testamento: de Josué a Ester', 18, 'Compreender a história do povo de Israel desde a conquista de Canaã até o exílio', 18),
  (5, 'Aprendendo com os Poetas', 'Estudo dos livros poéticos: Jó, Salmos, Provérbios, Eclesiastes e Cânticos', 18, 'Aprender sobre sabedoria, louvor e poesia bíblica', 18),
  (6, 'Aprendendo com os Profetas', 'Estudo dos profetas maiores e menores do Antigo Testamento', 18, 'Compreender mensagens de arrependimento, esperança e juízo', 18),
  (7, 'Caminhando com Jesus', 'Estudo dos Evangelhos e da vida e ministério de Jesus Cristo', 18, 'Conhecer a vida, ensinamentos e obra redentora de Jesus', 18),
  (8, 'Conhecendo a Igreja Primitiva', 'Estudo do livro de Atos e das cartas gerais', 18, 'Compreender o início e crescimento da igreja e seus ensinamentos', 18),
  (9, 'Compreendendo os Princípios Cristãos', 'Estudo das cartas paulinas e doutrinas fundamentais da fé cristã', 18, 'Aprender princípios e doutrinas essenciais da fé cristã', 18),
  (10, 'Desvendando o Futuro', 'Estudo do livro de Apocalipse e escatologia bíblica', 18, 'Compreender as profecias e a esperança cristã no futuro', 18)
) AS v(numero, titulo, descricao, duracao_sugestiva, objetivos, carga_horaria)
ON CONFLICT (numero) DO UPDATE SET
  titulo = EXCLUDED.titulo,
  descricao = EXCLUDED.descricao,
  duracao_sugestiva = EXCLUDED.duracao_sugestiva,
  objetivos = EXCLUDED.objetivos,
  carga_horaria = EXCLUDED.carga_horaria;

-- Função auxiliar para inserir lição apenas se não existir
-- Garante idempotência e permite atualização de nomenclatura via UPSERT por (modulo_id, ordem)
CREATE UNIQUE INDEX IF NOT EXISTS licoes_modulo_id_ordem_key ON licoes (modulo_id, ordem);

CREATE OR REPLACE FUNCTION insert_licao_if_not_exists(
  p_modulo_numero INTEGER,
  p_titulo TEXT,
  p_descricao TEXT,
  p_ordem INTEGER
) RETURNS void AS $$
BEGIN
  INSERT INTO licoes (modulo_id, titulo, descricao, ordem, liberacao_data)
  SELECT m.id, p_titulo, p_descricao, p_ordem, CURRENT_DATE
  FROM modulos m
  WHERE m.numero = p_modulo_numero
  ON CONFLICT (modulo_id, ordem) DO UPDATE
  SET
    titulo = EXCLUDED.titulo,
    descricao = EXCLUDED.descricao;
END;
$$ LANGUAGE plpgsql;

-- Inserir Lições para cada Módulo (idempotente)
-- Módulo 1: Entendendo a Bíblia
SELECT insert_licao_if_not_exists(1, 'O que é a Bíblia?', 'Introdução ao conceito e importância da Bíblia', 1);

SELECT insert_licao_if_not_exists(1, 'A Bíblia é um livro?', 'Entendendo a estrutura da Bíblia como uma coleção de livros', 2);

SELECT insert_licao_if_not_exists(1, 'A Bíblia foi escrita em que idioma?', 'Estudo dos idiomas originais: hebraico, aramaico e grego', 3);

SELECT insert_licao_if_not_exists(1, 'Porque a minha Bíblia parece ser diferente?', 'Entendendo as diferentes traduções e versões da Bíblia', 4);

SELECT insert_licao_if_not_exists(1, 'A Bíblia está em ordem cronológica?', 'Compreendendo a organização dos livros bíblicos', 5);

SELECT insert_licao_if_not_exists(1, 'O Antigo Testamento', 'Visão geral do conteúdo e propósito do Antigo Testamento', 6);

SELECT insert_licao_if_not_exists(1, 'O grande exemplo de Deus', 'A revelação de Deus através do Antigo Testamento', 7);

SELECT insert_licao_if_not_exists(1, 'O Novo Testamento', 'Visão geral do conteúdo e propósito do Novo Testamento', 8);

SELECT insert_licao_if_not_exists(1, 'Qual o objetivo da Bíblia?', 'Compreendendo o propósito principal das Escrituras', 9);

SELECT insert_licao_if_not_exists(1, 'Quem é Jesus?', 'Introdução à pessoa e obra de Jesus Cristo', 10);

SELECT insert_licao_if_not_exists(1, 'Provas Bíblicas que Jesus é Deus', 'Evidências bíblicas da divindade de Jesus', 11);

SELECT insert_licao_if_not_exists(1, 'Jesus, o caminho a verdade e a vida', 'Jesus como único caminho para Deus', 12);

-- Módulo 2: Descobrindo o Pentateuco
SELECT insert_licao_if_not_exists(2, 'História do Pentateuco', 'Introdução aos cinco primeiros livros da Bíblia', 1);

SELECT insert_licao_if_not_exists(2, 'Gênesis', 'Estudo do livro de Gênesis: criação, queda e patriarcas', 2);

SELECT insert_licao_if_not_exists(2, 'O Êxodo', 'A libertação do povo de Israel do Egito', 3);

SELECT insert_licao_if_not_exists(2, 'Os Dez Mandamentos', 'Estudo dos Dez Mandamentos e sua importância', 4);

SELECT insert_licao_if_not_exists(2, 'O Tabernáculo', 'O lugar de adoração no deserto', 5);

SELECT insert_licao_if_not_exists(2, 'A Arca da Aliança', 'O símbolo da presença de Deus', 6);

SELECT insert_licao_if_not_exists(2, 'O Sumo Sacerdote', 'O papel do sacerdócio no Antigo Testamento', 7);

SELECT insert_licao_if_not_exists(2, 'Levítico', 'Leis e regulamentos para o povo de Israel', 8);

SELECT insert_licao_if_not_exists(2, 'As 5 Ofertas', 'Estudo das ofertas e sacrifícios', 9);

SELECT insert_licao_if_not_exists(2, 'As Festas de Israel', 'As festas religiosas e seu significado', 10);

SELECT insert_licao_if_not_exists(2, 'Números', 'A jornada no deserto e o censo do povo', 11);

SELECT insert_licao_if_not_exists(2, 'Deuteronômio', 'A repetição da lei e a preparação para Canaã', 12);

-- Módulo 3: Explorando as Terras Bíblicas
SELECT insert_licao_if_not_exists(3, 'O mundo Bíblico', 'Visão geral do contexto geográfico bíblico', 1);

SELECT insert_licao_if_not_exists(3, 'A Terra Prometida', 'A geografia da terra de Canaã', 2);

SELECT insert_licao_if_not_exists(3, 'Planaltos e montes', 'As elevações e montanhas importantes na Bíblia', 3);

SELECT insert_licao_if_not_exists(3, 'Planícies e vales', 'As planícies e vales mencionados nas Escrituras', 4);

SELECT insert_licao_if_not_exists(3, 'Desertos e hidrografia', 'Os desertos e os corpos d''água bíblicos', 5);

SELECT insert_licao_if_not_exists(3, 'O clima, flora e a fauna nos tempos Bíblicos', 'O ambiente natural do mundo bíblico', 6);

SELECT insert_licao_if_not_exists(3, 'A jornada do povo de Israel do Egito a Canaã', 'O caminho percorrido durante o Êxodo', 7);

SELECT insert_licao_if_not_exists(3, 'A distribuição da terra às 12 tribos', 'Como a terra foi dividida entre as tribos', 8);

SELECT insert_licao_if_not_exists(3, 'Período de Glória e derrota', 'Os altos e baixos da história de Israel', 9);

SELECT insert_licao_if_not_exists(3, 'Tradições dos Judeus', 'Costumes e tradições do povo judeu', 10);

SELECT insert_licao_if_not_exists(3, 'A terra santa nos tempos de Jesus', 'A geografia durante o ministério de Jesus', 11);

SELECT insert_licao_if_not_exists(3, 'Terra de Israel atualmente', 'A geografia moderna da terra de Israel', 12);

-- Módulo 4: Vivenciando a História
SELECT insert_licao_if_not_exists(4, 'O Livro de Josué', 'A conquista da terra prometida', 1);

SELECT insert_licao_if_not_exists(4, 'O Livro de Juízes', 'O período dos juízes de Israel', 2);

SELECT insert_licao_if_not_exists(4, 'O Livro de Rute', 'A história de Rute e sua fidelidade', 3);

SELECT insert_licao_if_not_exists(4, 'O Livro de I Samuel', 'O início da monarquia e o reinado de Saul', 4);

SELECT insert_licao_if_not_exists(4, 'O Livro de II Samuel', 'O reinado de Davi', 5);

SELECT insert_licao_if_not_exists(4, 'O Livro de I Reis', 'O reino dividido e os reis de Israel e Judá', 6);

SELECT insert_licao_if_not_exists(4, 'O Livro de II Reis', 'A continuação da história dos reinos', 7);

SELECT insert_licao_if_not_exists(4, 'O Livro de I Crônicas', 'A história revisada do povo de Israel', 8);

SELECT insert_licao_if_not_exists(4, 'O Livro de II Crônicas', 'A continuação das crônicas', 9);

SELECT insert_licao_if_not_exists(4, 'O Livro de Esdras', 'O retorno do exílio e a reconstrução do templo', 10);

SELECT insert_licao_if_not_exists(4, 'O Livro de Neemias', 'A reconstrução dos muros de Jerusalém', 11);

SELECT insert_licao_if_not_exists(4, 'O Livro de Ester', 'A coragem de Ester para salvar seu povo', 12);

-- Módulo 5: Aprendendo com os Poetas
SELECT insert_licao_if_not_exists(5, 'Livros Poéticos', 'Introdução aos livros poéticos da Bíblia', 1);

SELECT insert_licao_if_not_exists(5, 'O Livro de Jó', 'O sofrimento e a sabedoria de Jó', 2);

SELECT insert_licao_if_not_exists(5, 'O livro de Salmos', 'Introdução ao livro de Salmos', 3);

SELECT insert_licao_if_not_exists(5, 'O livro dos Salmos – Parte I (1 – 41)', 'Estudo dos primeiros salmos', 4);

SELECT insert_licao_if_not_exists(5, 'O livro dos Salmos – Parte II (42 – 72)', 'Continuação do estudo dos salmos', 5);

SELECT insert_licao_if_not_exists(5, 'O livro dos Salmos – Parte III (73 – 89)', 'Mais salmos de adoração e lamento', 6);

SELECT insert_licao_if_not_exists(5, 'O livro dos Salmos – Parte IV (90 – 106)', 'Salmos de louvor e ação de graças', 7);

SELECT insert_licao_if_not_exists(5, 'O livro dos Salmos – Parte V (107 – 150)', 'Os últimos salmos', 8);

SELECT insert_licao_if_not_exists(5, 'O Livro de Provérbios', 'Sabedoria prática para a vida diária', 9);

SELECT insert_licao_if_not_exists(5, 'Provérbios – O sábio e o insensato', 'Contraste entre sabedoria e insensatez', 10);

SELECT insert_licao_if_not_exists(5, 'O Livro de Eclesiastes', 'A busca pelo significado da vida', 11);

SELECT insert_licao_if_not_exists(5, 'O livro de Cânticos dos Cânticos', 'O amor e o casamento segundo a Bíblia', 12);

-- Módulo 6: Aprendendo com os Profetas
SELECT insert_licao_if_not_exists(6, 'Os profetas', 'Introdução ao ministério profético', 1);

SELECT insert_licao_if_not_exists(6, 'Os livros de Joel, Jonas e Amós', 'Estudo dos profetas menores', 2);

SELECT insert_licao_if_not_exists(6, 'Os livros de Oséias e Miquéias', 'Mensagens de juízo e esperança', 3);

SELECT insert_licao_if_not_exists(6, 'O livro de Isaías', 'O profeta messiânico', 4);

SELECT insert_licao_if_not_exists(6, 'Os Livros de Naum e Sofonias', 'Profetas do juízo', 5);

SELECT insert_licao_if_not_exists(6, 'O livro de Jeremias', 'O profeta chorão e suas mensagens', 6);

SELECT insert_licao_if_not_exists(6, 'Os livros de Habacuque e Obadias', 'Profetas do exílio', 7);

SELECT insert_licao_if_not_exists(6, 'O livro de Ezequiel', 'Visões e profecias durante o exílio', 8);

SELECT insert_licao_if_not_exists(6, 'O livro de Lamentações', 'O lamento pela destruição de Jerusalém', 9);

SELECT insert_licao_if_not_exists(6, 'O livro de Daniel', 'Profetas e visões apocalípticas', 10);

SELECT insert_licao_if_not_exists(6, 'Os livros de Ageu, Zacarias e Malaquias', 'Profetas pós-exílicos', 11);

SELECT insert_licao_if_not_exists(6, 'A vinda do Messias e 400 Anos de Silêncio de Deus', 'O período intertestamentário', 12);

-- Módulo 7: Caminhando com Jesus
SELECT insert_licao_if_not_exists(7, 'O Novo Testamento', 'Introdução ao Novo Testamento', 1);

SELECT insert_licao_if_not_exists(7, 'O evangelho de Jesus', 'O que é o evangelho', 2);

SELECT insert_licao_if_not_exists(7, 'O livro de Mateus', 'O evangelho do reino', 3);

SELECT insert_licao_if_not_exists(7, 'O livro de Marcos', 'O evangelho da ação', 4);

SELECT insert_licao_if_not_exists(7, 'O livro de Lucas', 'O evangelho do Filho do Homem', 5);

SELECT insert_licao_if_not_exists(7, 'O livro de João', 'O evangelho do Filho de Deus', 6);

SELECT insert_licao_if_not_exists(7, 'A vida de Jesus até o chamado dos discípulos', 'O início do ministério de Jesus', 7);

SELECT insert_licao_if_not_exists(7, 'Os ensinamentos de Jesus', 'O Sermão do Monte e outros ensinamentos', 8);

SELECT insert_licao_if_not_exists(7, 'Os milagres e maravilhas que Jesus fez', 'O poder de Jesus manifestado', 9);

SELECT insert_licao_if_not_exists(7, 'As parábolas de Jesus', 'Ensinamentos através de histórias', 10);

SELECT insert_licao_if_not_exists(7, 'As orações de Jesus', 'A vida de oração de Jesus', 11);

SELECT insert_licao_if_not_exists(7, 'Prisão, crucificação, morte e ressurreição de Jesus', 'A obra redentora de Jesus', 12);

-- Módulo 8: Conhecendo a Igreja Primitiva
SELECT insert_licao_if_not_exists(8, 'Revela Jesus como único caminho', 'Jesus como único caminho para a salvação', 1);

SELECT insert_licao_if_not_exists(8, 'O livro dos Atos dos Apóstolos', 'O nascimento e crescimento da igreja', 2);

SELECT insert_licao_if_not_exists(8, 'O Espírito de Deus abre as escrituras ao entendimento dos Apóstolos', 'O papel do Espírito Santo', 3);

SELECT insert_licao_if_not_exists(8, 'O Pentecostes', 'O derramamento do Espírito Santo', 4);

SELECT insert_licao_if_not_exists(8, 'O Apóstolo Pedro', 'O ministério de Pedro', 5);

SELECT insert_licao_if_not_exists(8, 'O Apóstolo Paulo', 'A conversão e ministério de Paulo', 6);

SELECT insert_licao_if_not_exists(8, 'A Igreja', 'A natureza e propósito da igreja', 7);

SELECT insert_licao_if_not_exists(8, 'As cartas universais do Novo Testamento', 'Introdução às cartas gerais', 8);

SELECT insert_licao_if_not_exists(8, 'A carta aos Hebreus', 'Jesus, o sumo sacerdote perfeito', 9);

SELECT insert_licao_if_not_exists(8, 'A carta de Tiago e a carta de Judas', 'Cartas sobre fé e prática', 10);

SELECT insert_licao_if_not_exists(8, 'As cartas do Apóstolo Pedro', 'Ensinamentos sobre sofrimento e santidade', 11);

SELECT insert_licao_if_not_exists(8, 'As cartas do Apóstolo João', 'Amor, verdade e comunhão', 12);

-- Módulo 9: Compreendendo os Princípios Cristãos
SELECT insert_licao_if_not_exists(9, 'As cartas Paulinas', 'Introdução às cartas do apóstolo Paulo', 1);

SELECT insert_licao_if_not_exists(9, 'A carta do Apóstolo Paulo aos Romanos', 'O evangelho da justificação pela fé', 2);

SELECT insert_licao_if_not_exists(9, 'A primeira carta do Apóstolo Paulo aos Coríntios', 'Problemas na igreja e soluções', 3);

SELECT insert_licao_if_not_exists(9, 'Segunda carta do Apóstolo Paulo aos Coríntios', 'Ministério e sofrimento', 4);

SELECT insert_licao_if_not_exists(9, 'Carta do Apóstolo Paulo aos Gálatas', 'A liberdade em Cristo', 5);

SELECT insert_licao_if_not_exists(9, 'Carta do Apóstolo Paulo aos Efésios', 'A igreja como corpo de Cristo', 6);

SELECT insert_licao_if_not_exists(9, 'Cartas do Apóstolo Paulo aos Filipenses', 'Alegria em todas as circunstâncias', 7);

SELECT insert_licao_if_not_exists(9, 'Carta do Apóstolo Paulo aos Colossenses e a Filemom', 'Cristo preeminente e reconciliação', 8);

SELECT insert_licao_if_not_exists(9, 'Primeira e segunda carta do Apóstolo Paulo aos Tessalonicenses', 'A segunda vinda de Cristo', 9);

SELECT insert_licao_if_not_exists(9, 'Primeira carta do Apóstolo Paulo a Timóteo', 'Liderança e doutrina na igreja', 10);

SELECT insert_licao_if_not_exists(9, 'Segunda Carta do Apóstolo Paulo a Timóteo', 'Fidelidade e perseverança', 11);

SELECT insert_licao_if_not_exists(9, 'Carta do Apóstolo Paulo a Tito', 'Liderança e boas obras', 12);

-- Módulo 10: Desvendando o Futuro
SELECT insert_licao_if_not_exists(10, 'O Livro de Apocalipse', 'Introdução ao livro de Apocalipse', 1);

SELECT insert_licao_if_not_exists(10, 'A revelação de Jesus Cristo', 'Jesus como revelador do futuro', 2);

SELECT insert_licao_if_not_exists(10, 'As sete mensagens às Igrejas da Ásia', 'Cartas às sete igrejas', 3);

SELECT insert_licao_if_not_exists(10, 'O trono de Deus no céu', 'A adoração celestial', 4);

SELECT insert_licao_if_not_exists(10, 'Digno é o Cordeiro de abrir o livro selado', 'Jesus como único digno', 5);

SELECT insert_licao_if_not_exists(10, 'Os sete selos', 'As aberturas dos selos', 6);

SELECT insert_licao_if_not_exists(10, 'As sete trombetas', 'Os juízos das trombetas', 7);

SELECT insert_licao_if_not_exists(10, 'As visões de consolação', 'Esperança em meio ao juízo', 8);

SELECT insert_licao_if_not_exists(10, 'As sete taças derramadas sobre a terra', 'Os juízos finais', 9);

SELECT insert_licao_if_not_exists(10, 'A Babilônia – A visão e lamentação sobre a queda', 'A queda do sistema mundial', 10);

SELECT insert_licao_if_not_exists(10, 'As bodas do Cordeiro – Satanás amarrado, o reino milenar e o juízo final', 'O triunfo final de Cristo', 11);

SELECT insert_licao_if_not_exists(10, 'O novo céu, a nova terra e a nova Jerusalém', 'A consumação de todas as coisas', 12);

-- ============================================
-- NOTA: Dados de demonstração removidos
-- 
-- Para testes com dados reais:
-- 1. Crie os polos através da interface administrativa
-- 2. Crie os usuários através da interface administrativa
-- 3. Crie as turmas através da interface administrativa
-- 
-- Este arquivo agora contém apenas:
-- - Níveis do curso (estrutura básica)
-- - Módulos do curso (estrutura básica)
-- - Lições de cada módulo (estrutura básica)
-- ============================================

-- Limpar função auxiliar (não é mais necessária após as inserções)
DROP FUNCTION IF EXISTS insert_licao_if_not_exists(INTEGER, TEXT, TEXT, INTEGER);
