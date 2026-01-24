const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const srcDir = path.join(rootDir, 'src');

const layers = ['app', 'pages', 'widgets', 'features', 'entities', 'shared'];

const results = {
  violations: [],
  summary: {
    scannedFiles: 0,
    totalViolations: 0
  }
};

function getLayer(filePath) {
  const relativePath = path.relative(srcDir, filePath);
  const parts = relativePath.split(path.sep);
  if (parts.length > 0 && layers.includes(parts[0])) {
    return parts[0];
  }
  return null;
}

function checkImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const currentLayer = getLayer(filePath);
  if (!currentLayer) return;

  results.summary.scannedFiles++;

  const importRegex = /import\s+.*\s+from\s+['"](@\/(app|pages|widgets|features|entities|shared)\/.*)['"]/g;
  let match;

  while ((match = importRegex.exec(content)) !== null) {
    const importedPath = match[1];
    const importedLayer = match[2];

    const currentLayerIndex = layers.indexOf(currentLayer);
    const importedLayerIndex = layers.indexOf(importedLayer);

    // Rule 1: Layer Violation (Lower cannot import Higher)
    if (importedLayerIndex < currentLayerIndex) {
      results.violations.push({
        file: path.relative(rootDir, filePath),
        type: 'Layer Violation',
        message: `Camada '${currentLayer}' não pode importar da camada superior '${importedLayer}'`,
        import: importedPath
      });
      results.summary.totalViolations++;
    }

    // Rule 2: Sideways Coupling (Same layer cross-import, especially features)
    if (currentLayer === importedLayer && currentLayer === 'features') {
      const currentSlice = path.relative(srcDir, filePath).split(path.sep)[1];
      const importedSlice = importedPath.split('/')[2];

      if (currentSlice && importedSlice && currentSlice !== importedSlice) {
        results.violations.push({
          file: path.relative(rootDir, filePath),
          type: 'Sideways Coupling',
          message: `Feature '${currentSlice}' não pode importar diretamente da feature '${importedSlice}'`,
          import: importedPath
        });
        results.summary.totalViolations++;
      }
    }
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (!['node_modules', '.git', 'dist'].includes(file)) {
        walkDir(filePath);
      }
    } else if (['.tsx', '.ts', '.jsx', '.js'].some(ext => file.endsWith(ext))) {
      checkImports(filePath);
    }
  });
}

console.log('--- INÍCIO DA VERIFICAÇÃO FSD ---');
if (fs.existsSync(srcDir)) {
  walkDir(srcDir);
}

if (results.violations.length > 0) {
  console.log('\n❌ VIOLAÇÕES ENCONTRADAS:');
  results.violations.slice(0, 15).forEach(v => {
    console.log(`[${v.type}] em ${v.file}:`);
    console.log(`  - ${v.message}`);
    console.log(`  - Importação: ${v.import}\n`);
  });

  if (results.violations.length > 15) {
    console.log(`... e mais ${results.violations.length - 15} violações.`);
  }
} else {
  console.log('\n✅ Nenhuma violação de arquitetura detectada!');
}

console.log('\n--- RESUMO ---');
console.log(`Arquivos escaneados: ${results.summary.scannedFiles}`);
console.log(`Total de violações: ${results.summary.totalViolations}`);
console.log('--- FIM DA VERIFICAÇÃO ---');
