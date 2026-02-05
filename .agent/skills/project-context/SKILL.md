---
name: project-context
description: Manutenção da continuidade técnica, decisões de design (ADRs) e roadmap do IBUC System.
---

# 🧠 IBUC System: Project Context

Esta skill garante que qualquer LLM ou desenvolvedor humano tenha visibilidade total sobre o estado atual do projeto, evitando redundância e perda de contexto.

## 1. O Arquivo Mestre: `PROJECT_CONTEXT.md`

Toda a continuidade reside no arquivo `PROJECT_CONTEXT.md` na raiz do projeto. Ele deve ser a primeira coisa lida ao iniciar uma nova sessão complexa.

### Seções Obrigatórias:

1.  **Estado Atual**: O que está em desenvolvimento agora? Qual o "mood" do código?
2.  **ADRs (Architecture Decision Records)**: Registro de decisões "por que sim" e "por que não".
3.  **Roadmap**: Próximos módulos ou refatorações planejadas.
4.  **Dívida Técnica**: Atalhos tomados que precisam de correção futura.

## 2. Regras de Manutenção

- **Sempre Atualizar**: Após concluir uma tarefa que muda o rumo do projeto ou resolve um grande problema, atualize o `PROJECT_CONTEXT.md`.
- **Registro de Descobertas**: Se descobrir uma peculiaridade no Supabase ou no comportamento do Vite, registre na seção de ADRs ou FAQ Técnico.
- **Veracidade**: O arquivo deve refletir a realidade do código, não apenas o desejo do desenvolvedor.

## 3. Workflow de Início de Tarefa

Antes de agir, o agente deve:

1.  Ler `PROJECT_CONTEXT.md`.
2.  Ler `.agent/skills/fsd-guard/SKILL.md`.
3.  Validar se a tarefa solicitada não contradiz uma ADR registrada.

## 4. Auditoria de Coesão

Ao final de cada tarefa major:

- [ ] O `PROJECT_CONTEXT.md` foi atualizado com a conclusão da tarefa?
- [ ] Novas dívidas técnicas foram documentadas?
- [ ] Alguma decisão arquitetônica nova foi tomada e registrada?
