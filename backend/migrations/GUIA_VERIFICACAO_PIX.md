# 🔧 Guia de Verificação e Correção - Sistema PIX

## 📋 Sobre este Script

O arquivo `verify_fix_configuracoes_financeiras.sql` verifica e corrige automaticamente a tabela de configurações financeiras do sistema PIX.

## 🚀 Como Executar

### Opção 1: Supabase Dashboard (Recomendado)

1. Acesse o **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Clique em **New Query**
4. Cole todo o conteúdo do arquivo `verify_fix_configuracoes_financeiras.sql`
5. Clique em **Run** (ou pressione `Ctrl + Enter`)

### Opção 2: Ferramenta de Banco de Dados

1. Abra sua ferramenta de DB (pgAdmin, DBeaver, etc.)
2. Conecte ao banco de dados
3. Abra o arquivo SQL
4. Execute o script completo

## 📊 O que o Script Faz

### PARTE 1: Verificação

- ✅ Verifica se a tabela existe
- ✅ Mostra a estrutura da tabela
- ✅ Conta quantos registros existem
- ✅ Verifica se os campos estão preenchidos

### PARTE 2: Correção Automática

- 🔧 Cria a tabela se não existir
- 🔧 Insere registro padrão se a tabela estiver vazia
- 🔧 Corrige campos vazios ou NULL

### PARTE 3: Relatório Final

- 📊 Mostra a configuração atual
- 📊 Validação completa
- 📊 Instruções dos próximos passos

## 📖 Interpretando os Resultados

### ✅ Tudo OK

```
✅ TUDO OK! Sistema PIX pronto para uso!
```

**Ação**: Nenhuma. O sistema está funcionando.

### ⚠️ Usando Dados Padrão

```
⚠️ ATENÇÃO: Usando configuração PADRÃO/TESTE!
```

**Ação**: Configure com dados reais:

1. Admin → Financeiro → Configuração
2. Preencha chave PIX real
3. Preencha nome do beneficiário
4. Preencha cidade
5. Salve

### ❌ Erro Crítico

```
❌ ERRO CRÍTICO: Não foi possível criar/encontrar configuração!
```

**Ação**: Entre em contato com suporte técnico ou execute novamente a migration original.

## 🔄 Depois de Executar

1. **Verifique o relatório final** no output do SQL
2. **Se tudo OK**: teste o sistema
   - Área do Aluno → Financeiro
   - Clique em "Pagar PIX"
   - Verifique se o QR Code aparece

3. **Se usando dados padrão**: configure dados reais
   - Admin → Financeiro → Configuração
   - Atualizar os campos

4. **Se houver erro**: verifique:
   - Backend está rodando?
   - Migrations foram executadas?
   - Banco de dados está acessível?

## 🎯 Valores Padrão Inseridos

Caso a tabela esteja vazia, o script insere:

- **Chave PIX**: `12345678900` (exemplo)
- **Beneficiário**: `Instituto Bíblico`
- **Cidade**: `São Paulo`

⚠️ **IMPORTANTE**: Estes são valores de TESTE. Configure com dados reais!

## 📞 Suporte

Se o script não resolver o problema:

1. Capture o output completo do script
2. Verifique os logs do backend
3. Teste os endpoints da API manualmente
