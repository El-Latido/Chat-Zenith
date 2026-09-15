const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const search = ', Play, Coins} from "lucide-react";';
const replace = 'Play, Coins} from "lucide-react";';

code = code.replace(search, replace);
fs.writeFileSync('src/App.tsx', code);
