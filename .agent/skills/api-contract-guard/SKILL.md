---
name: api-contract-guard
description: Sincronização e integridade de contratos entre Backend (NestJS/Supabase) e Frontend (Vite/TypeScript).
---

# 🔌 IBUC System: API Contract Guard

Esta skill garante que a comunicação entre o frontend e o backend permaneça estável e tipada, evitando erros de "undefined" ou falhas de mapeamento.

## 1. Princípios de Sincronia

Sempre que houver alteração em uma tabela do Supabase ou em um Controller/DTO do NestJS:

- **Verificação de DTOs**: Verifique se o `CreateXDto` e `UpdateXDto` no backend refletem exatamente o que o frontend em `src/entities/[entidade]/api/` está enviando.
- **Interfaces Type-Safe**: As interfaces em `src/types/database.ts` ou nos serviços das `Entities` devem ser a "única fonte da verdade" para o frontend.
- **Mapeamento de Snake_case vs CamelCase**: O IBUC System utiliza preferencialmente `snake_case` no banco de dados para compatibilidade nativa com Supabase/PostgreSQL. Mantenha essa consistência nos contratos.

## 2. Tratamento Padronizado de Erros

A API deve seguir o padrão de resposta do NestJS. No frontend:

- **Global Error Handler**: Use o `ApiClient` em `src/shared/api/api.ts` para capturar erros 401, 403 e 500.
- **User Feedback**: Erros de validação (400) devem ser exibidos via `Toast` ou `FeedbackContext` com mensagens amigáveis em português.

## 3. Protocolo de Alteração de Contrato

Ao adicionar um novo campo:

1.  Atualize a Migration no Supabase (`supabase/migrations/`).
2.  Atualize o DTO no NestJS (`backend/src/`).
3.  Atualize a Interface no Frontend (`src/entities/` ou `src/types/`).
4.  Atualize o `PROJECT_CONTEXT.md` se for uma mudança estrutural major.

## 4. Auditoria de Contrato (Checklist)

- [ ] Os nomes dos campos no Frontend batem com o `snake_case` do Backend?
- [ ] O `api.ts` está sendo usado como único client de requisições?
- [ ] Erros de "fail to fetch" ou 500 são tratados graciosamente?
- [ ] O DTO do NestJS possui validações (`class-validator`) correspondentes às regras do banco?
