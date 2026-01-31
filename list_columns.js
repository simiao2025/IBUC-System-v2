
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

async function listColumns() {
  const tables = ['alunos', 'matriculas'];
  
  for (const table of tables) {
    console.log(`\n--- ${table} ---`);
    // Workaround to get column names: request a select with a column that doesn't exist
    // PostgREST often lists valid columns in the error.
    // Or just try to get one record.
    const { data, error } = await supabase.from(table).select('*').limit(1);
    
    if (error) {
      console.log(`Error: ${error.message}`);
    } else if (data && data.length > 0) {
      console.log('Columns:', Object.keys(data[0]));
    } else {
      // If table is empty, we can try to force an error
      const { error: err2 } = await supabase.from(table).select('non_existent_column');
      console.log('Table empty. Column hint from error:', err2?.message);
    }
  }
}

listColumns();
