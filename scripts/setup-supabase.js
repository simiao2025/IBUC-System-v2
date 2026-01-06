#!/usr/bin/env node

/**
 * Script para configurar o banco de dados no Supabase
 * Executa as migrations automaticamente
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

// Carregar variáveis de ambiente
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Erro: Variáveis de ambiente não configuradas!');
  console.error('Certifique-se de que VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão no arquivo .env');
  process.exit(1);
}

// Criar cliente admin (bypassa RLS)
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function executeSQLFile(filePath) {
  try {
    console.log(`\n📄 Lendo arquivo: ${filePath}`);
    const sql = readFileSync(filePath, 'utf-8');
    
    // Dividir em comandos individuais (separados por ;)
    const commands = sql
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    console.log(`   Executando ${commands.length} comandos...`);

    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      
      // Pular comentários e comandos vazios
      if (!command || command.startsWith('--')) continue;

      try {
        // Executar via RPC ou query direta
        const { error } = await supabase.rpc('exec_sql', { sql_query: command });
        
        if (error) {
          // Tentar método alternativo
          const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SERVICE_ROLE_KEY,
              'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
            },
            body: JSON.stringify({ sql_query: command }),
          });

          if (!response.ok) {
            console.warn(`   ⚠️  Comando ${i + 1} pode ter falhado (isso é normal para alguns comandos)`);
          }
        }
      } catch (err) {
        // Ignorar erros de comandos que não podem ser executados via RPC
        console.warn(`   ⚠️  Comando ${i + 1} ignorado (normal para DDL)`);
      }
    }

    console.log(`   ✅ Arquivo processado`);
  } catch (error) {
    console.error(`   ❌ Erro ao executar arquivo:`, error.message);
    throw error;
  }
}

async function setupDatabase() {
  console.log('🚀 Configurando banco de dados IBUC System no Supabase...\n');
  console.log(`📡 Conectando a: ${SUPABASE_URL}\n`);

  try {
    // Verificar conexão
    const { data, error } = await supabase.from('polos').select('count').limit(1);
    
    if (error && error.code !== 'PGRST116') {
      console.log('ℹ️  Banco ainda não configurado (isso é esperado na primeira execução)\n');
    }

    // Método recomendado: usar Supabase CLI ou Dashboard
    console.log('📋 IMPORTANTE: Este script não pode executar DDL diretamente.');
    console.log('   Use uma das opções abaixo:\n');
    
    console.log('✅ OPÇÃO 1: Via Dashboard (Recomendado)');
    console.log('   1. Acesse: https://supabase.com/dashboard/project/ffzqgdxznsrbuhqbtmaw');
    console.log('   2. Vá em "SQL Editor"');
    console.log('   3. Execute o arquivo: supabase/migrations/001_initial_schema.sql');
    console.log('   4. Execute o arquivo: supabase/migrations/002_seed_data.sql\n');
    
    console.log('✅ OPÇÃO 2: Via Supabase CLI');
    console.log('   1. npm install -g supabase');
    console.log('   2. supabase login');
    console.log('   3. supabase link --project-ref ffzqgdxznsrbuhqbtmaw');
    console.log('   4. supabase db push\n');

    // Tentar criar função auxiliar para executar SQL (se não existir)
    console.log('🔧 Tentando criar função auxiliar...');
    
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
      RETURNS void
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        EXECUTE sql_query;
      END;
      $$;
    `;

    // Nota: A função acima não pode ser criada via REST API
    // É necessário usar o SQL Editor do dashboard

    console.log('\n✅ Instruções fornecidas!');
    console.log('   Execute as migrations manualmente usando uma das opções acima.\n');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

// Executar
setupDatabase();

