# 🏛️ Estrutura de Diretorias - IBUC System

## 📋 Visão Geral

O sistema possui **tabelas dedicadas** para gestão profissional e segura de diretorias geral e dos polos, separadas da tabela de usuários.

## 🗄️ Tabelas

### 1. `diretoria_geral`
Armazena informações das diretorias gerais do sistema (não vinculadas a um polo específico).

**Campos principais:**
- `usuario_id` - Referência ao usuário no sistema
- `cargo` - Tipo de cargo (diretor, vice_diretor, coordenador, etc.)
- `nome_completo`, `cpf`, `rg`, `data_nascimento`
- `telefone`, `email`, `endereco`, `foto_url`
- `formacao_academica`, `formacao_teologica`, `experiencia`
- `tempo_servico` - Em meses
- `data_inicio`, `data_fim` - Período de gestão
- `status` - ativa, inativa, suspensa
- `observacoes`

### 2. `diretoria_polo`
Armazena informações das diretorias de cada polo específico.

**Campos principais:**
- `polo_id` - Referência ao polo
- `usuario_id` - Referência ao usuário
- `cargo` - Tipo de cargo
- Mesmos campos de dados pessoais e profissionais
- `data_inicio`, `data_fim` - Período de gestão
- `status` - ativa, inativa, suspensa

**Constraint importante:**
- Garante que não há dois diretores ativos no mesmo polo simultaneamente

## 🔗 Relacionamentos

```
usuarios (1) ──< (N) diretoria_geral
usuarios (1) ──< (N) diretoria_polo
polos (1) ──< (N) diretoria_polo
```

## 📊 Views Úteis

### `vw_diretoria_ativa`
Lista todas as diretorias ativas (geral e polos):
```sql
SELECT * FROM vw_diretoria_ativa;
```

### `vw_historico_diretoria`
Histórico completo de todas as diretorias:
```sql
SELECT * FROM vw_historico_diretoria;
```

## 🔐 Segurança (RLS)

### Diretoria Geral
- **Ver**: Super admin, admin geral, diretor geral
- **Inserir/Atualizar**: Super admin, admin geral

### Diretoria Polo
- **Ver**: Super admin, admin geral, diretor geral, diretor do polo
- **Inserir/Atualizar**: Super admin, admin geral, diretor do polo

## ⚙️ Funcionalidades Automáticas

### Triggers
1. **Atualização de `updated_at`** - Automática
2. **Atualização de `polos.diretor_id`** - Quando diretor de polo é criado/atualizado

## 📝 Exemplos de Uso

### Buscar diretor geral ativo
```sql
SELECT * FROM diretoria_geral 
WHERE cargo = 'diretor' 
  AND status = 'ativa' 
  AND data_fim IS NULL;
```

### Buscar diretor de um polo específico
```sql
SELECT dp.*, p.nome as polo_nome
FROM diretoria_polo dp
JOIN polos p ON p.id = dp.polo_id
WHERE dp.polo_id = 'uuid-do-polo'
  AND dp.cargo = 'diretor'
  AND dp.status = 'ativa'
  AND dp.data_fim IS NULL;
```

### Histórico de diretorias de um polo
```sql
SELECT * FROM vw_historico_diretoria
WHERE tipo = 'polo' 
  AND polo_id = 'uuid-do-polo'
ORDER BY data_inicio DESC;
```

## ✅ Vantagens desta Estrutura

1. **Separação de Responsabilidades**: Diretorias separadas de usuários
2. **Histórico Completo**: Mantém histórico de todas as gestões
3. **Campos Específicos**: Campos profissionais dedicados
4. **Segurança**: RLS específico para diretorias
5. **Integridade**: Constraints garantem consistência
6. **Auditoria**: Rastreamento de quem criou/modificou
7. **Flexibilidade**: Suporta múltiplos cargos e períodos

## 🚀 Migração

Execute a migration:
```bash
supabase db push
```

Ou execute manualmente no SQL Editor do Supabase:
1. `004_create_diretoria_tables.sql`
2. `005_seed_diretoria_data.sql` (opcional - dados de exemplo)

---

**Última atualização**: 2024-01-01






