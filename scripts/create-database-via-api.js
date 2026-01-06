#!/usr/bin/env node

/**
 * Script alternativo para criar estrutura via API REST do Supabase
 * Usa a SERVICE_ROLE_KEY para executar comandos SQL
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Variáveis de ambiente não configuradas!');
  process.exit(1);
}

async function executeMigrationViaAPI() {
  console.log('🚀 Criando estrutura do banco via API...\n');

  const migrationFile = join(__dirname, '../supabase/migrations/001_initial_schema.sql');
  const seedFile = join(__dirname, '../supabase/migrations/002_seed_data.sql');

  try {
    // Ler arquivos SQL
    console.log('📄 Lendo arquivos de migration...');
    const migrationSQL = readFileSync(migrationFile, 'utf-8');
    const seedSQL = readFileSync(seedFile, 'utf-8');

    // Dividir em blocos executáveis
    const migrationBlocks = migrationSQL
      .split(/;\s*\n/)
      .map(b => b.trim())
      .filter(b => b.length > 0 && !b.startsWith('--'));

    console.log(`\n📦 Executando ${migrationBlocks.length} blocos de migration...\n`);

    // Executar via REST API usando pg_rest ou função customizada
    // Nota: A API REST do Supabase não suporta DDL diretamente
    // É necessário usar o SQL Editor ou Supabase CLI

    console.log('⚠️  A API REST do Supabase não suporta execução direta de DDL.');
    console.log('   Use o método via Dashboard ou CLI.\n');

    console.log('📋 Siga estas instruções:\n');
    console.log('1️⃣  Acesse o Dashboard:');
    console.log(`   https://supabase.com/dashboard/project/ffzqgdxznsrbuhqbtmaw/sql\n`);
    
    console.log('2️⃣  Execute o SQL abaixo (copie e cole no SQL Editor):\n');
    console.log('─'.repeat(60));
    console.log(migrationSQL.substring(0, 500) + '...\n');
    console.log('─'.repeat(60));
    console.log('\n   (Arquivo completo: supabase/migrations/001_initial_schema.sql)\n');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

executeMigrationViaAPI();

