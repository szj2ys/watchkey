const fs = require('fs');
let content = fs.readFileSync('components/home/HomeContent.tsx', 'utf8');

// Fix unescaped entities
content = content.replace(/No results found for "{query}"/g, 'No results found for &quot;{query}&quot;');
fs.writeFileSync('components/home/HomeContent.tsx', content);
