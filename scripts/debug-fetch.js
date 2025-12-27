import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

console.log('Testando conexão direta...');
console.log('URL:', url);

const supabase = createClient(url, key);

async function check() {
    try {
        const { data, error } = await supabase.from('polos').select('*').limit(1);
        if (error) {
            console.error('Erro do Supabase:', error);
        } else {
            console.log('Sucesso! Dados:', data);
        }
    } catch (e) {
        console.error('Erro de Exception:', e);
    }
}

check();
