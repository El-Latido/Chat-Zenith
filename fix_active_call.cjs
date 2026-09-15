const fs = require('fs');
let code = fs.readFileSync('src/components/ActiveCallModal.tsx', 'utf8');

const search = `    useEffect(() => {
        const timer = setInterval(() => setDuration(prev => prev + 1), 1000);`;

const replace = `    useEffect(() => {
        let timer = setInterval(() => setDuration(prev => prev + 1), 1000);`;

code = code.replace(search, replace);
fs.writeFileSync('src/components/ActiveCallModal.tsx', code);
