import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Erro: SUPABASE_SERVICE_ROLE_KEY não configurada!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function checkUsers() {
  const { data: users, error } = await supabase
    .from('usuarios')
    .select('id, email, role, password_hash, ativo');

  if (error) {
    console.error('Erro ao buscar usuários:', error);
    return;
  }

  console.log('--- Lista Completa de Usuários ---');
  console.log(JSON.stringify(users, null, 2));
}

checkUsers();
