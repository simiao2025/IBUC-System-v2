const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/workers/pdf.service.ts');
console.log('Reading file:', filePath);

try {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n'); // Split by newline
  console.log('Total lines:', lines.length);

  if (lines.length > 1380) {
    console.log('Truncating file to line 1376 plus closing brace...');
    // We want lines 0 to 1375 (1-based 1376). 
    // Line 1376 is "  }".
    // We want to keep it.
    // And add "}" for the class.
    
    // Slice 0 to 1376 includes indices 0..1375.
    // Let's check specific lines.
    // Array index 1375 corresponds to line 1376.
    
    const newLines = lines.slice(0, 1376); 
    const lastLine = newLines[newLines.length - 1]; // "  }"
    console.log('Last kept line:', lastLine);
    
    newLines.push('}'); // Close class
    
    const newContent = newLines.join('\n');
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log('File written successfully.');
  } else {
    console.log('File seems already truncated or short.');
  }
} catch (e) {
  console.error('Error:', e);
}
