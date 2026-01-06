# Convenções e Arquitetura - IBUC System v2

Este documento estabelece os termos oficiais e as regras de desenvolvimento para o projeto, visando eliminar ambiguidades e manter a consistência técnica.

## 1. Vocabulário Oficial (Negócio)

| Termo             | Definição                                                             | Status       |
| :---------------- | :-------------------------------------------------------------------- | :----------- |
| **Polo**          | Unidade física ou administrativa onde as aulas ocorrem.               | Consolidado  |
| **Aluno**         | Pessoa vinculada ao sistema para fins de ensino.                      | Consolidado  |
| **Responsável**   | Pessoa legalmente encarregada por um aluno (pai, mãe, tutor).         | Consolidado  |
| **Matrícula**     | O registro formal de um aluno em um polo/turma.                       | Consolidado  |
| **Pré-Matrícula** | Cadastro inicial realizado externamente pelo portal público.          | Consolidado  |
| **Turma**         | Agrupamento de alunos em um Nível e Polo específico.                  | Consolidado  |
| **Nível**         | Etapa acadêmica (I, II, III ou IV).                                   | Consolidado  |
| **Disciplina**    | Matéria ou módulo de ensino dentro de um Nível.                       | Em transição |
| **Usuário**       | Colaborador administrativo (Super Admin, Diretor, Coordenador, etc.). | Consolidado  |
| **Dracmas**       | Sistema de pontos e recompensas por desempenho.                       | Consolidado  |

## 2. Convenções de Nomenclatura

### 2.1 Arquivos e Pastas

- **Componentes React**: PascalCase. Ex: `PageHeader.tsx`, `StudentAccess.tsx`.
- **Serviços**: camelCase. Ex: `aluno.service.ts`, `matricula.service.ts`.
- **Utilitários/Lib**: camelCase. Ex: `logger.ts`, `api.ts`.
- **Estilos**: PascalCase (se vinculado a componente) ou `index.css`.
- **Pastas**: lowercase simples ou kebab-case. Ex: `services/`, `pages/`, `common-ui/`.

### 2.2 Código (Typescript)

- **Interfaces/Tipos**: PascalCase. Ex: `interface StudentData`.
- **Variáveis/Funções**: camelCase. Ex: `const studentName`.
- **Constantes de Configuração**: UPPER_SNAKE_CASE. Ex: `const API_URL`.
- **Valores de Enum/Status (DB)**: lowercase snake_case (para bater com o DB). Ex: `status: 'em_analise'`.

## 3. Regras de Estrutura (Congelamento)

- **Novas Pastas Genéricas**: Fica proibida a criação de pastas como `utils/`, `helpers/` ou `common/` sem aprovação prévia.
- **Centralização de Lógica**: Regras de negócio devem morar em `src/services/`, nunca diretamente nos componentes.
- **Componentes UI**: Componentes de interface pura devem morar em `src/components/ui/`.

---

_Este documento é a "Fonte da Verdade" para o sistema. Em caso de dúvida, consulte o Vocabulário Oficial._
