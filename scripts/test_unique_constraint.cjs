require('dotenv').config({ path: './backend/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testUniqueConstraint() {
    console.log('--- Testing Unique Constraint on certificados ---');

    const dummyCert = {
        aluno_id: '00000000-0000-0000-0000-000000000000', // Random ID, or just anything
        modulo_id: '00000000-0000-0000-0000-000000000000',
        tipo: 'modulo',
        url_arquivo: 'test.pdf'
    };

    console.log('Inserting first record...');
    const { data: d1, error: e1 } = await supabase.from('certificados').insert(dummyCert).select();

    if (e1) {
        console.log('Error inserting first (expected if ID not valid student, but let\'s see):', e1.message);
        // If it's a FK error, we need a real student ID
        if (e1.message.includes('violates foreign key constraint')) {
            console.log('Need real IDs. Fetching...');
            const { data: student } = await supabase.from('alunos').select('id').limit(1).single();
            const { data: module } = await supabase.from('modulos').select('id').limit(1).single();

            if (student && module) {
                dummyCert.aluno_id = student.id;
                dummyCert.modulo_id = module.id;
                console.log('Using IDs:', { student: student.id, module: module.id });

                // Delete any existing with these IDs to ensure clean test
                await supabase.from('certificados').delete().eq('aluno_id', student.id).eq('modulo_id', module.id).eq('tipo', 'modulo');

                const { error: e2 } = await supabase.from('certificados').insert(dummyCert);
                if (e2) console.log('Error inserting first with real IDs:', e2.message);
                else console.log('First record inserted.');
            }
        }
    } else {
        console.log('First record inserted.');
    }

    console.log('Inserting duplicate record...');
    const { error: eDup } = await supabase.from('certificados').insert(dummyCert);

    if (eDup) {
        console.log('DUPLICATE INSERT RESULT:', eDup.message);
        if (eDup.message.includes('unique_certificado_aluno_modulo_tipo') || eDup.code === '23505') {
            console.log('✅ Unique constraint is ACTIVE.');
        } else {
            console.log('❌ Unexpected error or no unique constraint:', eDup.message);
        }
    } else {
        console.log('❌ SUCCESS inserting duplicate! Unique constraint is MISSING.');
    }

    // Cleanup if needed (optional since it's a test record)
    await supabase.from('certificados').delete().eq('url_arquivo', 'test.pdf');
}

testUniqueConstraint();
