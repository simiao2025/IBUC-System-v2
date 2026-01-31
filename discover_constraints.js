
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

async function listConstraints() {
  console.log('--- START ---');
  const tables = ['alunos', 'matriculas'];
  
  for (const table of tables) {
    const { error } = await supabase
      .from(table)
      .select('*, turmas!wrong(*)')
      .limit(1);
    
    if (error) {
      console.log(`\nTable: ${table}`);
      console.log(`Message: ${error.message}`);
    }
  }
  console.log('\n--- END ---');
}

listConstraints();
