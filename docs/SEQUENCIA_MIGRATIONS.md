# 📋 Sequência de Execução das Migrations SQL

## ⚠️ IMPORTANTE: Execute na ordem abaixo!

As migrations devem ser executadas **sequencialmente** nesta ordem exata:

## 📝 Ordem de Execução

### 1️⃣ `001_initial_schema.sql`
**Descrição**: Schema inicial completo do banco de dados
- ✅ Cria 15 ENUMs (tipos) - **Idempotente** (verifica se existe antes)
- ✅ Cria 21 tabelas principais - **Idempotente** (usa IF NOT EXISTS)
- ✅ Cria índices - **Idempotente** (verifica se existe antes)
- ✅ Cria triggers - **Idempotente** (remove e recria se necessário)
- ✅ Cria views - **Idempotente** (usa CREATE OR REPLACE)
- ✅ Configura RLS (Row Level Security)
- ✅ Cria funções auxiliares - **Idempotente** (usa CREATE OR REPLACE)

**Tempo estimado**: 1-2 minutos
**Status**: ⚠️ **OBRIGATÓRIO** - Base de tudo
**Nota**: ✅ Pode ser reexecutado sem erro se alguns objetos já existirem

---

### 2️⃣ `002_seed_data.sql`
**Descrição**: Dados iniciais (seed data)
- ✅ Insere 4 níveis do curso
- ✅ Insere 10 módulos
- ✅ Insere 1 polo de exemplo
- ✅ Insere 5 usuários de exemplo
- ✅ Cria 1 turma de exemplo

**Tempo estimado**: 10-20 segundos
**Status**: ⚠️ **OBRIGATÓRIO** - Dados básicos do sistema

---

### 3️⃣ `003_fix_enum_roles.sql`
**Descrição**: Correção e adição de roles faltantes
- ✅ Adiciona `diretor_geral` ao enum (se não existir)
- ✅ Adiciona `coordenador_geral` ao enum (se não existir)
- ✅ Adiciona `tesoureiro` ao enum (se não existir)
- ✅ Adiciona `auxiliar` ao enum (se não existir)
- ✅ Verifica todos os valores do enum

**Tempo estimado**: 5-10 segundos
**Status**: ⚠️ **OBRIGATÓRIO** - Corrige roles do sistema

---

### 4️⃣ `004_create_diretoria_tables.sql`
**Descrição**: Criação das tabelas de diretorias
- ✅ Cria ENUMs: `status_diretoria`, `tipo_cargo_diretoria` - **Idempotente**
- ✅ Cria tabela `diretoria_geral` - **Idempotente** (usa IF NOT EXISTS)
- ✅ Cria tabela `diretoria_polo` - **Idempotente** (usa IF NOT EXISTS)
- ✅ Cria índices - **Idempotente** (verifica se existe antes)
- ✅ Cria triggers (atualização automática) - **Idempotente**
- ✅ Cria views (`vw_diretoria_ativa`, `vw_historico_diretoria`) - **Idempotente**
- ✅ Configura RLS para diretorias

**Tempo estimado**: 30-60 segundos
**Status**: ✅ **RECOMENDADO** - Estrutura profissional de diretorias
**Nota**: ✅ Pode ser reexecutado sem erro

---

### 5️⃣ `005_seed_diretoria_data.sql`
**Descrição**: Dados de exemplo para diretorias
- ✅ Insere diretor geral de exemplo
- ✅ Insere coordenador geral de exemplo
- ✅ Insere diretor de polo de exemplo
- ✅ Insere coordenador de polo de exemplo

**Tempo estimado**: 5-10 segundos
**Status**: ⚪ **OPCIONAL** - Apenas dados de exemplo

---

## 🚀 Como Executar

### Opção 1: Via Supabase CLI (Recomendado)

```bash
# No diretório do projeto
cd C:\Projetos\IBUC-System-v2

# Executar todas as migrations
supabase db push
```

### Opção 2: Via SQL Editor (Supabase Dashboard)

1. Acesse: https://supabase.com/dashboard/project/[seu-projeto]/sql
2. Execute cada arquivo **na ordem**:

#### Passo 1: Execute `001_initial_schema.sql`
- Clique em "New query"
- Abra o arquivo `supabase/migrations/001_initial_schema.sql`
- Copie TODO o conteúdo (Ctrl+A, Ctrl+C)
- Cole no editor (Ctrl+V)
- Clique em **Run** ou pressione **Ctrl+Enter**
- ⏳ Aguarde a execução (1-2 minutos)

#### Passo 2: Execute `002_seed_data.sql`
- Clique em "New query"
- Abra o arquivo `supabase/migrations/002_seed_data.sql`
- Copie TODO o conteúdo
- Cole no editor
- Clique em **Run**
- ⏳ Aguarde (10-20 segundos)

#### Passo 3: Execute `003_fix_enum_roles.sql`
- Clique em "New query"
- Abra o arquivo `supabase/migrations/003_fix_enum_roles.sql`
- Copie TODO o conteúdo
- Cole no editor
- Clique em **Run**
- ⏳ Aguarde (5-10 segundos)

#### Passo 4: Execute `004_create_diretoria_tables.sql`
- Clique em "New query"
- Abra o arquivo `supabase/migrations/004_create_diretoria_tables.sql`
- Copie TODO o conteúdo
- Cole no editor
- Clique em **Run**
- ⏳ Aguarde (30-60 segundos)

#### Passo 5: Execute `005_seed_diretoria_data.sql` (Opcional)
- Clique em "New query"
- Abra o arquivo `supabase/migrations/005_seed_diretoria_data.sql`
- Copie TODO o conteúdo
- Cole no editor
- Clique em **Run**
- ⏳ Aguarde (5-10 segundos)

---

## ✅ Verificação Pós-Execução

Após executar todas as migrations, verifique:

```sql
-- Verificar tabelas criadas (deve retornar 23+)
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- Verificar diretorias criadas
SELECT COUNT(*) FROM diretoria_geral;
SELECT COUNT(*) FROM diretoria_polo;

-- Verificar views criadas
SELECT table_name FROM information_schema.views 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Verificar dados seed
SELECT COUNT(*) FROM niveis; -- Deve retornar 4
SELECT COUNT(*) FROM modulos; -- Deve retornar 10
SELECT COUNT(*) FROM polos; -- Deve retornar 1+
```

---

## 📊 Resumo da Sequência

| # | Arquivo | Descrição | Tempo | Status |
|---|---------|-----------|-------|--------|
| 1 | `001_initial_schema.sql` | Schema completo | 1-2 min | ⚠️ Obrigatório |
| 2 | `002_seed_data.sql` | Dados iniciais | 10-20s | ⚠️ Obrigatório |
| 3 | `003_fix_enum_roles.sql` | Correção de roles | 5-10s | ⚠️ Obrigatório |
| 4 | `004_create_diretoria_tables.sql` | Tabelas diretorias | 30-60s | ✅ Recomendado |
| 5 | `005_seed_diretoria_data.sql` | Dados diretorias | 5-10s | ⚪ Opcional |

**Tempo total estimado**: ~3-4 minutos

---

## ⚠️ Avisos Importantes

1. **NÃO pule nenhuma migration** - Elas dependem uma da outra
2. **Execute na ordem** - A ordem é crítica
3. **Aguarde cada execução terminar** - Antes de executar a próxima
4. **Verifique erros** - Se houver erro, corrija antes de continuar
5. **Backup** - Faça backup antes se já tiver dados importantes

---

## 🆘 Problemas Comuns

### Erro: "relation already exists"
**Causa**: Migration já foi executada anteriormente
**Solução**: Pule essa migration ou drope as tabelas (CUIDADO: perde dados!)

### Erro: "type already exists"
**Causa**: ENUM já foi criado
**Solução**: A migration usa `IF NOT EXISTS`, então pode ignorar

### Erro: "permission denied"
**Causa**: Usuário sem permissões
**Solução**: Use o SQL Editor do Supabase (tem permissões completas)

---

## 📁 Localização dos Arquivos

```
supabase/
└── migrations/
    ├── 001_initial_schema.sql      ⚠️ Obrigatório
    ├── 002_seed_data.sql           ⚠️ Obrigatório
    ├── 003_fix_enum_roles.sql      ⚠️ Obrigatório
    ├── 004_create_diretoria_tables.sql  ✅ Recomendado
    └── 005_seed_diretoria_data.sql      ⚪ Opcional
```

---

**Última atualização**: 2024-01-01
**Status**: ✅ Pronto para execução

