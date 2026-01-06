# 🗄️ Guia Rápido - Configuração do Banco de Dados

## ✅ O que já está criado

### 📁 Arquivos de Migration

1. **`supabase/migrations/001_initial_schema.sql`** (710 linhas)
   - ✅ 21 tabelas completas
   - ✅ 15 ENUMs (tipos)
   - ✅ Índices para performance
   - ✅ Triggers automáticos
   - ✅ Views para relatórios
   - ✅ Row Level Security (RLS) completo

2. **`supabase/migrations/002_seed_data.sql`**
   - ✅ 4 níveis do curso
   - ✅ 10 módulos
   - ✅ 1 polo de exemplo
   - ✅ 5 usuários de exemplo
   - ✅ 1 turma de exemplo

### 📊 Estrutura do Banco

```
📦 Banco de Dados IBUC
├── 📋 21 Tabelas
│   ├── polos (tenant principal)
│   ├── usuarios (com roles)
│   ├── alunos
│   ├── responsaveis
│   ├── turmas
│   ├── matriculas
│   ├── presencas
│   ├── mensalidades
│   ├── documentos
│   └── ... (12 outras)
│
├── 🔐 Row Level Security (RLS)
│   ├── Isolamento por polo
│   ├── Permissões por role
│   └── Políticas de acesso
│
├── 🔄 Triggers
│   ├── Auto-update de timestamps
│   ├── Geração de protocolos
│   └── Atualização de status
│
└── 📊 Views
    ├── vw_aluno_progresso
    └── vw_resumo_financeiro_aluno
```

## 🚀 Como Executar (3 Passos)

### Passo 1: Criar Projeto no Supabase

1. Acesse: https://supabase.com
2. Faça login e clique em **"New Project"**
3. Preencha:
   - **Name**: IBUC System
   - **Database Password**: (anote esta senha!)
   - **Region**: South America (São Paulo)
4. Aguarde a criação (2-3 minutos)

### Passo 2: Executar Migrations

#### Opção A: Via Dashboard (Mais Fácil) ⭐

1. No dashboard do Supabase, vá em **SQL Editor**
2. Clique em **New query**
3. Abra o arquivo `supabase/migrations/001_initial_schema.sql`
4. Copie TODO o conteúdo e cole no editor
5. Clique em **Run** (ou Ctrl+Enter)
6. Aguarde a execução (pode levar 1-2 minutos)
7. Repita para `002_seed_data.sql`

#### Opção B: Via CLI (Recomendado para Devs)

```bash
# 1. Instalar Supabase CLI
npm install -g supabase

# 2. Login
supabase login

# 3. Linkar projeto
supabase link --project-ref SEU-PROJECT-REF
# O project-ref está na URL: https://supabase.com/dashboard/project/[AQUI]

# 4. Executar migrations
supabase db push
```

### Passo 3: Verificar

Execute no **SQL Editor** do Supabase:

```sql
-- Verificar tabelas criadas
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public'; 
-- Deve retornar 21+

-- Verificar dados seed
SELECT COUNT(*) FROM niveis; -- Deve retornar 4
SELECT COUNT(*) FROM modulos; -- Deve retornar 10
SELECT COUNT(*) FROM polos; -- Deve retornar 1
```

## 🔑 Obter Credenciais

Após criar o projeto:

1. Vá em **Settings** > **API**
2. Copie:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (chave longa)

3. Crie arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

## 📋 Checklist de Verificação

Após executar as migrations, verifique:

- [ ] 21 tabelas criadas
- [ ] RLS habilitado em todas as tabelas
- [ ] 4 níveis inseridos
- [ ] 10 módulos inseridos
- [ ] 1 polo de exemplo criado
- [ ] 5 usuários de exemplo criados
- [ ] Views criadas (vw_aluno_progresso, vw_resumo_financeiro_aluno)
- [ ] Triggers funcionando

## 🧪 Testar RLS

Para testar se o RLS está funcionando:

```sql
-- Como super_admin (deve ver todos os polos)
SELECT * FROM polos;

-- Como usuário comum (deve ver apenas seu polo)
-- (teste fazendo login com diferentes usuários)
```

## 📚 Documentação Completa

Para mais detalhes, consulte:
- `supabase/README.md` - Documentação completa
- `scripts/verify-database.sql` - Script de verificação
- `scripts/setup-database.sh` - Script automatizado

## 🐛 Problemas Comuns

### Erro: "relation already exists"
**Solução**: As tabelas já existem. Você pode:
- Dropar manualmente (CUIDADO: perde dados!)
- Ou usar `CREATE TABLE IF NOT EXISTS` (modificar migration)

### Erro: "permission denied"
**Solução**: Certifique-se de estar usando o usuário correto no SQL Editor

### Erro: "function does not exist"
**Solução**: Execute as migrations na ordem (001 antes de 002)

## 🎯 Próximos Passos

Após configurar o banco:

1. ✅ Configure `.env` com as credenciais
2. ✅ Execute `npm install`
3. ✅ Execute `npm run dev`
4. ✅ Teste o sistema!

---

**Dúvidas?** Consulte `supabase/README.md` para documentação detalhada.

