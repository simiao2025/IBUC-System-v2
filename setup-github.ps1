# Script PowerShell para configurar e fazer push no GitHub
# Execute: .\setup-github.ps1

Write-Host "🚀 Configurando repositório Git para GitHub..." -ForegroundColor Green

# Verificar se Git está instalado
try {
    $gitVersion = git --version
    Write-Host "✅ Git encontrado: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git não encontrado. Por favor, instale o Git: https://git-scm.com/download/win" -ForegroundColor Red
    exit 1
}

# Verificar se já é um repositório Git
if (Test-Path .git) {
    Write-Host "✅ Repositório Git já inicializado" -ForegroundColor Green
} else {
    Write-Host "📦 Inicializando repositório Git..." -ForegroundColor Yellow
    git init
    Write-Host "✅ Repositório inicializado" -ForegroundColor Green
}

# Verificar .gitignore
if (Test-Path .gitignore) {
    Write-Host "✅ .gitignore encontrado" -ForegroundColor Green
} else {
    Write-Host "⚠️  .gitignore não encontrado" -ForegroundColor Yellow
}

# Adicionar arquivos
Write-Host "📝 Adicionando arquivos..." -ForegroundColor Yellow
git add .

# Verificar status
Write-Host "`n📊 Status dos arquivos:" -ForegroundColor Cyan
git status --short

# Solicitar mensagem de commit
Write-Host "`n💬 Digite a mensagem do commit (ou pressione Enter para usar a padrão):" -ForegroundColor Yellow
$commitMessage = Read-Host
if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "Initial commit: IBUC System v2 - Sistema completo de gestão de curso de teologia infanto-juvenil"
}

# Fazer commit
Write-Host "`n💾 Fazendo commit..." -ForegroundColor Yellow
git commit -m $commitMessage

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Commit realizado com sucesso!" -ForegroundColor Green
} else {
    Write-Host "❌ Erro ao fazer commit" -ForegroundColor Red
    exit 1
}

# Verificar se já tem remote
$remoteExists = git remote get-url origin 2>$null
if ($remoteExists) {
    Write-Host "✅ Remote 'origin' já configurado: $remoteExists" -ForegroundColor Green
    Write-Host "`n📤 Deseja fazer push agora? (S/N)" -ForegroundColor Yellow
    $push = Read-Host
    if ($push -eq "S" -or $push -eq "s") {
        Write-Host "📤 Fazendo push..." -ForegroundColor Yellow
        git branch -M main
        git push -u origin main
    }
} else {
    Write-Host "`n🔗 Configuração do Remote:" -ForegroundColor Cyan
    Write-Host "1. Acesse https://github.com/new e crie um novo repositório" -ForegroundColor Yellow
    Write-Host "2. Copie a URL do repositório (ex: https://github.com/USUARIO/IBUC-System-v2.git)" -ForegroundColor Yellow
    Write-Host "3. Cole a URL abaixo:" -ForegroundColor Yellow
    $repoUrl = Read-Host "URL do repositório"
    
    if (![string]::IsNullOrWhiteSpace($repoUrl)) {
        git remote add origin $repoUrl
        Write-Host "✅ Remote adicionado: $repoUrl" -ForegroundColor Green
        
        Write-Host "`n📤 Deseja fazer push agora? (S/N)" -ForegroundColor Yellow
        $push = Read-Host
        if ($push -eq "S" -or $push -eq "s") {
            Write-Host "📤 Fazendo push..." -ForegroundColor Yellow
            git branch -M main
            git push -u origin main
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Push realizado com sucesso!" -ForegroundColor Green
                Write-Host "🎉 Seu código está no GitHub!" -ForegroundColor Green
            } else {
                Write-Host "❌ Erro ao fazer push. Verifique suas credenciais." -ForegroundColor Red
                Write-Host "💡 Dica: Use Personal Access Token ao invés de senha" -ForegroundColor Yellow
            }
        }
    }
}

Write-Host "`n✅ Processo concluído!" -ForegroundColor Green
Write-Host "📚 Consulte GITHUB_SETUP.md para mais informações" -ForegroundColor Cyan

