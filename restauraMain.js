const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'public', 'js', 'main.js');
let content = fs.readFileSync(filePath, 'utf8');

// Remove chaves extras adicionadas no final do arquivo
content = content.replace(/\}\s*\}\s*$/, '}');

// Corrige blocos duplicados de login (Google/Firebase)
content = content.replace(
  /const result = await firebase\.auth\(\)\.signInWithPopup\(provider\)[\s\S]*?catch\s*\([\s\S]*?\}\s*\}/g,
  (match, offset, str) => {
    // Mantém apenas a primeira ocorrência
    return str.indexOf(match) === offset ? match : '';
  }
);

// Fecha corretamente blocos abertos (if, try, etc.)
const openBraces = (content.match(/\{/g) || []).length;
const closeBraces = (content.match(/\}/g) || []).length;
if (openBraces > closeBraces) {
  content += '\n'.repeat(openBraces - closeBraces) + '}'.repeat(openBraces - closeBraces);
}

fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ main.js restaurado e limpo. Agora execute:');
console.log('   npm run dev');
