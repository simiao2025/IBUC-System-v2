---
name: supabase-ops
description: Automação de operações no Supabase (SQL, Migrations, Edge Functions e Auditoria) via MCP.
---

# 🚀 IBUC System: Supabase Ops Skill

Esta skill utiliza as ferramentas do **Supabase MCP Server** para gerenciar o banco de dados e a infraestrutura do projeto de forma automatizada e segura.

## 1. Ferramentas Disponíveis (MCP)

Sempre que realizar operações de banco de dados, utilize as seguintes ferramentas:

- `execute_sql`: Para consultas rápidas, correções de dados e auditorias.
- `apply_migration`: Para alterações de schema (DDL). **Nunca** use `execute_sql` para DDL.
- `list_tables`: Para verificar a existência e estrutura de tabelas.
- `deploy_edge_function`: Para atualizar lógica no servidor.

## 2. Auditoria de Dados e Schema

Utilize o MCP para garantir a integridade entre o código e o banco:

- **Divergência de Tipos**: Rode scripts SQL via MCP para extrair a estrutura das tabelas e comparar com as interfaces TypeScript.
- **Verificação de RLS**: Teste as políticas de segurança rodando consultas como diferentes roles via `execute_sql`.
- **Integridade de Enums**: Garanta que os enums no banco (ex: `status_turma`) batem com as definições do frontend.

## 3. Manutenção e Troubleshooting

Procedimentos para resolver problemas comuns:

- **Logs de Erro**: Se o backend/frontend falhar em uma consulta, use `get_logs` para identificar se o erro veio do Postgres ou do PostgREST.
- **Correção em Batch**: Use SQL para corrigir inconsistências (ex: datas com shift de 1 dia em registros antigos) de forma segura.
- **Consultas de Advisor**: Use `get_advisors` regularmente para identificar falta de índices ou problemas de segurança (RLS ausente).

## 4. Fluxo de Trabalho com Migrations

1.  Crie o arquivo SQL localmente em `supabase/migrations/`.
2.  Use o CLI do Supabase para testar localmente.
3.  Solicite aprovação do usuário.
4.  Utilize o MCP para aplicar ou verificar o status das migrations no banco remoto.

## 5. Auditoria de Operações (Checklist)

- [ ] A alteração de schema foi aplicada via `apply_migration` (não `execute_sql`)?
- [ ] Foi verificado se a nova tabela possui RLS habilitado?
- [ ] Os logs do serviço foram consultados após o deploy de uma Edge Function?
- [ ] O Advisor de performance foi consultado após mudanças major no banco?

---

> [!CAUTION]
> **Cuidado com Dados Produtivos**: Sempre realize um `SELECT` antes de um `UPDATE` ou `DELETE` para confirmar os IDs afetados. Utilize a ferramenta `execute_sql` com precaução extrema.
