
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, 'backend/.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found in backend/.env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log('--- Database Verification ---');

  // 1. Check status_turma enum
  const { data: enumTurma, error: errTurma } = await supabase.rpc('get_enum_values', { type_name: 'status_turma' });
  if (errTurma) {
    // If RPC doesn't exist, try raw query if possible or check via a table that uses it
    console.log('Checking status_turma via fallback...');
    const { data: qTurma, error: eqTurma } = await supabase.from('turmas').select('status').limit(1);
    if (eqTurma) console.error('Error checking turmas:', eqTurma.message);
    else console.log('Successfully queried turmas table.');
  } else {
    console.log('status_turma values:', enumTurma);
  }

  // 2. Check alumnos columns
  const { data: colAlunos, error: errAlunos } = await supabase.from('alunos').select('*').limit(0);
  if (errAlunos) {
    console.error('Error checking alumnos table:', errAlunos.message);
  } else {
    // Check for some of the new columns
    const columns = Object.keys(colAlunos[0] || {});
    const expected = ['nome_responsavel', 'alergias', 'rg_orgao'];
    const missing = expected.filter(c => !columns.includes(c));
    if (missing.length === 0) {
      console.log('New columns in "alunos" table are present.');
    } else if (colAlunos.length === 0 && !errAlunos) {
       console.log('Alunos table is empty, could not verify columns via select * limit 0.');
    } else {
      console.log('Missing columns in "alunos":', missing);
    }
  }

  // 3. Check for coordenadores_regionais_polos table
  const { data: tableCheck, error: errTable } = await supabase.from('coordenadores_regionais_polos').select('id').limit(1);
  if (errTable) {
    if (errTable.code === 'PGRST116' || errTable.message.includes('does not exist')) {
        console.log('Table "coordenadores_regionais_polos" DOES NOT exist.');
    } else {
        console.error('Error checking table "coordenadores_regionais_polos":', errTable.message);
    }
  } else {
    console.log('Table "coordenadores_regionais_polos" exists.');
  }

  console.log('--- End Verification ---');
}

// Since RPC 'get_enum_values' might not exist, let's try a direct query for enums if we can
async function checkEnumsDirectly() {
    // This requires the service role key to have permission to pg_catalog, which it usually doesn't over PostgREST
    // So we will just check if we can insert a 'rascunho' value or if it's already there.
}

checkDatabase();
