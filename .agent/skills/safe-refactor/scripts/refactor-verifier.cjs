const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();

function runCommand(command, name) {
  console.log(`\n🔍 Executando: ${name}...`);
  try {
    execSync(command, { stdio: 'inherit', cwd: rootDir });
    console.log(`✅ ${name} passou!`);
    return true;
  } catch (error) {
    console.error(`❌ ${name} falhou!`);
    return false;
  }
}

console.log('--- INÍCIO DA VERIFICAÇÃO DE REFATORAÇÃO ---');

// 1. Lint Check
const lintPassed = runCommand('npm run lint', 'ESLint Check');

// 2. Type Check
const typePassed = runCommand('npm run type-check', 'Typescript Check');

console.log('\n--- RESUMO DA VERIFICAÇÃO ---');
console.log(`Lint: ${lintPassed ? '✅ OK' : '❌ ERRO'}`);
console.log(`Typescript: ${typePassed ? '✅ OK' : '❌ ERRO'}`);

if (lintPassed && typePassed) {
  console.log('\n🟢 SINAL VERDE: A refatoração parece segura para o próximo passo!');
} else {
  console.error('\n🔴 SINAL VERMELHO: Verifique os erros acima antes de prosseguir.');
  process.exit(1);
}

console.log('--- FIM DA VERIFICAÇÃO ---');
