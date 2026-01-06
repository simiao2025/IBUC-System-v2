# 🧪 Guia de Teste - Cadastro de Aluno

## 🚀 Sistema Iniciado

O frontend está rodando em: **http://localhost:5173**

## 📋 Páginas de Cadastro Disponíveis

### 1. Pré-matrícula Online (Recomendado para Teste)
**URL**: `http://localhost:5173/pre-matricula`

**O que faz:**
- Cria aluno com status `pendente`
- Cria matrícula com status `pendente`
- Gera protocolo de matrícula
- Salva diretamente no Supabase

**Como testar:**
1. Acesse: `http://localhost:5173/pre-matricula`
2. Preencha o formulário completo
3. Clique em "Enviar Pré-matrícula"
4. Anote o protocolo gerado
5. Verifique no Supabase se os dados foram salvos

### 2. Cadastro de Aluno
**URL**: `http://localhost:5173/cadastro-aluno`

**O que faz:**
- Cadastro básico de aluno
- Salva no contexto local (pode precisar de backend)

### 3. Matrícula
**URL**: `http://localhost:5173/matricula`

**O que faz:**
- Formulário de matrícula completa
- Redireciona para cadastro se necessário

## ✅ Checklist de Teste

### Teste 1: Pré-matrícula Online

- [ ] Acessar `/pre-matricula`
- [ ] Preencher dados do aluno:
  - [ ] Nome completo
  - [ ] Data de nascimento
  - [ ] Sexo
  - [ ] CPF
- [ ] Preencher endereço:
  - [ ] CEP
  - [ ] Rua, número, bairro, cidade, estado
- [ ] Preencher dados do responsável:
  - [ ] Nome
  - [ ] Telefone
  - [ ] Email
  - [ ] CPF
  - [ ] Tipo de parentesco
- [ ] Selecionar polo
- [ ] Selecionar nível (se disponível)
- [ ] Aceitar termos
- [ ] Enviar formulário
- [ ] Verificar se protocolo foi gerado
- [ ] Verificar no Supabase se dados foram salvos

### Verificação no Supabase

Execute no SQL Editor do Supabase:

```sql
-- Verificar alunos criados
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

-- Verificar matrículas criadas
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

-- Verificar responsáveis criados
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

## 🔍 O que Verificar

### ✅ Sucesso se:
- Formulário submete sem erros
- Protocolo é gerado e exibido
- Dados aparecem nas tabelas do Supabase:
  - `alunos` - aluno criado com status `pendente`
  - `matriculas` - matrícula criada com protocolo
  - `responsaveis` - responsável vinculado ao aluno

### ❌ Problemas Comuns:

1. **Erro: "Supabase URL ou Anon Key não configurados"**
   - Verificar arquivo `.env.local`
   - Verificar variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`

2. **Erro: "permission denied"**
   - Verificar RLS (Row Level Security) no Supabase
   - Verificar se as políticas RLS permitem INSERT

3. **Erro: "relation does not exist"**
   - Verificar se as migrations foram executadas
   - Verificar se as tabelas existem

4. **Formulário não envia**
   - Verificar console do navegador (F12)
   - Verificar erros de validação
   - Verificar se todos os campos obrigatórios foram preenchidos

## 📊 Dados de Teste Sugeridos

```
Aluno:
- Nome: João Silva Santos
- Data Nascimento: 15/03/2010
- Sexo: M
- CPF: 123.456.789-00

Endereço:
- CEP: 77000-000
- Rua: Rua das Flores
- Número: 123
- Bairro: Centro
- Cidade: Palmas
- Estado: TO

Responsável:
- Nome: Maria Silva Santos
- Telefone: (63) 99999-9999
- Email: maria@example.com
- CPF: 987.654.321-00
- Parentesco: Mãe
```

## 🎯 Próximos Passos Após Teste

1. ✅ Verificar se dados foram salvos no Supabase
2. ✅ Testar consulta de matrícula por protocolo
3. ✅ Testar aprovação de matrícula (se tiver acesso admin)
4. ✅ Verificar se RLS está funcionando corretamente

---

**Boa sorte com o teste!** 🚀

Se encontrar algum problema, verifique o console do navegador (F12) e os logs do Supabase.






