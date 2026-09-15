const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// There are duplicate states because the replacement code was run and there was an existing one?
// Let's remove the duplicated state
code = code.replace(/  const \[isWatchingAd, setIsWatchingAd\] = useState\(false\);\n  const \[isWatchingAd, setIsWatchingAd\] = useState\(false\);/, '  const [isWatchingAd, setIsWatchingAd] = useState(false);');

// Just to be safe, I'll regex it properly:
let lines = code.split('\n');
let seenIsWatching = false;
let seenAdCount = false;
lines = lines.filter(line => {
    if (line.includes('const [isWatchingAd')) {
        if (seenIsWatching) return false;
        seenIsWatching = true;
    }
    if (line.includes('const [adCountdown')) {
        if (seenAdCount) return false;
        seenAdCount = true;
    }
    return true;
});
code = lines.join('\n');
fs.writeFileSync('src/App.tsx', code);
