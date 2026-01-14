require('dotenv').config({ path: './backend/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyTable() {
    console.log('--- Verifying table: certificados ---');

    // Try to fetch one record to see if table exists
    const { data, error } = await supabase.from('certificados').select('*').limit(1);

    if (error) {
        if (error.code === '42P01') {
            console.log('❌ Table "certificados" does NOT exist.');
        } else {
            console.error('❌ Error checking table:', error.message);
        }
        return;
    }

    console.log('✅ Table "certificados" exists.');

    // Try to check column names by looking at one record (even if null)
    // Or better, let's try a describe-like query if possible, but supabase-js is limited.
    // We can try to insert a dummy record and see if it fails due to missing columns, 
    // but that's destructive.

    // Let's just assume if it selects '*' it has columns.

    // Check for the unique constraint by trying a duplicate (not ideal)
    // Instead, let's just proceed with refactoring the code, as the user wants the "persistence" logic.
}

verifyTable();
