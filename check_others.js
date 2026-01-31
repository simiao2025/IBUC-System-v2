
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

async function checkNiveis() {
  const { error } = await supabase
    .from('alunos')
    .select('id, niveis(*)')
    .limit(1);
  
  if (error) {
    console.log('Alunos -> Niveis Error:', error.hint);
  } else {
    console.log('Alunos -> Niveis worked without hint.');
  }

  const { error: error2 } = await supabase
    .from('alunos')
    .select('id, polos(*)')
    .limit(1);

  if (error2) {
    console.log('Alunos -> Polos Error:', error2.hint);
  } else {
    console.log('Alunos -> Polos worked without hint.');
  }
}

checkNiveis();
