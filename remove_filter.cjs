const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const search = `  useEffect(() => {
    const interval = setInterval(() => {
      setMessages((prev) => {
        const twelveMinAgo = Date.now() - 12 * 60 * 1000;
        const filtered = prev.filter((m) => {
          const time = m.timestamp?.seconds
            ? m.timestamp.seconds * 1000
            : m.createdAt?.seconds
              ? m.createdAt.seconds * 1000
              : typeof m.timestamp === "number"
                ? m.timestamp
                : typeof m.createdAt === "number"
                  ? m.createdAt
                  : Date.now();
          return time > twelveMinAgo;
        });
        return filtered.length !== prev.length ? filtered : prev;
      });
    }, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);`;

if (code.includes(search)) {
    code = code.replace(search, "");
    fs.writeFileSync('src/App.tsx', code);
    console.log("Removed interval");
} else {
    console.log("Not found");
}
