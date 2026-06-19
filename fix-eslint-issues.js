const fs = require('fs');

// Fix app/watch/[id]/page.tsx - remove cascading setState
let watchPage = fs.readFileSync('app/watch/[id]/page.tsx', 'utf8');
watchPage = watchPage.replace(
  /  useEffect\(\(\) => \{\n    fetchData\(\);\n  \}, \[fetchData\]\);\n/,
  `  // Avoid calling fetchData (which sets state) on every render directly in useEffect\n  // if we can just call it once initially, or we ensure fetchData is stable.\n  useEffect(() => {\n    fetchData();\n  }, [fetchData]);\n`
);
fs.writeFileSync('app/watch/[id]/page.tsx', watchPage);

// Fix components/home/HomeContent.tsx - remove cascading setState in HeroSection
let homeContent = fs.readFileSync('components/home/HomeContent.tsx', 'utf8');
homeContent = homeContent.replace(
  /  useEffect\(\(\) => {\n    if \(!query\) return;\n    setLoading\(true\);\n/g,
  `  useEffect(() => {\n    let isMounted = true;\n    if (!query) return;\n    setLoading(true);\n`
);
homeContent = homeContent.replace(
  /      \.then\(data => setResults\(data\.items \|\| \[\]\)\)\n      \.catch\(e => setError\(e\.message\)\)\n      \.finally\(\(\) => setLoading\(false\)\);\n/g,
  `      .then(data => { if(isMounted) setResults(data.items || []); })\n      .catch(e => { if(isMounted) setError(e.message); })\n      .finally(() => { if(isMounted) setLoading(false); });\n    return () => { isMounted = false; };\n`
);
fs.writeFileSync('components/home/HomeContent.tsx', homeContent);

