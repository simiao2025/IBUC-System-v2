# Script PowerShell para configurar Git e fazer push inicial
# Execute: .\setup-git.ps1

Write-Host "🚀 Configurando Git para IBUC System..." -ForegroundColor Cyan

# Verificar se Git está instalado
try {
    $gitVersion = git --version
    Write-Host "✅ Git encontrado: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git não está instalado!" -ForegroundColor Red
    Write-Host "📥 Instale o Git em: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

# Verificar se já é um repositório Git
if (Test-Path .git) {
    Write-Host "⚠️  Repositório Git já inicializado" -ForegroundColor Yellow
    $continue = Read-Host "Deseja continuar mesmo assim? (s/n)"
    if ($continue -ne "s") {
        exit 0
    }
} else {
    Write-Host "📦 Inicializando repositório Git..." -ForegroundColor Cyan
    git init
}

# Adicionar arquivos
Write-Host "📝 Adicionando arquivos..." -ForegroundColor Cyan
git add .

# Fazer commit
Write-Host "💾 Fazendo commit inicial..." -ForegroundColor Cyan
git commit -m "Initial commit: IBUC System completo com backend NestJS e frontend React"

# Solicitar URL do repositório
Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Yellow
Write-Host "1. Crie um repositório no GitHub: https://github.com/new" -ForegroundColor White
Write-Host "2. Nome sugerido: IBUC-System-v2" -ForegroundColor White
Write-Host "3. NÃO marque 'Initialize with README'" -ForegroundColor White
Write-Host ""
$repoUrl = Read-Host "Cole a URL do repositório (ex: https://github.com/usuario/IBUC-System-v2.git)"

if ($repoUrl) {
    # Adicionar remote
    Write-Host "🔗 Adicionando remote..." -ForegroundColor Cyan
    git remote add origin $repoUrl 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  Remote já existe, removendo e adicionando novamente..." -ForegroundColor Yellow
        git remote remove origin
        git remote add origin $repoUrl
    }

    # Renomear branch
    Write-Host "🌿 Configurando branch main..." -ForegroundColor Cyan
    git branch -M main

    # Fazer push
    Write-Host "⬆️  Fazendo push para GitHub..." -ForegroundColor Cyan
    Write-Host "⚠️  Se pedir autenticação, use um Personal Access Token" -ForegroundColor Yellow
    Write-Host "   Token: https://github.com/settings/tokens" -ForegroundColor Yellow
    Write-Host ""
    git push -u origin main

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Sucesso! Repositório salvo no GitHub!" -ForegroundColor Green
        Write-Host "🔗 Acesse: $repoUrl" -ForegroundColor Cyan
    } else {
        Write-Host ""
        Write-Host "❌ Erro ao fazer push. Verifique:" -ForegroundColor Red
        Write-Host "   - Se o repositório foi criado no GitHub" -ForegroundColor Yellow
        Write-Host "   - Se você tem permissão para fazer push" -ForegroundColor Yellow
        Write-Host "   - Se usou o token correto para autenticação" -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "⚠️  URL não fornecida. Execute manualmente:" -ForegroundColor Yellow
    Write-Host "   git remote add origin <URL_DO_REPOSITORIO>" -ForegroundColor White
    Write-Host "   git branch -M main" -ForegroundColor White
    Write-Host "   git push -u origin main" -ForegroundColor White
}

Write-Host ""
Write-Host "📚 Para mais informações, veja:" -ForegroundColor Cyan
Write-Host "   - GITHUB_SETUP.md" -ForegroundColor White
Write-Host "   - COMANDOS_GIT.md" -ForegroundColor White






