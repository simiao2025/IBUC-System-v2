
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

async function checkAll() {
  const results = {};

  const pairs = [
    { from: 'alunos', to: 'turmas' },
    { from: 'alunos', to: 'niveis' },
    { from: 'alunos', to: 'polos' },
    { from: 'matriculas', to: 'alunos' },
    { from: 'matriculas', to: 'turmas' },
    { from: 'matriculas', to: 'polos' },
    { from: 'mensalidades', to: 'alunos' },
    { from: 'mensalidades', to: 'polos' },
    { from: 'diretoria_polo', to: 'polos' },
    { from: 'diretoria_polo', to: 'usuarios' }
  ];

  for (const pair of pairs) {
    const { error } = await supabase.from(pair.from).select(`id, ${pair.to}(*)`).limit(1);
    if (error && error.hint && error.hint.includes('one of the following')) {
      results[`${pair.from}_${pair.to}`] = {
        hint: error.hint,
        details: error.details
      };
    }
  }

  fs.writeFileSync('all_errors.json', JSON.stringify(results, null, 2));
}

checkAll();
