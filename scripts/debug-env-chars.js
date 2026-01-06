import { config } from 'dotenv';
import path from 'path';
import fs from 'fs';

const backendEnv = path.join(process.cwd(), 'backend', '.env');
const content = fs.readFileSync(backendEnv, 'utf8');
const lines = content.split('\n');

console.log('--- Debug de Caracteres Invisíveis ---');
lines.forEach(line => {
    if (line.startsWith('SUPABASE_URL')) {
        const value = line.split('=')[1] || '';
        console.log(`URL: "${value}"`);
        console.log(`Tamanho: ${value.trim().length}`);
        console.log(`Chars: ${JSON.stringify(value.split(''))}`);
    }
});
