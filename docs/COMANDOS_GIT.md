# 📋 Comandos Git - Copiar e Colar

## ⚡ Setup Rápido

Copie e cole estes comandos no terminal (PowerShell ou CMD):

```bash
# 1. Inicializar repositório
git init

# 2. Adicionar todos os arquivos
git add .

# 3. Primeiro commit
git commit -m "Initial commit: IBUC System completo com backend NestJS e frontend React"

# 4. Adicionar remote (SUBSTITUA SEU_USUARIO pelo seu usuário do GitHub)
git remote add origin https://github.com/SEU_USUARIO/IBUC-System-v2.git

# 5. Renomear branch para main
git branch -M main

# 6. Fazer push
git push -u origin main
```

## 🔐 Se Pedir Autenticação

### Opção 1: Personal Access Token (Recomendado)

1. Acesse: https://github.com/settings/tokens
2. Clique em "Generate new token (classic)"
3. Nome: `IBUC-System`
4. Selecione escopo: `repo` (marcar tudo em repo)
5. Clique em "Generate token"
6. **COPIE O TOKEN** (você só verá uma vez!)
7. Quando pedir senha, cole o token

### Opção 2: GitHub CLI

```bash
# Instalar GitHub CLI
winget install GitHub.cli

# Fazer login
gh auth login

# Depois fazer push normalmente
git push -u origin main
```

## 📝 Comandos Adicionais

```bash
# Ver status dos arquivos
git status

# Ver histórico de commits
git log --oneline

# Adicionar arquivo específico
git add nome-do-arquivo.ts

# Fazer commit com mensagem
git commit -m "Sua mensagem aqui"

# Ver branches
git branch

# Criar nova branch
git checkout -b feature/nova-funcionalidade

# Voltar para main
git checkout main

# Fazer push de uma branch
git push origin feature/nova-funcionalidade
```

## ⚠️ Antes de Fazer Push

1. ✅ Verifique se o `.gitignore` está correto
2. ✅ Certifique-se de que não há arquivos `.env` com credenciais reais
3. ✅ Revise os arquivos que serão commitados: `git status`

## 🆘 Problemas Comuns

### Erro: "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/SEU_USUARIO/IBUC-System-v2.git
```

### Erro: "failed to push some refs"
```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

### Esqueceu de criar o repositório no GitHub?
1. Acesse: https://github.com/new
2. Nome: `IBUC-System-v2`
3. **NÃO** marque "Initialize with README"
4. Clique em "Create repository"
5. Depois execute os comandos acima

---

**Dúvidas?** Veja `GITHUB_SETUP.md` para instruções detalhadas.






