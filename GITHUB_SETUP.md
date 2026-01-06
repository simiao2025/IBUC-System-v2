# 🚀 Como Salvar no GitHub

## Pré-requisitos

1. **Instalar Git** (se ainda não tiver):
   - Baixe em: https://git-scm.com/download/win
   - Ou use: `winget install Git.Git`

2. **Criar conta no GitHub** (se ainda não tiver):
   - Acesse: https://github.com

## Passo a Passo

### 1. Inicializar o Repositório Git

```bash
# Inicializar git
git init

# Adicionar todos os arquivos
git add .

# Fazer o primeiro commit
git commit -m "Initial commit: IBUC System completo com backend NestJS e frontend React"
```

### 2. Criar Repositório no GitHub

1. Acesse: https://github.com/new
2. Nome do repositório: `IBUC-System-v2` (ou outro nome de sua preferência)
3. Descrição: "Sistema completo de gestão de curso de teologia infanto-juvenil"
4. Escolha: **Private** (recomendado) ou **Public**
5. **NÃO** marque "Initialize with README" (já temos arquivos)
6. Clique em **"Create repository"**

### 3. Conectar e Fazer Push

```bash
# Adicionar remote (substitua SEU_USUARIO pelo seu usuário do GitHub)
git remote add origin https://github.com/SEU_USUARIO/IBUC-System-v2.git

# Renomear branch para main (se necessário)
git branch -M main

# Fazer push
git push -u origin main
```

### 4. Se Pedir Autenticação

Se o GitHub pedir autenticação, você pode:

**Opção A: Personal Access Token**
1. Vá em: https://github.com/settings/tokens
2. Clique em "Generate new token (classic)"
3. Dê um nome e selecione escopos: `repo`
4. Copie o token
5. Use o token como senha quando pedir

**Opção B: GitHub CLI**
```bash
# Instalar GitHub CLI
winget install GitHub.cli

# Fazer login
gh auth login

# Depois fazer push normalmente
git push -u origin main
```

## Comandos Úteis

```bash
# Ver status
git status

# Adicionar arquivos específicos
git add arquivo.ts

# Fazer commit
git commit -m "Descrição da mudança"

# Ver histórico
git log

# Ver branches
git branch

# Criar nova branch
git checkout -b feature/nova-funcionalidade

# Fazer push de uma branch
git push origin feature/nova-funcionalidade
```

## Estrutura do Repositório

O repositório contém:

```
IBUC-System-v2/
├── backend/              # Backend NestJS
├── src/                  # Frontend React
├── supabase/             # Migrations SQL
├── docs/                 # Documentação
├── scripts/              # Scripts de setup
├── README.md             # Documentação principal
└── .gitignore           # Arquivos ignorados
```

## ⚠️ Importante

- **NUNCA** commite arquivos `.env` com credenciais reais
- Use `.env.example` como template
- Revise o `.gitignore` antes do primeiro commit
- Considere usar **Private Repository** para proteger código

## Próximos Passos Após Push

1. Adicionar descrição no GitHub
2. Adicionar tags/releases
3. Configurar GitHub Actions (CI/CD) - opcional
4. Adicionar colaboradores - opcional

---

**Dúvidas?** Consulte a documentação do Git: https://git-scm.com/doc
