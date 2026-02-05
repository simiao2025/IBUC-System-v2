---
name: ux-integrity
description: Manutenção dos padrões de design, estética premium e fidelidade à experiência do usuário do IBUC System.
---

# ✨ IBUC System: UX Integrity

Esta skill garante que o sistema IBUC System continue sentindo-se "premium", moderno e coeso visualmente.

## 1. Design System (Vanilla CSS)

- **Tokens**: Utilize as variáveis definidas no `src/index.css` (Cores, Espaçamentos, Transitions).
- **Proibição de Hardcoding**: Nunca use cores fixas em estilos inline. Se precisar de uma cor nova, adicione como `--token` no CSS global.
- **Tipografia**: Use fontes modernas (Inter/Outfit) e mantenha a hierarquia de pesos (Black/Bold/Medium).

## 2. O Fator "WOW"

Para manter a estética de alto nível:

- **Micro-animações**: Adicione `hover:scale-105`, `transitions` e `glassmorphism` (blur + opacidade) onde fizer sentido.
- **States**: Todo clique ou carregamento deve ter um feedback (Skeleton screens, Spinners nos botões).
- **Consistência de Logos**: Use sempre ativos locais da pasta `/public/icons/3d/` para garantir velocidade e nitidez.

## 3. Responsividade e Acessibilidade

- **Mobile First**: Garanta que formulários e tabelas quebrem corretamente em telas menores.
- **Scroll Logic**: Todas as navegações devem resetar o scroll para o topo (componente `ScrollToTop`).
- **Semântica**: Use tags HTML5 (`<main>`, `<section>`, `<nav>`) para SEO e acessibilidade.

## 4. Auditoria Visual (Checklist)

- [ ] A interface possui micro-animações?
- [ ] O design segue a paleta obrigatória (Amarelo, Azul, Verde, Vermelho IBUC)?
- [ ] Os botões possuem estado de "loading"?
- [ ] A página carrega no topo?
- [ ] Não há "layout shift" agressivo no carregamento?
