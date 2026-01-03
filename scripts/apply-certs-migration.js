
require('dotenv').config({ path: './backend/.env' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  const sqlPath = path.join(__dirname, '..', 'fase5_certificados.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  console.log('Applying migration from fase5_certificados.sql...');

  // Supabase JS client doesn't support raw SQL execution directly on the public interface easily 
  // without a stored procedure or special endpoint, but we can try to use a standard pg client if available,
  // or instruct user.
  // HOWEVER, for this environment, let's assume we can't easily run raw SQL via JS client without 'rpc'.
  
  // Checking if there is an rpc for exec_sql
  const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
  
  if (error) {
     console.error('RPC exec_sql failed (maybe function does not exist):', error);
     console.log('Trying fallback: please run the SQL manually in Supabase Dashboard SQL Editor.');
  } else {
     console.log('Migration applied successfully via RPC!');
  }
}

// applyMigration(); 
// Accessing direct SQL is hard via just supabase-js without specific setup.
// I will output the file path for the user to run.
console.log('Please run the following SQL in your Supabase SQL Editor:');
console.log(path.join(__dirname, '..', 'fase5_certificados.sql'));
