#!/usr/bin/env node

/**
 * Script para verificar se o banco de dados foi configurado corretamente
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Variáveis de ambiente não configuradas!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function verifyDatabase() {
  console.log('🔍 Verificando configuração do banco de dados...\n');

  const checks = {
    tables: false,
    levels: false,
    modules: false,
    polos: false,
    usuarios: false,
    rls: false,
  };

  try {
    // Verificar tabelas
    console.log('📊 Verificando tabelas...');
    const { data: tables, error: tablesError } = await supabase
      .rpc('exec_sql', { 
        sql_query: `
          SELECT COUNT(*) as count 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_type = 'BASE TABLE'
        ` 
      });

    // Método alternativo: tentar acessar tabelas diretamente
    const { error: polosError } = await supabase.from('polos').select('count').limit(1);
    if (!polosError || polosError.code === 'PGRST116') {
      checks.tables = true;
      console.log('   ✅ Tabelas criadas');
    } else {
      console.log('   ❌ Erro ao acessar tabelas:', polosError.message);
    }

    // Verificar níveis
    const { data: niveis, error: niveisError } = await supabase
      .from('niveis')
      .select('id')
      .limit(1);
    
    if (!niveisError && niveis) {
      checks.levels = true;
      console.log('   ✅ Tabela niveis existe');
    } else {
      console.log('   ⚠️  Tabela niveis não encontrada ou vazia');
    }

    // Verificar módulos
    const { data: modulos, error: modulosError } = await supabase
      .from('modulos')
      .select('id')
      .limit(1);
    
    if (!modulosError && modulos) {
      checks.modules = true;
      console.log('   ✅ Tabela modulos existe');
    } else {
      console.log('   ⚠️  Tabela modulos não encontrada ou vazia');
    }

    // Verificar polos
    const { data: polos, error: polosError2 } = await supabase
      .from('polos')
      .select('id')
      .limit(1);
    
    if (!polosError2 && polos) {
      checks.polos = true;
      console.log('   ✅ Tabela polos existe');
    } else {
      console.log('   ⚠️  Tabela polos não encontrada ou vazia');
    }

    // Verificar usuários
    const { data: usuarios, error: usuariosError } = await supabase
      .from('usuarios')
      .select('id')
      .limit(1);
    
    if (!usuariosError && usuarios) {
      checks.usuarios = true;
      console.log('   ✅ Tabela usuarios existe');
    } else {
      console.log('   ⚠️  Tabela usuarios não encontrada ou vazia');
    }

    // Resumo
    console.log('\n📋 Resumo da Verificação:');
    console.log('─'.repeat(50));
    Object.entries(checks).forEach(([key, value]) => {
      const icon = value ? '✅' : '❌';
      const name = key.charAt(0).toUpperCase() + key.slice(1);
      console.log(`   ${icon} ${name}`);
    });
    console.log('─'.repeat(50));

    const allPassed = Object.values(checks).every(v => v);
    
    if (allPassed) {
      console.log('\n✅ Banco de dados configurado corretamente!');
    } else {
      console.log('\n⚠️  Algumas verificações falharam.');
      console.log('   Execute as migrations para corrigir:');
      console.log('   - Via Dashboard: https://supabase.com/dashboard/project/ffzqgdxznsrbuhqbtmaw/sql');
      console.log('   - Via CLI: supabase db push');
    }

  } catch (error) {
    console.error('❌ Erro ao verificar:', error.message);
    console.log('\n💡 Dica: Execute as migrations primeiro!');
  }
}

verifyDatabase();

