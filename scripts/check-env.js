import { config } from 'dotenv';
config();

const vars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
];

console.log('--- Verificação de Variáveis de Ambiente ---');
vars.forEach((v) => {
  console.log(`${v}: ${process.env[v] ? '✅ Definida' : '❌ NÃO DEFINIDA'}`);
});

if (process.env.SUPABASE_URL) {
  console.log(`SUPABASE_URL: ${process.env.SUPABASE_URL}`);
}
