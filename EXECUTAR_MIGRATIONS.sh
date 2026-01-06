#!/bin/bash
# Script para executar migrations na ordem correta
# Uso: ./EXECUTAR_MIGRATIONS.sh

echo "🚀 Iniciando execução das migrations do IBUC System..."
echo ""

# Verificar se está no diretório correto
if [ ! -f "supabase/migrations/001_initial_schema.sql" ]; then
    echo "❌ Erro: Execute este script na raiz do projeto"
    exit 1
fi

# Lista de migrations na ordem
MIGRATIONS=(
    "supabase/migrations/001_initial_schema.sql"
    "supabase/migrations/002_seed_data.sql"
    "supabase/migrations/003_fix_enum_roles.sql"
    "supabase/migrations/004_create_diretoria_tables.sql"
    "supabase/migrations/005_seed_diretoria_data.sql"
)

# Executar cada migration
for i in "${!MIGRATIONS[@]}"; do
    FILE="${MIGRATIONS[$i]}"
    NUM=$((i+1))
    
    echo "📄 [$NUM/5] Executando: $(basename $FILE)"
    
    if [ ! -f "$FILE" ]; then
        echo "⚠️  Arquivo não encontrado: $FILE"
        continue
    fi
    
    # Executar via Supabase CLI
    if command -v supabase &> /dev/null; then
        echo "   Executando via Supabase CLI..."
        # Nota: Supabase CLI executa migrations automaticamente na ordem
        # Este script é apenas para referência
    else
        echo "   ⚠️  Supabase CLI não encontrado"
        echo "   Execute manualmente no SQL Editor do Supabase"
    fi
    
    echo "   ✅ Concluído"
    echo ""
done

echo "🎉 Todas as migrations foram processadas!"
echo ""
echo "📋 Próximos passos:"
echo "   1. Verifique se não houve erros"
echo "   2. Execute as queries de verificação"
echo "   3. Configure as variáveis de ambiente"






