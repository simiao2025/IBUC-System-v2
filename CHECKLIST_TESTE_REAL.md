# ✅ Checklist - Pronto para Teste Real?

## 🔍 Verificação Pré-Teste

### 1. Variáveis de Ambiente

#### Frontend (`.env` ou `.env.local` na raiz)
- [ ] `VITE_SUPABASE_URL` configurado
- [ ] `VITE_SUPABASE_ANON_KEY` configurado
- [ ] `VITE_API_URL` configurado (opcional, padrão: http://localhost:3000)

#### Backend (`backend/.env`)
- [ ] `SUPABASE_URL` configurado
- [ ] `SUPABASE_ANON_KEY` configurado
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configurado
- [ ] `JWT_SECRET` configurado
- [ ] `REDIS_HOST` configurado (se usar filas)
- [ ] `REDIS_PORT` configurado (se usar filas)
- [ ] `SMTP_HOST` configurado (se usar emails)
- [ ] `SMTP_PORT` configurado (se usar emails)
- [ ] `SMTP_USER` configurado (se usar emails)
- [ ] `SMTP_PASS` configurado (se usar emails)
- [ ] `PORT` configurado (padrão: 3000)

### 2. Banco de Dados (Supabase)

#### Migrations Executadas
- [ ] `000_check_and_create_types.sql` (se existir)
- [ ] `001_initial_schema.sql` ✅ OBRIGATÓRIO
- [ ] `002_seed_data.sql` ✅ OBRIGATÓRIO
- [ ] `003_fix_enum_roles.sql` ✅ OBRIGATÓRIO
- [ ] `004_create_diretoria_tables.sql` (recomendado)
- [ ] `005_seed_diretoria_data.sql` (opcional)

#### Verificação do Banco
Execute no SQL Editor do Supabase:

```sql
-- Deve retornar 21+ tabelas
SELECT COUNT(*) as total_tabelas
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';

-- Deve retornar dados
SELECT COUNT(*) as total_niveis FROM niveis;
SELECT COUNT(*) as total_modulos FROM modulos;
SELECT COUNT(*) as total_polos FROM polos;
SELECT COUNT(*) as total_usuarios FROM usuarios;
```

### 3. Dependências Instaladas

#### Frontend
```bash
cd C:\Projetos\IBUC-System-v2
npm install
```

- [ ] Dependências instaladas sem erros
- [ ] `node_modules` existe

#### Backend
```bash
cd C:\Projetos\IBUC-System-v2\backend
npm install
```

- [ ] Dependências instaladas sem erros
- [ ] `node_modules` existe

### 4. Compilação e Build

#### Frontend
```bash
npm run build
```

- [ ] Build concluído sem erros
- [ ] Pasta `dist` criada

#### Backend
```bash
cd backend
npm run build
```

- [ ] Build concluído sem erros
- [ ] Pasta `dist` criada

### 5. Serviços Externos

- [ ] **Supabase**: Projeto ativo e acessível
- [ ] **Redis**: Rodando (se usar filas de jobs) - opcional
- [ ] **SMTP**: Configurado (se usar emails) - opcional

### 6. Arquivos Críticos

- [ ] `src/lib/supabase.ts` existe
- [ ] `src/lib/supabase-admin.ts` existe
- [ ] `backend/src/main.ts` existe
- [ ] `backend/src/app.module.ts` existe
- [ ] `src/router.tsx` existe
- [ ] `src/App.tsx` existe

## 🚀 Teste de Inicialização

### 1. Iniciar Backend

```bash
cd backend
npm run start:dev
```

**Verificar:**
- [ ] Backend inicia sem erros
- [ ] Mensagem: `🚀 Backend rodando em http://localhost:3000`
- [ ] Swagger acessível em: `http://localhost:3000/api/docs`
- [ ] Sem erros de conexão com Supabase

### 2. Iniciar Frontend

```bash
# Em outro terminal
npm run dev
```

**Verificar:**
- [ ] Frontend inicia sem erros
- [ ] Mensagem: `Local: http://localhost:5173`
- [ ] Página carrega no navegador
- [ ] Sem erros no console do navegador
- [ ] Sem erros de conexão com Supabase

### 3. Teste de Autenticação

- [ ] Página de login carrega
- [ ] É possível fazer login (se houver usuário de teste)
- [ ] Redirecionamento após login funciona
- [ ] Logout funciona

## 🧪 Testes Funcionais Básicos

### Autenticação
- [ ] Login funciona
- [ ] Logout funciona
- [ ] Sessão persiste após refresh
- [ ] Redirecionamento para não autenticados funciona

### Navegação
- [ ] Rotas principais carregam
- [ ] Links de navegação funcionam
- [ ] Botões de voltar funcionam

### Integração com Supabase
- [ ] Consultas ao banco funcionam
- [ ] Inserções funcionam (se aplicável)
- [ ] RLS (Row Level Security) está ativo

## ⚠️ Problemas Comuns

### Erro: "Supabase URL ou Anon Key não configurados"
**Solução:** Criar arquivo `.env` ou `.env.local` na raiz com:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
```

### Erro: "Cannot connect to database"
**Solução:** 
- Verificar se as migrations foram executadas
- Verificar se as credenciais do Supabase estão corretas
- Verificar se o projeto Supabase está ativo

### Erro: "Module not found"
**Solução:** 
```bash
npm install
cd backend && npm install
```

### Erro: "Port already in use"
**Solução:** 
- Fechar outros processos usando a porta
- Ou mudar a porta no `.env`

## 📊 Status Final

Marque quando concluído:

- [ ] ✅ Todas as variáveis de ambiente configuradas
- [ ] ✅ Todas as migrations executadas
- [ ] ✅ Dependências instaladas
- [ ] ✅ Backend inicia sem erros
- [ ] ✅ Frontend inicia sem erros
- [ ] ✅ Autenticação funciona
- [ ] ✅ Navegação funciona
- [ ] ✅ Integração com Supabase funciona

## 🎯 Pronto para Teste Real?

**SIM** ✅ - Se todos os itens acima estão marcados

**NÃO** ❌ - Se algum item crítico está faltando:
- Variáveis de ambiente
- Migrations do banco
- Dependências não instaladas
- Erros ao iniciar backend/frontend

---

## 🆘 Comandos Rápidos

```bash
# Verificar dependências
npm list --depth=0
cd backend && npm list --depth=0

# Verificar variáveis de ambiente (Windows PowerShell)
Get-Content .env
Get-Content backend\.env

# Testar conexão com Supabase
npm run db:test

# Verificar banco de dados
npm run db:verify
```

---

**Última atualização:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")






