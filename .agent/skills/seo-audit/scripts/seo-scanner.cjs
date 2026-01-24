const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const srcDir = path.join(rootDir, 'src');

const results = {
  metaTags: [],
  headings: [],
  images: [],
  technical: [],
  performance: []
};

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.relative(rootDir, filePath);

  // Verificar Meta Tags (principalmente no index.html)
  if (fileName === 'index.html') {
    const title = content.match(/<title>(.*?)<\/title>/i);
    results.metaTags.push({
      file: fileName,
      type: 'title',
      value: title ? title[1] : 'AUSENTE',
      status: title ? 'PASSOU' : 'FALHOU'
    });

    const description = content.match(/<meta name="description" content="(.*?)"/i);
    results.metaTags.push({
      file: fileName,
      type: 'description',
      value: description ? description[1] : 'AUSENTE',
      status: description ? 'PASSOU' : 'FALHOU'
    });

    const ogTitle = content.match(/<meta property="og:title" content="(.*?)"/i);
    results.metaTags.push({
      file: fileName,
      type: 'og:title',
      value: ogTitle ? ogTitle[1] : 'AUSENTE',
      status: ogTitle ? 'PASSOU' : 'FALHOU'
    });
  }

  // Verificar Títulos em TSX/JSX
  if (filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) {
    const h1s = content.match(/<h1[^>]*>(.*?)<\/h1>/gi);
    if (h1s) {
      h1s.forEach(h1 => {
        results.headings.push({
          file: fileName,
          type: 'h1',
          content: h1.replace(/<[^>]+>/g, '').trim(),
          status: 'ENCONTRADO'
        });
      });
    }

    // Verificar Imagens para texto alt
    const imgs = content.match(/<img[^>]*>/gi);
    if (imgs) {
      imgs.forEach(img => {
        const alt = img.match(/alt=["'](.*?)["']/i);
        results.images.push({
          file: fileName,
          src: (img.match(/src=["'](.*?)["']/i) || [])[1] || 'desconhecido',
          alt: alt ? alt[1] : 'AUSENTE',
          status: alt ? 'PASSOU' : 'FALHOU'
        });
      });
    }
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (!['node_modules', '.git', 'dist', 'build'].includes(file)) {
        walkDir(filePath);
      }
    } else if (['.html', '.tsx', '.jsx'].some(ext => file.endsWith(ext))) {
      scanFile(filePath);
    }
  });
}

console.log('--- INÍCIO DA AUDITORIA DE SEO ---');
console.log(`Varrendo em: ${rootDir}`);

// Varrer index.html primeiro
if (fs.existsSync(path.join(rootDir, 'index.html'))) {
  scanFile(path.join(rootDir, 'index.html'));
}

// Varrer diretório src
if (fs.existsSync(srcDir)) {
  walkDir(srcDir);
}

// Geração do Relatório Final
console.log('\n## RESUMO DAS DESCOBERTAS');

const criticalMeta = results.metaTags.filter(m => m.status === 'FALHOU');
console.log(`\n### Meta Tags [${results.metaTags.filter(m => m.status === 'PASSOU').length}/${results.metaTags.length}]`);
results.metaTags.forEach(m => console.log(`${m.status === 'PASSOU' ? '✅' : '❌'} [${m.type}] ${m.value}`));

const pagesWithH1 = new Set(results.headings.map(h => h.file));
console.log(`\n### Estrutura de Conteúdo`);
console.log(`- Páginas com H1: ${pagesWithH1.size}`);
if (results.headings.length > 0) {
  console.log(`- Exemplos de H1s:`);
  results.headings.slice(0, 3).forEach(h => console.log(`  - ${h.content} (${h.file})`));
}

const imagesWithoutAlt = results.images.filter(img => img.status === 'FALHOU');
console.log(`\n### Mídia`);
console.log(`- Total de imagens encontradas: ${results.images.length}`);
console.log(`- Imagens sem texto alt: ${imagesWithoutAlt.length}`);
if (imagesWithoutAlt.length > 0) {
  console.log(`  - ❌ Exemplos de texto alt ausente:`);
  imagesWithoutAlt.slice(0, 5).forEach(img => console.log(`    - ${img.src} em ${img.file}`));
}

// Verificações Técnicas
console.log('\n### SEO Técnico');
console.log(`${fs.existsSync(path.join(rootDir, 'public/robots.txt')) ? '✅' : '❌'} robots.txt`);
console.log(`${fs.existsSync(path.join(rootDir, 'public/sitemap.xml')) ? '✅' : '❌'} sitemap.xml`);

console.log('\n--- FIM DA AUDITORIA DE SEO ---');
