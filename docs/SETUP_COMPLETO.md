# ✅ Setup Completo - IBUC System

## 🎯 Status Atual

✅ **Arquivo `.env` criado** com:
- `VITE_SUPABASE_URL` configurado
- `SUPABASE_SERVICE_ROLE_KEY` configurado
- ⚠️ **Você precisa adicionar** `VITE_SUPABASE_ANON_KEY` (veja abaixo)

✅ **Migrations SQL criadas**:
- `supabase/migrations/001_initial_schema.sql` (710 linhas)
- `supabase/migrations/002_seed_data.sql` (86 linhas)

✅ **Scripts de setup criados**:
- `scripts/setup-supabase.js`
- `scripts/verify-database.js`
- `scripts/setup-database-complete.sh`

## 🚀 Próximos Passos

### 1. Obter ANON_KEY (Obrigatório)

1. Acesse: **https://supabase.com/dashboard/project/ffzqgdxznsrbuhqbtmaw/settings/api**

2. Procure por **"anon public"** key

3. Copie a chave (é uma string longa começando com `eyJ...`)

4. Abra o arquivo `.env` e cole após `VITE_SUPABASE_ANON_KEY=`

   ```env
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### 2. Executar Migrations no Supabase

#### Opção A: Via Dashboard (Recomendado) ⭐

1. **Acesse o SQL Editor**:
   ```
   https://supabase.com/dashboard/project/ffzqgdxznsrbuhqbtmaw/sql
   ```

2. **Execute a primeira migration**:
   - Clique em **"New query"**
   - Abra o arquivo: `supabase/migrations/001_initial_schema.sql`
   - Selecione TODO o conteúdo (Ctrl+A)
   - Copie (Ctrl+C)
   - Cole no editor SQL (Ctrl+V)
   - Clique em **"Run"** ou pressione **Ctrl+Enter**
   - ⏳ Aguarde 1-2 minutos (pode demorar)

3. **Execute a segunda migration**:
   - Clique em **"New query"** novamente
   - Abra: `supabase/migrations/002_seed_data.sql`
   - Copie TODO o conteúdo
   - Cole e execute

#### Opção B: Via Supabase CLI

```bash
# Instalar CLI (se ainda não tiver)
npm install -g supabase

# Login
supabase login

# Linkar projeto
supabase link --project-ref ffzqgdxznsrbuhqbtmaw

# Executar migrations
supabase db push
```

### 3. Verificar se Funcionou

Execute no **SQL Editor** do Supabase:

```sql
-- Deve retornar 21+
SELECT COUNT(*) as total_tabelas
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';

-- Deve retornar 4
SELECT COUNT(*) as total_niveis FROM niveis;

-- Deve retornar 10
SELECT COUNT(*) as total_modulos FROM modulos;

-- Deve retornar 1
SELECT COUNT(*) as total_polos FROM polos;
```

Ou execute o script de verificação:

```bash
npm run db:verify
```

## 📋 Checklist Final

- [ ] Arquivo `.env` criado ✅
- [ ] `VITE_SUPABASE_ANON_KEY` adicionada ao `.env`
- [ ] Migration `001_initial_schema.sql` executada
- [ ] Migration `002_seed_data.sql` executada
- [ ] 21+ tabelas criadas
- [ ] Dados seed inseridos (4 níveis, 10 módulos, 1 polo)

## 🎉 Pronto!

Após completar os passos acima:

```bash
# Instalar dependências
npm install

# Executar o projeto
npm run dev
```

O sistema estará disponível em: **http://localhost:5173**

## 📚 Documentação

- `EXECUTAR_SETUP.md` - Guia rápido de execução
- `GUIA_BANCO_DADOS.md` - Detalhes do banco de dados
- `SEGURANCA.md` - Guia de segurança
- `README.md` - Documentação geral

---

**Dúvidas?** Consulte a documentação ou entre em contato com a equipe.

