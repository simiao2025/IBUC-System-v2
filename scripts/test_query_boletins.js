
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('backend/.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuery() {
    const alunoId = 'bcd79cca-4671-4eaa-9fbc-862d970a7412';
    console.log(`--- Testing query for Aluno: ${alunoId} ---`);

    // Exact query from relatorios.service.ts
    const { data, error } = await supabase
        .from('boletins')
        .select(`
        id, pdf_url, generated_at, periodo, situacao, nota_final,
        aluno:alunos!fk_aluno(nome),
        modulo:modulos(titulo, numero),
        turma:turmas(nome)
      `)
        .eq('aluno_id', alunoId)
        .order('generated_at', { ascending: false });

    if (error) {
        console.error('Query Error:', error.message);
        console.error('Hint:', error.hint);
        console.error('Details:', error.details);
    } else {
        console.log('Query Result:', JSON.stringify(data, null, 2));
    }
}

testQuery();
