const fs = require('fs');
const content = fs.readFileSync('components/home/HomeContent.tsx', 'utf8');
const updated = content.replace(
  /const q = searchParams\.get\('q'\) \|\| '';\n  const \[searchQuery, setSearchQuery\] = useState\(q\);\n\n  \n\n  if \(searchQuery\)/,
  `const q = searchParams.get('q') || '';\n  const [searchQuery, setSearchQuery] = useState('');\n  \n  // Sync state when URL param changes\n  const currentQuery = searchQuery || q;\n\n  if (currentQuery)`
);
fs.writeFileSync('components/home/HomeContent.tsx', updated);
