const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', 'backend', '.env');

if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split('\n');
    console.log('--- Verificação do backend/.env ---');
    lines.forEach(line => {
        const match = line.match(/^([^=]+)=/);
        if (match) {
            console.log(`${match[1]}: ✅ Presente`);
        }
    });
} else {
    console.log('❌ Arquivo backend/.env não encontrado');
}
