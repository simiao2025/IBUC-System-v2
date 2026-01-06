#!/usr/bin/env node

/**
 * Script para testar a conexão com o Supabase e verificar dados
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  console.error('❌ VITE_SUPABASE_URL não configurado!');
  process.exit(1);
}

if (!ANON_KEY && !SERVICE_ROLE_KEY) {
  console.error('❌ Nenhuma chave configurada! Configure VITE_SUPABASE_ANON_KEY ou SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Usar SERVICE_ROLE_KEY se disponível, senão ANON_KEY
const key = SERVICE_ROLE_KEY || ANON_KEY;
const supabase = createClient(SUPABASE_URL, key, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function testConnection() {
  console.log('🔍 Testando conexão com Supabase...\n');
  console.log(`📡 URL: ${SUPABASE_URL}`);
  console.log(`🔑 Usando: ${SERVICE_ROLE_KEY ? 'SERVICE_ROLE_KEY' : 'ANON_KEY'}\n`);

  const tests = {
    niveis: false,
    modulos: false,
    polos: false,
    usuarios: false,
    turmas: false,
  };

  try {
    // Testar níveis
    console.log('📊 Testando tabela niveis...');
    const { data: niveis, error: niveisError } = await supabase
      .from('niveis')
      .select('*')
      .limit(5);

    if (!niveisError && niveis && niveis.length > 0) {
      tests.niveis = true;
      console.log(`   ✅ ${niveis.length} níveis encontrados`);
      niveis.forEach(n => console.log(`      - ${n.nome}`));
    } else {
      console.log(`   ❌ Erro: ${niveisError?.message || 'Nenhum nível encontrado'}`);
    }

    // Testar módulos
    console.log('\n📚 Testando tabela modulos...');
    const { data: modulos, error: modulosError } = await supabase
      .from('modulos')
      .select('numero, titulo')
      .limit(5);

    if (!modulosError && modulos && modulos.length > 0) {
      tests.modulos = true;
      console.log(`   ✅ ${modulos.length} módulos encontrados`);
      modulos.forEach(m => console.log(`      - Módulo ${m.numero}: ${m.titulo}`));
    } else {
      console.log(`   ❌ Erro: ${modulosError?.message || 'Nenhum módulo encontrado'}`);
    }

    // Testar polos
    console.log('\n🏢 Testando tabela polos...');
    const { data: polos, error: polosError } = await supabase
      .from('polos')
      .select('id, nome, codigo, status')
      .limit(5);

    if (!polosError && polos && polos.length > 0) {
      tests.polos = true;
      console.log(`   ✅ ${polos.length} polo(s) encontrado(s)`);
      polos.forEach(p => console.log(`      - ${p.nome} (${p.codigo}) - ${p.status}`));
    } else {
      console.log(`   ❌ Erro: ${polosError?.message || 'Nenhum polo encontrado'}`);
    }

    // Testar usuários
    console.log('\n👥 Testando tabela usuarios...');
    const { data: usuarios, error: usuariosError } = await supabase
      .from('usuarios')
      .select('email, nome_completo, role')
      .limit(5);

    if (!usuariosError && usuarios && usuarios.length > 0) {
      tests.usuarios = true;
      console.log(`   ✅ ${usuarios.length} usuário(s) encontrado(s)`);
      usuarios.forEach(u => console.log(`      - ${u.nome_completo} (${u.role}) - ${u.email}`));
    } else {
      console.log(`   ❌ Erro: ${usuariosError?.message || 'Nenhum usuário encontrado'}`);
    }

    // Testar turmas
    console.log('\n🎓 Testando tabela turmas...');
    const { data: turmas, error: turmasError } = await supabase
      .from('turmas')
      .select('nome, turno, status')
      .limit(5);

    if (!turmasError && turmas && turmas.length > 0) {
      tests.turmas = true;
      console.log(`   ✅ ${turmas.length} turma(s) encontrada(s)`);
      turmas.forEach(t => console.log(`      - ${t.nome} (${t.turno}) - ${t.status}`));
    } else {
      console.log(`   ⚠️  ${turmasError?.message || 'Nenhuma turma encontrada (isso é normal se não criou turmas ainda)'}`);
    }

    // Resumo
    console.log('\n' + '═'.repeat(50));
    console.log('📋 Resumo dos Testes:');
    console.log('═'.repeat(50));
    Object.entries(tests).forEach(([key, value]) => {
      const icon = value ? '✅' : '❌';
      const name = key.charAt(0).toUpperCase() + key.slice(1);
      console.log(`   ${icon} ${name}`);
    });
    console.log('═'.repeat(50));

    const allPassed = Object.values(tests).filter(v => v).length >= 4; // Pelo menos 4 devem passar

    if (allPassed) {
      console.log('\n✅ Conexão com banco de dados funcionando!');
      console.log('   O sistema está pronto para uso.\n');
    } else {
      console.log('\n⚠️  Alguns testes falharam.');
      console.log('   Verifique se as migrations foram executadas corretamente.\n');
    }

  } catch (error) {
    console.error('\n❌ Erro ao testar conexão:', error.message);
    process.exit(1);
  }
}

testConnection();

