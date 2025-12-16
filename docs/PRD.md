# PRD v2.1 FINAL — IBUC System (MVP)

## 1. Visão Geral

Sistema de gestão educacional para instituições religiosas, focado no gerenciamento de polos educacionais, alunos, turmas, conteúdo didático e finanças. Arquitetura full-stack com frontend em React/Vite e backend em Supabase.

## 2. Objetivo do MVP

Entregar uma solução estável e operacional que cubra os processos essenciais:

* Gestão de alunos e responsáveis
* Pré-matrícula com upload de documentos
* Matrícula administrativa
* Controle de frequência
* Gestão de conteúdo educacional
* Gestão financeira básica

## 3. Tipos de Usuários

### 3.1 Administrativos

* Super Admin
* Admin Geral
* Diretor Geral
* Coordenador Geral
* Diretor de Polo
* Coordenador de Polo
* Secretário de Polo
* Tesoureiro
* Professor

### 3.2 Externos

* Aluno
* Responsável

## 4. Escopo do MVP

Inclui exclusivamente as funcionalidades descritas neste documento. Qualquer item não listado é considerado fora de escopo.

## 5. Páginas Públicas

### 5.1 Página Inicial

**Objetivo**: Apresentar o curso e permitir pré-matrícula.

**Elementos obrigatórios**:

* Informações institucionais
* Menu: Início | Sobre IBUC | Módulos
* Botão: Pré-matrícula

**Ação principal**:

* Formulário de pré-matrícula com upload de documentos

### 5.2 Pré-matrícula

**Campos obrigatórios**:

* Nome do aluno
* Data de nascimento
* Polo desejado
* Dados do responsável
* Upload de documentos

**Regra**:

* Nenhuma matrícula é concluída nesta etapa

## 6. Estrutura de Rotas (Estado Alvo)

* Públicas: /, /sobre, /modulos, /pre-matricula, /login
* Aluno: /app/dashboard, /app/modulos, /app/boletim, /app/frequencia, /app/financeiro
* Admin: /admin/dashboard, /admin/polos, /admin/turmas, /admin/alunos, /admin/matriculas, /admin/frequencia, /admin/financeiro, /admin/relatorios, /admin/usuarios, /admin/configuracoes

## 7. Área do Aluno

### 7.1 Dashboard

**Objetivo**: Visão geral acadêmica

**Conteúdo**:

* Progresso no curso
* Status financeiro
* Avisos

### 7.2 Módulos

* Visualização de conteúdo liberado
* Progresso por módulo

### 7.3 Boletim

* Notas
* Observações

### 7.4 Frequência

* Presenças registradas

### 7.5 Financeiro

* Mensalidades
* Pagamentos

## 8. Área Administrativa (DETALHADA)

### 8.1 Admin Dashboard

**Papéis**: Super Admin, Admin Geral, Diretores, Coordenadores

**Ações**:

* Visualizar indicadores (alunos, matrículas, inadimplência, drácmas acumuladas)

**DoD**:

* Indicadores carregam corretamente

---

### 8.2 Gestão de Polos

**Papéis**: Super Admin, Admin Geral

**Ações**:

* Criar polo
* Editar polo
* Ativar/desativar polo

**Regras**:

* Polo inativo não recebe novas turmas

**DoD**:

* CRUD funcional com validações

---

### 8.3 Gestão de Turmas

**Papéis**: Admin Geral, Diretor/Coordenador de Polo

**Ações**:

* Criar turma
* Definir professor
* Definir vagas

**Regras**:

* Turma deve pertencer a um polo ativo

---

### 8.4 Gestão de Alunos

**Papéis**: Admin Geral, Secretário

**Ações**:

* Aprovar pré-matrícula
* Editar dados

**Regras**:

* Aluno só acessa após matrícula ativa

---

### 8.5 Matrículas

**Papéis**: Admin Geral, Secretário

**Ações**:

* Validar documentos
* Concluir matrícula

**Regras**:

* Matrícula gera vínculo aluno-turma

---

### 8.6 Frequência

**Papéis**: Professor

**Ações**:

* Registrar presença por aula

---

### 8.7 Sistema de Recompensas (Drácmas)

**Objetivo**: Incentivar participação, disciplina e bom comportamento dos alunos.

**Papéis**:

* Professor: lança drácmas
* Coordenador: visualiza
* Aluno: consulta saldo

**Regras Gerais**:

* Drácma é uma unidade simbólica de recompensa
* Não possui valor financeiro real
* Apenas lançamentos positivos são permitidos no MVP

**Critérios de Lançamento (configuráveis)**:

* Presença em aula
* Participação ativa
* Responder perguntas
* Comportamento exemplar

**Regra de Pontuação**:

* Cada ação positiva gera +1 drácma

**Ações do Professor**:

* Selecionar aluno
* Selecionar critério
* Confirmar lançamento

**Restrições**:

* Professor só lança drácmas para alunos da sua turma
* Lançamentos não podem ser editados ou excluídos

**DoD**:

* Lançamento registrado corretamente
* Saldo atualizado para o aluno

---

### 8.8 Financeiro

**Papéis**: Tesoureiro

**Ações**:

* Gerar mensalidades
* Registrar pagamentos

**Regras**:

* Inadimplência bloqueia novos módulos

---

### 8.9 Relatórios

**Papéis**: Diretores, Coordenadores

**Ações**:

* Visualizar relatórios acadêmicos, financeiros e de drácmas

---

### 8.10 Usuários

**Papéis**: Super Admin

**Ações**:

* Criar usuários
* Definir papéis

---

### 8.11 Configurações

**Papéis**: Super Admin

**Ações**:

* Definir critérios ativos de drácmas
* Definir parâmetros globais

## 9. Modelo de Dados (Resumo)

* users
* students
* guardians
* polos
* turmas
* matriculas
* frequencias
* dracma_criteria
* dracma_transactions
* pagamentos
* users
* students
* guardians
* polos
* turmas
* matriculas
* frequencias
* pagamentos

## 10. Regras Anti-Alucinação

* Implementar apenas o que está descrito neste PRD
* Qualquer dúvida deve ser questionada antes da execução

---

**Este documento é a FONTE ÚNICA DA VERDADE para o MVP.**
