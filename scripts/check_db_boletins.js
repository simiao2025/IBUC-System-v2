
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('backend/.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBoletins() {
    const alunoId = 'bcd79cca-4671-4eaa-9fbc-862d970a7412';
    console.log(`--- Checking records for Aluno: ${alunoId} ---`);

    const { data: records, error: recError } = await supabase
        .from('boletins')
        .select(`
            *,
            aluno:alunos(nome),
            modulo:modulos(titulo, numero),
            turma:turmas(nome)
        `)
        .eq('aluno_id', alunoId);

    if (recError) {
        console.error('Error fetching records:', recError.message);
    } else {
        console.log('Records Found:', JSON.stringify(records, null, 2));
    }

    console.log('\n--- Checking all records in boletins table ---');
    const { data: allRecords, error: allRecError } = await supabase
        .from('boletins')
        .select('*')
        .limit(10);

    if (allRecError) console.error('Error fetching all records:', allRecError.message);
    else console.log('All Records (truncated):', JSON.stringify(allRecords, null, 2));
}

checkBoletins();
