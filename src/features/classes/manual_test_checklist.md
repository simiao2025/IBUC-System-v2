# Checklist de Teste Manual - Migração da Feature (Turmas)

**Feature:** Gestão de Turmas
**Origem:** `src/pages/admin/TurmaManagement.tsx`
**Destino:** `src/features/classes/ClassManagement.tsx`

---

## 1. Verificação Visual

- [ ] Acessar `/admin/turmas`.
- [ ] O título "Gerenciar Turmas" e o botão "Adicionar Turma" aparecem corretamente?
- [ ] A lista de turmas carrega os dados?

## 2. Teste de Funcionalidade

- [ ] **Filtros:** Tente mudar o Polo ou Status. A lista atualiza?
- [ ] **Criação:** Clique em "Adicionar Turma". O formulário abre? Preencha e salve.
- [ ] **Edição:** Clique em "Editar" numa turma existente. Os dados vêm preenchidos?
- [ ] **Exclusão:** Tente excluir uma turma de teste.

## 3. Segurança / Permissões

- [ ] Se logado como Admin de Polo Específico, os filtros de polo estão travados no polo do usuário?
- [ ] O campo de seleção de Polo no formulário respeita essa restrição?

## 4. Console

- [ ] Abra o F12. Existem erros vermelhos (exceto os de HMR normais)?

---

**Status:** Aguardando validação do usuário.
