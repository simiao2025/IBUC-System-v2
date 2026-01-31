
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, 'backend/.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function triggerAmbiguity() {
  const results = {};

  // Alunos
  const { error: error1 } = await supabase
    .from('alunos')
    .select('id, turmas(*)')
    .limit(1);
  
  if (error1) {
    results.alunos = {
      message: error1.message,
      hint: error1.hint,
      details: error1.details
    };
  }

  // Matriculas
  const { error: error2 } = await supabase
    .from('matriculas')
    .select('id, turmas(*)')
    .limit(1);

  if (error2) {
    results.matriculas = {
      message: error2.message,
      hint: error2.hint,
      details: error2.details
    };
  }

  fs.writeFileSync('error_details.json', JSON.stringify(results, null, 2));
  console.log('Results saved to error_details.json');
}

triggerAmbiguity();
