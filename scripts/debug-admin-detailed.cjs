
require('dotenv').config({ path: './backend/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function debugAdmin() {
  console.log('--- ADMIN DEBUG ---');

  // 1. List Admins
  const { data: admins, error } = await supabase
    .from('usuarios')
    .select('id, email, role, ativo, password_hash, metadata')
    .in('role', ['super_admin', 'admin_geral']);

  if (error) {
    console.error('Error listing admins:', error);
    return;
  }

  console.log(`Found ${admins.length} admins.`);
  admins.forEach(u => {
    console.log(`User: ${u.email}`);
    console.log(`  Role: ${u.role}`);
    console.log(`  Ativo: ${u.ativo}`);
    console.log(`  Hash Len: ${u.password_hash ? u.password_hash.length : 'NULL'}`);
    console.log(`  Metadata:`, u.metadata);
  });

  if (admins.length > 0) {
    const targetEmail = admins[0].email;
    console.log(`\n--- TESTING QUERY FOR: ${targetEmail} ---`);
    
    // Test the exact query usage from usuarios.service.ts
    const { data: usuario, error: qError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', targetEmail)
      .single();
      
    if (qError) {
      console.error('QUERY ERROR (Step 1):', qError);
    } else {
      console.log('QUERY SUCCESS (Step 1): User found');
      if (usuario.role === 'aluno') {
         console.log('User is aluno, would fetch extra data...');
      } else {
         console.log('User is NOT aluno, skipping step 2 (FIXED LOGIC)');
      }
    }
  }
}

debugAdmin();
