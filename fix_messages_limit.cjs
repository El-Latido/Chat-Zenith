const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/limitToLast\(30\)/g, 'limitToLast(15)');

const receiveGlobalSearch = `        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });`;
const receiveGlobalReplace = `        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          const next = [...prev, msg];
          return next.slice(-15);
        });`;

code = code.replace(receiveGlobalSearch, receiveGlobalReplace);

fs.writeFileSync('src/App.tsx', code);
console.log("Fixed messages limit in App.tsx");
