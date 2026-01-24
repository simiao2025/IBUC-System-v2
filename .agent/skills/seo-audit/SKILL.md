---
name: Auditoria de SEO
description: Analisa a saúde do SEO (Search Engine Optimization) do projeto, identificando tags ausentes, problemas estruturais e oportunidades de performance, gerando um relatório padronizado.
---

# 📊 Skill de Auditoria de SEO

Esta skill permite realizar uma análise abrangente de SEO da aplicação web e gerar um relatório estruturado.

## 🛠️ Como usar esta skill

1. **Executar Scanner Automático**: Execute o script de varredura para obter uma visão rápida da saúde do SEO do projeto.
   ```powershell
   node .agent/skills/seo-audit/scripts/seo-scanner.cjs
   ```
2. **Validar Meta Tags**: Verifique os resultados para `<title>`, `<meta name="description">` e tags Open Graph.
3. **Revisar Títulos (Headings)**: Analise a hierarquia das tags `<h1>` a `<h6>`.
4. **Verificar Mídia**: Procure por atributos `alt` em tags `<img>`.
5. **SEO Técnico**: Verifique a presença de `robots.txt`, `sitemap.xml` e links canônicos.
6. **Mobile & Acessibilidade**: Garanta as configurações de viewport e o uso de HTML semântico.
7. **Gerar Relatório**: Use o modelo abaixo para apresentar suas descobertas com base na saída do script e verificações manuais.

## 🤖 Varredura Automática

Esta skill inclui um script automatizado para auxiliar na auditoria. Ele varre o `index.html` e todos os arquivos `.tsx`/`.jsx` em `src/`.

**Como executar:**

```powershell
node .agent/skills/seo-audit/scripts/seo-scanner.cjs
```

**O que ele verifica:**

- **Metadados**: Título, Descrição e tags OG no `index.html`.
- **Títulos**: Presença de `<h1>` nos componentes.
- **Imagens**: Presença de atributos `alt`.
- **Técnico**: Existência de `robots.txt` e `sitemap.xml` em `public/`.

## 📝 Modelo de Relatório

Ao realizar uma auditoria, siga sempre este formato exatamente:

# 📊 Relatório de Auditoria de SEO

**Projeto:** [nome do projeto/caminho]
**Data:** {{CURRENT_DATE}}
**Pontuação Geral:** [X/100] [🔴/🟡/🟢]

---

## 🎯 Resumo Executivo

[2-3 frases sobre a saúde geral do SEO]

**Estatísticas Rápidas:**

- ✅ Itens implementados: X
- ⚠️ Necessitam atenção: Y
- ❌ Problemas críticos: Z

**Top 3 Prioridades:**

1. [Problema mais crítico]
2. [Segunda prioridade]
3. [Terceira prioridade]

---

## 📋 Descobertas Detalhadas

### Meta Tags & Metadados [X/10]

**✅ Implementado Corretamente:**

- Lista de itens corretos...

**⚠️ Precisa de Melhorias:**

- Lista de itens com exemplos de código...

**❌ Problemas Críticos:**

- Lista de itens ausentes ou quebrados...

---

## 🚨 Problemas Críticos (Corrigir Imediatamente)

### 1. [Nome do Problema]

**Impacto:** [Descrição do impacto]
**Localização:** [Arquivo(s) afetado(s)]
**Correção:**

```[language]
// Código de correção proposto
```

---

## 📈 Plano de Ação

### Semanas 1-2: Correções Críticas

- [ ] Tarefa...

### Semanas 3-4: Melhorias Importantes

- [ ] Tarefa...

### Semana 5+: Aperfeiçoamentos

- [ ] Tarefa...

---

## 📊 Comparação de Benchmark

| Categoria             | Sua Pontuação | Média do Setor | Melhor Prática |
| --------------------- | ------------- | -------------- | -------------- |
| Meta Tags             | X/10          | 7/10           | 9/10           |
| Estrutura de Conteúdo | X/10          | 7/10           | 9/10           |
| SEO Técnico           | X/10          | 8/10           | 9/10           |
| Mobile/Acessibilidade | X/10          | 8/10           | 9/10           |
| Performance           | X/10          | 7/10           | 9/10           |

---

## 🔗 Recursos

- [Google Search Central](https://developers.google.com/search)
- [Documentação do Schema.org](https://schema.org/)
- [Guia de SEO do Web.dev](https://web.dev/learn-seo/)
- [Protocolo Open Graph](https://ogp.me/)
