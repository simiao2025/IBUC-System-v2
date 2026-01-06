import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

async function main() {
  const envPath = path.resolve(__dirname, '../.env');
  console.log(`Reading .env from ${envPath}`);

  try {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const env: any = {};
    envContent.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim();
        env[key] = value;
      }
    });

    const url = env['SUPABASE_URL']?.replace(/"/g, '').replace(/'/g, '');
    const key = env['SUPABASE_SERVICE_ROLE_KEY']?.replace(/"/g, '').replace(/'/g, '');

    if (!url || !key) {
      console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
      process.exit(1);
    }

    const supabase = createClient(url, key);
    const poloId = '25b6a71d-094e-47fd-891d-ba850dc78f0f';

    console.log(`Checking turmas for polo: ${poloId}`);

    const { data: turmas, error } = await supabase
      .from('turmas')
      .select('*')
      .eq('polo_id', poloId);

    if (error) {
      console.error('Error fetching turmas:', error);
    } else {
      console.log(`Found ${turmas?.length} turmas:`);
      if (turmas && turmas.length > 0) {
        console.log('Sample turma:', JSON.stringify(turmas[0], null, 2));
      }
      turmas?.forEach(t => {
        console.log(`- [${t.status}] ${t.nome} (Level: ${t.nivel_id})`);
      });
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

main();
