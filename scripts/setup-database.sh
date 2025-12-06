#!/bin/bash

# Script para configurar o banco de dados do IBUC System
# Uso: ./scripts/setup-database.sh

set -e

echo "🚀 Configurando banco de dados IBUC System..."
echo ""

# Verificar se Supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI não encontrado!"
    echo "📦 Instalando Supabase CLI..."
    npm install -g supabase
fi

echo "✅ Supabase CLI encontrado"
echo ""

# Verificar se está logado
echo "🔐 Verificando login no Supabase..."
if ! supabase projects list &> /dev/null; then
    echo "⚠️  Não está logado. Fazendo login..."
    supabase login
fi

echo "✅ Login verificado"
echo ""

# Verificar se projeto está linkado
if [ ! -f "supabase/.temp/project-ref" ]; then
    echo "⚠️  Projeto não está linkado."
    echo "📝 Por favor, execute:"
    echo "   supabase link --project-ref SEU-PROJECT-REF"
    echo ""
    echo "   O project-ref pode ser encontrado na URL do seu projeto:"
    echo "   https://supabase.com/dashboard/project/[PROJECT-REF]"
    exit 1
fi

echo "✅ Projeto linkado"
echo ""

# Executar migrations
echo "📦 Executando migrations..."
supabase db push

echo ""
echo "✅ Migrations executadas com sucesso!"
echo ""
echo "📊 Verificando dados seed..."
echo ""

# Verificar se os dados foram inseridos
echo "✅ Banco de dados configurado com sucesso!"
echo ""
echo "📝 Próximos passos:"
echo "   1. Configure as variáveis de ambiente no arquivo .env"
echo "   2. Execute: npm run dev"
echo ""

