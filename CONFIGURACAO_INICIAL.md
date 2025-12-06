# ⚙️ Configuração Inicial - IBUC System

## 🚀 Passo a Passo Completo

### 1. Configurar Variáveis de Ambiente

Crie o arquivo `.env.local` na raiz do projeto:

```bash
cp .env.local.example .env.local
```

Edite `.env.local` e adicione suas credenciais:

```env
# URL do projeto (já configurada)
VITE_SUPABASE_URL=https://ffzqgdxznsrbuhqbtmaw.supabase.co

# Obtenha a ANON_KEY em: https://supabase.com/dashboard/project/ffzqgdxznsrbuhqbtmaw/settings/api
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui

# SERVICE_ROLE_KEY (já fornecida - ⚠️ NUNCA use no frontend!)
# Esta chave só deve ser usada em Edge Functions ou backend
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmenFnZHh6bnNyYnVocWJ0bWF3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDY5NDEzMSwiZXhwIjoyMDgwMjcwMTMxfQ.PizriQ-K9_wxScltWKRBr863IkE0ow32Y8BHWC8E6PM
```

### 2. Obter ANON_KEY

1. Acesse: https://supabase.com/dashboard/project/ffzqgdxznsrbuhqbtmaw/settings/api
2. Copie a **anon public** key
3. Cole no `.env.local` como `VITE_SUPABASE_ANON_KEY`

### 3. Executar Migrations do Banco

#### Opção A: Via Dashboard (Mais Fácil)

1. Acesse: https://supabase.com/dashboard/project/ffzqgdxznsrbuhqbtmaw
2. Vá em **SQL Editor**
3. Clique em **New query**
4. Abra `supabase/migrations/001_initial_schema.sql`
5. Copie TODO o conteúdo e cole no editor
6. Clique em **Run** (ou Ctrl+Enter)
7. Aguarde a execução (1-2 minutos)
8. Repita para `002_seed_data.sql`

#### Opção B: Via CLI

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Linkar projeto
supabase link --project-ref ffzqgdxznsrbuhqbtmaw

# Executar migrations
supabase db push
```

### 4. Verificar Banco de Dados

Execute no **SQL Editor** do Supabase:

```sql
-- Verificar tabelas
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public';
-- Deve retornar 21+

-- Verificar dados seed
SELECT COUNT(*) FROM niveis; -- Deve retornar 4
SELECT COUNT(*) FROM modulos; -- Deve retornar 10
SELECT COUNT(*) FROM polos; -- Deve retornar 1
```

### 5. Instalar Dependências

```bash
npm install
```

### 6. Executar o Projeto

```bash
npm run dev
```

O projeto estará disponível em: http://localhost:5173

## ✅ Checklist de Configuração

- [ ] Arquivo `.env.local` criado com todas as variáveis
- [ ] `VITE_SUPABASE_URL` configurado
- [ ] `VITE_SUPABASE_ANON_KEY` configurado (obtida do dashboard)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configurada (já fornecida)
- [ ] Migration `001_initial_schema.sql` executada
- [ ] Migration `002_seed_data.sql` executada
- [ ] Banco de dados verificado (21+ tabelas, dados seed)
- [ ] Dependências instaladas (`npm install`)
- [ ] Projeto executando (`npm run dev`)

## 🔐 Segurança

⚠️ **IMPORTANTE**:
- A `SERVICE_ROLE_KEY` é **MUITO PODEROSA**
- **NUNCA** use no frontend
- **NUNCA** commite no Git
- Use apenas em Edge Functions ou backend

Leia `SEGURANCA.md` para mais detalhes.

## 🐛 Problemas Comuns

### Erro: "Invalid API key"
- Verifique se a `ANON_KEY` está correta
- Certifique-se de copiar a chave **anon public**, não a service_role

### Erro: "relation does not exist"
- Execute as migrations primeiro
- Verifique se executou ambas: `001_initial_schema.sql` e `002_seed_data.sql`

### Erro: "Row Level Security policy violation"
- Verifique se está usando a `ANON_KEY` no frontend (não a SERVICE_ROLE_KEY)
- Verifique se o usuário está autenticado
- Verifique as políticas RLS no dashboard

## 📚 Próximos Passos

Após configurar:
1. ✅ Teste o login
2. ✅ Teste a pré-matrícula
3. ✅ Explore o dashboard administrativo
4. ✅ Leia a documentação completa em `README.md`

---

**Dúvidas?** Consulte:
- `README.md` - Documentação geral
- `SEGURANCA.md` - Guia de segurança
- `GUIA_BANCO_DADOS.md` - Detalhes do banco

