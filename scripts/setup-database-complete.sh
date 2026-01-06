#!/bin/bash

# Script completo para configurar o banco de dados IBUC System
# Este script guia você através do processo de setup

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     IBUC System - Configuração do Banco de Dados          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se .env existe
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ Arquivo .env não encontrado!${NC}"
    echo "   Criando arquivo .env..."
    cp .env.local.example .env 2>/dev/null || echo "   Por favor, crie o arquivo .env manualmente"
    exit 1
fi

echo -e "${GREEN}✅ Arquivo .env encontrado${NC}"
echo ""

# Verificar variáveis
source .env

if [ -z "$VITE_SUPABASE_URL" ]; then
    echo -e "${RED}❌ VITE_SUPABASE_URL não configurado no .env${NC}"
    exit 1
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo -e "${RED}❌ SUPABASE_SERVICE_ROLE_KEY não configurado no .env${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Variáveis de ambiente configuradas${NC}"
echo "   URL: $VITE_SUPABASE_URL"
echo ""

# Verificar se Supabase CLI está instalado
if command -v supabase &> /dev/null; then
    echo -e "${GREEN}✅ Supabase CLI encontrado${NC}"
    echo ""
    
    # Verificar login
    if supabase projects list &> /dev/null; then
        echo -e "${GREEN}✅ Logado no Supabase${NC}"
        echo ""
        
        # Verificar se projeto está linkado
        if [ -f "supabase/.temp/project-ref" ] || supabase status &> /dev/null; then
            echo -e "${GREEN}✅ Projeto linkado${NC}"
            echo ""
            
            echo "🚀 Executando migrations..."
            supabase db push
            
            echo ""
            echo -e "${GREEN}✅ Migrations executadas com sucesso!${NC}"
            echo ""
            
        else
            echo -e "${YELLOW}⚠️  Projeto não está linkado${NC}"
            echo ""
            echo "Para linkar o projeto, execute:"
            echo "  supabase link --project-ref ffzqgdxznsrbuhqbtmaw"
            echo ""
            echo "Ou execute as migrations manualmente via Dashboard:"
            echo "  https://supabase.com/dashboard/project/ffzqgdxznsrbuhqbtmaw/sql"
            echo ""
        fi
    else
        echo -e "${YELLOW}⚠️  Não está logado no Supabase${NC}"
        echo "Execute: supabase login"
        echo ""
    fi
else
    echo -e "${YELLOW}⚠️  Supabase CLI não instalado${NC}"
    echo ""
    echo "📋 OPÇÃO 1: Instalar Supabase CLI e executar automaticamente"
    echo "   npm install -g supabase"
    echo "   supabase login"
    echo "   supabase link --project-ref ffzqgdxznsrbuhqbtmaw"
    echo "   supabase db push"
    echo ""
    echo "📋 OPÇÃO 2: Executar manualmente via Dashboard (Recomendado)"
    echo ""
    echo "   1. Acesse: https://supabase.com/dashboard/project/ffzqgdxznsrbuhqbtmaw"
    echo "   2. Vá em 'SQL Editor'"
    echo "   3. Clique em 'New query'"
    echo "   4. Abra o arquivo: supabase/migrations/001_initial_schema.sql"
    echo "   5. Copie TODO o conteúdo e cole no editor"
    echo "   6. Clique em 'Run' (ou Ctrl+Enter)"
    echo "   7. Aguarde a execução (1-2 minutos)"
    echo "   8. Repita para: supabase/migrations/002_seed_data.sql"
    echo ""
fi

echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    Verificação Final                       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "Para verificar se o banco foi configurado corretamente:"
echo "  1. Acesse o SQL Editor do Supabase"
echo "  2. Execute: SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"
echo "  3. Deve retornar 21+ tabelas"
echo ""
echo "Ou execute o script de verificação:"
echo "  node scripts/verify-database.js"
echo ""

