const fs = require('fs');
let code = fs.readFileSync('src/components/ProfileConfigModal.tsx', 'utf8');

code = code.replace(/setAdminConfigLizOpen/g, 'setAdminConfigAiOpen');
fs.writeFileSync('src/components/ProfileConfigModal.tsx', code);
