---
name: Refatoração Segura
description: Protocolo para realizar refatorações de larga escala sem introduzir regressões, garantindo estabilidade via análise de impacto e verificações contínuas.
---

# 🛡️ Skill de Refatoração Segura

Esta skill formaliza o processo de "Refactor-Shield", garantindo que cada mudança seja planejada, aprovada e verificada.

## 🛠️ Como usar esta skill

1. **Análise de Impacto Prévia**: Antes de tocar no código, identifique quem depende dele.
   - Use `grep_search` para encontrar referências globais.
   - Identifique efeitos colaterais em outras features.
2. **Plano de Implementação**: Crie um `implementation_plan.md` com uma seção de "Análise de Impacto".
3. **Refatoração Atômica**: Quebre mudanças grandes em pequenos passos verificáveis.
4. **Verificação Contínua**: Após cada passo, execute o verificador:
   ```powershell
   node .agent/skills/safe-refactor/scripts/refactor-verifier.cjs
   ```
5. **Testes de Regressão**: Valide manualmente ou via automação se as funcionalidades críticas ainda operam conforme esperado.
6. **Limpeza e Consolidação**: Remova arquivos temporários, placeholders e diretórios redundantes que não fazem mais parte da nova estrutura.
7. **Rollback**: Mantenha um ponto de retorno seguro caso a verificação falhe.

## 🤖 Verificador de Refatoração

O script incluído automatiza as verificações de sanidade:

- **Lint**: Garante conformidade com o estilo de código.
- **Type-Check**: Garante integridade dos tipos Typescript.
- **Project Build**: Garante que o projeto ainda compila (opcional).

**Comando:**

```powershell
node .agent/skills/safe-refactor/scripts/refactor-verifier.cjs
```

## 📝 Protocolo de Refatoração Segura (Checklist)

- [ ] **Passo 1: Pesquisa** - Encontrei todas as referências ao código original?
- [ ] **Passo 2: Testes** - Existe cobertura de teste para a lógica atual?
- [ ] **Passo 3: Backup** - Fiz commit do estado estável atual?
- [ ] **Passo 4: Execução** - A mudança foi feita no menor escopo possível?
- [ ] **Passo 5: Validação** - O script `refactor-verifier` retornou ✅?
- [ ] **Passo 6: Testes Reais** - Naveguei pelas telas afetadas e testei as principais ações?
- [ ] **Passo 7: Cleanup** - Removi todos os placeholders, arquivos `.old` e pastas redundantes?

---

## 📝 Modelo de Relatório de Refatoração

# 🛡️ Relatório de Refatoração

**Objetivo:** [Ex: Desacoplar AppContext de Features]
**Status:** [✅ Estável / ⚠️ Pendente / ❌ Regressão Detectada]

---

## 📉 Impacto Analisado

- **Arquivos Afetados:** X
- **Features Impactadas:** [Lista]

## 🧪 Resultados dos Testes

- **Lint:** [✅ Passou / ❌ Falhou]
- **Typescript:** [✅ Passou / ❌ Falhou]
- **Build:** [✅ Passou / ❌ Falhou]

## 🚨 Desafios Encontrados

[Descreva se algo quebrou ou se houve mudança de plano]

---

## 🔗 Referências

- [Refactoring (Martin Fowler)](https://refactoring.com/)
- [Working Effectively with Legacy Code (Michael Feathers)](https://www.oreilly.com/library/view/working-effectively-with/0131177052/)
