const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf8');
const newContent = content.replace(/import \{ DebugConsole \} from "\.\/components\/DebugConsole";\n?/, '').replace(/<DebugConsole \/>\n?/, '');
fs.writeFileSync('src/App.tsx', newContent);
