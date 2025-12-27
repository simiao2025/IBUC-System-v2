import fs from 'fs';
import path from 'path';

const files = [
    path.join(process.cwd(), '.env'),
    path.join(process.cwd(), 'backend', '.env')
];

files.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`Limpando ${file}...`);
        const content = fs.readFileSync(file, 'utf8');
        // Remove \r and extra spaces at the end of lines
        const cleaned = content.replace(/\r/g, '').replace(/[ \t]+$/gm, '');
        fs.writeFileSync(file, cleaned, 'utf8');
        console.log('✅ Concluído');
    }
});
