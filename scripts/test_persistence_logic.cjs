require('dotenv').config({ path: './backend/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testPersistence() {
    console.log('--- Testing PdfService Persistence Logic ---');

    // 1. Get a real student
    const { data: student } = await supabase.from('alunos').select('id, nome').limit(1).single();
    if (!student) {
        console.log('No students found.');
        return;
    }
    console.log('Testing with student:', student.nome);

    // 2. Get a real module
    const { data: module } = await supabase.from('modulos').select('id, titulo').limit(1).single();

    // 3. Get a real enrollment/class
    const { data: matricula } = await supabase.from('matriculas').select('turma_id').eq('aluno_id', student.id).limit(1).single();

    if (!matricula) {
        console.log('No enrollment found for student.');
        return;
    }

    const turmaId = matricula.turma_id;
    const alunoId = student.id;

    // Cleanup previous tests
    await supabase.from('certificados').delete().eq('aluno_id', alunoId).eq('turma_id', turmaId);

    // Simulation of the persistence logic in pdf.service.ts:
    console.log('Simulating first generation...');

    // In reality, pdf.service generates the PDF first.
    const storagePath = `certificados/${alunoId}/test_${Date.now()}.pdf`;
    const codigoValidacao = `IBUC-TEST-${Date.now()}`;

    const { data: inserted, error: e1 } = await supabase.from('certificados').insert({
        aluno_id: alunoId,
        turma_id: turmaId,
        modulo_id: module?.id || null,
        tipo: 'modulo',
        url_arquivo: storagePath,
        codigo_validacao: codigoValidacao,
        data_emissao: new Date().toISOString()
    }).select().single();

    if (e1) {
        console.error('Error in first persistence:', e1.message);
    } else {
        console.log('✅ First persistence SUCCESS. ID:', inserted.id);
    }

    // Simulation of the re-use check:
    console.log('Simulating second generation (should re-use)...');

    const { data: certExistente } = await supabase
        .from('certificados')
        .select('id, url_arquivo, codigo_validacao, data_emissao')
        .eq('aluno_id', alunoId)
        .eq('turma_id', turmaId)
        .eq('tipo', 'modulo')
        .maybeSingle();

    if (certExistente?.url_arquivo) {
        console.log('✅ Re-use SUCCESS. Existing path:', certExistente.url_arquivo);
    } else {
        console.log('❌ Re-use FAILED. No existing record found.');
    }

    // 4. Verify count
    const { count } = await supabase.from('certificados').select('*', { count: 'exact', head: true });
    console.log('Total certificates in DB:', count);
}

testPersistence();
