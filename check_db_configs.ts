import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConfigs() {
    console.log('--- Checking configuracoes_sistema ---');
    try {
        const { data, error } = await supabase
            .from('configuracoes_sistema')
            .select('*');

        if (error) {
            console.error('Error fetching configs:', error);
        } else {
            console.log(`Configs count: ${data?.length || 0}`);
            data?.forEach(config => {
                console.log(`- ${config.chave}: ${JSON.stringify(config.valor)} (Public: ${config.publica})`);
            });
        }
    } catch (err) {
        console.error('Execution error:', err);
    }
}

await checkConfigs();
