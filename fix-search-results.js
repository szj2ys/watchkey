const fs = require('fs');
const content = fs.readFileSync('components/home/HomeContent.tsx', 'utf8');

const updated = content.replace(
  /\{results\.length > 0 \? \([\s\S]*?\) : \([\s\S]*?<p className="text-gray-500">No results found for "{query}"<\/p>[\s\S]*?\)[\s\S]*?\}/,
  `{results.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {results.map(v => <VideoCard key={v.id} video={v} />)}
        </div>
      ) : !error ? (
        <div className="text-center py-16">
          <p className="text-gray-500">No results found for "{query}"</p>
        </div>
      ) : null}`
);

fs.writeFileSync('components/home/HomeContent.tsx', updated);
