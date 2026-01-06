
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';

// Load environment variables
config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Erro: Variáveis de ambiente não encontradas.');
  console.error('Certifique-se de ter um arquivo .env com VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (ou VITE_SUPABASE_ANON_KEY)');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function fixPassword() {
  const email = 'simacjr@hotmail.com';
  const newPassword = '123456';
  
  console.log(`Iniciando atualização de senha para ${email}...`);

  // 1. Generate Hash
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(newPassword, salt);
  
  console.log('Hash gerado com sucesso.');

  // 2. Update User
  const { data, error } = await supabase
    .from('usuarios')
    .update({ password_hash: passwordHash })
    .eq('email', email)
    .select();

  if (error) {
    console.error('Erro ao atualizar senha:', error);
    process.exit(1);
  }

  if (data && data.length > 0) {
    console.log('✅ Senha atualizada com sucesso!');
    console.log('Novo hash:', passwordHash);
  } else {
    console.error('⚠️ Usuário não encontrado ou permissão negada (RLS).');
    console.error('Se o RLS estiver ativo, você precisa da SUPABASE_SERVICE_ROLE_KEY para atualizar usuários de outros contextos.');
  }
}

fixPassword();
