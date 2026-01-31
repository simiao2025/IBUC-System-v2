
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

async function checkSpecificColumns() {
  const { data, error } = await supabase.from('alunos').select('*').limit(1);
  if (data && data.length > 0) {
    const cols = Object.keys(data[0]);
    console.log('turma_id exists:', cols.includes('turma_id'));
    console.log('nivel_atual_id exists:', cols.includes('nivel_atual_id'));
    console.log('All columns starting with "turma":', cols.filter(c => c.startsWith('turma')));
  }
}

checkSpecificColumns();
