const fs = require('fs');

let content = fs.readFileSync('/tmp/server.ts.broken', 'utf8');

let stack = [];
let output = [];
let lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    output.push(line);
    
    // Very simple auto-fix:
    // If the next line is `socket.on` or `if (process.env.NODE_ENV !== "production"`
    // and we have unclosed brackets that are obvious, just close them.
    
    if (i < lines.length - 1) {
        let nextLine = lines[i+1];
        if (nextLine.match(/^\s*socket\.on/)) {
            // Count open braces in the previous block... actually that's hard without AST.
            // But we know exactly what was deleted:
            // if (callback) callback({ success: false, error: err.message });
            // });
        }
    }
}
