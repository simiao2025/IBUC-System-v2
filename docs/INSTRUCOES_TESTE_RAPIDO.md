# ⚡ Instruções Rápidas para Teste de Cadastro

## ✅ Sistema Iniciado

O frontend está rodando! Acesse: **http://localhost:5173**

## 🎯 Teste Rápido - Pré-matrícula

### 1. Acesse a Página de Pré-matrícula

Abra no navegador:
```
http://localhost:5173/pre-matricula
```

### 2. Preencha o Formulário

**Dados do Aluno:**
- Nome completo
- Data de nascimento (formato: DD/MM/AAAA)
- Sexo (M/F/Outro)
- CPF (formato: 000.000.000-00)

**Endereço:**
- CEP (formato: 00000-000)
- Rua, número, bairro, cidade, estado

**Dados do Responsável:**
- Nome completo
- Telefone (formato: (00) 00000-0000)
- Email
- CPF
- Tipo de parentesco (pai/mãe/tutor/outro)

**Matrícula:**
- Selecione o polo (deve aparecer o polo criado na migration)
- Selecione o nível (se disponível)
- Observações (opcional)
- ✅ Aceite os termos

### 3. Envie o Formulário

Clique em **"Enviar Pré-matrícula"**

### 4. Verifique o Resultado

**Sucesso se:**
- ✅ Protocolo de matrícula é exibido
- ✅ Mensagem de sucesso aparece
- ✅ Redirecionamento para página de acompanhamento

**Anote o protocolo gerado!**

## 🔍 Verificar se Salvou no Banco

### Opção 1: SQL Editor do Supabase

Execute estas queries:

```sql
-- Ver últimos alunos criados
SELECT 
    id,
    nome,
    cpf,
    status,
    polo_id,
    created_at
FROM alunos
ORDER BY created_at DESC
LIMIT 5;

-- Ver últimas matrículas criadas
SELECT 
    id,
    protocolo,
    aluno_id,
    status,
    tipo,
    created_at
FROM matriculas
ORDER BY created_at DESC
LIMIT 5;

-- Ver últimos responsáveis criados
SELECT 
    id,
    nome,
    cpf,
    tipo_parentesco,
    created_at
FROM responsaveis
ORDER BY created_at DESC
LIMIT 5;
```

### Opção 2: Table Editor do Supabase

1. Acesse: Dashboard do Supabase → Table Editor
2. Abra a tabela `alunos`
3. Verifique se o novo registro aparece
4. Repita para `matriculas` e `responsaveis`

## ⚠️ Problemas Comuns

### Erro: "Supabase URL ou Anon Key não configurados"
**Solução:**
1. Verifique se o arquivo `.env.local` existe na raiz
2. Verifique se tem as variáveis:
   ```
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-anon-key
   ```
3. Reinicie o servidor (`npm run dev`)

### Erro: "permission denied" ou "new row violates row-level security"
**Solução:**
- As políticas RLS podem estar bloqueando INSERT
- Verifique as políticas RLS no Supabase
- Ou teste com um usuário autenticado

### Formulário não envia
**Solução:**
1. Abra o Console do navegador (F12)
2. Verifique erros em vermelho
3. Verifique se todos os campos obrigatórios foram preenchidos
4. Verifique validações de CPF, email, etc.

### Nenhum polo aparece na lista
**Solução:**
- Verifique se a migration 002 foi executada
- Execute no Supabase:
  ```sql
  SELECT * FROM polos;
  ```
- Deve retornar pelo menos 1 polo

## 📊 Dados de Teste Sugeridos

```
Aluno:
Nome: João Silva Santos
Data Nascimento: 15/03/2010
Sexo: M
CPF: 123.456.789-00

Endereço:
CEP: 77000-000
Rua: Rua das Flores
Número: 123
Bairro: Centro
Cidade: Palmas
Estado: TO

Responsável:
Nome: Maria Silva Santos
Telefone: (63) 99999-9999
Email: maria.silva@example.com
CPF: 987.654.321-00
Parentesco: Mãe
```

## ✅ Checklist de Teste

- [ ] Frontend carregou em http://localhost:5173
- [ ] Página `/pre-matricula` carrega
- [ ] Formulário exibe todos os campos
- [ ] Lista de polos aparece (pelo menos 1)
- [ ] Validações funcionam (CPF, email, etc.)
- [ ] Formulário envia sem erros
- [ ] Protocolo é gerado e exibido
- [ ] Dados aparecem no Supabase (alunos, matriculas, responsaveis)

## 🎉 Pronto!

Se todos os itens acima estão ✅, o cadastro está funcionando!

---

**Dica**: Mantenha o Console do navegador aberto (F12) para ver logs e erros em tempo real.






