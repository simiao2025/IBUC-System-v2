---
name: security-access-guard
description: Auditoria de segurança, permissões de acesso (RBAC/RLS) e proteção de endpoints.
---

# 🔐 IBUC System: Security Access Guard

Esta skill é responsável por garantir que nenhum dado sensível vaze entre Polos ou Usuários sem permissão.

## 1. Proteção de Endpoints (Backend)

- **JwtAuthGuard**: Todo Controller, por padrão, deve ser decorado com `@UseGuards(JwtAuthGuard)`.
- **Exceção @Public()**: Use o decorador `@Public()` apenas em endpoints estritamente necessários (ex: Login, Pré-matrícula inicial).
- **Validação de Propriedade**: Nunca confie apenas no `ID` enviado no body. Sempre valide se o recurso pertence ao `req.user.polo_id` ou se o usuário tem a permissão necessária.

## 2. Multi-tenancy (RLS & Filtros)

- **Row Level Security (RLS)**: O Supabase deve ter políticas que bloqueiem `SELECT/UPDATE/DELETE` baseados no `polo_id` do usuário logado.
- **Filtro Forçado**: Em rotas de listagem, o backend deve forçar o filtro pelo `polo_id` do usuário (a menos que seja um Global Admin).

## 3. Frontend: Protected Routes

- **ProtectedRoute Component**: Use este componente no router para bloquear acesso a páginas administrativas por usuários não logados ou sem a role correta.
- **Visibility Toggling**: Elementos da UI (botões de deletar, menus de config) devem ser ocultados baseados nas permissões do `currentUser`.

## 4. Auditoria de Segurança (Checklist)

- [ ] O novo Controller possui `@UseGuards(JwtAuthGuard)`?
- [ ] O endpoint `@Public()` é realmente necessário e seguro?
- [ ] Um usuário de um Polo X consegue acessar dados de um Polo Y mudando o ID na URL? (Deve ser proibido).
- [ ] O `req.user` está sendo usado para identificar o autor da ação (auditoria)?
