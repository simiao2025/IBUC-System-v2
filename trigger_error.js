
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

async function triggerAmbiguity() {
  console.log('--- Triggering Ambiguity on Alunos -> Turmas ---');
  const { error } = await supabase
    .from('alunos')
    .select('id, turmas(*)')
    .limit(1);
  
  if (error) {
    console.log('Error Message:', error.message);
    console.log('Error Hint:', error.hint || 'No hint');
    console.log('Error Details:', error.details || 'No details');
  }

  console.log('\n--- Triggering Ambiguity on Matriculas -> Turmas ---');
  const { error: error2 } = await supabase
    .from('matriculas')
    .select('id, turmas(*)')
    .limit(1);

  if (error2) {
    console.log('Error Message:', error2.message);
    console.log('Error Hint:', error2.hint || 'No hint');
  }
}

triggerAmbiguity();
