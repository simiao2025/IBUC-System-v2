# 📊 Status das Migrations - IBUC System

## 🔍 Como Verificar Quais Migrations Faltam

### Opção 1: Script SQL (Recomendado)

1. Acesse o **SQL Editor** do Supabase:
   ```
   https://supabase.com/dashboard/project/[seu-projeto]/sql
   ```

2. Abra o arquivo: `supabase/migrations/VERIFICAR_MIGRATIONS.sql`

3. Copie TODO o conteúdo e cole no SQL Editor

4. Execute (Ctrl+Enter)

5. O script mostrará:
   - ✅ Quais migrations foram executadas
   - ❌ Quais migrations faltam executar
   - 📊 Resumo geral do banco

### Opção 2: Verificação Manual

Execute estas queries no SQL Editor:

```sql
-- Verificar se Migration 001 foi executada
SELECT COUNT(*) as total_tabelas
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';
-- Deve retornar 21+ tabelas

-- Verificar se Migration 002 foi executada
SELECT 
    (SELECT COUNT(*) FROM niveis) as niveis,
    (SELECT COUNT(*) FROM modulos) as modulos,
    (SELECT COUNT(*) FROM polos) as polos;
-- Deve retornar pelo menos 4 níveis, 10 módulos, 1 polo

-- Verificar se Migration 003 foi executada
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'role_usuario')
AND enumlabel IN ('diretor_geral', 'coordenador_geral');
-- Deve retornar ambos os roles

-- Verificar se Migration 004 foi executada
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('diretoria_geral', 'diretoria_polo');
-- Deve retornar ambas as tabelas
```

## 📋 Lista Completa de Migrations

### ✅ Migration 000: `000_check_and_create_types.sql`
- **Status**: Opcional (precaução)
- **O que faz**: Verifica e cria ENUMs antes da migration 001
- **Quando executar**: Se receber erro "type already exists" na 001
- **Tempo**: ~5 segundos

### ⚠️ Migration 001: `001_initial_schema.sql` 
- **Status**: **OBRIGATÓRIA**
- **O que faz**: Cria schema completo (21 tabelas, RLS, triggers, views)
- **Tempo**: 1-2 minutos
- **Verificação**: Deve criar 21+ tabelas

### ⚠️ Migration 002: `002_seed_data.sql`
- **Status**: **OBRIGATÓRIA**
- **O que faz**: Insere dados iniciais (níveis, módulos, polos, usuários)
- **Tempo**: 10-20 segundos
- **Verificação**: Deve inserir 4 níveis, 10 módulos, 1 polo

### ⚠️ Migration 003: `003_fix_enum_roles.sql`
- **Status**: **OBRIGATÓRIA**
- **O que faz**: Corrige roles (adiciona diretor_geral, coordenador_geral)
- **Tempo**: 5-10 segundos
- **Verificação**: ENUM role_usuario deve ter esses valores

### ✅ Migration 004: `004_create_diretoria_tables.sql`
- **Status**: **RECOMENDADA**
- **O que faz**: Cria tabelas de diretorias (geral e polos)
- **Tempo**: 30-60 segundos
- **Verificação**: Deve criar tabelas `diretoria_geral` e `diretoria_polo`

### ⚪ Migration 005: `005_seed_diretoria_data.sql`
- **Status**: **OPCIONAL**
- **O que faz**: Insere dados de exemplo para diretorias
- **Tempo**: 5-10 segundos
- **Verificação**: Tabelas de diretorias devem ter dados

## 🚀 Ordem de Execução

**IMPORTANTE**: Execute na ordem abaixo!

```
1. 000_check_and_create_types.sql (opcional, apenas se necessário)
   ↓
2. 001_initial_schema.sql ⚠️ OBRIGATÓRIA
   ↓
3. 002_seed_data.sql ⚠️ OBRIGATÓRIA
   ↓
4. 003_fix_enum_roles.sql ⚠️ OBRIGATÓRIA
   ↓
5. 004_create_diretoria_tables.sql ✅ RECOMENDADA
   ↓
6. 005_seed_diretoria_data.sql ⚪ OPCIONAL
```

## 📝 Como Executar

### Via SQL Editor (Recomendado)

1. Acesse: `https://supabase.com/dashboard/project/[projeto]/sql`
2. Para cada migration:
   - Clique em **"New query"**
   - Abra o arquivo SQL correspondente
   - Copie TODO (Ctrl+A, Ctrl+C)
   - Cole no editor (Ctrl+V)
   - Execute (Ctrl+Enter ou Run)
   - Aguarde conclusão
   - Verifique se não houve erros

### Via Supabase CLI

```bash
# Se já tiver o projeto linkado
supabase db push

# Ou linkar primeiro
supabase link --project-ref [seu-project-ref]
supabase db push
```

## ⚠️ Problemas Comuns

### Erro: "type already exists"
**Solução**: Os ENUMs já foram criados. Você pode:
- Pular a seção de ENUMs na migration 001
- Ou executar a migration 000 primeiro

### Erro: "relation already exists"
**Solução**: A tabela já existe. Você pode:
- Verificar se a migration já foi executada
- Ou usar `CREATE TABLE IF NOT EXISTS` (já está nas migrations)

### Erro: "permission denied"
**Solução**: Verifique se você tem permissões de administrador no projeto Supabase

## ✅ Checklist Final

Após executar todas as migrations obrigatórias:

- [ ] 21+ tabelas criadas
- [ ] 4 níveis inseridos
- [ ] 10 módulos inseridos
- [ ] 1 polo inserido
- [ ] Roles corrigidos (diretor_geral, coordenador_geral)
- [ ] RLS (Row Level Security) ativo
- [ ] Triggers criados
- [ ] Views criadas

## 🆘 Suporte

Se encontrar problemas:
1. Execute o script `VERIFICAR_MIGRATIONS.sql` para diagnóstico
2. Verifique os logs no SQL Editor do Supabase
3. Consulte `LISTA_MIGRATIONS.txt` para detalhes

---

**Última atualização**: 2024






