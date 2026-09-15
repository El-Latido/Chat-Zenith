const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `  let songHistory = [];`;
const replacement = `  let songHistory = [];
  const initHistory = () => {
     let shuffled = [...top30Songs].sort(() => 0.5 - Math.random());
     songHistory = shuffled.slice(0, 20).map(s => ({
         id: Date.now().toString() + Math.random().toString(),
         url: s.url,
         title: s.title,
         requester: "Elizabeth (AutoDJ)",
         status: "accepted"
     }));
  };
  initHistory();`;

if (code.includes(target) && !code.includes('initHistory()')) {
  code = code.replace(target, replacement);
  fs.writeFileSync('server.ts', code);
  console.log("Patched radio history init");
} else {
  console.log("Already patched or target not found");
}
