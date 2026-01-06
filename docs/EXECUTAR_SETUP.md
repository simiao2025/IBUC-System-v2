# 🚀 Executar Setup do Banco de Dados

## ⚡ Método Rápido (Recomendado)

### 1. Criar arquivo .env

Crie o arquivo `.env` na raiz do projeto com o seguinte conteúdo:

```env
VITE_SUPABASE_URL=https://ffzqgdxznsrbuhqbtmaw.supabase.co
VITE_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmenFnZHh6bnNyYnVocWJ0bWF3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDY5NDEzMSwiZXhwIjoyMDgwMjcwMTMxfQ.PizriQ-K9_wxScltWKRBr863IkE0ow32Y8BHWC8E6PM
```

**⚠️ IMPORTANTE**: Você precisa obter a `VITE_SUPABASE_ANON_KEY`:
1. Acesse: https://supabase.com/dashboard/project/ffzqgdxznsrbuhqbtmaw/settings/api
2. Copie a chave **"anon public"**
3. Cole no arquivo `.env`

### 2. Executar Migrations via Dashboard (Mais Fácil) ⭐

1. **Acesse o SQL Editor**:
   - https://supabase.com/dashboard/project/ffzqgdxznsrbuhqbtmaw/sql

2. **Execute a primeira migration**:
   - Clique em **"New query"**
   - Abra o arquivo: `supabase/migrations/001_initial_schema.sql`
   - Copie **TODO** o conteúdo (710 linhas)
   - Cole no editor SQL
   - Clique em **"Run"** (ou pressione Ctrl+Enter)
   - Aguarde 1-2 minutos

3. **Execute a segunda migration**:
   - Clique em **"New query"** novamente
   - Abra o arquivo: `supabase/migrations/002_seed_data.sql`
   - Copie **TODO** o conteúdo
   - Cole no editor SQL
   - Clique em **"Run"**

### 3. Verificar

Execute no SQL Editor:

```sql
-- Verificar tabelas (deve retornar 21+)
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- Verificar dados seed
SELECT COUNT(*) FROM niveis; -- Deve retornar 4
SELECT COUNT(*) FROM modulos; -- Deve retornar 10
SELECT COUNT(*) FROM polos; -- Deve retornar 1
```

## 🔧 Método Alternativo (Via CLI)

### Pré-requisitos

```bash
npm install -g supabase
```

### Executar

```bash
# 1. Login
supabase login

# 2. Linkar projeto
supabase link --project-ref ffzqgdxznsrbuhqbtmaw

# 3. Executar migrations
supabase db push

# 4. Verificar
npm run db:verify
```

## ✅ Checklist

Após executar, verifique:

- [ ] Arquivo `.env` criado com todas as variáveis
- [ ] `VITE_SUPABASE_ANON_KEY` configurada (obtida do dashboard)
- [ ] Migration `001_initial_schema.sql` executada
- [ ] Migration `002_seed_data.sql` executada
- [ ] 21+ tabelas criadas
- [ ] Dados seed inseridos (4 níveis, 10 módulos, 1 polo)

## 🐛 Problemas?

### Erro: "relation already exists"
- As tabelas já existem. Isso é normal se você já executou antes.
- Para recriar, você precisaria dropar as tabelas primeiro (CUIDADO: perde dados!)

### Erro: "permission denied"
- Certifique-se de estar usando a conta correta no Supabase
- Verifique se você tem permissões de administrador no projeto

### Erro: "Invalid API key"
- Verifique se copiou a chave correta (anon public, não service_role)
- Certifique-se de que não há espaços extras na chave

## 📚 Próximos Passos

Após configurar o banco:

1. ✅ Instale dependências: `npm install`
2. ✅ Execute o projeto: `npm run dev`
3. ✅ Teste o sistema!

---

**Dúvidas?** Consulte `GUIA_BANCO_DADOS.md` para mais detalhes.

