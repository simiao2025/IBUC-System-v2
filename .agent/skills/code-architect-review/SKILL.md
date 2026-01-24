---
name: Revisão de Código e Arquitetura
description: Realiza revisões de código profissionais focadas em qualidade, padrões de projeto e conformidade com a arquitetura Feature-Sliced Design (FSD).
---

# 🏗️ Skill de Revisão de Código e Arquitetura

Esta skill ajuda a garantir que o código siga as melhores práticas de desenvolvimento e respeite a arquitetura FSD do projeto.

## 🛠️ Como usar esta skill

1. **Executar Verificador de Arquitetura**: Use o script para detectar violações de camadas do FSD.
   ```powershell
   node .agent/skills/code-architect-review/scripts/fsd-checker.cjs
   ```
2. **Revisar Acoplamento**: Certifique-se de que camadas superiores não sejam importadas por camadas inferiores.
3. **Verificar APIs Públicas**: Garanta que as importações sejam feitas apenas através dos `index.ts` (Public API) de cada slice.
4. **Qualidade do Código**: Avalie legibilidade, complexidade ciclomática e tratamento de erros.
5. **Gerar Relatório**: Use o modelo abaixo para consolidar a revisão.

## 🤖 Verificação Automática (FSD)

O script incluído verifica:

- **Sideways Coupling**: Uma `feature` importando outra `feature` diretamente.
- **Layer Violation**: Camadas inferiores (ex: `shared`) importando de camadas superiores (ex: `entities`).
- **Public API**: Se as importações respeitam o ponto de entrada oficial do slice.

**Comando:**

```powershell
node .agent/skills/code-architect-review/scripts/fsd-checker.cjs
```

## 📝 Modelo de Relatório de Revisão

# 🏗️ Relatório de Revisão de Código e Arquitetura

**Arquivo/Feature:** [Nome]
**Revisor:** Antigravity
**Status:** [✅ Aprovado / ⚠️ Aprovado com Ressalvas / ❌ Rejeitado]

---

## 🎯 Resumo da Revisão

[Breve descrição da qualidade geral do código analisado]

---

## 🏗️ Análise Arquitetural (FSD)

| Regra                    | Status  | Observação   |
| :----------------------- | :-----: | :----------- |
| Independência de Camadas | [✅/❌] | [Explicação] |
| Acoplamento Lateral      | [✅/❌] | [Explicação] |
| Uso de API Pública       | [✅/❌] | [Explicação] |

---

## 🔍 Sugestões de Melhoria

### 🔴 Crítico

1. **[Problema]**: [Descrição e sugestão de correção]

### 🟡 Importante

1. **[Problema]**: [Melhoria recomendada]

### 🟢 Sugestão

1. **[Dica]**: [Refatoração opcional]

---

## 🔗 Referências Acadêmicas e Padrões

- [Feature-Sliced Design Documentation](https://feature-sliced.design/)
- [Clean Code (Robert C. Martin)](https://blog.cleancoder.com/)
- [Refactoring (Martin Fowler)](https://refactoring.com/)
