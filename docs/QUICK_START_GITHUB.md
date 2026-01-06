# ⚡ Quick Start - GitHub

## 🚀 Opção 1: Script Automático (Recomendado)

1. Abra PowerShell no diretório do projeto
2. Execute:
```powershell
.\setup-github.ps1
```
3. Siga as instruções na tela

## 🚀 Opção 2: Manual

### Passo 1: Instalar Git
Baixe: https://git-scm.com/download/win

### Passo 2: Configurar Git (primeira vez)
```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@example.com"
```

### Passo 3: Inicializar e Fazer Commit
```bash
git init
git add .
git commit -m "Initial commit: IBUC System v2"
```

### Passo 4: Criar Repositório no GitHub
1. Acesse: https://github.com/new
2. Nome: `IBUC-System-v2`
3. **NÃO** marque "Initialize with README"
4. Clique em "Create repository"

### Passo 5: Conectar e Fazer Push
```bash
git remote add origin https://github.com/SEU_USUARIO/IBUC-System-v2.git
git branch -M main
git push -u origin main
```

## 🔐 Autenticação

Quando pedir credenciais:
- **Usuário**: Seu usuário do GitHub
- **Senha**: Use um **Personal Access Token** (não sua senha)

### Criar Token:
1. https://github.com/settings/tokens
2. "Generate new token (classic)"
3. Selecione escopo: `repo`
4. Copie o token e use como senha

## ✅ Pronto!

Seu código está no GitHub! 🎉

---

**Dúvidas?** Veja `GITHUB_SETUP.md` para guia completo.

