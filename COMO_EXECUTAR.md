# 🚀 Como Executar o Projeto - IBUC System

## ✅ Pré-requisitos Verificados

- ✅ Migrations executadas (001, 002, 003)
- ✅ Banco de dados configurado
- ✅ Dependências instaladas

## 🎯 Execução Simples (Apenas Frontend)

### Passo 1: Verificar Variáveis de Ambiente

Certifique-se de que o arquivo `.env.local` existe na raiz do projeto com:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
```

### Passo 2: Executar o Frontend

Na raiz do projeto, execute:

```bash
npm run dev
```

**Isso é suficiente!** O Vite iniciará o servidor de desenvolvimento.

### Passo 3: Acessar

Abra no navegador:
```
http://localhost:5173
```

## 🔧 Execução Completa (Frontend + Backend)

Se você também quiser usar o backend NestJS:

### Terminal 1 - Backend

```bash
cd backend
npm run start:dev
```

**Verificar:**
- Backend rodando em `http://localhost:3000`
- Swagger em `http://localhost:3000/api/docs`

### Terminal 2 - Frontend

```bash
# Na raiz do projeto
npm run dev
```

**Verificar:**
- Frontend rodando em `http://localhost:5173`

## 📋 Comandos Disponíveis

### Na Raiz do Projeto:

```bash
npm run dev          # Inicia servidor de desenvolvimento (Vite)
npm run build        # Build para produção
npm run preview      # Preview do build de produção
npm run lint         # Executa o linter
npm run db:test      # Testa conexão com Supabase
npm run db:verify    # Verifica estrutura do banco
```

### No Backend (se usar):

```bash
cd backend
npm run start:dev    # Inicia em modo desenvolvimento
npm run build        # Build para produção
npm run start:prod   # Inicia em modo produção
```

## ⚠️ Problemas Comuns

### Erro: "Cannot find module"
**Solução:**
```bash
npm install
```

### Erro: "Supabase URL ou Anon Key não configurados"
**Solução:**
1. Crie o arquivo `.env.local` na raiz
2. Adicione as variáveis:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
```

### Erro: "Port 5173 already in use"
**Solução:**
- Feche outros processos usando a porta 5173
- Ou o Vite perguntará se quer usar outra porta

### Erro: "Failed to fetch" ou erros de CORS
**Solução:**
- Verifique se as variáveis de ambiente estão corretas
- Verifique se o projeto Supabase está ativo
- Verifique se as migrations foram executadas

## ✅ Checklist Antes de Executar

- [ ] Arquivo `.env.local` existe na raiz
- [ ] `VITE_SUPABASE_URL` configurado
- [ ] `VITE_SUPABASE_ANON_KEY` configurado
- [ ] Dependências instaladas (`npm install`)
- [ ] Migrations executadas no Supabase

## 🎉 Pronto!

Após executar `npm run dev`, você verá algo como:

```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Abra `http://localhost:5173` no navegador e comece a testar!

---

**Resposta direta**: Sim, basta executar `npm run dev` na raiz do projeto! 🚀






