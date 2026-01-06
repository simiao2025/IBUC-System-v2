
require('dotenv').config({ path: './backend/.env' });
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function resetPassword() {
  const email = 'simacjr@hotmail.com'; // Found in previous step
  const newPassword = '123456';
  
  console.log(`Resetting password for ${email} to '${newPassword}'...`);

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(newPassword, salt);

  const { data, error } = await supabase
    .from('usuarios')
    .update({ 
      password_hash: hash,
      updated_at: new Date().toISOString()
    })
    .eq('email', email)
    .select();

  if (error) {
    console.error('Error resetting password:', error);
  } else {
    console.log('Password reset successfully!');
    console.log(data);
  }
}

resetPassword();
