# Script de Verificação - Pronto para Teste Real?
# IBUC System v2

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  VERIFICAÇÃO - PRONTO PARA TESTE REAL" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$erros = @()
$avisos = @()

# 1. Verificar arquivos .env
Write-Host "1. Verificando variáveis de ambiente..." -ForegroundColor Yellow

if (Test-Path ".env") {
    Write-Host "   ✅ Frontend .env existe" -ForegroundColor Green
    $envContent = Get-Content .env -Raw
    if ($envContent -match "VITE_SUPABASE_URL") {
        Write-Host "   ✅ VITE_SUPABASE_URL configurado" -ForegroundColor Green
    } else {
        $erros += "VITE_SUPABASE_URL não encontrado no .env"
    }
    if ($envContent -match "VITE_SUPABASE_ANON_KEY") {
        Write-Host "   ✅ VITE_SUPABASE_ANON_KEY configurado" -ForegroundColor Green
    } else {
        $erros += "VITE_SUPABASE_ANON_KEY não encontrado no .env"
    }
} elseif (Test-Path ".env.local") {
    Write-Host "   ✅ Frontend .env.local existe" -ForegroundColor Green
    $envContent = Get-Content .env.local -Raw
    if ($envContent -match "VITE_SUPABASE_URL") {
        Write-Host "   ✅ VITE_SUPABASE_URL configurado" -ForegroundColor Green
    } else {
        $erros += "VITE_SUPABASE_URL não encontrado no .env.local"
    }
    if ($envContent -match "VITE_SUPABASE_ANON_KEY") {
        Write-Host "   ✅ VITE_SUPABASE_ANON_KEY configurado" -ForegroundColor Green
    } else {
        $erros += "VITE_SUPABASE_ANON_KEY não encontrado no .env.local"
    }
} else {
    $erros += "Arquivo .env ou .env.local não encontrado na raiz do projeto"
    Write-Host "   ❌ Frontend .env/.env.local NÃO existe" -ForegroundColor Red
}

if (Test-Path "backend\.env") {
    Write-Host "   ✅ Backend .env existe" -ForegroundColor Green
    $backendEnv = Get-Content "backend\.env" -Raw
    if ($backendEnv -match "SUPABASE_URL") {
        Write-Host "   ✅ SUPABASE_URL configurado" -ForegroundColor Green
    } else {
        $avisos += "SUPABASE_URL não encontrado no backend/.env"
    }
    if ($backendEnv -match "SUPABASE_SERVICE_ROLE_KEY") {
        Write-Host "   ✅ SUPABASE_SERVICE_ROLE_KEY configurado" -ForegroundColor Green
    } else {
        $avisos += "SUPABASE_SERVICE_ROLE_KEY não encontrado no backend/.env"
    }
} else {
    $avisos += "Arquivo backend/.env não encontrado (opcional se não usar backend NestJS)"
    Write-Host "   ⚠️  Backend .env NÃO existe (opcional)" -ForegroundColor Yellow
}

# 2. Verificar dependências
Write-Host "`n2. Verificando dependências..." -ForegroundColor Yellow

if (Test-Path "node_modules") {
    Write-Host "   ✅ Frontend node_modules existe" -ForegroundColor Green
} else {
    $erros += "Frontend node_modules não encontrado - execute: npm install"
    Write-Host "   ❌ Frontend node_modules NÃO existe" -ForegroundColor Red
}

if (Test-Path "backend\node_modules") {
    Write-Host "   ✅ Backend node_modules existe" -ForegroundColor Green
} else {
    $avisos += "Backend node_modules não encontrado - execute: cd backend && npm install"
    Write-Host "   ⚠️  Backend node_modules NÃO existe" -ForegroundColor Yellow
}

# 3. Verificar migrations
Write-Host "`n3. Verificando migrations SQL..." -ForegroundColor Yellow

$migrations = @(
    "supabase\migrations\001_initial_schema.sql",
    "supabase\migrations\002_seed_data.sql",
    "supabase\migrations\003_fix_enum_roles.sql"
)

foreach ($migration in $migrations) {
    if (Test-Path $migration) {
        Write-Host "   ✅ $migration existe" -ForegroundColor Green
    } else {
        $erros += "Migration não encontrada: $migration"
        Write-Host "   ❌ $migration NÃO existe" -ForegroundColor Red
    }
}

# 4. Verificar arquivos críticos
Write-Host "`n4. Verificando arquivos críticos..." -ForegroundColor Yellow

$arquivosCriticos = @(
    "src\lib\supabase.ts",
    "src\App.tsx",
    "src\router.tsx",
    "backend\src\main.ts"
)

foreach ($arquivo in $arquivosCriticos) {
    if (Test-Path $arquivo) {
        Write-Host "   ✅ $arquivo existe" -ForegroundColor Green
    } else {
        $erros += "Arquivo crítico não encontrado: $arquivo"
        Write-Host "   ❌ $arquivo NÃO existe" -ForegroundColor Red
    }
}

# 5. Resumo
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  RESUMO" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

if ($erros.Count -eq 0 -and $avisos.Count -eq 0) {
    Write-Host "✅ TUDO PRONTO PARA TESTE REAL!" -ForegroundColor Green
    Write-Host "`nPróximos passos:" -ForegroundColor Yellow
    Write-Host "1. Execute as migrations no Supabase (veja LISTA_MIGRATIONS.txt)"
    Write-Host "2. Inicie o backend: cd backend && npm run start:dev"
    Write-Host "3. Inicie o frontend: npm run dev"
    Write-Host "4. Acesse: http://localhost:5173`n"
} elseif ($erros.Count -eq 0) {
    Write-Host "⚠️  QUASE PRONTO - Alguns avisos:" -ForegroundColor Yellow
    foreach ($aviso in $avisos) {
        Write-Host "   - $aviso" -ForegroundColor Yellow
    }
    Write-Host "`nVocê pode prosseguir, mas verifique os avisos acima.`n"
} else {
    Write-Host "❌ NÃO ESTÁ PRONTO - Erros encontrados:" -ForegroundColor Red
    foreach ($erro in $erros) {
        Write-Host "   - $erro" -ForegroundColor Red
    }
    if ($avisos.Count -gt 0) {
        Write-Host "`nAvisos:" -ForegroundColor Yellow
        foreach ($aviso in $avisos) {
            Write-Host "   - $aviso" -ForegroundColor Yellow
        }
    }
    Write-Host "`nCorrija os erros acima antes de prosseguir.`n"
}

Write-Host "Para mais detalhes, consulte: CHECKLIST_TESTE_REAL.md`n" -ForegroundColor Cyan






