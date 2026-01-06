import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

const IP = '104.18.38.10'; // Um dos IPs resolvidos do Cloudflare
const HOST = 'ffzqgdxznsrbuhqbtmaw.supabase.co';
const URL = `https://${IP}`;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

console.log(`Tentando conexão via IP: ${URL} com Host: ${HOST}`);

const supabase = createClient(URL, KEY, {
  global: {
    headers: {
      'Host': HOST
    }
  }
});

async function check() {
    try {
        const { data, error } = await supabase.from('polos').select('*').limit(1);
        if (error) {
            console.error('Erro do Supabase:', error);
        } else {
            console.log('Sucesso! Conexão via IP funcionou. Dados:', data);
        }
    } catch (e) {
        console.error('Erro de Exception:', e);
    }
}

check();
