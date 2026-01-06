# Configuração do Banco de Dados - IBUC System

Este diretório contém as migrations SQL para configurar o banco de dados no Supabase.

## 📋 Pré-requisitos

- Conta no Supabase (https://supabase.com)
- Supabase CLI instalado (opcional, mas recomendado)

## 🚀 Configuração Inicial

### Opção 1: Via Supabase CLI (Recomendado)

```bash
# 1. Instalar Supabase CLI globalmente
npm install -g supabase

# 2. Fazer login no Supabase
supabase login

# 3. Linkar seu projeto local ao projeto no Supabase
supabase link --project-ref seu-project-ref
# O project-ref pode ser encontrado na URL do seu projeto:
# https://supabase.com/dashboard/project/[PROJECT-REF]

# 4. Executar todas as migrations
supabase db push

# 5. (Opcional) Verificar o status das migrations
supabase migration list
```

### Opção 2: Via Dashboard do Supabase

1. Acesse o dashboard do Supabase: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor** no menu lateral
4. Clique em **New query**
5. Copie e cole o conteúdo de `001_initial_schema.sql`
6. Clique em **Run** (ou pressione Ctrl+Enter)
7. Repita o processo para `002_seed_data.sql`

## 📁 Estrutura das Migrations

### 001_initial_schema.sql

Contém:
- ✅ Criação de todos os ENUMs (tipos)
- ✅ Criação de 21 tabelas principais
- ✅ Índices para performance
- ✅ Triggers para automações
- ✅ Views para relatórios
- ✅ Row Level Security (RLS) policies
- ✅ Funções auxiliares para RLS

**Tabelas criadas:**
1. `polos` - Polos/congregações
2. `usuarios` - Usuários do sistema
3. `niveis` - Níveis do curso
4. `modulos` - Módulos do curso
5. `turmas` - Turmas de alunos
6. `responsaveis` - Pais/responsáveis
7. `alunos` - Alunos cadastrados
8. `aluno_responsavel` - Relação aluno-responsável
9. `matriculas` - Matrículas
10. `licoes` - Lições
11. `conteudos` - Conteúdos
12. `presencas` - Presenças
13. `avaliacoes` - Avaliações
14. `notas` - Notas
15. `boletins` - Boletins
16. `documentos` - Documentos
17. `mensalidades` - Mensalidades
18. `pagamentos` - Pagamentos
19. `notificacoes` - Notificações
20. `consents` - Consentimentos LGPD
21. `audit_logs` - Logs de auditoria

### 002_seed_data.sql

Contém:
- ✅ 4 níveis do curso (I, II, III, IV)
- ✅ 10 módulos do curso
- ✅ 1 polo de exemplo
- ✅ Usuários de exemplo (super_admin, admin_geral, diretor, secretário, professor)
- ✅ 1 turma de exemplo

## 🔐 Row Level Security (RLS)

O RLS está habilitado em todas as tabelas e garante:

- **Isolamento por polo**: Usuários só veem dados do seu polo
- **Acesso por role**: Cada role tem permissões específicas
- **Super admin**: Tem acesso total ao sistema
- **Professores**: Veem apenas suas turmas
- **Responsáveis**: Veem apenas seus alunos

### Políticas RLS Implementadas

- `polos`: Super admin e admin_geral podem ver todos; outros veem apenas seu polo
- `alunos`: Isolamento por polo_id
- `matriculas`: Isolamento por polo_id
- `presencas`: Professores veem apenas suas turmas
- `mensalidades`: Isolamento por polo_id
- `documentos`: Acesso baseado em owner_type e owner_id

## 🔧 Funções Auxiliares

### `get_user_polo_id()`
Retorna o `polo_id` do usuário autenticado.

### `is_super_admin()`
Verifica se o usuário autenticado é super_admin.

## 📊 Views Criadas

### `vw_aluno_progresso`
Calcula o progresso do aluno por módulos:
- Total de lições
- Lições concluídas
- Percentual de conclusão

### `vw_resumo_financeiro_aluno`
Resumo financeiro por aluno:
- Total de mensalidades
- Mensalidades pagas/pendentes/vencidas
- Valores totais

## 🔄 Triggers

### `update_updated_at_column`
Atualiza automaticamente o campo `updated_at` em:
- `polos`
- `usuarios`
- `responsaveis`
- `alunos`

### `generate_matricula_protocolo`
Gera protocolo único para matrículas no formato: `IBUC-YYYYMMDD-XXXXXXXX`

### `update_mensalidade_on_payment`
Atualiza status da mensalidade quando pagamento é confirmado.

## ✅ Verificação Pós-Migration

Após executar as migrations, verifique:

1. **Tabelas criadas**:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   ORDER BY table_name;
   ```

2. **RLS habilitado**:
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public';
   ```

3. **Políticas criadas**:
   ```sql
   SELECT schemaname, tablename, policyname 
   FROM pg_policies 
   WHERE schemaname = 'public';
   ```

4. **Dados seed**:
   ```sql
   SELECT COUNT(*) FROM niveis; -- Deve retornar 4
   SELECT COUNT(*) FROM modulos; -- Deve retornar 10
   SELECT COUNT(*) FROM polos; -- Deve retornar 1
   ```

## 🐛 Troubleshooting

### Erro: "relation already exists"
Se uma tabela já existe, você pode:
1. Dropar a tabela manualmente (CUIDADO: perde dados!)
2. Ou modificar a migration para usar `CREATE TABLE IF NOT EXISTS`

### Erro: "permission denied"
Certifique-se de estar usando um usuário com permissões de administrador no banco.

### Erro: "function does not exist"
Execute as migrations na ordem correta (001 antes de 002).

## 📝 Criando Novas Migrations

Para criar uma nova migration:

```bash
# Via CLI
supabase migration new nome_da_migration

# Isso cria um arquivo em supabase/migrations/
# com timestamp: YYYYMMDDHHMMSS_nome_da_migration.sql
```

## 🔄 Rollback

Para reverter uma migration:

```bash
# Via CLI
supabase migration repair --status reverted --version YYYYMMDDHHMMSS
```

**ATENÇÃO**: Rollback manual pode ser necessário dependendo da migration.

## 📚 Recursos Adicionais

- [Documentação Supabase](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

**Última atualização**: 2024-01-01

