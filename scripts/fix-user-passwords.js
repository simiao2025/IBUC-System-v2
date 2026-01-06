import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import bcrypt from 'bcryptjs';
config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Erro: SUPABASE_SERVICE_ROLE_KEY não configurada!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function fixPasswords() {
  const { data: users, error } = await supabase
    .from('usuarios')
    .select('id, email, role, password_hash');

  if (error) {
    console.error('Erro ao buscar usuários:', error);
    return;
  }

  const usersToUpdate = users?.filter(u => !u.password_hash) || [];

  if (usersToUpdate.length === 0) {
    console.log('✅ Nenhum usuário sem senha encontrado.');
    return;
  }

  console.log(`🔧 Encontrados ${usersToUpdate.length} usuários sem senha. Configurando 'senha123'...`);

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('senha123', salt);

  for (const u of usersToUpdate) {
    console.log(`   - Atualizando ${u.email}...`);
    const { error: updateError } = await supabase
      .from('usuarios')
      .update({ password_hash: hash })
      .eq('id', u.id);

    if (updateError) {
      console.error(`   ❌ Erro ao atualizar ${u.email}:`, updateError);
    } else {
      console.log(`   ✅ ${u.email} atualizado com sucesso!`);
    }
  }
}

fixPasswords();
