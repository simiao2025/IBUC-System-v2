# Supabase Edge Functions

Este diretório contém Edge Functions do Supabase que podem usar a SERVICE_ROLE_KEY com segurança.

## ⚠️ Segurança da SERVICE_ROLE_KEY

A `SERVICE_ROLE_KEY` é uma chave poderosa que:
- ✅ **BYPASSA** todas as políticas RLS
- ✅ Tem acesso **TOTAL** ao banco de dados
- ✅ Deve ser usada **APENAS** em:
  - Edge Functions (este diretório)
  - Servidores backend
  - Scripts administrativos
  - Migrations

- ❌ **NUNCA** use no frontend
- ❌ **NUNCA** exponha no código do cliente
- ❌ **NUNCA** commite em repositórios públicos

## 🔧 Configurar SERVICE_ROLE_KEY nas Edge Functions

1. No dashboard do Supabase, vá em **Edge Functions** > **Settings**
2. Adicione a variável de ambiente:
   ```
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
   ```

Ou via CLI:

```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

## 📝 Exemplo de Edge Function

```typescript
// supabase/functions/example/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  // Obter SERVICE_ROLE_KEY das variáveis de ambiente
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;

  // Criar cliente admin (bypassa RLS)
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

  // Operações administrativas aqui
  const { data, error } = await supabaseAdmin
    .from('alunos')
    .select('*');

  return new Response(JSON.stringify({ data, error }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

## 🚀 Deploy de Edge Functions

```bash
# Deploy de uma função
supabase functions deploy nome-da-funcao

# Deploy de todas as funções
supabase functions deploy
```

