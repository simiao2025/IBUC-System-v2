# PRD Técnico: IBUC System v2

**Status**: Consolidado pós-refatoração (Fonte da Verdade)
**Papel**: Arquiteto de Software / Product Engineer Sênior

---

## 1. Contexto e Escopo

O **IBUC System v2** é uma plataforma de gestão acadêmica e administrativa para o IBUC (Instituto Bíblico). O sistema centraliza o controle de polos, matrículas, vida acadêmica dos alunos e gestão financeira, operando sob uma arquitetura de permissões baseada em papéis (RBAC) e isolamento de dados por polo (RLS conceitual).

---

## 2. Extração do Produto (Core Business)

### 2.1 Objetivo Central

Digitalizar e automatizar o ciclo de vida do aluno, desde a pré-matrícula pública até a graduação, permitindo a gestão descentralizada em polos regionais com supervisão administrativa central.

### 2.2 Funcionalidades Principais

- **Gestão de Pré-Matrículas**: Formulário público com validação rigorosa (Zod) e upload de documentos.
- **Controle Acadêmico**: Lançamento de frequências, notas (Dracmas), gestão de turmas e níveis.
- **Gestão de Polos**: Cadastro de unidades regionais, pastores responsáveis e capacidades.
- **Painel do Aluno**: Acesso a materiais, boletins, documentos e status financeiro.
- **Financeiro**: Controle de mensalidades, taxas e métodos de pagamento (Pix, Boleto, etc.).
- **Relatórios**: Geração de relatórios gerenciais e educacionais.

### 2.3 Fluxos Principais de Usuário

1. **Fluxo de Ingresso**:
   - Visitante preenche `PreMatricula` -> Validação Zod bloqueia erros -> Dados salvos como 'pendente'.
   - Admin revisa em `PreMatriculaManagement` -> Aprova -> Sistema executa `efetivarMatricula` (Cria Aluno ativo + Ativa Matrícula).
2. **Fluxo Acadêmico**:
   - Professor/Admin seleciona Turma -> Lança `Presenca` e `Dracmas` -> Dados refletidos no `Boletim` do Aluno.

### 2.4 Casos de Erro e Exceção

- **Erros de Validação**: Tratados via `ValidationError` no frontend antes do envio.
- **Falhas de API**: Mapeadas via `ApiError` com mensagens estruturadas através do `FeedbackContext`.
- **Autorização**: `ProtectedRoute` redireciona usuários para `/acesso-admin` ou `/acesso-aluno` conforme o papel e estado de autenticação.

---

## 3. Modelagem Técnica

### 3.1 Entidades e Modelos (Truth Source: `database.ts`)

- **Polo**: Unidade física (Nome, CNPJ, Pastor Responsável).
- **Usuário**: Identidade no sistema (Email, Role, Ativo).
- **Aluno**: Perfil acadêmico (Dados Pessoais, Saúde, Responsáveis, Status).
- **Matrícula**: Vínculo jurídico/financeiro (Protocolo, Tipo, Status).
- **Turma**: Agrupamento para aula (Nível, Ano Letivo, Professor).
- **Entidades de Aula**: `Modulo`, `Licao`, `Conteudo`, `Presenca`, `Avaliacao`.

### 3.2 Regras de Negócio Críticas

- **Isolamento**: Um usuário de polo só visualiza alunos e turmas vinculados ao seu `polo_id`.
- **Efetivação**: A conversão de uma pré-matrícula em aluno ativo exige a atribuição de um `nivel_id` e, opcionalmente, uma `turma_id`.
- **Integridade de Documentos**: Matrículas em análise exigem documentos obrigatórios (RG, CPF, Comprovante) validados e com URL persistida.

---

## 4. Arquitetura

### 4.1 Separação de Camadas

- **View Layer**: React + Tailwind/CSS, organizada por domínios (`auth`, `enrollment`, `admin`, `app`).
- **Logic Layer (Hooks)**: Custom hooks encapsulam o estado e a lógica de orquestração (ex: `usePreMatriculaForm`).
- **Service Layer**: Abstração da comunicação externa (ex: `AlunoService`), garantindo que a UI não conheça detalhes de implementação da API.
- **Infrastructure Layer**: Cliente `api.ts` padronizado para tratamento de headers, tokens e erros globais.

### 4.2 Decisões Técnicas Relevantes

- **Zod for Boring Security**: Validação de esquema na borda do sistema para evitar garbage-in.
- **Standardized Error Hierarchy**: Uso de classes `AppError` para evitar `try/catch` genéricos e melhorar o debug.
- **Domain-Driven Routing**: Rotas agrupadas facilitam a manutenção e o code-splitting futuro.

---

## 5. Riscos e Dívida Técnica

### 5.1 Pontos Frágeis

- **Inconsistência de Build**: Identificado comportamento anômalo no Rollup (erro interno) que exige builds limpas (`dist` removal).
- **Tipagem de Saúde**: Campos de saúde (`saude`) ainda utilizam estruturas flexíveis (`any`) em alguns pontos, o que pode gerar inconsistências de dados.

### 5.2 Trade-offs Conscientes

- **Ausência de State Managers Complexos**: Optou-se por Context API para evitar a complexidade do Redux, dado o tamanho atual do projeto.
- **Validação TSC vs Vite Build**: Em ambientes restritos, a validação via `tsc --noEmit` é a garantia de integridade, mesmo quando a minificação do Vite falha por razões ambientais.

---

**Documento gerado automaticamente a partir da análise estática do repositório em 26/12/2025.**
