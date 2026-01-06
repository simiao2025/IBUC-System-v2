# Guia de Deploy - IBUC System

Este documento contém instruções detalhadas para deploy do sistema IBUC em diferentes ambientes.

## 📋 Pré-requisitos

- Conta no Supabase (https://supabase.com)
- Node.js 18+ instalado
- Git instalado
- Conta no Vercel/Netlify (para deploy do frontend)

## 🗄️ Deploy do Banco de Dados (Supabase)

### 1. Criar Projeto no Supabase

1. Acesse https://supabase.com e faça login
2. Clique em "New Project"
3. Preencha:
   - **Name**: IBUC System
   - **Database Password**: (anote esta senha)
   - **Region**: Escolha a região mais próxima (ex: South America - São Paulo)
4. Aguarde a criação do projeto (pode levar alguns minutos)

### 2. Executar Migrations

#### Opção A: Via Supabase CLI (Recomendado)

```bash
# Instalar Supabase CLI
npm install -g supabase

# Fazer login
supabase login

# Linkar projeto
supabase link --project-ref seu-project-ref

# Executar migrations
supabase db push
```

#### Opção B: Via Dashboard do Supabase

1. Acesse o dashboard do Supabase
2. Vá em **SQL Editor**
3. Copie o conteúdo de `supabase/migrations/001_initial_schema.sql`
4. Cole no editor e execute
5. Repita para `supabase/migrations/002_seed_data.sql`

### 3. Configurar RLS (Row Level Security)

As políticas RLS já estão incluídas na migration `001_initial_schema.sql`. Verifique se estão ativas:

1. No dashboard, vá em **Authentication** > **Policies**
2. Verifique se as políticas foram criadas para todas as tabelas

### 4. Configurar Autenticação

1. No dashboard, vá em **Authentication** > **Settings**
2. Configure:
   - **Site URL**: URL do seu frontend (ex: https://ibuc.vercel.app)
   - **Redirect URLs**: Adicione URLs permitidas para redirect após login

### 5. Obter Credenciais

1. No dashboard, vá em **Settings** > **API**
2. Anote:
   - **Project URL**: `https://seu-projeto.supabase.co`
   - **anon/public key**: Chave pública para uso no frontend

## 🚀 Deploy do Frontend

### Opção A: Deploy na Vercel (Recomendado)

1. **Conectar Repositório**
   - Acesse https://vercel.com
   - Clique em "New Project"
   - Conecte seu repositório GitHub/GitLab

2. **Configurar Variáveis de Ambiente**
   - No projeto, vá em **Settings** > **Environment Variables**
   - Adicione:
     ```
     VITE_SUPABASE_URL=https://seu-projeto.supabase.co
     VITE_SUPABASE_ANON_KEY=sua-anon-key
     ```

3. **Configurar Build**
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Deploy**
   - Clique em "Deploy"
   - Aguarde o build completar

### Opção B: Deploy no Netlify

1. **Conectar Repositório**
   - Acesse https://netlify.com
   - Clique em "New site from Git"
   - Conecte seu repositório

2. **Configurar Build**
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

3. **Configurar Variáveis de Ambiente**
   - Vá em **Site settings** > **Environment variables**
   - Adicione as mesmas variáveis da Vercel

4. **Deploy**
   - Clique em "Deploy site"

### Opção C: Deploy Manual (VPS/Server)

```bash
# No servidor
git clone <seu-repositorio>
cd IBUCPalmas

# Instalar dependências
npm install

# Criar arquivo .env
cat > .env << EOF
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
EOF

# Build
npm run build

# Servir com nginx ou outro servidor web
# Exemplo com nginx:
sudo cp -r dist/* /var/www/html/
```

## 🔧 Configuração Pós-Deploy

### 1. Configurar Domínio Customizado (Opcional)

**Vercel:**
- Settings > Domains > Add Domain

**Netlify:**
- Domain settings > Add custom domain

### 2. Configurar HTTPS

Ambos Vercel e Netlify fornecem HTTPS automático via Let's Encrypt.

### 3. Atualizar URLs no Supabase

1. No dashboard do Supabase, vá em **Authentication** > **URL Configuration**
2. Atualize:
   - **Site URL**: URL de produção
   - **Redirect URLs**: Adicione todas as URLs de produção

## 🔐 Segurança

### Variáveis de Ambiente

**NUNCA** commite as seguintes informações:
- `VITE_SUPABASE_ANON_KEY` (embora seja pública, não deve ser exposta desnecessariamente)
- Senhas de banco de dados
- Chaves de API privadas

### RLS (Row Level Security)

Certifique-se de que o RLS está habilitado em todas as tabelas. As políticas garantem que:
- Usuários só acessam dados do seu polo
- Professores só veem suas turmas
- Responsáveis só veem seus alunos

## 📊 Monitoramento

### Supabase Dashboard

- **Database**: Monitore uso de banco, queries lentas
- **Authentication**: Monitore logins, usuários ativos
- **Storage**: Monitore uso de armazenamento
- **Logs**: Visualize logs de erro

### Vercel/Netlify Analytics

- Monitore performance
- Visualize erros
- Analise tráfego

## 🔄 Atualizações

### Atualizar Frontend

```bash
# Fazer alterações
git add .
git commit -m "Atualização"
git push

# Vercel/Netlify fazem deploy automático
```

### Atualizar Banco de Dados

```bash
# Criar nova migration
supabase migration new nome_da_migration

# Editar arquivo de migration
# Executar
supabase db push
```

## 🐛 Troubleshooting

### Erro: "Invalid API key"

- Verifique se as variáveis de ambiente estão configuradas corretamente
- Verifique se está usando a chave `anon/public` e não a `service_role`

### Erro: "Row Level Security policy violation"

- Verifique se o usuário está autenticado
- Verifique se as políticas RLS estão corretas
- Verifique se o usuário tem o role correto

### Erro: "CORS"

- Configure as URLs permitidas no Supabase Dashboard
- Verifique se o Site URL está correto

## 📞 Suporte

Para problemas de deploy, entre em contato com a equipe de desenvolvimento.

---

**Última atualização**: 2024-01-01

