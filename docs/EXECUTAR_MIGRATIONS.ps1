# Script PowerShell para listar migrations na ordem correta
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SEQUENCIA DE MIGRATIONS SQL" -ForegroundColor Cyan
Write-Host "  IBUC System" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/5] OBRIGATORIO" -ForegroundColor Red
Write-Host "   Arquivo: supabase\migrations\001_initial_schema.sql" -ForegroundColor White
Write-Host "   Descricao: Schema inicial completo" -ForegroundColor Gray
Write-Host "   Tempo: 1-2 minutos" -ForegroundColor Gray
$f1 = Test-Path "supabase\migrations\001_initial_schema.sql"
if ($f1) { Write-Host "   [OK] Arquivo existe" -ForegroundColor Green } else { Write-Host "   [ERRO] Nao encontrado" -ForegroundColor Red }
Write-Host ""

Write-Host "[2/5] OBRIGATORIO" -ForegroundColor Red
Write-Host "   Arquivo: supabase\migrations\002_seed_data.sql" -ForegroundColor White
Write-Host "   Descricao: Dados iniciais" -ForegroundColor Gray
Write-Host "   Tempo: 10-20 segundos" -ForegroundColor Gray
$f2 = Test-Path "supabase\migrations\002_seed_data.sql"
if ($f2) { Write-Host "   [OK] Arquivo existe" -ForegroundColor Green } else { Write-Host "   [ERRO] Nao encontrado" -ForegroundColor Red }
Write-Host ""

Write-Host "[3/5] OBRIGATORIO" -ForegroundColor Red
Write-Host "   Arquivo: supabase\migrations\003_fix_enum_roles.sql" -ForegroundColor White
Write-Host "   Descricao: Correcao de roles" -ForegroundColor Gray
Write-Host "   Tempo: 5-10 segundos" -ForegroundColor Gray
$f3 = Test-Path "supabase\migrations\003_fix_enum_roles.sql"
if ($f3) { Write-Host "   [OK] Arquivo existe" -ForegroundColor Green } else { Write-Host "   [ERRO] Nao encontrado" -ForegroundColor Red }
Write-Host ""

Write-Host "[4/5] RECOMENDADO" -ForegroundColor Green
Write-Host "   Arquivo: supabase\migrations\004_create_diretoria_tables.sql" -ForegroundColor White
Write-Host "   Descricao: Tabelas de diretorias" -ForegroundColor Gray
Write-Host "   Tempo: 30-60 segundos" -ForegroundColor Gray
$f4 = Test-Path "supabase\migrations\004_create_diretoria_tables.sql"
if ($f4) { Write-Host "   [OK] Arquivo existe" -ForegroundColor Green } else { Write-Host "   [ERRO] Nao encontrado" -ForegroundColor Red }
Write-Host ""

Write-Host "[5/5] OPCIONAL" -ForegroundColor Gray
Write-Host "   Arquivo: supabase\migrations\005_seed_diretoria_data.sql" -ForegroundColor White
Write-Host "   Descricao: Dados de exemplo para diretorias" -ForegroundColor Gray
Write-Host "   Tempo: 5-10 segundos" -ForegroundColor Gray
$f5 = Test-Path "supabase\migrations\005_seed_diretoria_data.sql"
if ($f5) { Write-Host "   [OK] Arquivo existe" -ForegroundColor Green } else { Write-Host "   [ERRO] Nao encontrado" -ForegroundColor Red }
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  COMO EXECUTAR" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "OPCAO 1: Supabase CLI" -ForegroundColor Yellow
Write-Host "  supabase db push" -ForegroundColor White
Write-Host ""
Write-Host "OPCAO 2: SQL Editor (Manual)" -ForegroundColor Yellow
Write-Host "  1. Acesse: https://supabase.com/dashboard/project/[projeto]/sql" -ForegroundColor White
Write-Host "  2. Execute cada arquivo NA ORDEM acima" -ForegroundColor White
Write-Host "  3. Para cada arquivo:" -ForegroundColor White
Write-Host "     - New query" -ForegroundColor Gray
Write-Host "     - Abrir arquivo SQL" -ForegroundColor Gray
Write-Host "     - Copiar TODO (Ctrl+A, Ctrl+C)" -ForegroundColor Gray
Write-Host "     - Colar no editor (Ctrl+V)" -ForegroundColor Gray
Write-Host "     - Run (Ctrl+Enter)" -ForegroundColor Gray
Write-Host "     - Aguardar conclusao" -ForegroundColor Gray
Write-Host ""
Write-Host "TEMPO TOTAL: ~3-4 minutos" -ForegroundColor Cyan
Write-Host ""
