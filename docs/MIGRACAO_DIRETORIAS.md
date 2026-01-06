# 🏛️ Migração: Tabelas de Diretorias

## ✅ O Que Foi Criado

### Novas Tabelas

1. **`diretoria_geral`** - Armazena diretorias gerais do sistema
2. **`diretoria_polo`** - Armazena diretorias de cada polo

### Novos ENUMs

- `status_diretoria`: 'ativa', 'inativa', 'suspensa'
- `tipo_cargo_diretoria`: 'diretor', 'vice_diretor', 'coordenador', 'vice_coordenador', 'secretario', 'tesoureiro'

### Views

- `vw_diretoria_ativa` - Todas as diretorias ativas
- `vw_historico_diretoria` - Histórico completo

## 🎯 Vantagens

### 1. Separação de Responsabilidades
- ✅ Diretorias separadas de usuários
- ✅ Campos específicos para gestão
- ✅ Melhor organização

### 2. Histórico Completo
- ✅ `data_inicio` e `data_fim` para períodos de gestão
- ✅ Rastreamento de todas as diretorias (ativas e inativas)
- ✅ Auditoria completa

### 3. Campos Profissionais
- ✅ `formacao_academica`
- ✅ `formacao_teologica`
- ✅ `experiencia`
- ✅ `tempo_servico`

### 4. Segurança
- ✅ RLS específico para diretorias
- ✅ Constraints de integridade
- ✅ Apenas um diretor ativo por polo

### 5. Integração Automática
- ✅ Trigger atualiza `polos.diretor_id` automaticamente
- ✅ Relacionamento com `usuarios` mantido

## 📋 Como Executar

### Opção 1: Via Supabase CLI
```bash
cd supabase
supabase db push
```

### Opção 2: Via SQL Editor (Supabase Dashboard)
1. Acesse: https://supabase.com/dashboard/project/[seu-projeto]/sql
2. Execute `004_create_diretoria_tables.sql`
3. (Opcional) Execute `005_seed_diretoria_data.sql` para dados de exemplo

## 🔄 Migração de Dados Existentes

Se você já tem diretores na tabela `usuarios`, execute este script para migrar:

```sql
-- Migrar diretores gerais
INSERT INTO diretoria_geral (
  usuario_id, cargo, nome_completo, cpf, telefone, email, 
  data_inicio, status, created_at
)
SELECT 
  id, 'diretor', nome_completo, cpf, telefone, email,
  created_at::DATE, 
  CASE WHEN ativo THEN 'ativa' ELSE 'inativa' END,
  created_at
FROM usuarios
WHERE role = 'diretor_geral';

-- Migrar diretores de polos
INSERT INTO diretoria_polo (
  polo_id, usuario_id, cargo, nome_completo, cpf, telefone, email,
  data_inicio, status, created_at
)
SELECT 
  polo_id, id, 'diretor', nome_completo, cpf, telefone, email,
  created_at::DATE,
  CASE WHEN ativo THEN 'ativa' ELSE 'inativa' END,
  created_at
FROM usuarios
WHERE role = 'diretor_polo' AND polo_id IS NOT NULL;
```

## 📊 Estrutura das Tabelas

### diretoria_geral
```sql
- id (UUID)
- usuario_id (FK → usuarios)
- cargo (ENUM)
- nome_completo, cpf, rg, data_nascimento
- telefone, email, endereco, foto_url
- formacao_academica, formacao_teologica, experiencia
- tempo_servico (meses)
- data_inicio, data_fim (período de gestão)
- status (ativa/inativa/suspensa)
- observacoes
- created_by, created_at, updated_at
```

### diretoria_polo
```sql
- id (UUID)
- polo_id (FK → polos)
- usuario_id (FK → usuarios)
- cargo (ENUM)
- [mesmos campos de dados pessoais e profissionais]
- data_inicio, data_fim
- status
- observacoes
- created_by, created_at, updated_at
```

## 🔐 Permissões (RLS)

### Diretoria Geral
- **Ver**: super_admin, admin_geral, diretor_geral
- **Inserir/Atualizar**: super_admin, admin_geral

### Diretoria Polo
- **Ver**: super_admin, admin_geral, diretor_geral, diretor_polo (do seu polo)
- **Inserir/Atualizar**: super_admin, admin_geral, diretor_polo (do seu polo)

## ⚠️ Importante

1. **Não remover** a tabela `usuarios` - ela ainda é necessária para autenticação
2. **Manter** o campo `role` em `usuarios` para controle de acesso
3. As tabelas de diretorias são **complementares**, não substitutas
4. O campo `polos.diretor_id` é atualizado automaticamente via trigger

## 📝 Próximos Passos

1. ✅ Executar migrations
2. ✅ Migrar dados existentes (se houver)
3. ✅ Atualizar serviços/frontend para usar novas tabelas
4. ✅ Testar criação/edição de diretorias
5. ✅ Validar RLS funcionando corretamente

---

**Data**: 2024-01-01
**Status**: ✅ Pronto para execução






