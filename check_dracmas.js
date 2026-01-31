
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, 'backend/.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDracmas() {
  const { error } = await supabase
    .from('dracmas_transacoes')
    .select('*, alunos(*)')
    .limit(1);
  
  if (error) {
    console.log('Dracmas -> Alunos Hint:', error.hint);
  }

  const { error: error2 } = await supabase
    .from('dracmas_transacoes')
    .select('*, turmas(*)')
    .limit(1);

  if (error2) {
    console.log('Dracmas -> Turmas Hint:', error2.hint);
  }
}

checkDracmas();
