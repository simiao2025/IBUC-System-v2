---
name: fsd-guard
description: Proteção e Manutenção da Arquitetura Feature-Sliced Design (FSD) no IBUC System.
---

# 🛡️ IBUC System: FSD Guard & Architecture PRD

Este documento serve como a **Bíblia Arquitetônica** do IBUC System. Qualquer Agente de IA ou Desenvolvedor Humano que atue neste projeto **DEVE** seguir estas diretrizes para evitar a regressão à arquitetura monolítica/híbrida anterior.

## 1. Princípios Fundamentais (Camadas)

A arquitetura segue o padrão **Feature-Sliced Design (FSD)**:

| Camada       | Propósito                                         | Regra de Ouro                                                 |
| :----------- | :------------------------------------------------ | :------------------------------------------------------------ |
| **App**      | Inicialização, Providers globais, Roteamento.     | Pode importar de todas as camadas inferiores.                 |
| **Pages**    | Composição de Features em rotas completas.        | Não contém lógica de negócio pesada, apenas layout.           |
| **Features** | Funcionalidades completas (ex: `UserManagement`). | **NÃO** deve importar de outras Features (Acoplamento Zero).  |
| **Entities** | Lógica de Domínio (ex: `Aluno`, `Turma`).         | Contém Modelos, APIs e Hooks do domínio específico.           |
| **Shared**   | Componentes agnósticos (UI, Lib, API Client).     | **NÃO** conhece as camadas superiores. É infraestrutura pura. |

## 2. Regras de Blindagem

### 🚫 Proibido (Anti-Patterns)

1.  **God Objects:** Jamais adicione lógica de domínio nova ao `AppContext.tsx`. Ele deve servir apenas para Auth e Feedback Global.
2.  **Cross-Imports entre Features:** Se a `Feature A` precisa de algo da `Feature B`, esse "algo" deve ser movido para `Entities` ou `Shared`.
3.  **Importações Relativas Profundas:** Use sempre o alias `@/` para importações entre camadas (ex: `import { api } from '@/shared/api/api'`).
4.  **Lógica na Camada de UI:** Componentes em `src/shared/ui` devem ser "burros" (apenas props e estilo).

### ✅ Obrigatório (Workflow)

1.  **Novos Serviços:** Devem ser criados em `src/entities/[entity]/api/`.
2.  **Novas Telas:** Devem residir em `src/pages/` e compor componentes de `features`.
3.  **Padronização de API:** Toda comunicação com o NestJS deve usar o `api` exportado de `@/shared/api/api`.

## 3. Gestão de Proxies (Legado)

Os arquivos em `src/lib`, `src/services` e `src/components/ui` que contêm apenas `export * from ...` são **Proxies de Compatibilidade**.

- Eles existem para garantir que o sistema em produção não quebre.
- Novos arquivos **NÃO** devem importar desses proxies. Use sempre o caminho FSD final.
- Quando 100% dos componentes forem atualizados, estes arquivos serão removidos.

## 4. Auditoria Automática

Antes de dar o "Done" em qualquer tarefa, verifique:

- [ ] O componente está na camada certa?
- [ ] O import usa o alias `@/`?
- [ ] `AppContext.tsx` foi modificado? (Se sim, justifique por que não foi para `Entities`).
