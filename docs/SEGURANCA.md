# 🔐 Guia de Segurança - IBUC System

## ⚠️ IMPORTANTE: SERVICE_ROLE_KEY

A `SERVICE_ROLE_KEY` que você forneceu é uma chave **MUITO PODEROSA** e deve ser tratada com extremo cuidado.

### O que é a SERVICE_ROLE_KEY?

- ✅ **BYPASSA** todas as políticas RLS (Row Level Security)
- ✅ Tem acesso **TOTAL** ao banco de dados
- ✅ Pode ler, escrever e deletar **QUALQUER** dado
- ✅ Não respeita permissões de usuário

### ✅ Onde USAR (Seguro)

1. **Edge Functions do Supabase**
   ```typescript
   // supabase/functions/admin/index.ts
   const supabaseAdmin = createClient(url, Deno.env.get('SERVICE_ROLE_KEY')!);
   ```

2. **Servidores Backend**
   ```typescript
   // Apenas em servidores Node.js/Deno
   const supabaseAdmin = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY);
   ```

3. **Scripts Administrativos**
   ```bash
   # Scripts que rodam no servidor
   node scripts/admin-script.js
   ```

4. **Migrations**
   ```sql
   -- Migrations executadas no servidor
   ```

### ❌ Onde NUNCA USAR

1. **❌ Código do Frontend (React/Vue/etc)**
   ```typescript
   // NUNCA faça isso no frontend!
   const supabase = createClient(url, SERVICE_ROLE_KEY); // ❌ PERIGOSO!
   ```

2. **❌ Código que roda no navegador**
   - Qualquer arquivo `.tsx`, `.jsx`, `.vue` que é enviado ao cliente
   - Código em `src/pages/`, `src/components/`

3. **❌ Variáveis de ambiente do frontend**
   ```env
   # NUNCA faça isso!
   VITE_SUPABASE_SERVICE_ROLE_KEY=... # ❌ Expõe no cliente!
   ```

4. **❌ Repositórios públicos**
   - Nunca commite a SERVICE_ROLE_KEY
   - Use `.env.local` e adicione ao `.gitignore`

## 🔒 Configuração Segura

### Frontend (.env.local)

```env
# ✅ SEGURO: Use apenas ANON_KEY no frontend
VITE_SUPABASE_URL=https://ffzqgdxznsrbuhqbtmaw.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui

# ❌ NUNCA adicione SERVICE_ROLE_KEY aqui!
```

### Backend/Edge Functions

```env
# ✅ SEGURO: SERVICE_ROLE_KEY apenas no backend
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

Configure via Supabase Dashboard:
1. Vá em **Edge Functions** > **Settings**
2. Adicione `SUPABASE_SERVICE_ROLE_KEY` nas variáveis de ambiente

## 🛡️ Boas Práticas

### 1. Use ANON_KEY no Frontend

```typescript
// ✅ CORRETO: Frontend usa ANON_KEY
import { supabase } from '@/lib/supabase';

// Este cliente respeita o RLS
const { data } = await supabase.from('alunos').select('*');
```

### 2. Use SERVICE_ROLE_KEY apenas no Backend

```typescript
// ✅ CORRETO: Backend/Edge Function usa SERVICE_ROLE_KEY
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')! // Apenas no servidor
);
```

### 3. RLS como Camada de Segurança

O RLS (Row Level Security) garante que:
- Usuários só veem dados do seu polo
- Professores só veem suas turmas
- Responsáveis só veem seus alunos

**NUNCA** desabilite o RLS pensando que a SERVICE_ROLE_KEY vai resolver tudo!

### 4. Rotação de Chaves

Se a SERVICE_ROLE_KEY for exposta:
1. Vá em **Settings** > **API** no Supabase
2. Gere uma nova SERVICE_ROLE_KEY
3. Atualize em todos os lugares seguros (Edge Functions, backend)
4. Revogue a chave antiga

## 🔍 Verificação de Segurança

### Checklist

- [ ] SERVICE_ROLE_KEY **NÃO** está no código do frontend
- [ ] SERVICE_ROLE_KEY **NÃO** está em variáveis `VITE_*`
- [ ] SERVICE_ROLE_KEY **NÃO** está commitada no Git
- [ ] `.env.local` está no `.gitignore`
- [ ] RLS está habilitado em todas as tabelas
- [ ] ANON_KEY está sendo usada no frontend

### Como Verificar

```bash
# Verificar se SERVICE_ROLE_KEY está no código do frontend
grep -r "SERVICE_ROLE_KEY" src/

# Se encontrar algo, REMOVA imediatamente!
```

## 📚 Recursos

- [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/security)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Edge Functions Security](https://supabase.com/docs/guides/functions)

## 🆘 Se a Chave For Exposta

1. **IMEDIATAMENTE**: Gere uma nova SERVICE_ROLE_KEY no Supabase
2. Atualize em todos os lugares seguros
3. Revogue a chave antiga
4. Monitore logs para atividades suspeitas
5. Considere fazer backup e restaurar o banco se necessário

---

**Lembre-se**: A segurança é responsabilidade de todos. Se tiver dúvidas, consulte a documentação ou entre em contato com a equipe.

