# 🔧 Correção do Enum role_usuario

## ❌ Problema

O enum `role_usuario` estava faltando alguns valores que são usados nas políticas RLS:
- `diretor_geral` - usado nas políticas RLS
- `coordenador_geral` - usado nos tipos TypeScript
- `tesoureiro` - usado nas políticas RLS para mensalidades
- `auxiliar` - usado nos tipos TypeScript

## ✅ Solução

### Opção 1: Recriar o Enum (Se ainda não executou a migration)

Se você **AINDA NÃO EXECUTOU** a migration `001_initial_schema.sql`, ela já foi corrigida e inclui todos os roles.

### Opção 2: Adicionar Valores ao Enum Existente

Se você **JÁ EXECUTOU** a migration, execute a migration de correção:

1. Acesse o SQL Editor do Supabase:
   https://supabase.com/dashboard/project/ffzqgdxznsrbuhqbtmaw/sql

2. Execute o arquivo: `supabase/migrations/003_fix_enum_roles.sql`

   Ou copie e cole este SQL:

```sql
-- Adicionar diretor_geral
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'diretor_geral' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'role_usuario')
    ) THEN
        ALTER TYPE role_usuario ADD VALUE 'diretor_geral';
    END IF;
END $$;

-- Adicionar coordenador_geral
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'coordenador_geral' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'role_usuario')
    ) THEN
        ALTER TYPE role_usuario ADD VALUE 'coordenador_geral';
    END IF;
END $$;

-- Adicionar tesoureiro
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'tesoureiro' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'role_usuario')
    ) THEN
        ALTER TYPE role_usuario ADD VALUE 'tesoureiro';
    END IF;
END $$;

-- Adicionar auxiliar
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'auxiliar' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'role_usuario')
    ) THEN
        ALTER TYPE role_usuario ADD VALUE 'auxiliar';
    END IF;
END $$;
```

3. Verificar se funcionou:

```sql
SELECT enumlabel as role
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'role_usuario')
ORDER BY enumsortorder;
```

Deve retornar todos os 12 roles:
- super_admin
- admin_geral
- diretor_geral
- coordenador_geral
- diretor_polo
- coordenador_polo
- secretario_polo
- tesoureiro
- professor
- auxiliar
- responsavel
- aluno

## 📋 Roles Completos

Agora o enum `role_usuario` inclui:

1. **super_admin** - Administrador do sistema (acesso total)
2. **admin_geral** - Administrador geral (acesso a todos os polos)
3. **diretor_geral** - Diretor geral (acesso a todos os polos)
4. **coordenador_geral** - Coordenador geral (acesso a todos os polos)
5. **diretor_polo** - Diretor de um polo específico
6. **coordenador_polo** - Coordenador de um polo específico
7. **secretario_polo** - Secretário de um polo específico
8. **tesoureiro** - Tesoureiro (acesso financeiro)
9. **professor** - Professor (acesso às suas turmas)
10. **auxiliar** - Auxiliar/Assistente
11. **responsavel** - Responsável por aluno(s)
12. **aluno** - Aluno do curso

## ✅ Após a Correção

Após executar a correção, você pode executar novamente a migration `001_initial_schema.sql` ou continuar com `002_seed_data.sql`.

---

**Nota**: Se você ainda não executou a migration principal, ela já está corrigida e você não precisa fazer nada além de executá-la normalmente.

