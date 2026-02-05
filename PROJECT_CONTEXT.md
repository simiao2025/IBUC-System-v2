# 🎯 IBUC System v2 - Contexto do Projeto

Este arquivo é a fonte da verdade para a continuidade do projeto. Ele deve ser atualizado periodicamente para manter Agentes (independente da LLM: Antigravity, Cursor, Windsurf, ChatGPT, etc.) e Desenvolvedores sincronizados.

## 🚀 Estado Atual

- **Fase**: Refatoração e Estabilização de Módulos Core.
- **Foco Recente**:
  - Correção de permissões no módulo **Diretoria** (isPoloScoped).
  - Habilitação de **Pré-matrícula Pública** (remoção de 401 Unauthorized para criação de alunos/matrículas).
  - Padronização visual (substituição de logo externa por local).
  - Correção de UX (scroll to top automático).

## 🛡️ Governança Técnica

Para garantir a integridade do sistema, as seguintes skills **devem** ser consultadas por qualquer agente:

- **`fsd-guard`**: Mantém a arquitetura Feature-Sliced Design.
- **`project-context`**: Gere a continuidade e este arquivo de briefing.
- **`api-contract-guard`**: Garante a sincronia entre Frontend e Backend.
- **`security-access-guard`**: Audita permissões, JWT e RLS (Multi-tenancy).
- **`ux-integrity`**: Preserva a estética premium, micro-animações e responsividade.

## 🏗️ Decisões de Arquitetura (ADRs)

### 001: Feature-Sliced Design (FSD)

- **Status**: Implementado / Em migração.
- **Contexto**: O sistema migrou de um monólito para FSD para ganhar escalabilidade.
- **Regra**: Seguir estritamente a skill `fsd-guard`.

### 002: Estética e Styling

- **Status**: Decidido.
- **Decisão**: **Vanilla CSS** puro com variáveis globais no `index.css`. Proibido Tailwind CSS a menos que solicitado explicitamente.
- **Rationale**: Máxima flexibilidade e "Wow factor" através de design customizado e micro-animações.

### 003: Fusão de Tabelas (Pre-Matrícula)

- **Status**: Decidido.
- **Decisão**: Não existe uma tabela separada de `pre_matriculas`. Tudo cai na tabela `matriculas` com `status='pendente'`.
- **Rationale**: Simplifica consultas e fluxo de aprovação.

### 004: Fuso Horário Brasil

- **Status**: Decidido.
- **Decisão**: Todas as datas devem ser tratadas considerando `America/Sao_Paulo`.
- **Rationale**: Evitar discrepâncias de 3h em agendas de eventos e relatórios.

## 🗺️ Roadmap Curto Prazo

1. [ ] Finalizar auditoria de permissões no módulo **Turmas**.
2. [ ] Implementar upload de banners e galerias no módulo **Eventos**.
3. [ ] Criar sistema de notificação por WhatsApp/E-mail via backend.

## ⚠️ Dívida Técnica & Riscos

- **Proxies de Legado**: Arquivos em `src/services`, `src/lib` e `src/components/ui` são ponteiros para o FSD. Precisam ser eliminados conforme os imports são atualizados.
- **Falta de Testes**: Cobertura de testes E2E ainda é baixa para fluxos de checkout de materiais.
- **Camada de Erros**: O tratamento de erros no frontend ainda é inconsistente (alguns usam catch global, outros toast local).

---

_Última atualização: 2026-02-05 por Antigravity_
