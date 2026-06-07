const fs = require('fs');
let content = fs.readFileSync('components/watch/Player.tsx', 'utf8');

// Use effect to safely update refs
content = content.replace(
  /  const onPlayerReadyRef = useRef\(onPlayerReady\);\n\n  useEffect\(\(\) => \{/g,
  `  const onPlayerReadyRef = useRef(onPlayerReady);\n\n  useEffect(() => {\n    onTimeUpdateRef.current = onTimeUpdate;\n    onPlayerReadyRef.current = onPlayerReady;\n  }, [onTimeUpdate, onPlayerReady]);\n\n  useEffect(() => {`
);

fs.writeFileSync('components/watch/Player.tsx', content);
