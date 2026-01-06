# 🔍 Quais Migrations Faltam Executar?

## 📋 Migrations Disponíveis

| # | Arquivo | Status | Obrigatória? | Descrição |
|---|---------|--------|--------------|-----------|
| 0 | `000_check_and_create_types.sql` | ⚪ Opcional | Não | Verifica/cria ENUMs (precaução) |
| 1 | `001_initial_schema.sql` | ⚠️ **OBRIGATÓRIA** | ✅ Sim | Schema completo (21 tabelas) |
| 2 | `002_seed_data.sql` | ⚠️ **OBRIGATÓRIA** | ✅ Sim | Dados iniciais (níveis, módulos, polos) |
| 3 | `003_fix_enum_roles.sql` | ⚠️ **OBRIGATÓRIA** | ✅ Sim | Corrige roles (diretor_geral, coordenador_geral) |
| 4 | `004_create_diretoria_tables.sql` | ✅ Recomendada | Não | Tabelas de diretorias |
| 5 | `005_seed_diretoria_data.sql` | ⚪ Opcional | Não | Dados de exemplo para diretorias |

## 🚀 Como Verificar Quais Já Foram Executadas

### Método Rápido (1 minuto)

1. Acesse o **SQL Editor** do Supabase:
   ```
   https://supabase.com/dashboard/project/[seu-projeto]/sql
   ```

2. Execute esta query simples:

```sql
-- Verifica Migration 001 (OBRIGATÓRIA)
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'polos')
        THEN '✅ 001_initial_schema.sql - EXECUTADA'
        ELSE '❌ 001_initial_schema.sql - FALTA EXECUTAR'
    END as status_001;

-- Verifica Migration 002 (OBRIGATÓRIA)
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM niveis LIMIT 1)
        THEN '✅ 002_seed_data.sql - EXECUTADA'
        ELSE '❌ 002_seed_data.sql - FALTA EXECUTAR'
    END as status_002;

-- Verifica Migration 003 (OBRIGATÓRIA)
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_enum 
            WHERE enumlabel = 'diretor_geral' 
            AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'role_usuario')
        )
        THEN '✅ 003_fix_enum_roles.sql - EXECUTADA'
        ELSE '❌ 003_fix_enum_roles.sql - FALTA EXECUTAR'
    END as status_003;

-- Verifica Migration 004 (Recomendada)
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'diretoria_geral')
        THEN '✅ 004_create_diretoria_tables.sql - EXECUTADA'
        ELSE '⚠️ 004_create_diretoria_tables.sql - NÃO EXECUTADA (recomendada)'
    END as status_004;
```

### Método Completo (5 minutos)

Execute o script completo de verificação:

1. Abra: `supabase/migrations/VERIFICAR_MIGRATIONS.sql`
2. Copie TODO o conteúdo
3. Cole no SQL Editor do Supabase
4. Execute
5. Veja o relatório completo

## ⚠️ Migrations Obrigatórias (Execute Primeiro!)

Se você ainda não executou nenhuma migration, execute nesta ordem:

### 1️⃣ `001_initial_schema.sql` ⚠️ OBRIGATÓRIA
- **O que faz**: Cria todo o schema do banco (21 tabelas, RLS, triggers)
- **Tempo**: 1-2 minutos
- **Como verificar**: Deve criar 21+ tabelas

### 2️⃣ `002_seed_data.sql` ⚠️ OBRIGATÓRIA
- **O que faz**: Insere dados iniciais (níveis, módulos, polos, usuários)
- **Tempo**: 10-20 segundos
- **Como verificar**: Deve ter 4 níveis, 10 módulos, 1 polo

### 3️⃣ `003_fix_enum_roles.sql` ⚠️ OBRIGATÓRIA
- **O que faz**: Adiciona roles faltantes (diretor_geral, coordenador_geral)
- **Tempo**: 5-10 segundos
- **Como verificar**: ENUM role_usuario deve ter esses valores

## ✅ Migrations Recomendadas (Depois das Obrigatórias)

### 4️⃣ `004_create_diretoria_tables.sql` ✅ RECOMENDADA
- **O que faz**: Cria tabelas para gestão de diretorias
- **Tempo**: 30-60 segundos
- **Quando executar**: Se você vai usar o módulo de diretorias

### 5️⃣ `005_seed_diretoria_data.sql` ⚪ OPCIONAL
- **O que faz**: Insere dados de exemplo para diretorias
- **Tempo**: 5-10 segundos
- **Quando executar**: Se quiser dados de exemplo para testes

## 📊 Resumo Rápido

```
✅ PRONTO PARA TESTE REAL se:
   - Migration 001 executada ✅
   - Migration 002 executada ✅
   - Migration 003 executada ✅

⚠️ QUASE PRONTO se:
   - Faltam apenas migrations 004 e 005 (opcionais)

❌ NÃO PRONTO se:
   - Faltam migrations 001, 002 ou 003 (obrigatórias)
```

## 🚀 Próximos Passos

1. **Execute o script de verificação** (`VERIFICAR_MIGRATIONS.sql`)
2. **Identifique quais migrations faltam**
3. **Execute as migrations obrigatórias** (001, 002, 003)
4. **Execute as migrations recomendadas** (004, 005) se necessário
5. **Verifique novamente** com o script

---

**Dica**: Consulte `LISTA_MIGRATIONS.txt` para instruções detalhadas de execução.






